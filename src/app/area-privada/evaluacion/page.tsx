"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Waves, Star, Mountain, Zap, Target, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { saveAssessmentAction } from "../actions";

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

export default function EvaluacionPage() {
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const allQuestionsAnswered = QUESTIONS.every((q) => answers[q.id]);
    const computedLevel = allQuestionsAnswered ? computeLevel(answers) : null;
    const levelCfg = computedLevel ? LEVEL_CONFIG[computedLevel] : null;

    function handleSubmit() {
        setError(null);
        if (!allQuestionsAnswered) return;

        const formData = new FormData();
        formData.set("answers", JSON.stringify(answers));

        startTransition(async () => {
            const result = await saveAssessmentAction(formData);
            if (result?.error) {
                setError(result.error);
            } else if (result?.success) {
                router.push("/area-privada");
                router.refresh();
            }
        });
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-8 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/area-privada" className="text-gray-400 hover:text-[#3F7FE3] transition-colors p-2 -ml-2 rounded-lg hover:bg-blue-50">
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-[#0F172A] font-fredoka leading-none">Tu Evaluación de Surf</h1>
                    <p className="text-sm text-gray-500 mt-1">Completa estas 5 preguntas para que podamos recomendarte las mejores clases para ti.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-8">
                {QUESTIONS.map((q, qi) => (
                    <div key={q.id}>
                        <p className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-7 h-7 bg-[#1E3A8A] text-white rounded-full text-xs flex items-center justify-center font-black shrink-0">
                                {qi + 1}
                            </span>
                            {q.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {q.options.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))}
                                    className={`text-left px-5 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                                        answers[q.id] === opt.value
                                            ? "border-[#3F7FE3] bg-[#3F7FE3]/10 text-[#1E3A8A] font-bold shadow-sm shadow-[#3F7FE3]/10"
                                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#3F7FE3]/40 hover:bg-blue-50/50"
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                        answers[q.id] === opt.value ? "border-[#3F7FE3] bg-[#3F7FE3]" : "border-gray-300 bg-white"
                                    }`}>
                                        {answers[q.id] === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </div>
                                    <span>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {computedLevel && levelCfg && (
                    <div className={`border rounded-2xl p-5 flex items-center gap-4 animate-fade-in-up mt-8 ${levelCfg.bg}`}>
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                            <Waves size={24} className={levelCfg.color} />
                        </div>
                        <div>
                            <p className={`text-xs font-black uppercase tracking-wider ${levelCfg.color} opacity-80`}>Tu nivel estimado</p>
                            <p className={`text-xl font-black ${levelCfg.color}`}>{levelCfg.label}</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        disabled={isPending || !allQuestionsAnswered}
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-[#3F7FE3] to-[#1E3A8A] hover:from-[#2A5BA6] hover:to-[#1E3A8A] text-white rounded-xl px-4 py-4 text-base font-bold transition-all duration-300 shadow-lg shadow-[#3F7FE3]/20 hover:shadow-xl hover:shadow-[#3F7FE3]/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Guardando tu perfil...
                            </>
                        ) : (
                            "Guardar  Perfil de Surf"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
