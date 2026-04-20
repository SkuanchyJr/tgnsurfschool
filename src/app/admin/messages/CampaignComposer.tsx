"use client";

import { useState, useTransition, useCallback } from "react";
import {
    Send, Users, Filter, Eye, EyeOff, Loader2, CheckCircle2,
    ChevronDown, MessageSquare, Waves, Bell, Calendar, Star
} from "lucide-react";
import { sendSegmentedCampaign, getStudentsSegmented, type CampaignFilters } from "../actions";

// ─── Template Definitions ─────────────────────────────────────────────────────
const TEMPLATES = [
    {
        id: "horarios",
        label: "🗓️ Horarios semanales",
        icon: <Calendar size={16} />,
        subject: "Horarios de surf esta semana 🌊",
        body: `Hola [Nombre],

Ya tenemos disponibles los horarios de surf para esta semana 🌊

📍 La Pineda
🕒 Sábado 10:00
🕒 Domingo 9:00

Reserva tu plaza aquí: [ENLACE_RESERVAS]

¡Nos vemos en el agua!`,
    },
    {
        id: "clase_especial",
        label: "⭐ Clase especial",
        icon: <Star size={16} />,
        subject: "Clase especial este fin de semana 🏄‍♂️",
        body: `Hola [Nombre],

Este fin de semana abrimos una sesión especial de técnica y diagonales, ideal para tu nivel 🌊🏄‍♂️

📍 Spot: [UBICACION]
🕒 Hora: [HORA]

¿Te apuntas? Reserva aquí: [ENLACE]

¡El mar nos llama!`,
    },
    {
        id: "evento",
        label: "🎉 Evento especial",
        icon: <Bell size={16} />,
        subject: "Evento especial — surfea con nosotros 🌊",
        body: `Hola [Nombre],

Este sábado tenemos evento especial de surf + desayuno + networking con la comunidad Erasmus 🌊☕🏄‍♂️

Plazas limitadas: [ENLACE]

¡No te lo pierdas!`,
    },
    {
        id: "condiciones",
        label: "🌊 Buenas condiciones",
        icon: <Waves size={16} />,
        subject: "¡Condiciones perfectas mañana! 🔥",
        body: `Hola [Nombre],

Mañana tenemos condiciones perfectas para tu nivel en La Pineda 🌊🔥

Si te animas, hemos abierto nuevas plazas: [ENLACE_RESERVA]

¡Esto hay que aprovecharlo!`,
    },
];

const LEVEL_OPTIONS = [
    { value: "BEGINNER",     label: "Principiante" },
    { value: "INITIATION",   label: "Iniciación" },
    { value: "INTERMEDIATE", label: "Intermedio" },
    { value: "ADVANCED",     label: "Avanzado" },
];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CampaignComposer() {
    // Filters
    const [levels,           setLevels]           = useState<string[]>([]);
    const [marketingOnly,    setMarketingOnly]     = useState(false);
    const [lastSessionDays,  setLastSessionDays]   = useState("");
    const [preferredBeach,   setPreferredBeach]    = useState("");

    // Message
    const [activeTemplate,   setActiveTemplate]   = useState(TEMPLATES[0]);
    const [subject,          setSubject]           = useState(TEMPLATES[0].subject);
    const [body,             setBody]              = useState(TEMPLATES[0].body);
    const [showPreview,      setShowPreview]       = useState(false);

    // Preview audience
    const [audience,         setAudience]          = useState<any[]>([]);
    const [audienceLoaded,   setAudienceLoaded]    = useState(false);

    // Send state
    const [isPending,        start]                = useTransition();
    const [result,           setResult]            = useState<{ sent: number; total: number } | null>(null);
    const [error,            setError]             = useState<string | null>(null);

    function buildFilters(): CampaignFilters {
        const filters: CampaignFilters = {};
        if (levels.length > 0) filters.levels = levels;
        if (marketingOnly) filters.marketingConsentOnly = true;
        if (lastSessionDays) {
            const d = new Date();
            d.setDate(d.getDate() - parseInt(lastSessionDays));
            filters.lastSessionBefore = d.toISOString().split("T")[0];
        }
        if (preferredBeach) filters.preferredBeach = preferredBeach;
        return filters;
    }

    function toggleLevel(value: string) {
        setLevels(prev =>
            prev.includes(value) ? prev.filter(l => l !== value) : [...prev, value]
        );
    }

    function applyTemplate(t: typeof TEMPLATES[0]) {
        setActiveTemplate(t);
        setSubject(t.subject);
        setBody(t.body);
    }

    function loadAudience() {
        start(async () => {
            try {
                const users = await getStudentsSegmented(buildFilters());
                setAudience(users);
                setAudienceLoaded(true);
            } catch (e: any) {
                setError(e.message);
            }
        });
    }

    function handleSend() {
        setError(null);
        setResult(null);
        start(async () => {
            const res = await sendSegmentedCampaign(buildFilters(), subject, body);
            if (res.error) {
                setError(res.error);
            } else {
                setResult({ sent: res.sent, total: res.total });
                setAudienceLoaded(false);
                setAudience([]);
            }
        });
    }

    return (
        <div className="space-y-6">
            {/* ── Step 1: Filters ─────────────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#1E3A8A] text-white rounded-full text-sm flex items-center justify-center font-black shrink-0">1</span>
                    <div>
                        <p className="font-black text-[#0F172A] font-fredoka">Segmentación de audiencia</p>
                        <p className="text-xs text-gray-400">Filtra quién recibe el mensaje</p>
                    </div>
                </div>
                <div className="p-6 space-y-5">
                    {/* Levels */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Nivel de surf</label>
                        <div className="flex flex-wrap gap-2">
                            {LEVEL_OPTIONS.map(opt => (
                                <button key={opt.value} type="button"
                                    onClick={() => toggleLevel(opt.value)}
                                    className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                                        levels.includes(opt.value)
                                            ? "border-[#3F7FE3] bg-[#3F7FE3]/10 text-[#1E3A8A]"
                                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#3F7FE3]/40"
                                    }`}>
                                    {opt.label}
                                </button>
                            ))}
                            {levels.length > 0 && (
                                <button type="button" onClick={() => setLevels([])}
                                    className="px-3 py-2 text-xs text-gray-400 hover:text-red-500 font-bold transition-colors">
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Last session inactivity */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                            Sin sesión hace más de (días)
                        </label>
                        <select value={lastSessionDays} onChange={e => setLastSessionDays(e.target.value)}
                            className="w-full sm:w-48 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#3F7FE3]">
                            <option value="">Todos</option>
                            <option value="14">14 días</option>
                            <option value="30">30 días</option>
                            <option value="60">60 días</option>
                            <option value="90">90 días</option>
                        </select>
                    </div>

                    {/* Preferred beach */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Playa habitual</label>
                        <input type="text" value={preferredBeach} onChange={e => setPreferredBeach(e.target.value)}
                            placeholder="Ej: La Pineda, El Vendrell..."
                            className="w-full sm:w-64 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#3F7FE3]" />
                    </div>

                    {/* Marketing consent */}
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={marketingOnly} onChange={e => setMarketingOnly(e.target.checked)}
                            className="w-4 h-4 accent-[#3F7FE3]" />
                        <span className="text-sm font-medium text-gray-600">Solo alumnos con consentimiento de comunicaciones</span>
                    </label>

                    {/* Preview button */}
                    <button type="button" onClick={loadAudience} disabled={isPending}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all disabled:opacity-60">
                        {isPending ? <Loader2 size={15} className="animate-spin" /> : <Users size={15} />}
                        Ver audiencia estimada
                    </button>

                    {audienceLoaded && (
                        <div className="rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                <span className="text-xs font-black text-gray-500 uppercase">
                                    {audience.length} alumno{audience.length !== 1 ? "s" : ""} seleccionado{audience.length !== 1 ? "s" : ""}
                                </span>
                                {audience.length === 0 && (
                                    <span className="text-xs text-amber-600 font-bold">Sin resultados para estos filtros</span>
                                )}
                            </div>
                            {audience.length > 0 && (
                                <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                                    {audience.map(u => (
                                        <div key={u.id} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                                            <div className="w-7 h-7 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center text-xs font-black shrink-0">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-700 truncate">{u.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                            </div>
                                            <span className="text-xs text-gray-400 shrink-0">{u.surf_level || "—"}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Step 2: Compose ─────────────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#1E3A8A] text-white rounded-full text-sm flex items-center justify-center font-black shrink-0">2</span>
                    <div>
                        <p className="font-black text-[#0F172A] font-fredoka">Composición del mensaje</p>
                        <p className="text-xs text-gray-400">Usa [Nombre] para personalización automática</p>
                    </div>
                </div>
                <div className="p-6 space-y-5">
                    {/* Templates */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Plantilla rápida</label>
                        <div className="flex flex-wrap gap-2">
                            {TEMPLATES.map(t => (
                                <button key={t.id} type="button" onClick={() => applyTemplate(t)}
                                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                                        activeTemplate.id === t.id
                                            ? "border-[#3F7FE3] bg-[#3F7FE3]/10 text-[#1E3A8A]"
                                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#3F7FE3]/40"
                                    }`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Asunto del email</label>
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:outline-none focus:border-[#3F7FE3] focus:ring-2 focus:ring-[#3F7FE3]/15 transition-all" />
                    </div>

                    {/* Body */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Cuerpo del mensaje</label>
                            <button type="button" onClick={() => setShowPreview(p => !p)}
                                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#3F7FE3] font-bold transition-colors">
                                {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
                                {showPreview ? "Editar" : "Vista previa"}
                            </button>
                        </div>
                        {showPreview ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[160px] whitespace-pre-wrap text-sm text-gray-700 font-medium">
                                {body.replace(/\[Nombre\]/g, "María García")}
                            </div>
                        ) : (
                            <textarea value={body} onChange={e => setBody(e.target.value)} rows={8}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:border-[#3F7FE3] focus:ring-2 focus:ring-[#3F7FE3]/15 transition-all font-mono"
                            />
                        )}
                    </div>

                    {/* WhatsApp note */}
                    <div className="flex items-start gap-3 p-4 bg-[#f0fdf4] border border-green-200 rounded-xl">
                        <MessageSquare size={18} className="text-green-600 shrink-0 mt-0.5" />
                        <div className="text-xs font-medium text-green-700">
                            <strong>WhatsApp:</strong> El email se envía automáticamente. Para WhatsApp, copia el mensaje y usa el botón de abajo para abrir
                            <a href="https://web.whatsapp.com" target="_blank" rel="noopener noreferrer"
                                className="underline ml-1">WhatsApp Web</a> y enviarlo manualmente a los grupos o contactos.
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Step 3: Send ────────────────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1">
                    <p className="font-black text-[#0F172A] text-sm">
                        {audienceLoaded
                            ? `Listo para enviar a ${audience.length} alumno${audience.length !== 1 ? "s" : ""}`
                            : "Define filtros y carga la audiencia antes de enviar"}
                    </p>
                    {!marketingOnly && (
                        <p className="text-xs text-amber-600 font-medium mt-0.5">
                            ⚠️ Sin filtro de consentimiento — se enviará a todos los alumnos del segmento
                        </p>
                    )}
                </div>
                <button type="button" onClick={handleSend}
                    disabled={isPending || !subject || !body}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3F7FE3] to-[#1E3A8A] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#3F7FE3]/20 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                    {isPending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                    {isPending ? "Enviando..." : "Enviar campaña"}
                </button>
            </div>

            {/* ── Result / Error ───────────────────────────────────────────── */}
            {result && (
                <div className="flex items-center gap-3 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                    <div>
                        <p className="font-black text-emerald-800">
                            Campaña enviada: {result.sent} / {result.total} emails
                        </p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                            Los emails llevan el diseño corporativo de TGN Surf School.
                        </p>
                    </div>
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                    Error: {error}
                </div>
            )}
        </div>
    );
}
