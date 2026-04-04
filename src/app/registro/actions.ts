"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { notifyWelcome } from "@/lib/notifications";

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

export async function registerAction(formData: FormData) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const answersRaw = formData.get("answers") as string | null;

    if (!email || !password) {
        return { error: "Email y contraseña son obligatorios" };
    }
    if (password.length < 6) {
        return { error: "La contraseña debe tener al menos 6 caracteres" };
    }

    // Parse questionnaire answers
    let answers: Record<string, string> = {};
    if (answersRaw) {
        try { answers = JSON.parse(answersRaw); } catch {}
    }
    const surf_level = Object.keys(answers).length > 0 ? computeLevel(answers) : "BEGINNER";

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${origin}/auth/callback` },
    });

    if (error) {
        const errorMap: Record<string, string> = {
            "User already registered": "Ya existe una cuenta con este email. ¿Quizás quieres iniciar sesión?",
            "Password should be at least 6 characters": "La contraseña debe tener al menos 6 caracteres",
            "Unable to validate email address: invalid format": "El formato del email no es válido",
            "Signup requires a valid password": "Debes introducir una contraseña válida",
        };
        return { error: errorMap[error.message] || error.message || "No se pudo crear la cuenta" };
    }

    // Create the public.users row with questionnaire data
    if (data?.user) {
        try {
            const adminClient = createAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                { auth: { autoRefreshToken: false, persistSession: false } }
            );
            await adminClient
                .from("users")
                .upsert(
                    {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.email?.split("@")[0] || "Alumno",
                        role: "STUDENT",
                        surf_level,
                        surf_assessment: Object.keys(answers).length > 0 ? answers : null,
                    },
                    { onConflict: "id" }
                );

            // Send welcome notification (non-blocking)
            const userName = data.user.email?.split("@")[0] || "Alumno";
            notifyWelcome(data.user.id, data.user.email || email, userName).catch(console.error);
        } catch (e) {
            console.error("[registro] Failed to upsert public.users:", e);
        }
    }

    if (data?.user?.confirmed_at) {
        return { success: "¡Tu cuenta ha sido creada! Ya puedes iniciar sesión." };
    }

    return {
        success: "Hemos enviado un email de confirmación a tu correo. Revisa tu bandeja de entrada (y spam) para activar tu cuenta.",
    };
}
