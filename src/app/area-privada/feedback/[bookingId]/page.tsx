"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Star, CheckCircle2, ChevronLeft, Loader2, ChevronDown, ChevronRight,
    ExternalLink, Smile, ThumbsUp, AlertCircle, RotateCcw
} from "lucide-react";
import Link from "next/link";
import { saveFeedbackAction } from "../actions";

// ─── Technical Content Blocks ─────────────────────────────────────────────
const CONTENT_BLOCKS = [
    {
        id: "base_tecnica",
        label: "Base técnica inicial",
        emoji: "🏄",
        items: [
            { id: "coger_transportar",   label: "Coger y transportar la tabla" },
            { id: "posicion_base",        label: "Posición base equilibrada" },
            { id: "remada_consciente",    label: "Remada consciente" },
            { id: "puesta_de_pie",        label: "Puesta en pie de un salto" },
            { id: "normas_seguridad",     label: "Normas básicas de seguridad" },
            { id: "confianza_medio",      label: "Confianza en el medio" },
        ],
    },
    {
        id: "timing_ola",
        label: "Timing con la ola",
        emoji: "🌊",
        items: [
            { id: "automatizar_posicion", label: "Automatizar posición base" },
            { id: "mejorar_pies_mirada",  label: "Mejorar pies, mirada y flexión" },
            { id: "salto_timing",         label: "Salto con timing" },
            { id: "timing_espuma",        label: "Timing en espuma" },
            { id: "lectura_ola",          label: "Lectura inicial de la ola" },
        ],
    },
    {
        id: "estabilidad_pesos",
        label: "Estabilidad y transferencia de pesos",
        emoji: "⚖️",
        items: [
            { id: "flexion_rodillas",     label: "Flexión de rodillas" },
            { id: "mirada_frente",        label: "Mirada al frente" },
            { id: "peso_delantero_trasero", label: "Peso delantero / trasero" },
            { id: "evitar_caidas",        label: "Evitar caídas hacia atrás" },
            { id: "metros_linea_recta",   label: "Más metros en línea recta" },
        ],
    },
    {
        id: "direccion_diagonales",
        label: "Dirección y diagonales",
        emoji: "↗️",
        items: [
            { id: "diagonal_dcha_izda",   label: "Diagonal derecha / izquierda" },
            { id: "mirada_hombros",       label: "Mirada y hombros" },
            { id: "seguir_apertura",      label: "Seguir apertura de la ola" },
            { id: "cambio_progresivo",    label: "Cambio progresivo de lado" },
        ],
    },
    {
        id: "pared_ola",
        label: "Pared de la ola",
        emoji: "🏔️",
        items: [
            { id: "diferenciar_pared",    label: "Diferenciar pared y espuma" },
            { id: "leer_dcha_izda",       label: "Leer derecha / izquierda" },
            { id: "identificar_pico",     label: "Identificar punto alto" },
            { id: "posicionamiento_pico", label: "Posicionamiento en el pico" },
        ],
    },
];

const FEELING_OPTIONS = [
    { value: "very_comfortable", label: "Muy cómodo/a",         icon: <Smile size={18} className="text-emerald-500" /> },
    { value: "comfortable",      label: "Cómodo/a",             icon: <ThumbsUp size={18} className="text-blue-500" /> },
    { value: "hard",             label: "Me ha costado",        icon: <AlertCircle size={18} className="text-amber-500" /> },
    { value: "need_practice",    label: "Necesito seguir practicando", icon: <RotateCcw size={18} className="text-orange-500" /> },
];

const ACHIEVEMENT_OPTIONS = [
    { value: "yes",         label: "Sí" },
    { value: "partially",   label: "En parte" },
    { value: "not_yet",     label: "Aún no" },
    { value: "need_more",   label: "Necesito seguir practicándolo" },
];

// ─── Google Review URL fallback ───────────────────────────────────────────
const GOOGLE_REVIEW_URL = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
    "https://g.page/r/tgnsurfschool/review";

// ─── Types ────────────────────────────────────────────────────────────────
type WorkedBlock = { block: string; items: string[] };

export default function FeedbackPage({ params }: { params: { bookingId: string } }) {
    const router = useRouter();
    const { bookingId } = params;

    // State
    const [sessionFeeling,    setSessionFeeling]    = useState("");
    const [selectedBlocks,    setSelectedBlocks]     = useState<string[]>([]);
    const [expandedBlocks,    setExpandedBlocks]     = useState<string[]>([]);
    const [checkedItems,      setCheckedItems]       = useState<Record<string, string[]>>({});
    const [achievement,       setAchievement]        = useState("");
    const [improvementGoal,   setImprovementGoal]    = useState("");
    const [rating,            setRating]             = useState(0);
    const [hoverRating,       setHoverRating]        = useState(0);
    const [googleClicked,     setGoogleClicked]      = useState(false);

    const [isPending, start] = useTransition();
    const [submitted, setSubmitted] = useState(false);
    const [error, setError]         = useState<string | null>(null);

    // --- Block selection (max 3) ---
    function toggleBlock(blockId: string) {
        if (selectedBlocks.includes(blockId)) {
            setSelectedBlocks(prev => prev.filter(b => b !== blockId));
            setExpandedBlocks(prev => prev.filter(b => b !== blockId));
            setCheckedItems(prev => { const n = { ...prev }; delete n[blockId]; return n; });
        } else if (selectedBlocks.length < 3) {
            setSelectedBlocks(prev => [...prev, blockId]);
            setExpandedBlocks(prev => [...prev, blockId]);
        }
    }

    function toggleExpand(blockId: string) {
        setExpandedBlocks(prev =>
            prev.includes(blockId) ? prev.filter(b => b !== blockId) : [...prev, blockId]
        );
    }

    function toggleItem(blockId: string, itemId: string) {
        setCheckedItems(prev => {
            const current = prev[blockId] || [];
            const updated = current.includes(itemId)
                ? current.filter(i => i !== itemId)
                : [...current, itemId];
            return { ...prev, [blockId]: updated };
        });
    }

    // Build worked_blocks payload
    const workedBlocks: WorkedBlock[] = selectedBlocks.map(blockId => ({
        block: blockId,
        items: checkedItems[blockId] || [],
    }));

    const isValid = sessionFeeling && rating > 0;
    const showGoogle = rating >= 4;

    function handleSubmit() {
        setError(null);
        if (!isValid) return;
        start(async () => {
            const fd = new FormData();
            fd.set("booking_id",          bookingId);
            fd.set("session_feeling",     sessionFeeling);
            fd.set("worked_blocks",       JSON.stringify(workedBlocks));
            fd.set("achievement_feeling", achievement);
            fd.set("improvement_goal",    improvementGoal);
            fd.set("rating",              String(rating));
            fd.set("google_review_sent",  String(googleClicked));
            const res = await saveFeedbackAction(fd);
            if (res.error) {
                setError(res.error);
            } else {
                setSubmitted(true);
            }
        });
    }

    // — Submitted state —
    if (submitted) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-[#0F172A] font-fredoka mb-2">
                    ¡Gracias por tu feedback! 🌊
                </h2>
                <p className="text-gray-500 font-medium max-w-xs mb-6">
                    Tu valoración nos ayuda a seguir mejorando cada sesión.
                </p>
                {showGoogle && (
                    <a
                        href={GOOGLE_REVIEW_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setGoogleClicked(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FBBC04] to-[#EA4335] text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:shadow-xl transition-all mb-4"
                    >
                        <ExternalLink size={17} />
                        Dejar reseña en Google
                    </a>
                )}
                <button onClick={() => router.push("/area-privada/mis-reservas")}
                    className="text-sm text-gray-400 hover:text-[#3F7FE3] font-medium transition-colors">
                    Volver a mis reservas →
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/area-privada/mis-reservas"
                    className="text-gray-400 hover:text-[#3F7FE3] transition-colors p-2 -ml-2 rounded-xl hover:bg-blue-50">
                    <ChevronLeft size={22} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-[#0F172A] font-fredoka leading-none">
                        ¿Cómo fue la sesión? 🏄
                    </h1>
                    <p className="text-sm text-gray-400 mt-1 font-medium">
                        Tu feedback nos ayuda a mejorar y a seguir tu evolución
                    </p>
                </div>
            </div>

            {/* Q1 — Sensación */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#1E3A8A] text-white rounded-full text-sm flex items-center justify-center font-black shrink-0">1</span>
                    <p className="font-black text-[#0F172A]">¿Cómo te has sentido en la sesión?</p>
                </div>
                <div className="p-6 space-y-3">
                    {FEELING_OPTIONS.map(opt => (
                        <button key={opt.value} type="button"
                            onClick={() => setSessionFeeling(opt.value)}
                            className={`w-full text-left px-5 py-4 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 flex items-center gap-3 ${
                                sessionFeeling === opt.value
                                    ? "border-[#3F7FE3] bg-[#3F7FE3]/8 text-[#1E3A8A] shadow-sm"
                                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#3F7FE3]/40 hover:bg-blue-50/40"
                            }`}>
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${sessionFeeling === opt.value ? "border-[#3F7FE3] bg-[#3F7FE3]" : "border-gray-300 bg-white"}`}>
                                {sessionFeeling === opt.value && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </span>
                            {opt.icon}
                            <span>{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Q2 — Contenidos trabajados */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#1E3A8A] text-white rounded-full text-sm flex items-center justify-center font-black shrink-0">2</span>
                    <div>
                        <p className="font-black text-[#0F172A]">¿Qué has trabajado hoy?</p>
                        <p className="text-xs text-gray-400 mt-0.5">Selecciona hasta 3 bloques</p>
                    </div>
                </div>
                <div className="p-4 space-y-2">
                    {CONTENT_BLOCKS.map(block => {
                        const isSelected = selectedBlocks.includes(block.id);
                        const isExpanded = expandedBlocks.includes(block.id);
                        return (
                            <div key={block.id} className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                                isSelected ? "border-[#3F7FE3] bg-[#3F7FE3]/5" : "border-gray-200 bg-gray-50"
                            }`}>
                                {/* Block header */}
                                <div className="flex items-center gap-3 px-4 py-3.5">
                                    {/* Select checkbox */}
                                    <button type="button" onClick={() => toggleBlock(block.id)}
                                        disabled={!isSelected && selectedBlocks.length >= 3}
                                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                            isSelected
                                                ? "border-[#3F7FE3] bg-[#3F7FE3]"
                                                : selectedBlocks.length >= 3
                                                    ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-40"
                                                    : "border-gray-300 bg-white hover:border-[#3F7FE3]"
                                        }`}>
                                        {isSelected && (
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        )}
                                    </button>
                                    <span className="text-xl shrink-0">{block.emoji}</span>
                                    <span className={`flex-1 text-sm font-bold ${isSelected ? "text-[#1E3A8A]" : "text-gray-700"}`}>
                                        {block.label}
                                    </span>
                                    {isSelected && (
                                        <button type="button" onClick={() => toggleExpand(block.id)}
                                            className="text-gray-400 hover:text-[#3F7FE3] transition-colors p-1">
                                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </button>
                                    )}
                                </div>

                                {/* Block items (visible when selected + expanded) */}
                                {isSelected && isExpanded && (
                                    <div className="px-4 pb-4 border-t border-[#3F7FE3]/10">
                                        <p className="text-xs text-[#3F7FE3] font-bold mb-3 mt-3 uppercase tracking-wider">
                                            Contenidos específicos trabajados:
                                        </p>
                                        <div className="grid grid-cols-1 gap-2">
                                            {block.items.map(item => {
                                                const checked = (checkedItems[block.id] || []).includes(item.id);
                                                return (
                                                    <label key={item.id}
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border ${
                                                            checked
                                                                ? "border-[#3F7FE3]/30 bg-[#3F7FE3]/8 text-[#1E3A8A]"
                                                                : "border-gray-200 bg-white text-gray-600 hover:border-[#3F7FE3]/30 hover:bg-blue-50/30"
                                                        }`}>
                                                        <input type="checkbox" className="sr-only"
                                                            checked={checked}
                                                            onChange={() => toggleItem(block.id, item.id)} />
                                                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                                            checked ? "border-[#3F7FE3] bg-[#3F7FE3]" : "border-gray-300 bg-white"
                                                        }`}>
                                                            {checked && (
                                                                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                                    <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                                </svg>
                                                            )}
                                                        </span>
                                                        <span className="text-sm font-medium">{item.label}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {selectedBlocks.length >= 3 && (
                        <p className="text-xs text-amber-600 font-medium text-center pt-1">
                            Máximo 3 bloques seleccionados
                        </p>
                    )}
                </div>
            </div>

            {/* Q3 — Logro */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#1E3A8A] text-white rounded-full text-sm flex items-center justify-center font-black shrink-0">3</span>
                    <p className="font-black text-[#0F172A]">¿Has sentido que has podido conseguirlo?</p>
                </div>
                <div className="p-6 grid grid-cols-2 gap-3">
                    {ACHIEVEMENT_OPTIONS.map(opt => (
                        <button key={opt.value} type="button"
                            onClick={() => setAchievement(opt.value)}
                            className={`py-3 px-4 rounded-2xl border-2 text-sm font-semibold transition-all text-center ${
                                achievement === opt.value
                                    ? "border-[#3F7FE3] bg-[#3F7FE3]/10 text-[#1E3A8A]"
                                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#3F7FE3]/40"
                            }`}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Q4 — Mejora */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#1E3A8A] text-white rounded-full text-sm flex items-center justify-center font-black shrink-0">4</span>
                    <p className="font-black text-[#0F172A]">¿Qué te gustaría seguir mejorando?</p>
                </div>
                <div className="p-6">
                    <textarea value={improvementGoal} onChange={e => setImprovementGoal(e.target.value)}
                        rows={3}
                        placeholder="Ej: Me cuesta el timing en el salto, quiero mejorar la lectura de la ola..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:border-[#3F7FE3] focus:ring-2 focus:ring-[#3F7FE3]/15 transition-all" />
                </div>
            </div>

            {/* Q5 — Valoración estrellas */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#1E3A8A] text-white rounded-full text-sm flex items-center justify-center font-black shrink-0">5</span>
                    <p className="font-black text-[#0F172A]">Valoración general de la sesión</p>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-center gap-3">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} type="button"
                                onClick={() => setRating(n)}
                                onMouseEnter={() => setHoverRating(n)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="transition-transform hover:scale-110">
                                <Star size={40}
                                    className={`transition-colors duration-150 ${
                                        n <= (hoverRating || rating)
                                            ? "fill-[#FBBC04] text-[#FBBC04]"
                                            : "fill-gray-200 text-gray-200"
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-center text-sm font-bold mt-3 text-gray-500">
                            {rating === 1 ? "Necesita mejorar" :
                             rating === 2 ? "Regular" :
                             rating === 3 ? "Bien" :
                             rating === 4 ? "Muy bien 🌊" : "Excelente ⭐"}
                        </p>
                    )}

                    {/* Google review prompt */}
                    {showGoogle && (
                        <div className="mt-5 p-4 bg-gradient-to-br from-[#FFF8E1] to-[#FFF3E0] border border-[#FBBC04]/30 rounded-2xl text-center">
                            <p className="text-sm font-bold text-gray-700 mb-3">
                                🎉 ¡Nos alegra que haya sido una gran experiencia!
                            </p>
                            <p className="text-xs text-gray-500 mb-3">
                                Nos ayudaría mucho que compartieras tu experiencia en Google
                            </p>
                            <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer"
                                onClick={() => setGoogleClicked(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#FBBC04] text-gray-800 rounded-xl font-bold text-sm hover:bg-[#FBBC04] hover:text-white transition-all shadow-sm">
                                <ExternalLink size={15} />
                                Dejar reseña en Google
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium text-center">
                    {error}
                </div>
            )}

            {/* Submit */}
            <button type="button" disabled={isPending || !isValid} onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-[#3F7FE3] to-[#1E3A8A] hover:from-[#2A5BA6] hover:to-[#152a6e] text-white rounded-2xl px-4 py-4 text-base font-bold transition-all duration-300 shadow-lg shadow-[#3F7FE3]/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isPending ? (
                    <><Loader2 size={20} className="animate-spin" /> Guardando feedback...</>
                ) : (
                    <>Enviar valoración <Star size={18} /></>
                )}
            </button>
        </div>
    );
}
