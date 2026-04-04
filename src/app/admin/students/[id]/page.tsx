import { getStudentDetail } from "../../actions";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { 
    ChevronLeft, Mail, Phone, CalendarDays, Star, Activity, 
    Clock, Users, Waves, ShieldCheck, MailPlus, ExternalLink 
} from "lucide-react";

const LEVEL_CONFIG: Record<string, { label: string; badge: string; color: string; bg: string }> = {
    BEGINNER:     { label: "Principiante", badge: "bg-emerald-100 text-emerald-700", color: "text-emerald-600", bg: "bg-emerald-50" },
    INITIATION:   { label: "Iniciación",   badge: "bg-emerald-100 text-emerald-700", color: "text-emerald-600", bg: "bg-emerald-50" },
    INTERMEDIATE: { label: "Intermedio",   badge: "bg-orange-100 text-orange-700",   color: "text-orange-600",   bg: "bg-orange-50" },
    ADVANCED:     { label: "Avanzado",     badge: "bg-red-100 text-red-700",      color: "text-red-600",      bg: "bg-red-50" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    PENDING:   { label: "Pendiente",  color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
    CONFIRMED: { label: "Confirmada", color: "bg-green-50 text-green-700 border-green-100" },
    COMPLETED: { label: "Completada", color: "bg-blue-50 text-blue-700 border-blue-100" },
    CANCELLED: { label: "Cancelada",  color: "bg-red-50 text-red-700 border-red-100" },
};

const Q_LABELS: Record<string, string> = {
    previous_surf: "Experiencia previa", 
    water_comfort: "Comodidad en el agua",
    wave_preference: "Olas preferidas", 
    fitness_level: "Forma física", 
    main_goal: "Objetivo",
};

const A_LABELS: Record<string, Record<string, string>> = {
    previous_surf:   { no: "Primera vez", yes_little: "Un par de veces", yes_regular: "Con regularidad", yes_lots: "Años surfeando" },
    water_comfort:   { nervous: "Nervioso/a", ok: "Se defiende", comfortable: "Cómodo/a", very_comfortable: "Muy cómodo/a" },
    wave_preference: { small: "Pequeñas y suaves", medium: "Medias", big: "Grandes y potentes", any: "Cualquiera" },
    fitness_level:   { low: "Baja", moderate: "Moderada", high: "Alta", athlete: "Deportista" },
    main_goal:       { learn_standup: "Ponerme de pie", improve_technique: "Mejorar técnica", ride_better_waves: "Olas más grandes", compete: "Competir" },
};

export default async function StudentDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const student = await getStudentDetail(params.id);

    if (!student) {
        notFound();
    }

    const lvCfg = LEVEL_CONFIG[student.surf_level] || LEVEL_CONFIG.BEGINNER;
    const registrationDate = new Date(student.created_at).toLocaleDateString('es-ES', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* ── TOP NAVIGATION ── */}
                <div className="flex items-center justify-between">
                    <Link 
                        href="/admin/students" 
                        className="flex items-center gap-2 text-gray-500 hover:text-[#3F7FE3] font-bold text-sm transition-colors group"
                    >
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
                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                            <p className="text-2xl font-black text-[#1E3A8A] leading-none">{student.bookings?.length || 0}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Reservas</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                            <p className="text-2xl font-black text-[#3F7FE3] leading-none">{student.active_vouchers || 0}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Bonos</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* ── LEFT COLUMN: ASSESSMENT ── */}
                    <div className="lg:col-span-1 space-y-8">
                        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                <Star size={18} className="text-amber-500" />
                                <h2 className="font-black text-[#0F172A] font-fredoka">Nivel de Surf</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className={`p-4 rounded-2xl border ${lvCfg.bg} ${lvCfg.badge.split(' ')[1]} border-opacity-20 flex items-center gap-4`}>
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                        <Waves size={24} className={lvCfg.color} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Nivel Asignado</p>
                                        <p className={`text-xl font-black ${lvCfg.color}`}>{lvCfg.label}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Cuestionario</h3>
                                    {student.surf_assessment ? (
                                        <div className="space-y-4">
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
                    </div>

                    {/* ── RIGHT COLUMN: BOOKINGS ── */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity size={18} className="text-blue-500" />
                                    <h2 className="font-black text-[#0F172A] font-fredoka">Historial de Reservas</h2>
                                </div>
                                <span className="text-xs font-bold text-gray-400">{student.bookings?.length || 0} registros encontrados</span>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Servicio</th>
                                            <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Fecha</th>
                                            <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Pax</th>
                                            <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {!student.bookings || student.bookings.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
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
                                                            {new Date(b.date).toLocaleDateString('es-ES')}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-0.5">
                                                            <Clock size={13} />
                                                            {b.time?.substring(0, 5)} h
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
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                </div>
            </div>
        </div>
    );
}
