"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { notifyWelcome } from "@/lib/notifications";

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

        const result = await client.query(
            `INSERT INTO users (email, password_hash, name, role, surf_level, surf_assessment, email_verified)
             VALUES ($1, $2, $3, 'STUDENT', $4, $5, true)
             RETURNING id, email, name, role`,
            [email, password_hash, name, surf_level, Object.keys(answers).length > 0 ? JSON.stringify(answers) : null]
        );

        const user = result.rows[0];

        const session = await getSession();
        session.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            emailVerified: true,
        };
        await session.save();

        notifyWelcome(user.id, user.email, user.name).catch(console.error);
    } catch (e: any) {
        console.error("[registro] Error:", e);
        return { error: "No se pudo crear la cuenta. Inténtalo de nuevo." };
    } finally {
        client.release();
    }

    redirect("/area-privada");
}
