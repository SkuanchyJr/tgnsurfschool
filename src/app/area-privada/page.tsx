import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import Link from "next/link";
import {
    CalendarDays, Waves, ArrowRight, UserCircle, ShieldCheck,
    CheckCircle2, Clock, Users, Hourglass, ClipboardList, Star, ChevronRight
} from "lucide-react";

import { BookingRecommendations } from "./components/BookingRecommendations";
import { AvailableClass } from "../reservas/actions";

export const metadata = {
    title: "Mi Área | TGN Surf School",
    description: "Tu panel de alumno: reservas, clases y estado de sesiones.",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING:   { label: "Pendiente",  color: "bg-yellow-50 text-yellow-700", icon: <Hourglass size={11} /> },
    CONFIRMED: { label: "Confirmada", color: "bg-green-50 text-green-700",   icon: <CheckCircle2 size={11} /> },
    COMPLETED: { label: "Completada", color: "bg-blue-50 text-blue-700",     icon: <CheckCircle2 size={11} /> },
    CANCELLED: { label: "Cancelada",  color: "bg-red-50 text-red-700",       icon: null },
};

const LEVEL_LABELS: Record<string, string> = {
    BEGINNER: "Principiante", INITIATION: "Iniciación",
    INTERMEDIATE: "Intermedio", ADVANCED: "Avanzado",
};

const LEVEL_CFG: Record<string, { label: string; emoji: string; color: string; bg: string; border: string; tagline: string; rec: string }> = {
    BEGINNER:     { label: "Principiante", emoji: "🏄", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", tagline: "¡Bienvenido/a al surf! Estás en el mejor punto de partida.", rec: "Te recomendamos nuestras clases de Iniciación con olas pequeñas y suaves. Aprenderás las bases en un entorno seguro." },
    INITIATION:   { label: "Iniciación",   emoji: "🏄", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", tagline: "¡Bienvenido/a al surf!",                                                rec: "Nuestras clases de iniciación son perfectas para ti." },
    INTERMEDIATE: { label: "Intermedio",   emoji: "🌊", color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   tagline: "Buen nivel — ya tienes la base, es hora de afinar la técnica.",    rec: "Prueba nuestras clases de Perfeccionamiento: olas medias y trabajo de maniobras." },
    ADVANCED:     { label: "Avanzado",     emoji: "⚡", color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",     tagline: "¡Top surfer! Estás listo para los retos más exigentes.",           rec: "Nuestras clases avanzadas y de alto rendimiento son para ti: olas grandes, maniobras complejas." },
};

const Q_LABELS: Record<string, string> = {
    previous_surf: "Experiencia previa", water_comfort: "Comodidad en el agua",
    wave_preference: "Olas preferidas", fitness_level: "Forma física", main_goal: "Objetivo",
};
const A_LABELS: Record<string, Record<string, string>> = {
    previous_surf:   { no: "Primera vez", yes_little: "Un par de veces", yes_regular: "Con regularidad", yes_lots: "Años surfeando" },
    water_comfort:   { nervous: "Me pongo nervioso/a", ok: "Me defiendo", comfortable: "Cómodo/a", very_comfortable: "Muy cómodo/a" },
    wave_preference: { small: "Pequeñas y suaves", medium: "Medias", big: "Grandes", any: "Cualquiera" },
    fitness_level:   { low: "Baja", moderate: "Moderada", high: "Alta", athlete: "Deportista" },
    main_goal:       { learn_standup: "Ponerme de pie", improve_technique: "Mejorar técnica", ride_better_waves: "Olas más grandes", compete: "Competir" },
};

export default async function AreaPrivadaPage() {
    const user = await getUser();
    if (!user) return redirect("/login");

    const today = new Date().toISOString().split("T")[0];

    // Fetch user surf profile
    const profileResult = await pool.query(
        `SELECT surf_level, surf_assessment, name FROM users WHERE id = $1`,
        [user.id]
    );
    const profile = profileResult.rows[0] || {};
    const surfLevel: string = profile.surf_level || "BEGINNER";
    const surfAssessment: Record<string, string> | null = profile.surf_assessment || null;
    const displayName = profile.name || user.name || "Alumno";
    const lv = LEVEL_CFG[surfLevel] || LEVEL_CFG.BEGINNER;

    // Fetch bookings with service and class info
    const bookingsResult = await pool.query(
        `SELECT b.id, b.date, b.time, b.pax, b.status, b.class_id,
                s.title as service_title, s.type as service_type,
                c.level as class_level
         FROM bookings b
         LEFT JOIN services s ON s.id = b.service_id
         LEFT JOIN classes c ON c.id = b.class_id
         WHERE b.user_id = $1
         ORDER BY b.date DESC, b.time DESC`,
        [user.id]
    );
    const bookings = bookingsResult.rows.map((b: any) => ({
        ...b,
        services: { title: b.service_title, type: b.service_type },
        class: { level: b.class_level },
    }));

    // Separate upcoming and past
    const upcoming = bookings
        .filter((b: any) => b.date >= today && b.status !== "CANCELLED")
        .sort((a: any, b: any) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    
    const past = bookings
        .filter((b: any) => b.status === "COMPLETED" || (b.date < today && b.status !== "CANCELLED"));

    const nextBooking = upcoming[0] || null;
    const totalBookings = bookings.length;
    const upcomingCount = upcoming.length;
    const completedClassesCount = past.filter((b: any) => b.status === "COMPLETED").length;

    // Fetch available classes with pax counts
    const availableResult = await pool.query(
        `SELECT c.id, c.date, c.time, c.duration_minutes, c.level, c.max_capacity,
                s.title as service_title,
                COALESCE((
                    SELECT SUM(b.pax) FROM bookings b WHERE b.class_id = c.id AND b.status != 'CANCELLED'
                ), 0) as booked_pax
         FROM classes c
         LEFT JOIN services s ON s.id = c.service_id
         WHERE c.status = 'SCHEDULED' AND c.date >= $1
         ORDER BY c.date ASC, c.time ASC
         LIMIT 10`,
        [today]
    );
    const availableClasses = availableResult.rows.map((c: any) => ({
        ...c,
        spots_left: c.max_capacity - parseInt(c.booked_pax, 10),
        service: { title: c.service_title },
    }));

    // Prepare Recommendations
    const recommendedClasses = availableClasses
        .filter((c: any) => c.level === surfLevel && c.spots_left > 0)
        .slice(0, 3)
        .map((c: any) => ({
            id: c.id, date: c.date, time: c.time, duration_minutes: c.duration_minutes,
            level: c.level, max_capacity: c.max_capacity, spots_left: c.spots_left,
            service_id: null, service_title: c.service_title, service_type: null,
            service_price: null, notes: null,
        }));

    // Prepare general available classes (max 3 for the small widget)
    const generalAvailableClasses = availableClasses.slice(0, 3);

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
            {/* 1. HERO CARD */}
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3F7FE3] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 text-white shadow-xl shadow-[#1E3A8A]/20">
                <div className="w-24 h-24 bg-white/10 backdrop-blur rounded-full border-4 border-white/20 flex items-center justify-center shrink-0">
                    <UserCircle size={56} strokeWidth={1.5} className="text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <ShieldCheck size={16} className="text-blue-200" />
                        <span className="text-sm font-black uppercase tracking-widest text-blue-200">Alumno TGN</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black font-fredoka capitalize mb-1">Hola, {displayName}</h1>
                    <p className="text-blue-100 text-sm">{user.email}</p>
                </div>
                <div className="flex gap-4 sm:flex-col text-center w-full md:w-auto mt-4 md:mt-0">
                    <div className="flex-1 md:flex-none bg-white/10 backdrop-blur rounded-2xl px-6 py-4 border border-white/10">
                        <p className="text-3xl font-black mb-1">{upcomingCount}</p>
                        <p className="text-xs text-blue-200 font-bold uppercase tracking-wide">Próximas</p>
                    </div>
                    <div className="flex-1 md:flex-none bg-white/10 backdrop-blur rounded-2xl px-6 py-4 border border-white/10">
                        <p className="text-3xl font-black mb-1">{totalBookings}</p>
                        <p className="text-xs text-blue-200 font-bold uppercase tracking-wide">Totales</p>
                    </div>
                </div>
            </div>

            {/* 2. QUICK ACTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/area-privada/clases" className="group flex items-center gap-5 p-6 bg-[#3F7FE3] text-white rounded-2xl hover:bg-[#2A5BA6] transition-all shadow-lg shadow-[#3F7FE3]/20">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0"><Waves size={24} /></div>
                    <div className="flex-1">
                        <p className="font-black text-lg mb-0.5">Reservar una clase</p>
                        <p className="text-blue-200 text-sm font-medium">Ver todas las clases disponibles</p>
                    </div>
                    <ArrowRight size={20} className="shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link href="/area-privada/mis-reservas" className="group flex items-center gap-5 p-6 bg-white border border-gray-200 rounded-2xl hover:border-[#3F7FE3]/30 hover:shadow-md transition-all">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-[#1E3A8A] shrink-0"><ClipboardList size={24} /></div>
                    <div className="flex-1">
                        <p className="font-black text-lg text-[#0F172A] mb-0.5">Mis reservas</p>
                        <p className="text-gray-400 text-sm font-medium">Ver historial completo y gestionar</p>
                    </div>
                    <ArrowRight size={20} className="shrink-0 text-gray-300 group-hover:text-[#3F7FE3] group-hover:translate-x-1 transition-all" />
                </Link>
            </div>

            {/* 3. NEXT BOOKING & AVAILABLE CLASSES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Next booking */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                        <h2 className="font-black text-[#0F172A] font-fredoka text-xl">Próxima Reserva</h2>
                        <Link href="/area-privada/mis-reservas" className="text-xs text-[#3F7FE3] font-bold hover:underline py-1">Ver todas</Link>
                    </div>
                    <div className="flex-1 flex flex-col">
                        {!nextBooking ? (
                            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                                <CalendarDays size={40} className="text-gray-200 mb-4" />
                                <p className="text-gray-400 font-medium text-sm mb-5">Vaya, no tienes reservas próximas.</p>
                                <Link href="/area-privada/clases" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] text-white rounded-xl text-sm font-bold hover:bg-[#3F7FE3] transition-colors shadow-md">
                                    <Waves size={16} /> Reservar ahora
                                </Link>
                            </div>
                        ) : (
                            <div className="p-6 flex flex-col sm:flex-row gap-5 items-center sm:items-start flex-1">
                                <div className="w-20 h-20 bg-gradient-to-b from-[#1E3A8A] to-[#3F7FE3] rounded-2xl flex flex-col items-center justify-center shadow-lg shrink-0">
                                    <span className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-0.5">
                                        {new Date(nextBooking.date.replace(/-/g, '/')).toLocaleDateString("es-ES", { month: "short" })}
                                    </span>
                                    <span className="text-white font-black text-3xl leading-none">{nextBooking.date.split("-")[2]}</span>
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <p className="font-black text-[#0F172A] text-lg mb-1">{(nextBooking as any).services?.title || "Clase de Surf"}</p>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start text-xs text-gray-500 font-medium gap-3 mb-4">
                                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400"/> {nextBooking.time?.substring(0, 5)}</span>
                                        <span className="flex items-center gap-1.5"><Users size={14} className="text-gray-400"/> {nextBooking.pax} {nextBooking.pax === 1 ? 'persona' : 'personas'}</span>
                                    </div>
                                    {(() => {
                                        const cfg = STATUS_CONFIG[nextBooking.status] || STATUS_CONFIG.PENDING;
                                        return <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${cfg.color}`}>{cfg.icon}{cfg.label}</span>;
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Available classes */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                        <h2 className="font-black text-[#0F172A] font-fredoka text-xl">Próximos Horarios</h2>
                        <Link href="/area-privada/clases" className="text-xs text-[#3F7FE3] font-bold hover:underline py-1">Calendario</Link>
                    </div>
                    <div className="flex-1 flex flex-col">
                        {!generalAvailableClasses || generalAvailableClasses.length === 0 ? (
                            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                                <Waves size={40} className="text-gray-200 mb-4" />
                                <p className="text-gray-400 font-medium text-sm">El equipo está preparando el calendario.<br />¡Vuelve pronto!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 flex-1">
                                {(generalAvailableClasses as any[]).map(cls => {
                                    const remaining = cls.spots_left ?? 0;
                                    const instructor = cls.class_instructors?.find((i: any) => i.status === "ACCEPTED" || i.status === "ASSIGNED");
                                    return (
                                        <div key={cls.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-12 h-12 bg-gray-900 rounded-xl flex flex-col items-center justify-center shrink-0">
                                                    <span className="text-blue-300 text-[10px] font-bold uppercase">
                                                        {new Date(cls.date.replace(/-/g, '/')).toLocaleDateString("es-ES", { month: "short" })}
                                                    </span>
                                                    <span className="text-white font-black text-lg leading-none">{cls.date.split("-")[2]}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[#0F172A] text-sm truncate">{cls.service?.title || "Clase"}</p>
                                                    <div className="flex flex-wrap items-center text-xs text-gray-500 font-medium gap-X-2 gap-y-1 mt-0.5">
                                                        <span>{cls.time?.substring(0, 5)}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="truncate max-w-[100px]">{LEVEL_LABELS[cls.level]}</span>
                                                        {instructor?.instructor?.name && (
                                                            <>
                                                                <span className="text-gray-300">•</span>
                                                                <span className="truncate max-w-[100px]">{instructor.instructor.name}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="sm:text-right shrink-0 mt-2 sm:mt-0 pl-16 sm:pl-0">
                                                <p className={`text-xs font-black px-2 py-1 rounded-md inline-block bg-opacity-10 ${remaining <= 0 ? "bg-red-500 text-red-600" : remaining <= 2 ? "bg-amber-500 text-amber-700" : "bg-emerald-500 text-emerald-700"}`}>
                                                    {remaining <= 0 ? "Completa" : `${remaining} plazas libres`}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. RECOMENDACIONES (Si hay evaluación) */}
            {surfAssessment ? (
                <BookingRecommendations recommendedClasses={recommendedClasses} levelName={LEVEL_LABELS[surfLevel]} />
            ) : (
                <div className={`rounded-2xl border-2 p-8 ${lv.bg} ${lv.border} flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm`}>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        <Star size={32} className={lv.color} />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className={`text-xl font-black mb-2 ${lv.color}`}>Obtén recomendaciones personalizadas</h2>
                        <p className={`text-sm opacity-80 mb-4 max-w-xl ${lv.color}`}>Completa tu evaluación de surf para que podamos sugerirte las clases perfectas para tu nivel y objetivos.</p>
                        <Link href="/area-privada/evaluacion" className={`inline-flex font-bold px-6 py-3 rounded-xl border ${lv.border} ${lv.color} hover:bg-white transition-colors items-center gap-2 bg-white/50 backdrop-blur-sm shadow-sm`}>
                            Hacer evaluación <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            )}

        </div>
    );
}
