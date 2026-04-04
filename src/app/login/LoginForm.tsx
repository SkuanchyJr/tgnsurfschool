"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginAction } from "./actions";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleSubmit(formData: FormData) {
        setError(null);
        startTransition(async () => {
            const result = await loginAction(formData);
            if (result?.error) {
                setError(result.error);
            }
        });
    }

    return (
        <form action={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
                <label
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                    htmlFor="login-email"
                >
                    Email
                </label>
                <input
                    id="login-email"
                    className="w-full rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F7FE3]/40 focus:border-[#3F7FE3] transition-all text-sm"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    autoComplete="email"
                    disabled={isPending}
                />
            </div>

            {/* Password */}
            <div>
                <label
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                    htmlFor="login-password"
                >
                    Contraseña
                </label>
                <div className="relative">
                    <input
                        id="login-password"
                        className="w-full rounded-xl px-4 py-3 pr-12 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F7FE3]/40 focus:border-[#3F7FE3] transition-all text-sm"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        minLength={6}
                        disabled={isPending}
                    />
                    <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            {/* Error inline */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium text-center animate-fade-in-up">
                    {error}
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#3F7FE3] hover:from-[#1E3A8A] hover:to-[#2A5BA6] text-white rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-300 shadow-lg shadow-[#3F7FE3]/20 hover:shadow-xl hover:shadow-[#3F7FE3]/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isPending ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Iniciando sesión...
                    </>
                ) : (
                    "Iniciar Sesión"
                )}
            </button>
        </form>
    );
}
