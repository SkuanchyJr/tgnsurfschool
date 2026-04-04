import { getMyAssignedClasses } from "./actions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    CalendarDays, Clock, CheckCircle2, AlertCircle,
    ClipboardList, ArrowRight, LifeBuoy, Users, Waves
} from "lucide-react";

export const metadata = { title: "Dashboard Monitor | TGN Surf" };

const LEVEL_LABELS: Record<string, string> = {
    BEGINNER: "Principiante", INITIATION: "Iniciación", INTERMEDIATE: "Intermedio", ADVANCED: "Avanzado",
};

export default async function InstructorDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    const assignments = await getMyAssignedClasses();

    const today = new Date().toISOString().split("T")[0];

    const pending = assignments.filter(a => a.assignmentStatus === "ASSIGNED");
    const accepted = assignments.filter(a => a.assignmentStatus === "ACCEPTED");
    const todayClasses = assignments.filter(a => a.date === today && a.assignmentStatus !== "REJECTED" && a.status !== "CANCELLED");

    const userName = user.email?.split("@")[0] || "Monitor";

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-[#0F172A] font-fredoka leading-none mb-1">
                    Hola, {userName} 🤙
                </h1>
                <p className="text-gray-500 font-medium">
                    {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                </p>
            </div>

            {/* Pending alert */}
            {pending.length > 0 && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-bold text-amber-800">
                            {pending.length} asignación{pending.length > 1 ? "es" : ""} pendiente{pending.length > 1 ? "s" : ""} de respuesta
                        </p>
                        <p className="text-amber-700 text-sm mt-0.5">
                            Acepta o rechaza cuanto antes para que el equipo pueda planificar.
                        </p>
                    </div>
                    <Link
                        href="/instructor/asignaciones"
                        className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors"
                    >
                        Ver <ArrowRight size={12} />
                    </Link>
                </div>
            )}

            {/* KPI strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total asignadas", value: assignments.length, color: "text-[#0F172A]", bg: "bg-gray-50", icon: <LifeBuoy size={16} className="text-gray-600" /> },
                    { label: "Aceptadas", value: accepted.length, color: "text-emerald-700", bg: "bg-emerald-50", icon: <CheckCircle2 size={16} className="text-emerald-600" /> },
                    { label: "Pendientes", value: pending.length, color: "text-amber-600", bg: "bg-amber-50", icon: <ClipboardList size={16} className="text-amber-600" /> },
                    { label: "Hoy", value: todayClasses.length, color: "text-blue-700", bg: "bg-blue-50", icon: <CalendarDays size={16} className="text-blue-600" /> },
                ].map(k => (
                    <div key={k.label} className={`${k.bg} rounded-2xl border border-white/60 p-5`}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{k.label}</p>
                            {k.icon}
                        </div>
                        <p className={`text-3xl font-black ${k.color}`}>{k.value}</p>
                    </div>
                ))}
            </div>

            {/* Today's classes */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-black text-[#0F172A] font-fredoka text-xl">Clases de Hoy</h2>
                    <Link href="/instructor/clases" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                        Ver todas <ArrowRight size={12} />
                    </Link>
                </div>
                {todayClasses.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                        <Waves size={32} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-gray-400 font-medium text-sm">Sin clases asignadas para hoy</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todayClasses.map(cls => (
                            <div key={cls.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 p-4">
                                <div className="w-14 h-14 bg-[#0F172A] rounded-xl flex flex-col items-center justify-center shrink-0">
                                    <Clock size={12} className="text-blue-300" />
                                    <span className="text-white font-black text-base leading-tight">{cls.time?.substring(0, 5)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[#0F172A]">{cls.service?.title || "Clase"}</p>
                                    <p className="text-xs text-gray-400">
                                        {LEVEL_LABELS[cls.level]} · {cls.duration_minutes} min ·{" "}
                                        <span className="font-bold text-gray-600">{cls.total_pax}</span> alumnos
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                    {cls.assignmentStatus === "ACCEPTED" ? "Aceptada" : "Asignada"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
