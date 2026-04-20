import { getStudentDetail } from "../../actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ChevronLeft, Mail, Phone, CalendarDays, Star, Activity,
    Clock, Users, Waves, ShieldCheck, MailPlus, Package,
    ClipboardList, MessageSquare, ExternalLink, TrendingUp
} from "lucide-react";

// ─── Config Maps ──────────────────────────────────────────────────────────────
const LEVEL_CONFIG: Record<string, { label: string; badge: string; color: string; bg: string }> = {
    BEGINNER:     { label: "Principiante",      badge: "bg-emerald-100 text-emerald-700", color: "text-emerald-600", bg: "bg-emerald-50" },
    INITIATION:   { label: "Iniciación",        badge: "bg-emerald-100 text-emerald-700", color: "text-emerald-600", bg: "bg-emerald-50" },
    INTERMEDIATE: { label: "Intermedio",        badge: "bg-orange-100 text-orange-700",   color: "text-orange-600",  bg: "bg-orange-50" },
    ADVANCED:     { label: "Avanzado",          badge: "bg-red-100 text-red-700",         color: "text-red-600",     bg: "bg-red-50" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    PENDING:   { label: "Pendiente",  color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
    CONFIRMED: { label: "Confirmada", color: "bg-green-50 text-green-700 border-green-100" },
    COMPLETED: { label: "Completada", color: "bg-blue-50 text-blue-700 border-blue-100" },
    CANCELLED: { label: "Cancelada",  color: "bg-red-50 text-red-700 border-red-100" },
};

const Q_LABELS: Record<string, string> = {
    previous_surf: "Experiencia previa", water_comfort: "Comodidad en el agua",
    wave_preference: "Olas preferidas",  fitness_level: "Forma física", main_goal: "Objetivo",
};
const A_LABELS: Record<string, Record<string, string>> = {
    previous_surf:   { no: "Primera vez", yes_little: "Un par de veces", yes_regular: "Con regularidad", yes_lots: "Años surfeando" },
    water_comfort:   { nervous: "Nervioso/a", ok: "Se defiende", comfortable: "Cómodo/a", very_comfortable: "Muy cómodo/a" },
    wave_preference: { small: "Pequeñas y suaves", medium: "Medias", big: "Grandes y potentes", any: "Cualquiera" },
    fitness_level:   { low: "Baja", moderate: "Moderada", high: "Alta", athlete: "Deportista" },
    main_goal:       { learn_standup: "Ponerme de pie", improve_technique: "Mejorar técnica", ride_better_waves: "Olas más grandes", compete: "Competir" },
};

// Intake labels
const FREQ_LABELS: Record<string, string> = {
    never: "Nunca ha surfeado", "1_3": "1–3 veces", "4_10": "4–10 veces",
    "10_plus": "Más de 10 veces", regular: "Surfea con frecuencia",
};
const GEAR_LABELS: Record<string, string> = {
    board_wetsuit: "Tabla y neopreno", board_only: "Solo tabla",
    wetsuit_only: "Solo neopreno", none: "Necesita material completo",
};
const BLOCK_LABELS: Record<string, string> = {
    base_tecnica: "Base técnica inicial",
    timing_ola: "Timing con la ola",
    estabilidad_pesos: "Estabilidad y pesos",
    direccion_diagonales: "Dirección y diagonales",
    pared_ola: "Pared de la ola",
};
const FEELING_LABELS: Record<string, string> = {
    very_comfortable: "Muy cómodo/a 😊",
    comfortable: "Cómodo/a 👍",
    hard: "Me costó un poco 💪",
    need_practice: "Necesito más práctica 🔄",
};

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            {icon}
            <h2 className="font-black text-[#0F172A] font-fredoka">{title}</h2>
        </div>
    );
}

export default async function StudentDetailPage(props: { params: Promise<{ id: string }> }) {
    const params  = await props.params;
    const student = await getStudentDetail(params.id);
    if (!student) notFound();

    const lvCfg           = LEVEL_CONFIG[student.surf_level] || LEVEL_CONFIG.BEGINNER;
    const registrationDate = new Date(student.created_at).toLocaleDateString("es-ES", {
        year: "numeric", month: "long", day: "numeric",
    });

    // Latest intake (most recent booking with intake)
    const latestIntake = student.bookings?.find((b: any) => b.intake) ?? null;

    // Bookings with feedback, sorted oldest first for timeline
    const feedbackBookings = (student.bookings || [])
        .filter((b: any) => b.feedback)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const avgRating = feedbackBookings.length > 0
        ? (feedbackBookings.reduce((sum: number, b: any) => sum + (b.feedback?.rating || 0), 0) / feedbackBookings.length).toFixed(1)
        : null;

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* ── TOP NAVIGATION ── */}
                <div className="flex items-center justify-between">
                    <Link href="/admin/students"
                        className="flex items-center gap-2 text-gray-500 hover:text-[#3F7FE3] font-bold text-sm transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:border-[#3F7FE3]/30 group-hover:bg-blue-50 transition-all">
                            <ChevronLeft size={18} />
                        </div>
                        Volver al directorio
                    </Link>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-[#3F7FE3]/30 hover:bg-blue-50 transition-all">
                            <MailPlus size={16} /> Enviar Email
                        </button>
                    </div>
                </div>

                {/* ── HEADER CARD ── */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1E3A8A] to-[#3F7FE3] flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-blue-900/10 shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h1 className="text-3xl font-black text-[#0F172A] font-fredoka leading-none">{student.name}</h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${lvCfg.badge}`}>
                                {lvCfg.label}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-gray-500 font-medium">
                            <div className="flex items-center gap-2"><Mail size={14} /> {student.email}</div>
                            {student.phone && <div className="flex items-center gap-2"><Phone size={14} /> {student.phone}</div>}
                            <div className="flex items-center gap-2"><CalendarDays size={14} /> Miembro desde {registrationDate}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
                        <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                            <p className="text-2xl font-black text-[#1E3A8A] leading-none">{student.bookings?.length || 0}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Reservas</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                            <p className="text-2xl font-black text-[#3F7FE3] leading-none">{student.active_vouchers || 0}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Bonos</p>
                        </div>
                        {avgRating && (
                            <div className="bg-amber-50 rounded-2xl p-4 text-center border border-amber-100">
                                <p className="text-2xl font-black text-amber-600 leading-none">{avgRating} ⭐</p>
                                <p className="text-[10px] font-bold text-amber-400 uppercase mt-1">Valoración</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── MAIN GRID ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Nivel de surf (evaluación) */}
                        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                            <SectionHeader icon={<Star size={18} className="text-amber-500" />} title="Nivel de Surf" />
                            <div className="p-6 space-y-6">
                                <div className={`p-4 rounded-2xl border ${lvCfg.bg} ${lvCfg.badge.split(" ")[1]} border-opacity-20 flex items-center gap-4`}>
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                        <Waves size={24} className={lvCfg.color} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Nivel Asignado</p>
                                        <p className={`text-xl font-black ${lvCfg.color}`}>{lvCfg.label}</p>
                                    </div>
                                </div>
                                <div className="space-y-4 pt-2">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Cuestionario inicial</h3>
                                    {student.surf_assessment ? (
                                        <div className="space-y-3">
                                            {Object.keys(Q_LABELS).map(k => {
                                                const v = student.surf_assessment[k];
                                                if (!v) return null;
                                                return (
                                                    <div key={k} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{Q_LABELS[k]}</p>
                                                        <p className="text-sm font-bold text-gray-700">{A_LABELS[k]?.[v] || v}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center">
                                            <p className="text-sm text-gray-400 italic">No ha completado el cuestionario</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Formulario previo (último intake) */}
                        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                            <SectionHeader icon={<ClipboardList size={18} className="text-[#3F7FE3]" />} title="Formulario Pre-Sesión" />
                            <div className="p-6">
                                {latestIntake?.intake ? (
                                    <div className="space-y-3">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            Última actualización — {new Date(latestIntake.intake.created_at).toLocaleDateString("es-ES")}
                                        </div>
                                        {[
                                            { label: "Experiencia", value: FREQ_LABELS[latestIntake.intake.surf_frequency] || latestIntake.intake.surf_frequency },
                                            latestIntake.intake.declared_level && { label: "Nivel declarado", value: latestIntake.intake.declared_level },
                                            { label: "Material", value: GEAR_LABELS[latestIntake.intake.own_gear] || latestIntake.intake.own_gear },
                                            latestIntake.intake.wetsuit_size && { label: "Talla neopreno", value: latestIntake.intake.wetsuit_size.toUpperCase() },
                                            { label: "Tabla", value: latestIntake.intake.board_size.replace("_", "'") },
                                            latestIntake.intake.board_notes && { label: "Nota tabla", value: latestIntake.intake.board_notes },
                                        ].filter(Boolean).map((item: any) => (
                                            <div key={item.label} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{item.label}</p>
                                                <p className="text-sm font-bold text-gray-700">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center">
                                        <Package size={24} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-400 italic">Sin formulario previo aún</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Historial de reservas */}
                        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                            <SectionHeader
                                icon={<Activity size={18} className="text-blue-500" />}
                                title="Historial de Reservas"
                            />
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Servicio</th>
                                            <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Fecha</th>
                                            <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Pax</th>
                                            <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Formularios</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {!student.bookings || student.bookings.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                                    Sin reservas registradas.
                                                </td>
                                            </tr>
                                        ) : (
                                            student.bookings.map((b: any) => (
                                                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-[#0F172A]">{b.services?.title || "Clase de Surf"}</div>
                                                        <div className="text-[10px] text-gray-400 uppercase font-bold">{b.services?.type || "General"}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                                                            <CalendarDays size={13} className="text-[#3F7FE3]" />
                                                            {new Date(b.date).toLocaleDateString("es-ES")}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-0.5">
                                                            <Clock size={13} /> {b.time?.substring(0, 5)} h
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg text-xs font-bold text-gray-600">
                                                            <Users size={12} /> {b.pax}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_CONFIG[b.status]?.color || "bg-gray-100"}`}>
                                                            {STATUS_CONFIG[b.status]?.label || b.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span title="Formulario previo"
                                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${b.intake ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
                                                                📋
                                                            </span>
                                                            <span title="Feedback"
                                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${b.feedback ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-400"}`}>
                                                                ⭐
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Timeline de feedback */}
                        {feedbackBookings.length > 0 && (
                            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                                <SectionHeader
                                    icon={<TrendingUp size={18} className="text-emerald-500" />}
                                    title="Evolución · Feedback por Sesión"
                                />
                                <div className="p-6 space-y-5">
                                    {feedbackBookings.map((b: any, idx: number) => {
                                        const fb = b.feedback;
                                        const workedBlocks: Array<{ block: string; items: string[] }> =
                                            Array.isArray(fb.worked_blocks) ? fb.worked_blocks : [];
                                        const stars = fb.rating || 0;
                                        return (
                                            <div key={b.id} className="relative pl-8 pb-5 border-l-2 border-gray-100 last:border-0 last:pb-0">
                                                {/* Timeline dot */}
                                                <div className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${stars >= 4 ? "bg-amber-400" : stars >= 3 ? "bg-blue-400" : "bg-gray-300"}`}>
                                                    <span className="text-white text-[8px] font-black">{stars}</span>
                                                </div>

                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-xs font-black text-gray-400">
                                                        {new Date(b.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                                                    </span>
                                                    <span className="text-xs text-gray-300">·</span>
                                                    <span className="text-xs font-bold text-gray-500">{b.services?.title || "Clase de Surf"}</span>
                                                    {/* Stars */}
                                                    <div className="flex items-center gap-0.5 ml-auto">
                                                        {[1,2,3,4,5].map(n => (
                                                            <Star key={n} size={12}
                                                                className={n <= stars ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                                                    {/* Sensación */}
                                                    <p className="text-xs font-medium text-gray-500">
                                                        {FEELING_LABELS[fb.session_feeling] || fb.session_feeling}
                                                    </p>

                                                    {/* Bloques trabajados */}
                                                    {workedBlocks.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {workedBlocks.map(wb => (
                                                                <span key={wb.block}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                                                                    {BLOCK_LABELS[wb.block] || wb.block}
                                                                    {wb.items?.length > 0 && (
                                                                        <span className="text-blue-400 font-normal">({wb.items.length})</span>
                                                                    )}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Mejora */}
                                                    {fb.improvement_goal && (
                                                        <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-2">
                                                            💬 "{fb.improvement_goal}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
