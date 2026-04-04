"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Loader2, CheckCircle, ChevronLeft, Waves, Star, Mountain, Zap, Target } from "lucide-react";
import { registerAction } from "./actions";

// ─── Questionnaire definition ─────────────────────────────────────────────────
const QUESTIONS = [
    {
        id: "previous_surf",
        question: "¿Has practicado surf antes?",
        icon: <Waves size={20} />,
        options: [
            { value: "no", label: "No, es mi primera vez" },
            { value: "yes_little", label: "Sí, un par de veces" },
            { value: "yes_regular", label: "Sí, con regularidad" },
            { value: "yes_lots", label: "Sí, llevo años surfeando" },
        ],
    },
    {
        id: "water_comfort",
        question: "¿Cómo te describes en el agua?",
        icon: <Star size={20} />,
        options: [
            { value: "nervous", label: "Me pongo nervioso/a" },
            { value: "ok", label: "Me defiendo, pero con cuidado" },
            { value: "comfortable", label: "Me siento cómodo/a" },
            { value: "very_comfortable", label: "Muy cómodo/a, soy buen nadador/a" },
        ],
    },
    {
        id: "wave_preference",
        question: "¿Qué tipo de ola prefieres o quieres aprender?",
        icon: <Mountain size={20} />,
        options: [
            { value: "small", label: "Pequeñas y suaves" },
            { value: "medium", label: "Medias y manejables" },
            { value: "big", label: "Grandes y potentes" },
            { value: "any", label: "Lo que me pongan" },
        ],
    },
    {
        id: "fitness_level",
        question: "¿Cómo describirías tu nivel de forma física?",
        icon: <Zap size={20} />,
        options: [
            { value: "low", label: "Baja, no hago mucho deporte" },
            { value: "moderate", label: "Moderada, algo de deporte" },
            { value: "high", label: "Alta, hago deporte a menudo" },
            { value: "athlete", label: "Muy alta, soy deportista" },
        ],
    },
    {
        id: "main_goal",
        question: "¿Cuál es tu objetivo principal?",
        icon: <Target size={20} />,
        options: [
            { value: "learn_standup", label: "Aprender a ponerme de pie" },
            { value: "improve_technique", label: "Mejorar mi técnica" },
            { value: "ride_better_waves", label: "Surfear olas más grandes" },
            { value: "compete", label: "Preparación para competir" },
        ],
    },
];

// ─── Level badge colors ────────────────────────────────────────────────────────
const LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    BEGINNER: { label: "Principiante", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    INTERMEDIATE: { label: "Intermedio", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    ADVANCED: { label: "Avanzado", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

// ─── Level computation ─────────────────────────────────────────────────────────
function computeLevel(answers: Record<string, string>): string {
    let score = 0;

    // previous surf
    if (answers.previous_surf === "yes_lots") score += 3;
    else if (answers.previous_surf === "yes_regular") score += 2;
    else if (answers.previous_surf === "yes_little") score += 1;

    // water comfort
    if (answers.water_comfort === "very_comfortable") score += 3;
    else if (answers.water_comfort === "comfortable") score += 2;
    else if (answers.water_comfort === "ok") score += 1;

    // wave preference
    if (answers.wave_preference === "big") score += 3;
    else if (answers.wave_preference === "medium") score += 2;
    else if (answers.wave_preference === "any") score += 1;

    // fitness
    if (answers.fitness_level === "athlete") score += 2;
    else if (answers.fitness_level === "high") score += 1;

    // goal
    if (answers.main_goal === "compete" || answers.main_goal === "ride_better_waves") score += 2;
    else if (answers.main_goal === "improve_technique") score += 1;

    if (score >= 9) return "ADVANCED";
    if (score >= 4) return "INTERMEDIATE";
    return "BEGINNER";
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function RegisterForm() {
    const [step, setStep] = useState<1 | 2>(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const passwordsMatch = password === confirmPassword;
    const passwordLongEnough = password.length >= 6;
    const allQuestionsAnswered = QUESTIONS.every((q) => answers[q.id]);
    const computedLevel = allQuestionsAnswered ? computeLevel(answers) : null;
    const levelCfg = computedLevel ? LEVEL_CONFIG[computedLevel] : null;

    function handleStep1(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        if (!passwordsMatch) { setError("Las contraseñas no coinciden"); return; }
        if (!passwordLongEnough) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleSubmit() {
        setError(null);
        setSuccess(null);
        const formData = new FormData();
        formData.set("email", email);
        formData.set("password", password);
        formData.set("answers", JSON.stringify(answers));
        startTransition(async () => {
            const result = await registerAction(formData);
            if (result?.error) {
                setError(result.error);
                setStep(1);
            } else if (result?.success) {
                setSuccess(result.success);
            }
        });
    }

    // ── Success screen ──────────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="text-center py-4 space-y-4 animate-fade-in-up">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">¡Cuenta creada!</h3>
                    <p className="text-sm text-gray-500">{success}</p>
                </div>
            </div>
        );
    }

    // ── Step indicator ──────────────────────────────────────────────────────────
    const StepIndicator = () => (
        <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center transition-all duration-300 ${
                        s < step ? "bg-emerald-500 text-white" :
                        s === step ? "bg-[#1E3A8A] text-white" :
                        "bg-gray-100 text-gray-400"
                    }`}>
                        {s < step ? "✓" : s}
                    </div>
                    <span className={`text-xs font-bold ${s === step ? "text-gray-700" : "text-gray-400"}`}>
                        {s === 1 ? "Cuenta" : "Tu nivel"}
                    </span>
                    {s < 2 && <div className={`h-px w-6 ${step > s ? "bg-emerald-400" : "bg-gray-200"}`} />}
                </div>
            ))}
        </div>
    );

    // ── Step 1: Email + Password ─────────────────────────────────────────────────
    if (step === 1) {
        return (
            <>
                <StepIndicator />
                <form onSubmit={handleStep1} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="register-email">
                            Email
                        </label>
                        <input
                            id="register-email"
                            className="w-full rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F7FE3]/40 focus:border-[#3F7FE3] transition-all text-sm"
                            name="email"
                            type="email"
                            placeholder="tu@email.com"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="register-password">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                id="register-password"
                                className="w-full rounded-xl px-4 py-3 pr-12 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F7FE3]/40 focus:border-[#3F7FE3] transition-all text-sm"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Mínimo 6 caracteres"
                                required
                                autoComplete="new-password"
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {password.length > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-300 ${
                                        password.length >= 8 ? "bg-emerald-500" : password.length >= 6 ? "bg-amber-500" : "bg-red-400"
                                    }`} style={{ width: password.length >= 8 ? "100%" : password.length >= 6 ? "66%" : "33%" }} />
                                </div>
                                <span className={`text-xs font-medium ${
                                    password.length >= 8 ? "text-emerald-600" : password.length >= 6 ? "text-amber-600" : "text-red-500"
                                }`}>
                                    {password.length >= 8 ? "Fuerte" : password.length >= 6 ? "Aceptable" : "Débil"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="register-confirm-password">
                            Confirmar Contraseña
                        </label>
                        <div className="relative">
                            <input
                                id="register-confirm-password"
                                className={`w-full rounded-xl px-4 py-3 pr-12 bg-gray-50 border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F7FE3]/40 focus:border-[#3F7FE3] transition-all text-sm ${
                                    confirmPassword.length > 0 && !passwordsMatch ? "border-red-300" :
                                    confirmPassword.length > 0 && passwordsMatch ? "border-emerald-300" : "border-gray-200"
                                }`}
                                type={showConfirm ? "text" : "password"}
                                placeholder="Repite tu contraseña"
                                required
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {confirmPassword.length > 0 && !passwordsMatch && (
                            <p className="text-xs text-red-500 mt-1.5 font-medium">Las contraseñas no coinciden</p>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium text-center animate-fade-in-up">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={confirmPassword.length > 0 && !passwordsMatch}
                        className="w-full bg-gradient-to-r from-[#3F7FE3] to-[#1E3A8A] hover:from-[#2A5BA6] hover:to-[#1E3A8A] text-white rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-300 shadow-lg shadow-[#3F7FE3]/20 hover:shadow-xl hover:shadow-[#3F7FE3]/30 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        Siguiente → Cuestionario de nivel
                    </button>

                    <p className="text-xs text-gray-400 text-center">Al registrarte, aceptas nuestros términos y condiciones</p>
                </form>
            </>
        );
    }

    // ── Step 2: Surf questionnaire ───────────────────────────────────────────────
    return (
        <>
            <StepIndicator />

            <div className="space-y-6">
                <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Waves size={24} className="text-[#3F7FE3]" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium">5 preguntas · menos de 1 minuto</p>
                </div>

                {QUESTIONS.map((q, qi) => (
                    <div key={q.id}>
                        <p className="text-sm font-bold text-gray-800 mb-2.5 flex items-center gap-2">
                            <span className="w-6 h-6 bg-[#1E3A8A] text-white rounded-full text-xs flex items-center justify-center font-black shrink-0">
                                {qi + 1}
                            </span>
                            {q.question}
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            {q.options.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))}
                                    className={`text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                                        answers[q.id] === opt.value
                                            ? "border-[#3F7FE3] bg-[#3F7FE3]/10 text-[#1E3A8A] font-bold"
                                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#3F7FE3]/40 hover:bg-blue-50/50"
                                    }`}
                                >
                                    {answers[q.id] === opt.value && <span className="mr-2 text-[#3F7FE3]">✓</span>}
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Level preview */}
                {computedLevel && levelCfg && (
                    <div className={`border rounded-2xl p-4 flex items-center gap-3 animate-fade-in-up ${levelCfg.bg}`}>
                        <Waves size={22} className={levelCfg.color} />
                        <div>
                            <p className={`text-xs font-black uppercase tracking-wider ${levelCfg.color}`}>Tu nivel estimado</p>
                            <p className={`text-base font-black ${levelCfg.color}`}>{levelCfg.label}</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => { setStep(1); setError(null); }}
                        className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all"
                    >
                        <ChevronLeft size={16} /> Atrás
                    </button>
                    <button
                        type="button"
                        disabled={isPending || !allQuestionsAnswered}
                        onClick={handleSubmit}
                        className="flex-1 bg-gradient-to-r from-[#3F7FE3] to-[#1E3A8A] hover:from-[#2A5BA6] hover:to-[#1E3A8A] text-white rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 shadow-lg shadow-[#3F7FE3]/20 hover:shadow-xl hover:shadow-[#3F7FE3]/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Creando cuenta...
                            </>
                        ) : (
                            "Finalizar registro"
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}
