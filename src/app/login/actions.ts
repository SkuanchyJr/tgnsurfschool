"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { getSession } from "@/lib/session";

export async function loginAction(formData: FormData) {
    const email = (formData.get("email") as string)?.toLowerCase().trim();
    const password = formData.get("password") as string;

    if (!email || !password) return { error: "Email y contraseña son obligatorios" };

    try {
        const result = await pool.query(
            "SELECT id, email, name, role, password_hash, email_verified FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return { error: "Email o contraseña incorrectos" };
        }

        const user = result.rows[0];

        if (!user.password_hash) {
            return { error: "Esta cuenta no tiene contraseña configurada. Contacta con nosotros." };
        }

        const passwordValid = await bcrypt.compare(password, user.password_hash);
        if (!passwordValid) {
            return { error: "Email o contraseña incorrectos" };
        }

        const session = await getSession();
        session.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            emailVerified: user.email_verified,
        };
        await session.save();
    } catch (e: any) {
        console.error("[loginAction] Error:", e);
        return { error: "No se pudo iniciar sesión. Inténtalo de nuevo." };
    }

    redirect("/area-privada");
}
