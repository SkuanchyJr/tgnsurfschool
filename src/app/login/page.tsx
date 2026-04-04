import Link from "next/link";
import { Waves } from "lucide-react";
import LoginForm from "./LoginForm";

export const metadata = {
    title: "Iniciar Sesión | TGN Surf School",
    description: "Accede a tu área privada de TGN Surf School",
};

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string; error?: string }>;
}) {
    const params = await searchParams;
    const message = params?.message || null;
    const error = params?.error || null;

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
                            Bienvenido de vuelta
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Accede a tu área privada de TGN Surf School
                        </p>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center text-sm font-medium animate-fade-in-up">
                        {error === "InvalidToken"
                            ? "El enlace de verificación ha expirado o no es válido. Inténtalo de nuevo."
                            : error}
                    </div>
                )}
                {message && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center text-sm font-medium animate-fade-in-up">
                        {message}
                    </div>
                )}

                {/* Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                    <LoginForm />

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-400">
                        ¿No tienes cuenta?{" "}
                        <Link
                            href="/registro"
                            className="text-[#3F7FE3] font-semibold hover:text-[#2A5BA6] transition-colors"
                        >
                            Regístrate gratis
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
