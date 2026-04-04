import Link from "next/link";
import { Waves } from "lucide-react";
import RegisterForm from "./RegisterForm";

export const metadata = {
    title: "Crear Cuenta | TGN Surf School",
    description: "Regístrate en TGN Surf School para reservar tus clases de surf",
};

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string; success?: string }>;
}) {
    const params = await searchParams;
    const message = params?.message || null;
    const success = params?.success || null;

    return (
        <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-[80vh]">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="flex flex-col mb-10 items-center gap-4">
                    <Link
                        href="/"
                        className="w-20 h-20 bg-gradient-to-br from-[#3F7FE3] to-[#1E3A8A] text-white rounded-2xl flex items-center justify-center transform hover:scale-105 transition-all duration-300 shadow-xl shadow-[#3F7FE3]/30"
                    >
                        <Waves size={36} strokeWidth={2} />
                    </Link>
                    <div className="text-center">
                        <h1 className="text-3xl font-fredoka font-bold text-[#111827]">
                            Únete a TGN Surf
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Crea tu cuenta de alumno para reservar clases
                        </p>
                    </div>
                </div>

                {/* Success message (email confirmation) */}
                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-center text-sm font-medium animate-fade-in-up">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="font-bold">¡Revisa tu email!</span>
                        </div>
                        {success}
                    </div>
                )}

                {/* Error message */}
                {message && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center text-sm font-medium animate-fade-in-up">
                        {message}
                    </div>
                )}

                {/* Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                    <RegisterForm />

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-400">
                        ¿Ya tienes cuenta?{" "}
                        <Link
                            href="/login"
                            className="text-[#111827] font-semibold hover:text-[#3F7FE3] transition-colors"
                        >
                            Inicia sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
