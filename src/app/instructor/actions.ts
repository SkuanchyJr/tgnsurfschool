"use server";

import pool from "@/lib/db";
import { getUser } from "@/lib/session";
import { notifyAssignmentResponse } from "@/lib/notifications";

export async function respondToAssignment(
    classId: string,
    response: "ACCEPTED" | "REJECTED"
): Promise<{ success: boolean; error?: string }> {
    const user = await getUser();
    if (!user) return { success: false, error: "No autenticado." };

    try {
        await pool.query(
            `UPDATE class_instructors SET status = $1 WHERE class_id = $2 AND instructor_id = $3`,
            [response, classId, user.id]
        );

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/instructor");
        revalidatePath("/instructor/clases");
        revalidatePath("/instructor/asignaciones");
        revalidatePath("/admin/classes");

        notifyAssignmentResponse(user.id, classId, response).catch(console.error);
        return { success: true };
    } catch (e) {
        console.error("[respondToAssignment] Error:", e);
        return { success: false, error: "No se pudo actualizar la asignación." };
    }
}

export async function getMyAssignedClasses() {
    const user = await getUser();
    if (!user) return [];

    try {
        const assignmentsResult = await pool.query(
            `SELECT
                ci.id as assignment_id,
                ci.status as assignment_status,
                c.id, c.date, c.time, c.duration_minutes, c.level, c.max_capacity, c.status, c.notes,
                s.title as service_title, s.type as service_type,
                COALESCE((
                    SELECT SUM(b.pax) FROM bookings b
                    WHERE b.class_id = c.id AND b.status != 'CANCELLED'
                ), 0) as total_pax
             FROM class_instructors ci
             JOIN classes c ON c.id = ci.class_id
             LEFT JOIN services s ON s.id = c.service_id
             WHERE ci.instructor_id = $1
             ORDER BY ci.created_at DESC`,
            [user.id]
        );

        const classIds = assignmentsResult.rows.map((r: any) => r.id).filter(Boolean);

        let instructorsByClass: Record<string, any[]> = {};
        if (classIds.length > 0) {
            const instrResult = await pool.query(
                `SELECT ci.class_id, ci.id, ci.instructor_id, ci.status, u.id as u_id, u.name, u.email
                 FROM class_instructors ci
                 JOIN users u ON u.id = ci.instructor_id
                 WHERE ci.class_id = ANY($1::uuid[])`,
                [classIds]
            );
            for (const row of instrResult.rows) {
                if (!instructorsByClass[row.class_id]) instructorsByClass[row.class_id] = [];
                instructorsByClass[row.class_id].push({
                    id: row.id,
                    instructor_id: row.instructor_id,
                    status: row.status,
                    instructor: { id: row.u_id, name: row.name, email: row.email },
                });
            }
        }

        return assignmentsResult.rows.map((row: any) => ({
            assignmentId: row.assignment_id,
            assignmentStatus: row.assignment_status,
            id: row.id,
            date: row.date,
            time: row.time,
            duration_minutes: row.duration_minutes,
            level: row.level,
            max_capacity: row.max_capacity,
            status: row.status,
            notes: row.notes,
            total_pax: parseInt(row.total_pax, 10),
            service: row.service_title ? { title: row.service_title, type: row.service_type } : null,
            class_instructors: instructorsByClass[row.id] || [],
        }));
    } catch (e) {
        console.error("[getMyAssignedClasses] Error:", e);
        return [];
    }
}
