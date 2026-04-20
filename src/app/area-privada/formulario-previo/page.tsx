"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Waves, ChevronLeft, Loader2, Package, Ruler, CheckCircle2,
    ChevronDown, HelpCircle
} from "lucide-react";
import Link from "next/link";
import { saveIntakeFormAction } from "../actions";

// ─── Types ────────────────────────────────────────────────────────────────
type IntakeForm = {
    surf_frequency: string;
    declared_level: string;
    own_gear: string;
    wetsuit_size: string;
    board_size: string;
    board_notes: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────
const SURF_FREQ_OPTIONS = [
    { value: "never",   label: "Nunca he surfeado", emoji: "🤿" },
    { value: "1_3",     label: "1 – 3 veces",       emoji: "🏊" },
    { value: "4_10",    label: "4 – 10 veces",      emoji: "🌊" },
    { value: "10_plus", label: "Más de 10 veces",   emoji: "🏄" },
    { value: "regular", label: "Surfeo con frecuencia", emoji: "⚡" },
];

const LEVEL_OPTIONS = [
    { value: "initiation",     label: "Iniciación",           desc: "Aprendo las bases" },
    { value: "adv_initiation", label: "Iniciación avanzada",  desc: "Ya me pongo de pie" },
    { value: "intermediate",   label: "Intermedio",           desc: "Trabajo diagonales" },
    { value: "advanced",       label: "Avanzado",             desc: "Maniobras y técnica" },
];

const GEAR_OPTIONS = [
    { value: "board_wetsuit", label: "Sí, tabla y neopreno", icon: "✅" },
    { value: "board_only",    label: "Solo tabla",           icon: "🏄" },
    { value: "wetsuit_only",  label: "Solo neopreno",        icon: "🤿" },
    { value: "none",          label: "No, necesito material",icon: "📦" },
];

const WETSUIT_SIZES = ["XS", "S", "M", "L", "XL", "No lo sé"];
const BOARD_SIZES   = ["5'10", "6'6", "6'8", "7'0", "7'2", "7'6", "8'0", "8'2", "Otro"];

// ─── Helper ────────────────────────────────────────────────────────────────
function OptionButton({
    selected, onClick, children,
}: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left px-5 py-4 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 flex items-center gap-3 ${
                selected
                    ? "border-[#3F7FE3] bg-[#3F7FE3]/8 text-[#1E3A8A] shadow-sm shadow-[#3F7FE3]/15"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#3F7FE3]/40 hover:bg-blue-50/40"
            }`}
        >
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                selected ? "border-[#3F7FE3] bg-[#3F7FE3]" : "border-gray-300 bg-white"
            }`}>
                {selected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
            </span>
            {children}
        </button>
    );
}

function SectionCard({ step, title, desc, children }: {
    step: number; title: string; desc?: string; children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#1E3A8A] text-white rounded-full text-sm flex items-center justify-center font-black shrink-0">
                        {step}
                    </span>
                    <div>
                        <p className="font-black text-[#0F172A] text-base">{title}</p>
                        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-3">{children}</div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function FormularioPrevioPage() {
    const router        = useRouter();
    const searchParams  = useSearchParams();
    const bookingId     = searchParams.get("booking") ?? "";

    const [form, setForm]     = useState<IntakeForm>({
        surf_frequency: "", declared_level: "", own_gear: "",
        wetsuit_size: "", board_size: "", board_notes: "",
    });
    const [isPending, start]  = useTransition();
    const [error, setError]   = useState<string | null>(null);
    const [done, setDone]     = useState(false);

    const isNever    = form.surf_frequency === "never";
    const needsGear  = ["none", "board_only", "wetsuit_only", ""].includes(form.own_gear);

    const isValid =
        form.surf_frequency &&
        (isNever || form.declared_level) &&
        form.own_gear &&
        form.board_size;

    function set(key: keyof IntakeForm, value: string) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    function handleSubmit() {
        setError(null);
        if (!isValid) return;
        start(async () => {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.set(k, v));
            fd.set("booking_id", bookingId);
            const res = await saveIntakeFormAction(fd);
            if (res.error) {
                setError(res.error);
            } else {
                setDone(true);
                setTimeout(() => router.push("/area-privada/mis-reservas"), 2000);
            }
        });
    }

    if (done) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-[#0F172A] font-fredoka mb-2">¡Todo listo! 🌊</h2>
                <p className="text-gray-500 font-medium">Tu información ha sido guardada. ¡Nos vemos en el agua!</p>
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
                        Formulario Previo 🏄
                    </h1>
                    <p className="text-sm text-gray-400 mt-1 font-medium">
                        Ayúdanos a preparar tu sesión con esta información rápida
                    </p>
                </div>
            </div>

            {/* Q1 — Experiencia */}
            <SectionCard step={1} title="¿Has practicado surf alguna vez?" >
                {SURF_FREQ_OPTIONS.map(opt => (
                    <OptionButton key={opt.value} selected={form.surf_frequency === opt.value}
                        onClick={() => { set("surf_frequency", opt.value); if (opt.value === "never") set("declared_level", ""); }}>
                        <span className="text-lg shrink-0">{opt.emoji}</span>
                        <span>{opt.label}</span>
                    </OptionButton>
                ))}
            </SectionCard>

            {/* Q2 — Nivel (solo si no es "Nunca") */}
            {form.surf_frequency && !isNever && (
                <SectionCard step={2} title="¿Cuál dirías que es tu nivel?"
                    desc="Responde según tu última experiencia en el agua">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {LEVEL_OPTIONS.map(opt => (
                            <button key={opt.value} type="button"
                                onClick={() => set("declared_level", opt.value)}
                                className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                                    form.declared_level === opt.value
                                        ? "border-[#3F7FE3] bg-[#3F7FE3]/8 shadow-sm"
                                        : "border-gray-200 bg-gray-50 hover:border-[#3F7FE3]/40 hover:bg-blue-50/40"
                                }`}>
                                <p className={`font-black text-sm ${form.declared_level === opt.value ? "text-[#1E3A8A]" : "text-gray-700"}`}>
                                    {opt.label}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                            </button>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* Q3 — Material */}
            <SectionCard step={isNever ? 2 : 3} title="¿Traes tu propio material?"
                desc="Nos ayuda a preparar el equipo adecuado">
                <Package size={18} className="text-gray-300 hidden" />
                {GEAR_OPTIONS.map(opt => (
                    <OptionButton key={opt.value} selected={form.own_gear === opt.value}
                        onClick={() => set("own_gear", opt.value)}>
                        <span className="text-lg shrink-0">{opt.icon}</span>
                        <span>{opt.label}</span>
                    </OptionButton>
                ))}
            </SectionCard>

            {/* Q4 — Talla neopreno */}
            <SectionCard step={isNever ? 3 : 4} title="¿Qué talla de neopreno usas?"
                desc="Necesario para preparar el equipo si no traes el tuyo">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {WETSUIT_SIZES.map(size => (
                        <button key={size} type="button"
                            onClick={() => set("wetsuit_size", size === "No lo sé" ? "unknown" : size.toLowerCase())}
                            className={`py-3 px-2 rounded-xl border-2 text-sm font-bold transition-all text-center ${
                                form.wetsuit_size === (size === "No lo sé" ? "unknown" : size.toLowerCase())
                                    ? "border-[#3F7FE3] bg-[#3F7FE3]/10 text-[#1E3A8A]"
                                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#3F7FE3]/40"
                            }`}>
                            {size}
                        </button>
                    ))}
                </div>
            </SectionCard>

            {/* Q5 — Medida tabla (siempre visible) */}
            <SectionCard step={isNever ? 4 : 5} title="¿Qué medida de tabla usas o necesitas?"
                desc="Se muestra siempre, independientemente del material que traigas">
                <Ruler size={16} className="text-gray-300 hidden" />
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {BOARD_SIZES.map(size => (
                        <button key={size} type="button"
                            onClick={() => set("board_size", size.replace("'", "_").toLowerCase())}
                            className={`py-3 px-2 rounded-xl border-2 text-sm font-bold transition-all text-center ${
                                form.board_size === size.replace("'", "_").toLowerCase()
                                    ? "border-[#3F7FE3] bg-[#3F7FE3]/10 text-[#1E3A8A]"
                                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#3F7FE3]/40"
                            }`}>
                            {size}
                        </button>
                    ))}
                </div>

                {/* 5.1 — Campo libre */}
                <div className="mt-4 space-y-1.5">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <HelpCircle size={14} className="text-[#3F7FE3]" />
                        Especifica la medida o cualquier detalle (opcional)
                    </label>
                    <textarea
                        value={form.board_notes}
                        onChange={e => set("board_notes", e.target.value)}
                        rows={2}
                        placeholder="Ej: Me fue bien con 7'6 · La última vez usé 8'0 · Creo que podría bajar"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:border-[#3F7FE3] focus:ring-2 focus:ring-[#3F7FE3]/15 transition-all"
                    />
                </div>
            </SectionCard>

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
                    <><Loader2 size={20} className="animate-spin" /> Guardando...</>
                ) : (
                    <>Guardar y continuar <Waves size={18} /></>
                )}
            </button>
        </div>
    );
}
