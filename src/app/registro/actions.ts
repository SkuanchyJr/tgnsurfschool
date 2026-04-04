"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import pool from "@/lib/db";
import { notifyWelcome } from "@/lib/notifications";
import { sendEmail, emailHeading, emailParagraph, emailButton } from "@/lib/email";

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

export async function registerAction(formData: FormData) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
    const email = (formData.get("email") as string)?.toLowerCase().trim();
    const password = formData.get("password") as string;
    const answersRaw = formData.get("answers") as string | null;

    if (!email || !password) return { error: "Email y contraseña son obligatorios" };
    if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres" };

    let answers: Record<string, string> = {};
    if (answersRaw) {
        try { answers = JSON.parse(answersRaw); } catch {}
    }
    const surf_level = Object.keys(answers).length > 0 ? computeLevel(answers) : "BEGINNER";
    const name = email.split("@")[0] || "Alumno";

    const client = await pool.connect();
    try {
        const existing = await client.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existing.rows.length > 0) {
            return { error: "Ya existe una cuenta con este email. ¿Quizás quieres iniciar sesión?" };
        }

        const password_hash = await bcrypt.hash(password, 12);
        const verification_token = randomBytes(32).toString("hex");
        const token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        const result = await client.query(
            `INSERT INTO users (email, password_hash, name, role, surf_level, surf_assessment, email_verified, verification_token, verification_token_expires)
             VALUES ($1, $2, $3, 'STUDENT', $4, $5, false, $6, $7)
             RETURNING id`,
            [email, password_hash, name, surf_level, Object.keys(answers).length > 0 ? JSON.stringify(answers) : null, verification_token, token_expires]
        );

        const userId = result.rows[0].id;

        const verifyUrl = `${origin}/auth/callback?token=${verification_token}`;
        const emailBody = [
            emailHeading("Confirma tu cuenta 📧"),
            emailParagraph(`Hola <strong>${name}</strong>,`),
            emailParagraph("Haz clic en el botón para verificar tu dirección de email y activar tu cuenta:"),
            emailButton("Verificar mi cuenta", verifyUrl),
            emailParagraph("Si no has creado una cuenta, puedes ignorar este mensaje."),
        ].join("");

        await sendEmail(email, "Verifica tu cuenta — TGN Surf School", emailBody);

        notifyWelcome(userId, email, name).catch(console.error);

        return { success: "Hemos enviado un email de confirmación a tu correo. Revisa tu bandeja de entrada (y spam) para activar tu cuenta." };
    } catch (e: any) {
        console.error("[registro] Error:", e);
        return { error: "No se pudo crear la cuenta. Inténtalo de nuevo." };
    } finally {
        client.release();
    }
}
