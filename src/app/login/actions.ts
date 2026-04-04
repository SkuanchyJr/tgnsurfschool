"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email y contraseña son obligatorios" };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        // Map common Supabase errors to user-friendly messages
        const errorMap: Record<string, string> = {
            "Invalid login credentials": "Email o contraseña incorrectos",
            "Email not confirmed": "Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.",
            "Too many requests": "Demasiados intentos. Espera un momento antes de reintentar.",
        };

        return {
            error: errorMap[error.message] || error.message || "No se pudo iniciar sesión",
        };
    }

    redirect("/area-privada");
}
