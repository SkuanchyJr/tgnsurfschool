"use client";

import { useState } from "react";
import { Users, Clock, Waves, CheckCircle2, Loader2, ShieldAlert, UserCheck } from "lucide-react";
import { bookClass } from "../actions";

type ClassInstructor = {
    instructor: { name: string } | null;
    status: string;
};

type AvailableClass = {
    id: string;
    date: string;
    time: string;
    duration_minutes: number;
    level: string;
    max_capacity: number;
    status: string;
    location: string | null;
    notes: string | null;
    service: { title: string } | null;
    class_instructors: ClassInstructor[];
    total_pax: number;
    remaining: number;
};

type Props = {
    classes: AvailableClass[];
};

const LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
    BEGINNER: { label: "Principiante", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    INITIATION: { label: "Iniciación", color: "bg-blue-50 text-blue-700 border-blue-100" },
    INTERMEDIATE: { label: "Intermedio", color: "bg-violet-50 text-violet-700 border-violet-100" },
    ADVANCED: { label: "Avanzado", color: "bg-orange-50 text-orange-700 border-orange-100" },
    UNDEFINED: { label: "No definido", color: "bg-gray-50 text-gray-500 border-gray-100" },
};

function ClassCard({ cls }: { cls: AvailableClass }) {
    const [pax, setPax] = useState(1);
    const [loading, setLoading] = useState(false);
    const [booked, setBooked] = useState(false);
    const [error, setError] = useState("");

    const lvl = LEVEL_CONFIG[cls.level] || LEVEL_CONFIG.BEGINNER;
    const isFull = cls.remaining <= 0;
    const acceptedInstructor = cls.class_instructors.find(
        i => i.status === "ACCEPTED" || i.status === "ASSIGNED"
    );
    const instructorName = acceptedInstructor?.instructor?.name;

    const [y, m, d] = cls.date.split("-");
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const weekday = dateObj.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase();
    const monthLabel = dateObj.toLocaleDateString("es-ES", { month: "short" }).toUpperCase();

    const handleBook = async () => {
        setLoading(true);
        setError("");
        const res = await bookClass(cls.id, pax);
        if (res.success) {
            setBooked(true);
        } else {
            setError(res.error || "Error desconocido");
        }
        setLoading(false);
    };

    if (booked) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center text-center gap-2">
                <CheckCircle2 size={36} className="text-emerald-600" />
                <p className="font-black text-emerald-800 text-lg">¡Reserva confirmada!</p>
                <p className="text-emerald-600 text-sm">{cls.service?.title} · {cls.date} · {cls.time.substring(0, 5)}</p>
                <p className="text-emerald-500 text-xs mt-1">Recibirás confirmación del equipo pronto.</p>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-2xl border shadow-sm flex flex-col overflow-hidden transition-all ${isFull ? "border-gray-100 opacity-70" : "border-gray-200 hover:border-[#3F7FE3]/30 hover:shadow-md"}`}>
            {/* Color accent top bar by level */}
            <div className={`h-1 w-full ${cls.level === "BEGINNER" ? "bg-emerald-400" : cls.level === "INITIATION" ? "bg-blue-400" : cls.level === "INTERMEDIATE" ? "bg-violet-400" : cls.level === "ADVANCED" ? "bg-orange-400" : "bg-gray-300"}`} />

            <div className="p-5 flex gap-4 flex-1">
                {/* Date block */}
                <div className="flex flex-col items-center justify-center w-14 h-14 bg-[#0F172A] rounded-xl shrink-0">
                    <span className="text-blue-300 text-[10px] font-bold">{weekday}</span>
                    <span className="text-white font-black text-xl leading-tight">{d}</span>
                    <span className="text-blue-300 text-[10px] font-bold">{monthLabel}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className="font-bold text-[#0F172A] text-base">{cls.service?.title || "Clase de Surf"}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${lvl.color}`}>{lvl.label}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-400 text-xs">
                        <span className="flex items-center gap-1"><Clock size={11} />{cls.time.substring(0, 5)} · {cls.duration_minutes} min</span>
                        {cls.location && (
                            <span className="flex items-center gap-1 text-[#3F7FE3] font-bold">
                                <Users size={11} className="text-[#3F7FE3]/50" /> {cls.location}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Users size={11} />
                            {isFull
                                ? <span className="text-red-500 font-bold">Sin plazas</span>
                                : <span><span className="font-bold text-emerald-600">{cls.remaining}</span> plazas libres</span>
                            }
                        </span>
                        {instructorName && (
                            <span className="flex items-center gap-1 text-gray-500">
                                <UserCheck size={11} />{instructorName}
                            </span>
                        )}
                    </div>
                    {cls.notes && (
                        <p className="text-xs text-gray-400 mt-1.5 italic">📝 {cls.notes}</p>
                    )}
                </div>
            </div>

            {/* Booking footer */}
            <div className="px-5 pb-4">
                {error && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-2.5 mb-3">
                        <ShieldAlert size={14} className="shrink-0" />{error}
                    </div>
                )}
                {!isFull && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 border border-gray-200 rounded-xl overflow-hidden">
                            <button onClick={() => setPax(Math.max(1, pax - 1))} className="w-8 h-9 text-gray-500 hover:bg-gray-50 font-bold text-lg leading-none flex items-center justify-center">-</button>
                            <span className="w-7 text-center font-bold text-sm text-[#0F172A]">{pax}</span>
                            <button onClick={() => setPax(Math.min(cls.remaining, pax + 1))} className="w-8 h-9 text-gray-500 hover:bg-gray-50 font-bold text-lg leading-none flex items-center justify-center">+</button>
                        </div>
                        <button
                            onClick={handleBook}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1E3A8A] text-white rounded-xl text-sm font-bold hover:bg-[#3F7FE3] transition-colors disabled:opacity-60"
                        >
                            {loading ? <Loader2 size={15} className="animate-spin" /> : <Waves size={15} />}
                            Reservar
                        </button>
                    </div>
                )}
                {isFull && (
                    <div className="py-2.5 text-center text-sm font-bold text-gray-400 bg-gray-50 rounded-xl">
                        Clase completa
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ClassBrowserClient({ classes }: Props) {
    if (classes.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <Waves size={40} className="mx-auto text-gray-200 mb-4" />
                <h3 className="font-bold text-gray-400 text-lg mb-2">Sin clases disponibles</h3>
                <p className="text-gray-400 text-sm">El equipo está preparando el calendario de clases. ¡Vuelve pronto!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {classes.map(cls => <ClassCard key={cls.id} cls={cls} />)}
        </div>
    );
}
