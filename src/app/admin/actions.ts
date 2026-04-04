"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import {
    notifyBookingStatusChange,
    notifyClassAssignment,
    notifyClassCancelled,
} from "@/lib/notifications";

// ─────────────────────────────────────────────
// Shared Types
// ─────────────────────────────────────────────
export type ClassLevel = 'BEGINNER' | 'INITIATION' | 'INTERMEDIATE' | 'ADVANCED' | 'UNDEFINED';
export type ClassStatus = 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type InstructorAssignmentStatus = 'ASSIGNED' | 'ACCEPTED' | 'REJECTED';

export type ClassInstructor = {
    id: string;
    instructor_id: string;
    status: InstructorAssignmentStatus;
    instructor: { id: string; name: string; email: string } | null;
};

export type SurfClass = {
    id: string;
    service_id: string | null;
    date: string;
    time: string;
    duration_minutes: number;
    level: ClassLevel;
    max_capacity: number;
    status: ClassStatus;
    location: string | null;
    notes: string | null;
    created_at: string;
    service: { title: string; type: string } | null;
    class_instructors: ClassInstructor[];
};

export type SurfClassWithBookings = SurfClass & {
    total_pax: number;
    booking_count: number;
};

// ─────────────────────────────────────────────
// Helper: Admin Client (bypasses RLS)
// ─────────────────────────────────────────────
function getAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// ─────────────────────────────────────────────
// 1. Auth / Role Check
// ─────────────────────────────────────────────
export async function verifyAdminAccess(): Promise<{ hasAccess: boolean; user?: any }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return { hasAccess: false };

    const admin = getAdminClient();
    const { data: publicUser } = await admin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!publicUser || (publicUser.role !== 'ADMIN' && publicUser.role !== 'INSTRUCTOR')) {
        return { hasAccess: false };
    }

    return { hasAccess: true, user };
}

// ─────────────────────────────────────────────
// 2. Bookings
// ─────────────────────────────────────────────
export async function getAllBookings() {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) throw new Error("Acceso denegado");

    const admin = getAdminClient();
    const { data } = await admin
        .from('bookings')
        .select(`
            id, date, time, pax, status,
            users (id, name, email, phone),
            services (id, title, type, price)
        `)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

    return (data || []).map(b => ({
        ...b,
        users: Array.isArray(b.users) ? b.users[0] : b.users,
        services: Array.isArray(b.services) ? b.services[0] : b.services,
    })) as any[];
}

export async function updateBookingStatus(bookingId: string, newStatus: string) {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) return { success: false, error: "Acceso denegado" };

    const admin = getAdminClient();
    const { error } = await admin
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

    if (error) return { success: false, error: "No se pudo actualizar el estado" };

    // Notify the student about the status change (non-blocking)
    notifyBookingStatusChange(bookingId, newStatus).catch(console.error);

    revalidatePath('/admin');
    revalidatePath('/area-privada');
    return { success: true };
}

// ─────────────────────────────────────────────
// 3. Users — Students & Instructors
// ─────────────────────────────────────────────
export async function getAllStudents() {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) throw new Error("Acceso denegado");

    const admin = getAdminClient();
    const { data } = await admin
        .from('users')
        .select(`*, bookings (count)`)
        .eq('role', 'STUDENT')
        .order('created_at', { ascending: false });

    return data || [];
}

export async function getAllInstructors() {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) throw new Error("Acceso denegado");

    const admin = getAdminClient();
    const { data } = await admin
        .from('users')
        .select(`*`)
        .in('role', ['INSTRUCTOR', 'ADMIN'])
        .order('name', { ascending: true });

    return data || [];
}

export async function getStudentDetail(id: string) {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) throw new Error("Acceso denegado");

    const admin = getAdminClient();
    
    // 1. Fetch student profile
    const { data: student, error: studentError } = await admin
        .from('users')
        .select(`*`)
        .eq('id', id)
        .single();

    if (studentError || !student) return null;

    // 2. Fetch student bookings with service info
    const { data: bookings, error: bookingsError } = await admin
        .from('bookings')
        .select(`
            id, date, time, pax, status,
            services (id, title, type, price)
        `)
        .eq('user_id', id)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

    return {
        ...student,
        bookings: (bookings || []).map(b => ({
            ...b,
            services: Array.isArray(b.services) ? b.services[0] : b.services,
        })) as any[]
    };
}

// ─────────────────────────────────────────────
// 4. Services Catalog CRUD
// ─────────────────────────────────────────────
export async function createService(serviceData: {
    title: string; type: string; description: string | null; price: number;
}) {
    try {
        const { hasAccess } = await verifyAdminAccess();
        if (!hasAccess) {
            return { success: false, error: "Acceso denegado" };
        }

        const admin = getAdminClient();
        const { error } = await admin
            .from('services')
            .insert([{ ...serviceData, is_active: true }]);

        if (error) {
            return { success: false, error: error.message };
        }
        
        revalidatePath('/admin/services');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Error inesperado" };
    }
}

export async function updateService(id: string, serviceData: {
    title: string; type: string; description: string | null; price: number;
}) {
    try {
        const { hasAccess } = await verifyAdminAccess();
        if (!hasAccess) return { success: false, error: "Acceso denegado" };

        const admin = getAdminClient();
        const { error } = await admin
            .from('services')
            .update(serviceData)
            .eq('id', id);

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath('/admin/services');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Error inesperado" };
    }
}

export async function deleteService(id: string) {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) return { success: false, error: "Acceso denegado" };

    const admin = getAdminClient();
    const { error } = await admin.from('services').delete().eq('id', id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/services');
    return { success: true };
}

// ─────────────────────────────────────────────
// 5. Class Sessions CRUD
// ─────────────────────────────────────────────
export async function getClasses(): Promise<SurfClassWithBookings[]> {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) throw new Error("Acceso denegado");

    const admin = getAdminClient();
    const { data: classes, error } = await admin
        .from('classes')
        .select(`
            *,
            service:service_id ( title, type ),
            class_instructors (
                id, instructor_id, status,
                instructor:instructor_id ( id, name, email )
            )
        `)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

    if (error || !classes) return [];

    const classIds = (classes as any[]).map(c => c.id);
    const { data: bookings } = classIds.length > 0
        ? await admin.from('bookings').select('class_id, pax').in('class_id', classIds).neq('status', 'CANCELLED')
        : { data: [] };

    const paxByClass: Record<string, number> = {};
    const countByClass: Record<string, number> = {};
    for (const b of (bookings || [])) {
        if (b.class_id) {
            paxByClass[b.class_id] = (paxByClass[b.class_id] || 0) + b.pax;
            countByClass[b.class_id] = (countByClass[b.class_id] || 0) + 1;
        }
    }

    return (classes as any[]).map(c => ({
        ...c,
        total_pax: paxByClass[c.id] || 0,
        booking_count: countByClass[c.id] || 0,
    }));
}

export async function getClassesForDate(date: string): Promise<SurfClassWithBookings[]> {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) throw new Error("Acceso denegado");

    const admin = getAdminClient();
    const { data: classes } = await admin
        .from('classes')
        .select(`
            *,
            service:service_id ( title, type ),
            class_instructors (
                id, instructor_id, status,
                instructor:instructor_id ( id, name, email )
            )
        `)
        .eq('date', date)
        .neq('status', 'CANCELLED')
        .order('time', { ascending: true });

    if (!classes || classes.length === 0) return [];

    const classIds = (classes as any[]).map(c => c.id);
    const { data: bookings } = await admin
        .from('bookings')
        .select('class_id, pax')
        .in('class_id', classIds)
        .neq('status', 'CANCELLED');

    const paxByClass: Record<string, number> = {};
    const countByClass: Record<string, number> = {};
    for (const b of (bookings || [])) {
        if (b.class_id) {
            paxByClass[b.class_id] = (paxByClass[b.class_id] || 0) + b.pax;
            countByClass[b.class_id] = (countByClass[b.class_id] || 0) + 1;
        }
    }

    return (classes as any[]).map(c => ({
        ...c,
        total_pax: paxByClass[c.id] || 0,
        booking_count: countByClass[c.id] || 0,
    }));
}

export async function createClass(data: {
    service_id: string | null;
    date: string;
    time: string;
    duration_minutes: number;
    level: string;
    max_capacity: number;
    location?: string;
    notes?: string;
    instructorIds?: string[];
}) {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) return { success: false, error: "Acceso denegado" };

    const admin = getAdminClient();
    const { instructorIds, ...classData } = data;

    const { data: created, error } = await admin
        .from('classes')
        .insert({ ...classData, status: 'SCHEDULED' })
        .select('id')
        .single();

    if (error) return { success: false, error: error.message };

    // Bulk assign instructors if provided
    if (instructorIds && instructorIds.length > 0) {
        const assignments = instructorIds.map(instructorId => ({
            class_id: created.id,
            instructor_id: instructorId,
            status: 'ASSIGNED'
        }));
        await admin.from('class_instructors').insert(assignments);

        // Notify each assigned instructor (non-blocking)
        let serviceName = "Clase de Surf";
        if (data.service_id) {
            const { data: svc } = await admin.from('services').select('title').eq('id', data.service_id).single();
            if (svc) serviceName = svc.title;
        }
        for (const iid of instructorIds) {
            notifyClassAssignment(iid, {
                classId: created.id,
                date: data.date,
                time: data.time,
                level: data.level,
                serviceName,
            }).catch(console.error);
        }
    }
    revalidatePath('/admin/classes');
    revalidatePath('/admin');
    return { success: true, id: created.id };
}

export async function updateClass(id: string, data: Partial<{
    service_id: string | null;
    date: string;
    time: string;
    duration_minutes: number;
    level: string;
    max_capacity: number;
    status: string;
    location: string | null;
    notes: string | null;
    instructorIds?: string[];
}>): Promise<{ success: boolean; error?: string }> {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) return { success: false, error: "Acceso denegado" };

    const admin = getAdminClient();
    const { instructorIds, ...classData } = data;

    const { error } = await admin.from('classes').update(classData).eq('id', id);

    if (error) return { success: false, error: error.message };

    // Sync instructors if provided
    if (instructorIds !== undefined) {
        // Delete all and re-add (simple strategy for now)
        await admin.from('class_instructors').delete().eq('class_id', id);
        
        if (instructorIds.length > 0) {
            const assignments = instructorIds.map(instructorId => ({
                class_id: id,
                instructor_id: instructorId,
                status: 'ASSIGNED'
            }));
            await admin.from('class_instructors').insert(assignments);
        }
    }
    revalidatePath('/admin/classes');
    revalidatePath('/admin');
    return { success: true };
}

export async function cancelClass(id: string): Promise<{ success: boolean; error?: string }> {
    const result = await updateClass(id, { status: 'CANCELLED' });
    if (result.success) {
        // Notify all affected students and instructors (non-blocking)
        notifyClassCancelled(id).catch(console.error);
    }
    return result;
}

// ─────────────────────────────────────────────
// 6. Instructor Assignment
// ─────────────────────────────────────────────
export async function assignInstructor(
    classId: string,
    instructorId: string
): Promise<{ success: boolean; error?: string }> {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) return { success: false, error: "Acceso denegado" };

    const admin = getAdminClient();
    const { error } = await admin
        .from('class_instructors')
        .upsert(
            { class_id: classId, instructor_id: instructorId, status: 'ASSIGNED' },
            { onConflict: 'class_id,instructor_id' }
        );

    if (error) return { success: false, error: error.message };

    // Notify instructor about the assignment (non-blocking)
    const { data: cls } = await admin
        .from('classes')
        .select('date, time, level, service:service_id(title)')
        .eq('id', classId)
        .single();

    if (cls) {
        const service = cls.service ? (Array.isArray(cls.service) ? cls.service[0] : cls.service) : null;
        notifyClassAssignment(instructorId, {
            classId,
            date: cls.date,
            time: cls.time,
            level: cls.level,
            serviceName: (service as any)?.title || "Clase de Surf",
        }).catch(console.error);
    }

    revalidatePath('/admin/classes');
    return { success: true };
}

export async function removeInstructor(
    classId: string,
    instructorId: string
): Promise<{ success: boolean; error?: string }> {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) return { success: false, error: "Acceso denegado" };

    const admin = getAdminClient();
    const { error } = await admin
        .from('class_instructors')
        .delete()
        .eq('class_id', classId)
        .eq('instructor_id', instructorId);

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/classes');
    return { success: true };
}

// ─────────────────────────────────────────────
// 7. Class Bookings (roster view)
// ─────────────────────────────────────────────
export async function getClassBookings(classId: string) {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) throw new Error("Acceso denegado");

    const admin = getAdminClient();
    const { data } = await admin
        .from('bookings')
        .select(`id, date, time, pax, status, created_at, users (id, name, email, phone)`)
        .eq('class_id', classId)
        .order('created_at', { ascending: true });

    return (data || []).map(b => ({
        ...b,
        users: Array.isArray(b.users) ? b.users[0] : b.users,
    })) as any[];
}

// ─────────────────────────────────────────────
// 8. Class Merge
// ─────────────────────────────────────────────
export async function mergeClasses(
    sourceClassId: string,
    targetClassId: string
): Promise<{ success: boolean; error?: string }> {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) return { success: false, error: "Acceso denegado" };
    if (sourceClassId === targetClassId) return { success: false, error: "Selecciona una clase diferente como destino." };

    const admin = getAdminClient();

    // 1. Fetch both classes
    const { data: classes } = await admin
        .from('classes')
        .select('id, date, time, max_capacity, status, notes')
        .in('id', [sourceClassId, targetClassId]);

    const source = (classes || []).find((c: any) => c.id === sourceClassId);
    const target = (classes || []).find((c: any) => c.id === targetClassId);

    if (!source || !target) return { success: false, error: "Una de las clases no existe." };
    if (source.status === 'CANCELLED') return { success: false, error: "La clase origen ya está cancelada." };
    if (target.status === 'CANCELLED') return { success: false, error: "La clase destino está cancelada." };

    // 2. Compute current pax in both classes (exclude CANCELLED bookings)
    const { data: bookingsData } = await admin
        .from('bookings')
        .select('class_id, pax')
        .in('class_id', [sourceClassId, targetClassId])
        .neq('status', 'CANCELLED');

    const paxByClass: Record<string, number> = {};
    for (const b of (bookingsData || [])) {
        if (b.class_id) paxByClass[b.class_id] = (paxByClass[b.class_id] || 0) + b.pax;
    }

    const sourcePax = paxByClass[sourceClassId] || 0;
    const targetPax = paxByClass[targetClassId] || 0;
    const combinedPax = sourcePax + targetPax;

    if (combinedPax > target.max_capacity) {
        return {
            success: false,
            error: `No hay capacidad suficiente. Combinado: ${combinedPax} alumnos, máximo de destino: ${target.max_capacity}.`,
        };
    }

    // 3. Move all bookings from source → target
    const { error: moveError } = await admin
        .from('bookings')
        .update({ class_id: targetClassId })
        .eq('class_id', sourceClassId)
        .neq('status', 'CANCELLED');

    if (moveError) return { success: false, error: `Error al transferir reservas: ${moveError.message}` };

    // 4. Cancel source class with traceability
    const mergeNote = `Fusionada en clase ${targetClassId} el ${new Date().toLocaleDateString('es-ES')}. ${source.notes ? '| ' + source.notes : ''}`.trim();
    const { error: cancelError } = await admin
        .from('classes')
        .update({
            status: 'CANCELLED',
            notes: mergeNote,
            merged_into_class_id: targetClassId,
        })
        .eq('id', sourceClassId);

    if (cancelError) return { success: false, error: `Error al cancelar clase origen: ${cancelError.message}` };

    revalidatePath('/admin/classes');
    revalidatePath('/admin');
    return { success: true };
}

