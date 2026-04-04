"use server";

import pool from "@/lib/db";
import { getUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { notifyBookingConfirmation, notifyNewBookingToAdmin } from "@/lib/notifications";

export async function bookClass(
    classId: string,
    pax: number = 1
): Promise<{ success: boolean; error?: string }> {
    const user = await getUser();
    if (!user) return { success: false, error: "Debes iniciar sesión para reservar." };

    const client = await pool.connect();
    try {
        const clsResult = await client.query(
            `SELECT id, date, time, service_id, max_capacity, status FROM classes WHERE id = $1`,
            [classId]
        );
        if (clsResult.rows.length === 0) return { success: false, error: "Clase no encontrada." };
        const cls = clsResult.rows[0];

        if (cls.status === "CANCELLED") return { success: false, error: "Esta clase ha sido cancelada." };

        const paxResult = await client.query(
            `SELECT COALESCE(SUM(pax), 0) as total FROM bookings WHERE class_id = $1 AND status != 'CANCELLED'`,
            [classId]
        );
        const currentPax = parseInt(paxResult.rows[0].total, 10);

        if (currentPax + pax > cls.max_capacity) {
            const remaining = cls.max_capacity - currentPax;
            return {
                success: false,
                error: remaining <= 0
                    ? "Esta clase ya no tiene plazas disponibles."
                    : `Solo quedan ${remaining} plaza${remaining === 1 ? "" : "s"} disponibles.`,
            };
        }

        await client.query(
            `INSERT INTO bookings (user_id, class_id, service_id, date, time, pax, status) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')`,
            [user.id, classId, cls.service_id, cls.date, cls.time, pax]
        );

        let serviceName = "Clase de Surf";
        if (cls.service_id) {
            const svcResult = await client.query(`SELECT title FROM services WHERE id = $1`, [cls.service_id]);
            if (svcResult.rows.length > 0) serviceName = svcResult.rows[0].title;
        }

        const userResult = await client.query(`SELECT name, email FROM users WHERE id = $1`, [user.id]);
        const userInfo = userResult.rows[0];

        notifyBookingConfirmation(user.id, { date: cls.date, time: cls.time, pax, serviceName }).catch(console.error);
        notifyNewBookingToAdmin({
            studentName: userInfo?.name || user.email.split("@")[0],
            studentEmail: userInfo?.email || user.email,
            date: cls.date,
            time: cls.time,
            pax,
            serviceName,
        }).catch(console.error);

        revalidatePath("/area-privada");
        revalidatePath("/area-privada/clases");
        revalidatePath("/area-privada/mis-reservas");
        return { success: true };
    } catch (e) {
        console.error("[bookClass] Error:", e);
        return { success: false, error: "Error al crear la reserva. Inténtalo de nuevo." };
    } finally {
        client.release();
    }
}

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
    const user = await getUser();
    if (!user) return { error: "Debes iniciar sesión para guardar la evaluación." };

    const answersRaw = formData.get("answers") as string | null;
    if (!answersRaw) return { error: "Faltan datos de la evaluación." };

    let answers: Record<string, string> = {};
    try { answers = JSON.parse(answersRaw); } catch {
        return { error: "Formato de datos inválido." };
    }

    const surf_level = computeLevel(answers);

    try {
        await pool.query(
            `UPDATE users SET surf_level = $1, surf_assessment = $2 WHERE id = $3`,
            [surf_level, JSON.stringify(answers), user.id]
        );
        revalidatePath("/area-privada");
        return { success: true };
    } catch (e) {
        console.error("[saveAssessmentAction] Error:", e);
        return { error: "Error al guardar la evaluación. Inténtalo de nuevo." };
    }
}
