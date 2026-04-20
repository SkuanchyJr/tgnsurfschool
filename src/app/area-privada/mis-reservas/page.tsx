import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import Link from "next/link";
import {
    CalendarDays, Clock, Users, CheckCircle2, XCircle, Hourglass,
    ClipboardList, MessageSquarePlus, Star
} from "lucide-react";

export const metadata = { title: "Mis Reservas | TGN Surf" };

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING:   { label: "Pendiente",  color: "bg-yellow-50 text-yellow-700 border-yellow-100", icon: <Hourglass size={12} /> },
    CONFIRMED: { label: "Confirmada", color: "bg-green-50 text-green-700 border-green-100",    icon: <CheckCircle2 size={12} /> },
    COMPLETED: { label: "Completada", color: "bg-blue-50 text-blue-700 border-blue-100",       icon: <CheckCircle2 size={12} /> },
    CANCELLED: { label: "Cancelada",  color: "bg-red-50 text-red-700 border-red-100",          icon: <XCircle size={12} /> },
};

const LEVEL_LABELS: Record<string, string> = {
    BEGINNER: "Principiante", INITIATION: "Iniciación",
    INTERMEDIATE: "Intermedio", ADVANCED: "Avanzado",
};

export default async function MisReservasPage() {
    const user = await getUser();
    if (!user) return redirect("/login");

    const bookingsResult = await pool.query(
        `SELECT b.id, b.date, b.time, b.pax, b.status, b.created_at, b.class_id,
                b.intake_id, b.feedback_id,
                s.title as service_title, s.type as service_type,
                c.level as class_level, c.duration_minutes, c.maps_url,
                (SELECT u.name FROM class_instructors ci JOIN users u ON u.id = ci.instructor_id
                 WHERE ci.class_id = b.class_id LIMIT 1) as instructor_name
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
        class: {
            level: b.class_level,
            duration_minutes: b.duration_minutes,
            maps_url: b.maps_url,
            class_instructors: b.instructor_name ? [{ instructor: { name: b.instructor_name } }] : [],
        },
    }));

    const today    = new Date().toISOString().split("T")[0];
    const upcoming = (bookings || []).filter((b: any) => b.date >= today && b.status !== "CANCELLED");
    const past     = (bookings || []).filter((b: any) => b.date < today || b.status === "COMPLETED" || b.status === "CANCELLED");

    function formatDate(dateStr: string) {
        const [y, m, d] = dateStr.split("-");
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
            .toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    }

    const BookingRow = ({ b }: { b: any }) => {
        const cfg        = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING;
        const service    = Array.isArray(b.services) ? b.services[0] : b.services;
        const cls        = Array.isArray(b.class)    ? b.class[0]    : b.class;
        const instructor = cls?.class_instructors?.[0]?.instructor?.name;
        const isUpcoming = b.date >= today && b.status !== "CANCELLED";
        const needsIntake    = isUpcoming && !b.intake_id;
        const canGiveFeedback = (b.status === "COMPLETED" || (b.date < today && b.status !== "CANCELLED")) && !b.feedback_id;

        return (
            <div className="p-4 hover:bg-gray-50/80 transition-colors">
                <div className="flex items-center gap-4">
                    {/* Time pill */}
                    <div className="hidden sm:flex w-12 h-12 bg-[#0F172A] rounded-xl flex-col items-center justify-center shrink-0">
                        <Clock size={12} className="text-blue-300" />
                        <span className="text-white font-bold text-sm">{b.time?.substring(0, 5)}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#0F172A] text-sm truncate">{service?.title || "Clase de surf"}</p>
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-xs text-gray-400">
                            <span className="capitalize">{formatDate(b.date)}</span>
                            {cls?.level && <span>· {LEVEL_LABELS[cls.level]}</span>}
                            {cls?.duration_minutes && <span>· {cls.duration_minutes} min</span>}
                            <span className="flex items-center gap-0.5"><Users size={10} /> {b.pax} pax</span>
                            {instructor && <span>· Monitor: {instructor}</span>}
                        </div>
                    </div>

                    {/* Status badge */}
                    <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${cfg.color}`}>
                        {cfg.icon}{cfg.label}
                    </span>
                </div>

                {/* Action buttons */}
                {(needsIntake || canGiveFeedback) && (
                    <div className="flex flex-wrap gap-2 mt-3 pl-0 sm:pl-16">
                        {needsIntake && (
                            <Link
                                href={`/area-privada/formulario-previo?booking=${b.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition-all">
                                <ClipboardList size={13} />
                                Completar formulario previo
                            </Link>
                        )}
                        {canGiveFeedback && (
                            <Link
                                href={`/area-privada/feedback/${b.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all">
                                <Star size={13} />
                                Dar feedback
                            </Link>
                        )}
                        {b.feedback_id && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold">
                                <CheckCircle2 size={13} />
                                Feedback enviado
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-[#0F172A] font-fredoka leading-none mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3F7FE3]/10 text-[#3F7FE3] rounded-xl flex items-center justify-center">
                        <CalendarDays size={20} />
                    </div>
                    Mis Reservas
                </h1>
                <p className="text-gray-500 font-medium">Historial completo de tus clases y reservas.</p>
            </div>

            {/* Upcoming */}
            <section className="mb-8">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Próximas ({upcoming.length})</h2>
                {upcoming.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                        <CalendarDays size={32} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-gray-400 font-medium text-sm">Sin clases próximas</p>
                        <a href="/area-privada/clases" className="inline-block mt-3 text-xs font-bold text-[#3F7FE3] hover:underline">
                            Reservar una clase →
                        </a>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
                        {upcoming.map((b: any) => <BookingRow key={b.id} b={b} />)}
                    </div>
                )}
            </section>

            {/* Past / Cancelled */}
            {past.length > 0 && (
                <section>
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Historial ({past.length})</h2>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
                        {past.map((b: any) => <BookingRow key={b.id} b={b} />)}
                    </div>
                </section>
            )}
        </div>
    );
}
