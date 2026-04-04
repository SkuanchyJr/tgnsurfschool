"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { notifyAssignmentResponse } from "@/lib/notifications";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function getInstructorHelper() {
    return supabaseAdmin;
}

function getCurrentUser() {
    return createClient().then(s => s.auth.getUser());
}

// ─────────────────────────────────────────────
// Accept or reject an assignment for the current instructor
// ─────────────────────────────────────────────
export async function respondToAssignment(
    classId: string,
    response: "ACCEPTED" | "REJECTED"
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: "No autenticado." };
    }

    const { error } = await supabaseAdmin
        .from("class_instructors")
        .update({ status: response })
        .eq("class_id", classId)
        .eq("instructor_id", user.id);

    if (error) {
        console.error("[respondToAssignment] error:", error);
        return { success: false, error: "No se pudo actualizar la asignación." };
    }

    // Revalidate admin and instructor views
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/instructor");
    revalidatePath("/instructor/clases");
    revalidatePath("/instructor/asignaciones");
    revalidatePath("/admin/classes");

    // Notify admins about the response (non-blocking)
    notifyAssignmentResponse(user.id, classId, response).catch(console.error);

    return { success: true };
}

// ─────────────────────────────────────────────
// Get all classes assigned to current instructor
// ─────────────────────────────────────────────
export async function getMyAssignedClasses() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return [];

    // Get all class_instructors rows for this user
    const { data: assignments, error } = await supabaseAdmin
        .from("class_instructors")
        .select(`
            id,
            status,
            class:class_id (
                id, date, time, duration_minutes, level, max_capacity, status, notes,
                service:service_id ( title, type ),
                class_instructors (
                    id, instructor_id, status,
                    instructor:instructor_id ( id, name, email )
                )
            )
        `)
        .eq("instructor_id", user.id)
        .order("created_at", { ascending: false });

    if (error || !assignments) return [];

    // For each class, compute pax count
    const classIds = (assignments as any[])
        .map(a => a.class?.id)
        .filter(Boolean);

    const { data: bookings } = classIds.length > 0
        ? await supabaseAdmin.from("bookings").select("class_id, pax").in("class_id", classIds).neq("status", "CANCELLED")
        : { data: [] };

    const paxByClass: Record<string, number> = {};
    for (const b of (bookings || [])) {
        if (b.class_id) paxByClass[b.class_id] = (paxByClass[b.class_id] || 0) + b.pax;
    }

    return (assignments as any[]).map(a => ({
        assignmentId: a.id,
        assignmentStatus: a.status,
        ...(a.class || {}),
        total_pax: paxByClass[a.class?.id] || 0,
        // Rename nested service to match SurfClass types
        service: a.class?.service || null,
        class_instructors: a.class?.class_instructors || [],
    }));
}
