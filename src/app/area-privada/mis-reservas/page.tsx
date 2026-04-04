import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { CalendarDays, Clock, Users, CheckCircle2, XCircle, AlertCircle, Hourglass } from "lucide-react";

export const metadata = { title: "Mis Reservas | TGN Surf" };

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: "Pendiente", color: "bg-yellow-50 text-yellow-700 border-yellow-100", icon: <Hourglass size={12} /> },
    CONFIRMED: { label: "Confirmada", color: "bg-green-50 text-green-700 border-green-100", icon: <CheckCircle2 size={12} /> },
    COMPLETED: { label: "Completada", color: "bg-blue-50 text-blue-700 border-blue-100", icon: <CheckCircle2 size={12} /> },
    CANCELLED: { label: "Cancelada", color: "bg-red-50 text-red-700 border-red-100", icon: <XCircle size={12} /> },
};

const LEVEL_LABELS: Record<string, string> = {
    BEGINNER: "Principiante", INITIATION: "Iniciación", INTERMEDIATE: "Intermedio", ADVANCED: "Avanzado",
};

export default async function MisReservasPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    const { data: bookings } = await supabaseAdmin
        .from("bookings")
        .select(`
            id, date, time, pax, status, created_at, class_id,
            services:service_id ( title, type ),
            class:class_id (
                level, duration_minutes,
                class_instructors (
                    status,
                    instructor:instructor_id ( name )
                )
            )
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("time", { ascending: false });

    const today = new Date().toISOString().split("T")[0];
    const upcoming = (bookings || []).filter((b: any) => b.date >= today && b.status !== "CANCELLED");
    const past = (bookings || []).filter((b: any) => b.date < today || b.status === "COMPLETED" || b.status === "CANCELLED");

    const formatDate = (dateStr: string) => {
        const [y, m, d] = dateStr.split("-");
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
            .toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    };

    const BookingRow = ({ b }: { b: any }) => {
        const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING;
        const service = Array.isArray(b.services) ? b.services[0] : b.services;
        const cls = Array.isArray(b.class) ? b.class[0] : b.class;
        const instructor = cls?.class_instructors?.[0]?.instructor?.name;

        return (
            <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="hidden sm:flex w-12 h-12 bg-[#0F172A] rounded-xl flex-col items-center justify-center shrink-0">
                    <Clock size={12} className="text-blue-300" />
                    <span className="text-white font-bold text-sm">{b.time?.substring(0, 5)}</span>
                </div>
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
                <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${cfg.color}`}>
                    {cfg.icon}{cfg.label}
                </span>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
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
                        <a href="/area-privada/clases" className="inline-block mt-3 text-xs font-bold text-[#3F7FE3] hover:underline">Reservar una clase →</a>
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
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden opacity-75">
                        {past.map((b: any) => <BookingRow key={b.id} b={b} />)}
                    </div>
                </section>
            )}
        </div>
    );
}
