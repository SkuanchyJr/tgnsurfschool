"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, Clock, Users, Waves, AlertCircle } from "lucide-react";
import { respondToAssignment } from "./actions";

type Assignment = {
    id: string;
    assignmentId: string;
    assignmentStatus: string;
    date: string;
    time: string;
    duration_minutes: number;
    level: string;
    max_capacity: number;
    status: string;
    notes: string | null;
    service: { title: string } | null;
    total_pax: number;
};

type Props = {
    assignments: Assignment[];
    pendingOnly?: boolean;
};

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
    BEGINNER: { label: "Principiante", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    INITIATION: { label: "Iniciación", color: "bg-blue-50 text-blue-700 border-blue-100" },
    INTERMEDIATE: { label: "Intermedio", color: "bg-violet-50 text-violet-700 border-violet-100" },
    ADVANCED: { label: "Avanzado", color: "bg-orange-50 text-orange-700 border-orange-100" },
};

const ASSIGNMENT_STATUS: Record<string, { label: string; color: string }> = {
    ASSIGNED: { label: "Pendiente", color: "bg-amber-50 text-amber-700 border-amber-100" },
    ACCEPTED: { label: "Aceptada", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    REJECTED: { label: "Rechazada", color: "bg-red-50 text-red-700 border-red-100" },
};

function AssignmentCard({ assignment }: { assignment: Assignment }) {
    const [status, setStatus] = useState(assignment.assignmentStatus);
    const [loadingAction, setLoadingAction] = useState<"ACCEPTED" | "REJECTED" | null>(null);
    const [error, setError] = useState("");

    const isPending = status === "ASSIGNED";
    const lvl = LEVEL_LABELS[assignment.level] || LEVEL_LABELS.BEGINNER;
    const aStatus = ASSIGNMENT_STATUS[status] || ASSIGNMENT_STATUS.ASSIGNED;

    const [y, m, d] = assignment.date.split("-");
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const weekday = dateObj.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase();
    const monthLabel = dateObj.toLocaleDateString("es-ES", { month: "short" }).toUpperCase();
    const fullDate = dateObj.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

    const handleRespond = async (response: "ACCEPTED" | "REJECTED") => {
        setLoadingAction(response);
        setError("");
        const res = await respondToAssignment(assignment.id, response);
        if (res.success) {
            setStatus(response);
        } else {
            setError(res.error || "Error desconocido");
        }
        setLoadingAction(null);
    };

    return (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${isPending ? "border-amber-200" : "border-gray-200"}`}>
            {/* Top color bar */}
            <div className={`h-1 w-full ${assignment.level === "BEGINNER" ? "bg-emerald-400" : assignment.level === "INITIATION" ? "bg-blue-400" : assignment.level === "INTERMEDIATE" ? "bg-violet-400" : "bg-orange-400"}`} />

            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Date block */}
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-[#0F172A] rounded-xl shrink-0">
                        <span className="text-blue-300 text-[10px] font-bold">{weekday}</span>
                        <span className="text-white font-black text-xl leading-tight">{d}</span>
                        <span className="text-blue-300 text-[10px] font-bold">{monthLabel}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="font-bold text-[#0F172A] text-base">{assignment.service?.title || "Clase"}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${lvl.color}`}>{lvl.label}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${aStatus.color}`}>{aStatus.label}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-400 text-xs">
                            <span className="capitalize">{fullDate}</span>
                            <span className="flex items-center gap-1"><Clock size={11} />{assignment.time?.substring(0, 5)} · {assignment.duration_minutes} min</span>
                            <span className="flex items-center gap-1"><Users size={11} /><span className="font-bold text-gray-600">{assignment.total_pax}</span>/{assignment.max_capacity} alumnos</span>
                        </div>

                        {assignment.notes && (
                            <p className="text-xs text-gray-400 italic mt-1.5">📝 {assignment.notes}</p>
                        )}
                    </div>
                </div>

                {/* Action buttons — only shown when pending */}
                {isPending && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        {error && (
                            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">
                                <AlertCircle size={13} className="shrink-0" />{error}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleRespond("ACCEPTED")}
                                disabled={!!loadingAction}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-60"
                            >
                                {loadingAction === "ACCEPTED"
                                    ? <Loader2 size={16} className="animate-spin" />
                                    : <CheckCircle2 size={16} />}
                                Aceptar clase
                            </button>
                            <button
                                onClick={() => handleRespond("REJECTED")}
                                disabled={!!loadingAction}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-60"
                            >
                                {loadingAction === "REJECTED"
                                    ? <Loader2 size={16} className="animate-spin" />
                                    : <XCircle size={16} />}
                                Rechazar
                            </button>
                        </div>
                    </div>
                )}

                {/* Accepted/Rejected confirmation */}
                {!isPending && (
                    <div className={`mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm font-bold ${status === "ACCEPTED" ? "text-emerald-600" : "text-red-500"}`}>
                        {status === "ACCEPTED" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        {status === "ACCEPTED" ? "Has aceptado esta clase" : "Has rechazado esta clase"}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AssignmentListClient({ assignments, pendingOnly }: Props) {
    if (assignments.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <Waves size={40} className="mx-auto text-gray-200 mb-4" />
                <h3 className="font-bold text-gray-400 text-lg mb-2">
                    {pendingOnly ? "Sin asignaciones pendientes" : "Sin clases asignadas"}
                </h3>
                <p className="text-gray-400 text-sm">
                    {pendingOnly
                        ? "¡Todo al día! El admin aún no te ha asignado nuevas clases."
                        : "Aún no tienes clases asignadas."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {assignments.map(a => <AssignmentCard key={a.assignmentId || a.id} assignment={a} />)}
        </div>
    );
}
