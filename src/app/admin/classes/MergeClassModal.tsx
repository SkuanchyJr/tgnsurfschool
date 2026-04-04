"use client";

import { useState } from "react";
import { X, Loader2, GitMerge, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { mergeClasses, type SurfClassWithBookings } from "../actions";
import { useRouter } from "next/navigation";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    sourceClass: SurfClassWithBookings;
    allClasses: SurfClassWithBookings[];
};

const LEVEL_LABELS: Record<string, string> = {
    BEGINNER: "Principiante", INITIATION: "Iniciación", INTERMEDIATE: "Intermedio", ADVANCED: "Avanzado",
};

export default function MergeClassModal({ isOpen, onClose, sourceClass, allClasses }: Props) {
    const [targetId, setTargetId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    // Only show SCHEDULED/CONFIRMED classes that aren't the source
    const eligibleTargets = allClasses.filter(c =>
        c.id !== sourceClass.id &&
        (c.status === "SCHEDULED" || c.status === "CONFIRMED")
    );

    const targetClass = eligibleTargets.find(c => c.id === targetId);

    // Live capacity preview
    const combinedPax = (sourceClass.total_pax || 0) + (targetClass?.total_pax || 0);
    const targetCap = targetClass?.max_capacity || 0;
    const isOverCapacity = targetClass ? combinedPax > targetCap : false;
    const capacityPct = targetClass && targetCap > 0 ? Math.min((combinedPax / targetCap) * 100, 100) : 0;

    const handleMerge = async () => {
        if (!targetId) return;
        setLoading(true);
        setError("");
        const res = await mergeClasses(sourceClass.id, targetId);
        if (res.success) {
            setSuccess(true);
            setTimeout(() => {
                router.refresh();
                onClose();
                setSuccess(false);
                setTargetId("");
            }, 1500);
        } else {
            setError(res.error || "Error desconocido");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-900 to-violet-600">
                    <div className="flex items-center gap-2">
                        <GitMerge size={20} className="text-white" />
                        <h2 className="text-lg font-black text-white font-fredoka">Fusionar Clase</h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {success ? (
                        <div className="flex flex-col items-center py-6 gap-3">
                            <CheckCircle2 size={48} className="text-emerald-600" />
                            <p className="font-black text-emerald-700 text-lg">¡Fusión completada!</p>
                            <p className="text-gray-500 text-sm text-center">
                                Los alumnos han sido trasladados. La clase origen ha sido cancelada con registro de auditoría.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Source class summary */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Clase origen (se cancela)</p>
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                    <p className="font-bold text-red-800">{sourceClass.service?.title || "Clase"}</p>
                                    <p className="text-sm text-red-700 mt-0.5">
                                        {sourceClass.date} · {sourceClass.time?.substring(0, 5)} · {LEVEL_LABELS[sourceClass.level]}
                                    </p>
                                    <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                        <Users size={12} /> {sourceClass.total_pax} alumno{sourceClass.total_pax !== 1 ? "s" : ""} serán trasladados
                                    </p>
                                </div>
                            </div>

                            {/* Target selector */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Clase destino (absorbe alumnos)</label>
                                <select
                                    value={targetId}
                                    onChange={e => { setTargetId(e.target.value); setError(""); }}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 bg-white"
                                >
                                    <option value="">Selecciona clase destino...</option>
                                    {eligibleTargets.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.service?.title || "Clase"} · {c.date} {c.time?.substring(0, 5)} · {LEVEL_LABELS[c.level]} · {c.total_pax}/{c.max_capacity} alumnos
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Capacity preview */}
                            {targetClass && (
                                <div className={`rounded-xl p-4 border ${isOverCapacity ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-100"}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Resultado tras fusión</p>
                                        {isOverCapacity
                                            ? <span className="text-xs font-bold text-red-600 flex items-center gap-1"><AlertTriangle size={11} /> Sin capacidad</span>
                                            : <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={11} /> OK</span>
                                        }
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold mb-2">
                                        <span className={isOverCapacity ? "text-red-600" : "text-gray-900"}>
                                            {combinedPax} / {targetCap} alumnos
                                        </span>
                                        <span className="text-gray-400 text-xs">en clase destino</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${isOverCapacity ? "bg-red-500" : "bg-emerald-500"}`}
                                            style={{ width: `${capacityPct}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">
                                    <AlertTriangle size={14} className="shrink-0" />{error}
                                </div>
                            )}

                            {/* Warning note */}
                            <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                ⚠️ Esta acción es irreversible. Se cancelará la clase origen y todas sus reservas activas serán transferidas a la clase destino.
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleMerge}
                                    disabled={!targetId || isOverCapacity || loading}
                                    className="flex-1 py-2.5 text-sm font-bold text-white bg-violet-700 hover:bg-violet-800 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={15} className="animate-spin" /> : <GitMerge size={15} />}
                                    Fusionar clases
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
