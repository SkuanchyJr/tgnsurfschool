"use server";

import pool from "@/lib/db";
import { getUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import {
    notifyBookingStatusChange,
    notifyClassAssignment,
    notifyClassCancelled,
} from "@/lib/notifications";

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

export async function verifyAdminAccess(): Promise<{ hasAccess: boolean; user?: any }> {
    const user = await getUser();
    if (!user) return { hasAccess: false };
    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') return { hasAccess: false };
    return { hasAccess: true, user };
}

export async function getAllBookings() {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) throw new Error("Acceso denegado");

    const result = await pool.query(
        `SELECT
            b.id, b.date, b.time, b.pax, b.status,
            u.id as user_id, u.name as user_name, u.email as user_email, u.phone as user_phone,
            s.id as service_id, s.title as service_title, s.type as service_type, s.price as service_price
         FROM bookings b
         LEFT JOIN users u ON u.id = b.user_id
         LEFT JOIN services s ON s.id = b.service_id
         ORDER BY b.date DESC, b.time DESC`
    );

    return result.rows.map((b: any) => ({
        id: b.id,
        date: b.date,
        time: b.time,
        pax: b.pax,
        status: b.status,
        users: { id: b.user_id, name: b.user_name, email: b.user_email, phone: b.user_phone },
        services: { id: b.service_id, title: b.service_title, type: b.service_type, price: b.service_price },
    }));
}

export async function updateBookingStatus(bookingId: string, newStatus: string) {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) return { success: false, error: "Acceso denegado" };

    try {
        await pool.query(`UPDATE bookings SET status = $1 WHERE id = $2`, [newStatus, bookingId]);
        notifyBookingStatusChange(bookingId, newStatus).catch(console.error);
        revalidatePath('/admin');
        revalidatePath('/area-privada');
        return { success: true };
    } catch (e) {
        return { success: false, error: "No se pudo actualizar el estado" };
    }
}

export async function getAllStudents() {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) throw new Error("Acceso denegado");

    const result = await pool.query(
        `SELECT u.*, COUNT(b.id) as booking_count
         FROM users u
         LEFT JOIN bookings b ON b.user_id = u.id
         WHERE u.role = 'STUDENT'
         GROUP BY u.id
         ORDER BY u.created_at DESC`
    );
    return result.rows;
}

export async function getAllInstructors() {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) throw new Error("Acceso denegado");

    const result = await pool.query(
        `SELECT * FROM users WHERE role IN ('INSTRUCTOR', 'ADMIN') ORDER BY name ASC`
    );
    return result.rows;
}

export async function getStudentDetail(id: string) {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) throw new Error("Acceso denegado");

    const studentResult = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (studentResult.rows.length === 0) return null;
    const student = studentResult.rows[0];

    const bookingsResult = await pool.query(
        `SELECT b.id, b.date, b.time, b.pax, b.status, b.intake_id, b.feedback_id,
                s.id as service_id, s.title as service_title, s.type as service_type, s.price as service_price
         FROM bookings b
         LEFT JOIN services s ON s.id = b.service_id
         WHERE b.user_id = $1
         ORDER BY b.date DESC, b.time DESC`,
        [id]
    );

    // Collect IDs for batch fetch
    const intakeIds  = bookingsResult.rows.filter((b: any) => b.intake_id).map((b: any)  => b.intake_id);
    const feedbackIds = bookingsResult.rows.filter((b: any) => b.feedback_id).map((b: any) => b.feedback_id);

    let intakesMap:   Record<string, any> = {};
    let feedbacksMap: Record<string, any> = {};

    if (intakeIds.length > 0) {
        const iResult = await pool.query(
            `SELECT * FROM session_intake WHERE id = ANY($1::uuid[])`,
            [intakeIds]
        );
        for (const row of iResult.rows) intakesMap[row.id] = row;
    }

    if (feedbackIds.length > 0) {
        const fResult = await pool.query(
            `SELECT * FROM session_feedback WHERE id = ANY($1::uuid[])`,
            [feedbackIds]
        );
        for (const row of fResult.rows) feedbacksMap[row.id] = row;
    }

    return {
        ...student,
        bookings: bookingsResult.rows.map((b: any) => ({
            ...b,
            services: { id: b.service_id, title: b.service_title, type: b.service_type, price: b.service_price },
            intake:   b.intake_id   ? intakesMap[b.intake_id]   ?? null : null,
            feedback: b.feedback_id ? feedbacksMap[b.feedback_id] ?? null : null,
        })),
    };
}


export async function createService(serviceData: {
    title: string; type: string; description: string | null; price: number;
}) {
    try {
        const { hasAccess } = await verifyAdminAccess();
        if (!hasAccess) return { success: false, error: "Acceso denegado" };

        await pool.query(
            `INSERT INTO services (title, type, description, price, is_active) VALUES ($1, $2, $3, $4, true)`,
            [serviceData.title, serviceData.type, serviceData.description, serviceData.price]
        );
        revalidatePath('/admin/services');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Error inesperado" };
    }
}

export async function updateService(id: string, serviceData: {
    title: string; type: string; description: string | null; price: number;
}) {
    try {
        const { hasAccess } = await verifyAdminAccess();
        if (!hasAccess) return { success: false, error: "Acceso denegado" };

        await pool.query(
            `UPDATE services SET title = $1, type = $2, description = $3, price = $4 WHERE id = $5`,
            [serviceData.title, serviceData.type, serviceData.description, serviceData.price, id]
        );
        revalidatePath('/admin/services');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Error inesperado" };
    }
}

export async function deleteService(id: string) {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) return { success: false, error: "Acceso denegado" };

    try {
        await pool.query(`DELETE FROM services WHERE id = $1`, [id]);
        revalidatePath('/admin/services');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

async function getClassesWithBookings(whereClause: string, params: any[]): Promise<SurfClassWithBookings[]> {
    const classesResult = await pool.query(
        `SELECT c.*, s.title as service_title, s.type as service_type
         FROM classes c
         LEFT JOIN services s ON s.id = c.service_id
         ${whereClause}
         ORDER BY c.date ASC, c.time ASC`,
        params
    );
    if (classesResult.rows.length === 0) return [];

    const classIds = classesResult.rows.map((c: any) => c.id);

    const bookingsResult = await pool.query(
        `SELECT class_id, pax FROM bookings WHERE class_id = ANY($1::uuid[]) AND status != 'CANCELLED'`,
        [classIds]
    );
    const paxByClass: Record<string, number> = {};
    const countByClass: Record<string, number> = {};
    for (const b of bookingsResult.rows) {
        paxByClass[b.class_id] = (paxByClass[b.class_id] || 0) + parseInt(b.pax, 10);
        countByClass[b.class_id] = (countByClass[b.class_id] || 0) + 1;
    }

    const instrResult = await pool.query(
        `SELECT ci.class_id, ci.id, ci.instructor_id, ci.status, u.id as u_id, u.name, u.email
         FROM class_instructors ci
         JOIN users u ON u.id = ci.instructor_id
         WHERE ci.class_id = ANY($1::uuid[])`,
        [classIds]
    );
    const instrByClass: Record<string, ClassInstructor[]> = {};
    for (const row of instrResult.rows) {
        if (!instrByClass[row.class_id]) instrByClass[row.class_id] = [];
        instrByClass[row.class_id].push({
            id: row.id,
            instructor_id: row.instructor_id,
            status: row.status,
            instructor: { id: row.u_id, name: row.name, email: row.email },
        });
    }

    return classesResult.rows.map((c: any) => ({
        id: c.id,
        service_id: c.service_id,
        date: c.date,
        time: c.time,
        duration_minutes: c.duration_minutes,
        level: c.level,
        max_capacity: c.max_capacity,
        status: c.status,
        location: c.location,
        notes: c.notes,
        created_at: c.created_at,
        service: c.service_title ? { title: c.service_title, type: c.service_type } : null,
        class_instructors: instrByClass[c.id] || [],
        total_pax: paxByClass[c.id] || 0,
        booking_count: countByClass[c.id] || 0,
    }));
}

export async function getClasses(): Promise<SurfClassWithBookings[]> {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) throw new Error("Acceso denegado");
    return getClassesWithBookings("", []);
}

export async function getClassesForDate(date: string): Promise<SurfClassWithBookings[]> {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) throw new Error("Acceso denegado");
    return getClassesWithBookings("WHERE c.date = $1 AND c.status != 'CANCELLED'", [date]);
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

    const { instructorIds, ...classData } = data;

    try {
        const result = await pool.query(
            `INSERT INTO classes (service_id, date, time, duration_minutes, level, max_capacity, location, notes, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'SCHEDULED') RETURNING id`,
            [classData.service_id, classData.date, classData.time, classData.duration_minutes,
             classData.level, classData.max_capacity, classData.location ?? null, classData.notes ?? null]
        );
        const createdId = result.rows[0].id;

        if (instructorIds && instructorIds.length > 0) {
            for (const instructorId of instructorIds) {
                await pool.query(
                    `INSERT INTO class_instructors (class_id, instructor_id, status) VALUES ($1, $2, 'ASSIGNED')
                     ON CONFLICT (class_id, instructor_id) DO NOTHING`,
                    [createdId, instructorId]
                );
            }

            let serviceName = "Clase de Surf";
            if (data.service_id) {
                const svcResult = await pool.query(`SELECT title FROM services WHERE id = $1`, [data.service_id]);
                if (svcResult.rows.length > 0) serviceName = svcResult.rows[0].title;
            }
            for (const iid of instructorIds) {
                notifyClassAssignment(iid, {
                    classId: createdId,
                    date: data.date,
                    time: data.time,
                    level: data.level,
                    serviceName,
                }).catch(console.error);
            }
        }

        revalidatePath('/admin/classes');
        revalidatePath('/admin');
        return { success: true, id: createdId };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
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

    const { instructorIds, ...classData } = data;

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(classData)) {
        setClauses.push(`${key} = $${idx++}`);
        values.push(value);
    }

    try {
        if (setClauses.length > 0) {
            values.push(id);
            await pool.query(`UPDATE classes SET ${setClauses.join(", ")} WHERE id = $${idx}`, values);
        }

        if (instructorIds !== undefined) {
            await pool.query(`DELETE FROM class_instructors WHERE class_id = $1`, [id]);
            for (const instructorId of instructorIds) {
                await pool.query(
                    `INSERT INTO class_instructors (class_id, instructor_id, status) VALUES ($1, $2, 'ASSIGNED')
                     ON CONFLICT (class_id, instructor_id) DO NOTHING`,
                    [id, instructorId]
                );
            }
        }

        revalidatePath('/admin/classes');
        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function cancelClass(id: string): Promise<{ success: boolean; error?: string }> {
    const result = await updateClass(id, { status: 'CANCELLED' });
    if (result.success) {
        notifyClassCancelled(id).catch(console.error);
    }
    return result;
}

export async function assignInstructor(classId: string, instructorId: string): Promise<{ success: boolean; error?: string }> {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) return { success: false, error: "Acceso denegado" };

    try {
        await pool.query(
            `INSERT INTO class_instructors (class_id, instructor_id, status) VALUES ($1, $2, 'ASSIGNED')
             ON CONFLICT (class_id, instructor_id) DO UPDATE SET status = 'ASSIGNED'`,
            [classId, instructorId]
        );

        const clsResult = await pool.query(
            `SELECT c.date, c.time, c.level, s.title as service_title
             FROM classes c LEFT JOIN services s ON s.id = c.service_id
             WHERE c.id = $1`,
            [classId]
        );
        if (clsResult.rows.length > 0) {
            const cls = clsResult.rows[0];
            notifyClassAssignment(instructorId, {
                classId,
                date: cls.date,
                time: cls.time,
                level: cls.level,
                serviceName: cls.service_title || "Clase de Surf",
            }).catch(console.error);
        }

        revalidatePath('/admin/classes');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function removeInstructor(classId: string, instructorId: string): Promise<{ success: boolean; error?: string }> {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) return { success: false, error: "Acceso denegado" };

    try {
        await pool.query(
            `DELETE FROM class_instructors WHERE class_id = $1 AND instructor_id = $2`,
            [classId, instructorId]
        );
        revalidatePath('/admin/classes');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getClassBookings(classId: string) {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) throw new Error("Acceso denegado");

    const result = await pool.query(
        `SELECT b.id, b.date, b.time, b.pax, b.status, b.created_at,
                u.id as user_id, u.name as user_name, u.email as user_email, u.phone as user_phone
         FROM bookings b
         LEFT JOIN users u ON u.id = b.user_id
         WHERE b.class_id = $1
         ORDER BY b.created_at ASC`,
        [classId]
    );

    return result.rows.map((b: any) => ({
        id: b.id,
        date: b.date,
        time: b.time,
        pax: b.pax,
        status: b.status,
        created_at: b.created_at,
        users: { id: b.user_id, name: b.user_name, email: b.user_email, phone: b.user_phone },
    }));
}

export async function mergeClasses(
    sourceClassId: string,
    targetClassId: string
): Promise<{ success: boolean; error?: string }> {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) return { success: false, error: "Acceso denegado" };
    if (sourceClassId === targetClassId) return { success: false, error: "Selecciona una clase diferente como destino." };

    const client = await pool.connect();
    try {
        const classesResult = await client.query(
            `SELECT id, date, time, max_capacity, status, notes FROM classes WHERE id = ANY($1::uuid[])`,
            [[sourceClassId, targetClassId]]
        );
        const source = classesResult.rows.find((c: any) => c.id === sourceClassId);
        const target = classesResult.rows.find((c: any) => c.id === targetClassId);

        if (!source || !target) return { success: false, error: "Una de las clases no existe." };
        if (source.status === 'CANCELLED') return { success: false, error: "La clase origen ya está cancelada." };
        if (target.status === 'CANCELLED') return { success: false, error: "La clase destino está cancelada." };

        const paxResult = await client.query(
            `SELECT class_id, SUM(pax) as total FROM bookings
             WHERE class_id = ANY($1::uuid[]) AND status != 'CANCELLED'
             GROUP BY class_id`,
            [[sourceClassId, targetClassId]]
        );
        const paxByClass: Record<string, number> = {};
        for (const r of paxResult.rows) paxByClass[r.class_id] = parseInt(r.total, 10);

        const combinedPax = (paxByClass[sourceClassId] || 0) + (paxByClass[targetClassId] || 0);
        if (combinedPax > target.max_capacity) {
            return {
                success: false,
                error: `No hay capacidad suficiente. Combinado: ${combinedPax} alumnos, máximo de destino: ${target.max_capacity}.`,
            };
        }

        await client.query(
            `UPDATE bookings SET class_id = $1 WHERE class_id = $2 AND status != 'CANCELLED'`,
            [targetClassId, sourceClassId]
        );

        const mergeNote = `Fusionada en clase ${targetClassId} el ${new Date().toLocaleDateString('es-ES')}. ${source.notes ? '| ' + source.notes : ''}`.trim();
        await client.query(
            `UPDATE classes SET status = 'CANCELLED', notes = $1, merged_into_class_id = $2 WHERE id = $3`,
            [mergeNote, targetClassId, sourceClassId]
        );

        revalidatePath('/admin/classes');
        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    } finally {
        client.release();
    }
}

export type CampaignFilters = {
    levels?: string[];               // BEGINNER, INITIATION, INTERMEDIATE, ADVANCED
    hasActiveVouchers?: boolean;
    lastSessionBefore?: string;      // ISO date — inactive users
    preferredBeach?: string;
    marketingConsentOnly?: boolean;
};

export async function sendSegmentedCampaign(
    filters: CampaignFilters,
    subject: string,
    htmlBody: string
): Promise<{ success: boolean; sent: number; total: number; error?: string }> {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) return { success: false, sent: 0, total: 0, error: "Acceso denegado" };

    try {
        const conditions: string[] = [`u.role = 'STUDENT'`];
        const params: any[]         = [];
        let idx = 1;

        if (filters.marketingConsentOnly) {
            conditions.push(`u.marketing_consent = true`);
        }
        if (filters.levels && filters.levels.length > 0) {
            conditions.push(`u.surf_level = ANY($${idx++}::text[])`);
            params.push(filters.levels);
        }
        if (filters.preferredBeach) {
            conditions.push(`u.preferred_beach = $${idx++}`);
            params.push(filters.preferredBeach);
        }
        if (filters.lastSessionBefore) {
            conditions.push(`(u.last_session_date IS NULL OR u.last_session_date < $${idx++})`);
            params.push(filters.lastSessionBefore);
        }
        if (filters.hasActiveVouchers) {
            conditions.push(
                `EXISTS (SELECT 1 FROM vouchers v WHERE v.user_id = u.id AND v.remaining_classes > 0)`
            );
        }

        const where = conditions.join(" AND ");
        const result = await pool.query<{ id: string; name: string; email: string }>(
            `SELECT u.id, u.name, u.email FROM users u WHERE ${where} ORDER BY u.name ASC`,
            params
        );

        const users = result.rows;
        if (users.length === 0) {
            return { success: true, sent: 0, total: 0 };
        }

        const { sendEmail } = await import("@/lib/email");

        let sent = 0;
        for (const u of users) {
            // Personalise greeting
            const personalBody = htmlBody.replace(/\[Nombre\]/g, u.name);
            const res = await sendEmail(u.email, subject, personalBody);
            if (res.success) sent++;
        }

        return { success: true, sent, total: users.length };
    } catch (e: any) {
        console.error("[sendSegmentedCampaign] Error:", e);
        return { success: false, sent: 0, total: 0, error: e.message };
    }
}

export async function getStudentsSegmented(filters: CampaignFilters) {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) throw new Error("Acceso denegado");

    const conditions: string[] = [`u.role = 'STUDENT'`];
    const params: any[]         = [];
    let idx = 1;

    if (filters.marketingConsentOnly) conditions.push(`u.marketing_consent = true`);
    if (filters.levels && filters.levels.length > 0) {
        conditions.push(`u.surf_level = ANY($${idx++}::text[])`);
        params.push(filters.levels);
    }
    if (filters.preferredBeach) {
        conditions.push(`u.preferred_beach = $${idx++}`);
        params.push(filters.preferredBeach);
    }
    if (filters.lastSessionBefore) {
        conditions.push(`(u.last_session_date IS NULL OR u.last_session_date < $${idx++})`);
        params.push(filters.lastSessionBefore);
    }

    const where = conditions.join(" AND ");
    const result = await pool.query(
        `SELECT u.id, u.name, u.email, u.phone, u.surf_level, u.last_session_date, u.preferred_beach
         FROM users u WHERE ${where} ORDER BY u.name ASC`,
        params
    );
    return result.rows;
}
