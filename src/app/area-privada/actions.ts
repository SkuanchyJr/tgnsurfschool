"use server";

import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { notifyBookingConfirmation, notifyNewBookingToAdmin } from "@/lib/notifications";

/**
 * Book a spot in a scheduled class.
 * Enforces capacity: total active pax + requested pax must not exceed max_capacity.
 */
export async function bookClass(
    classId: string,
    pax: number = 1
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: "Debes iniciar sesión para reservar." };
    }

    // 1. Fetch the class to check capacity and get date/time/service_id
    const { data: cls, error: classError } = await supabaseAdmin
        .from("classes")
        .select("id, date, time, service_id, max_capacity, status")
        .eq("id", classId)
        .single();

    if (classError || !cls) {
        return { success: false, error: "Clase no encontrada." };
    }
    if (cls.status === "CANCELLED") {
        return { success: false, error: "Esta clase ha sido cancelada." };
    }

    // 2. Compute current pax in this class (excluding CANCELLED bookings)
    const { data: existingBookings } = await supabaseAdmin
        .from("bookings")
        .select("pax")
        .eq("class_id", classId)
        .neq("status", "CANCELLED");

    const currentPax = (existingBookings || []).reduce((sum, b) => sum + (b.pax || 0), 0);

    if (currentPax + pax > cls.max_capacity) {
        const remaining = cls.max_capacity - currentPax;
        return {
            success: false,
            error: remaining <= 0
                ? "Esta clase ya no tiene plazas disponibles."
                : `Solo quedan ${remaining} plaza${remaining === 1 ? '' : 's'} disponibles.`,
        };
    }

    // 3. Ensure user row exists in public.users (defensive FK fallback)
    await supabaseAdmin.from("users").upsert(
        { id: user.id, email: user.email, name: user.email?.split("@")[0] || "Alumno", role: "STUDENT" },
        { onConflict: "id" }
    );

    // 4. Insert the booking
    const { error: insertError } = await supabaseAdmin.from("bookings").insert({
        user_id: user.id,
        class_id: classId,
        service_id: cls.service_id,
        date: cls.date,
        time: cls.time,
        pax,
        status: "PENDING",
    });

    if (insertError) {
        console.error("[bookClass] insert error:", insertError);
        return { success: false, error: "Error al crear la reserva. Inténtalo de nuevo." };
    }

    // 5. Fetch service name for notifications
    let serviceName = "Clase de Surf";
    if (cls.service_id) {
        const { data: svc } = await supabaseAdmin.from("services").select("title").eq("id", cls.service_id).single();
        if (svc) serviceName = svc.title;
    }

    // 6. Get user info for admin notification
    const { data: userInfo } = await supabaseAdmin.from("users").select("name, email").eq("id", user.id).single();

    // 7. Send notifications (non-blocking)
    notifyBookingConfirmation(user.id, {
        date: cls.date,
        time: cls.time,
        pax,
        serviceName,
    }).catch(console.error);

    notifyNewBookingToAdmin({
        studentName: userInfo?.name || user.email?.split("@")[0] || "Alumno",
        studentEmail: userInfo?.email || user.email || "",
        date: cls.date,
        time: cls.time,
        pax,
        serviceName,
    }).catch(console.error);

    revalidatePath("/area-privada");
    revalidatePath("/area-privada/clases");
    revalidatePath("/area-privada/mis-reservas");
    return { success: true };
}

// ─── Level computation (mirrors client-side logic) ────────────────────────────
function computeLevel(answers: Record<string, string>): string {
    let score = 0;
    if (answers.previous_surf === "yes_lots") score += 3;
    else if (answers.previous_surf === "yes_regular") score += 2;
    else if (answers.previous_surf === "yes_little") score += 1;
    if (answers.water_comfort === "very_comfortable") score += 3;
    else if (answers.water_comfort === "comfortable") score += 2;
    else if (answers.water_comfort === "ok") score += 1;
    if (answers.wave_preference === "big") score += 3;
    else if (answers.wave_preference === "medium") score += 2;
    else if (answers.wave_preference === "any") score += 1;
    if (answers.fitness_level === "athlete") score += 2;
    else if (answers.fitness_level === "high") score += 1;
    if (answers.main_goal === "compete" || answers.main_goal === "ride_better_waves") score += 2;
    else if (answers.main_goal === "improve_technique") score += 1;
    if (score >= 9) return "ADVANCED";
    if (score >= 4) return "INTERMEDIATE";
    return "BEGINNER";
}

export async function saveAssessmentAction(formData: FormData) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: "Debes iniciar sesión para guardar la evaluación." };
    }

    const answersRaw = formData.get("answers") as string | null;
    if (!answersRaw) {
        return { error: "Faltan datos de la evaluación." };
    }

    let answers: Record<string, string> = {};
    try { answers = JSON.parse(answersRaw); } catch {
        return { error: "Formato de datos inválido." };
    }

    const surf_level = computeLevel(answers);

    const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({
            surf_level,
            surf_assessment: answers,
        })
        .eq("id", user.id);

    if (updateError) {
        console.error("[saveAssessmentAction] update error:", updateError);
        return { error: "Error al guardar la evaluación. Inténtalo de nuevo." };
    }

    revalidatePath("/area-privada");
    return { success: true };
}
