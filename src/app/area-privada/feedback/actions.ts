"use server";

import pool from "@/lib/db";
import { getUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function saveFeedbackAction(
    formData: FormData
): Promise<{ success?: boolean; error?: string }> {
    const user = await getUser();
    if (!user) return { error: "Debes iniciar sesión." };

    const booking_id         = formData.get("booking_id")         as string | null;
    const session_feeling    = formData.get("session_feeling")    as string | null;
    const worked_blocks_raw  = formData.get("worked_blocks")      as string | null;
    const achievement_feeling = formData.get("achievement_feeling") as string | null;
    const improvement_goal   = formData.get("improvement_goal")   as string | null;
    const rating_raw         = formData.get("rating")             as string | null;
    const google_review_sent = formData.get("google_review_sent") === "true";

    if (!session_feeling || !rating_raw) {
        return { error: "Faltan datos obligatorios (sensación y valoración)." };
    }

    let worked_blocks: any[] = [];
    try {
        worked_blocks = worked_blocks_raw ? JSON.parse(worked_blocks_raw) : [];
    } catch {
        return { error: "Formato de datos inválido." };
    }

    const rating = parseInt(rating_raw, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
        return { error: "Valoración inválida." };
    }

    try {
        // Verify booking belongs to user
        if (booking_id) {
            const check = await pool.query(
                `SELECT id FROM bookings WHERE id = $1 AND user_id = $2`,
                [booking_id, user.id]
            );
            if (check.rows.length === 0) return { error: "Reserva no encontrada." };
        }

        const result = await pool.query(
            `INSERT INTO session_feedback
               (user_id, booking_id, session_feeling, worked_blocks, achievement_feeling, improvement_goal, rating, google_review_sent)
             VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8)
             RETURNING id`,
            [
                user.id,
                booking_id || null,
                session_feeling,
                JSON.stringify(worked_blocks),
                achievement_feeling || null,
                improvement_goal || null,
                rating,
                google_review_sent,
            ]
        );
        const feedbackId = result.rows[0].id;

        // Link feedback to booking + update last_session_date
        if (booking_id) {
            await pool.query(
                `UPDATE bookings SET feedback_id = $1 WHERE id = $2 AND user_id = $3`,
                [feedbackId, booking_id, user.id]
            );
        }

        // Update user's last session date
        await pool.query(
            `UPDATE users SET last_session_date = CURRENT_DATE WHERE id = $1`,
            [user.id]
        );

        revalidatePath("/area-privada/mis-reservas");
        revalidatePath("/area-privada");
        return { success: true };
    } catch (e) {
        console.error("[saveFeedbackAction] Error:", e);
        return { error: "Error al guardar el feedback. Inténtalo de nuevo." };
    }
}
