"use client";

import { useState } from "react";
import { Plus, Edit2, XCircle, ChevronDown, ChevronUp, CalendarDays, Clock, Waves, AlertTriangle, GitMerge } from "lucide-react";
import { cancelClass, type SurfClassWithBookings } from "../actions";
import CapacityWidget, { requiredInstructors } from "./CapacityWidget";
import InstructorAssigner from "./InstructorAssigner";
import ClassFormModal from "./ClassFormModal";
import MergeClassModal from "./MergeClassModal";
import { useRouter } from "next/navigation";

type Service = { id: string; title: string; type: string };
type InstructorRow = { id: string; name: string; email: string; role: string };

type Props = {
    initialClasses: SurfClassWithBookings[];
    services: Service[];
    instructors: InstructorRow[];
};

type FilterTab = "today" | "week" | "all";

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
    BEGINNER: { label: "Principiante", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    INITIATION: { label: "Iniciación", color: "bg-blue-50 text-blue-700 border-blue-100" },
    INTERMEDIATE: { label: "Intermedio", color: "bg-violet-50 text-violet-700 border-violet-100" },
    ADVANCED: { label: "Avanzado", color: "bg-orange-50 text-orange-700 border-orange-100" },
    UNDEFINED: { label: "No definido", color: "bg-gray-50 text-gray-500 border-gray-100" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    SCHEDULED: { label: "Programada", color: "bg-blue-50 text-blue-700" },
    CONFIRMED: { label: "Confirmada", color: "bg-green-50 text-green-700" },
    CANCELLED: { label: "Cancelada", color: "bg-red-50 text-red-700" },
    COMPLETED: { label: "Completada", color: "bg-gray-100 text-gray-600" },
};

function toDateOnly(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ClassManagerClient({ initialClasses, services, instructors }: Props) {
    const [classes, setClasses] = useState<SurfClassWithBookings[]>(initialClasses);
    const [filter, setFilter] = useState<FilterTab>("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<SurfClassWithBookings | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [mergeSourceClass, setMergeSourceClass] = useState<SurfClassWithBookings | null>(null);
    const router = useRouter();

    const today = toDateOnly(new Date());
    const weekEnd = toDateOnly(new Date(Date.now() + 7 * 86400000));

    const filteredClasses = classes.filter(c => {
        if (filter === "today") return c.date === today;
        if (filter === "week") return c.date >= today && c.date <= weekEnd;
        return true;
    });

    const handleOpenCreate = () => { setEditingClass(null); setIsModalOpen(true); };
    const handleOpenEdit = (cls: SurfClassWithBookings) => { setEditingClass(cls); setIsModalOpen(true); };

    const handleCancel = async (id: string) => {
        if (!confirm("¿Cancelar esta clase? Los alumnos no podrán reservarla.")) return;
        setLoadingId(id);
        const res = await cancelClass(id);
        if (res.success) {
            setClasses(prev => prev.map(c => c.id === id ? { ...c, status: "CANCELLED" as const } : c));
        } else {
            alert(res.error);
        }
        setLoadingId(null);
    };

    const handleSaved = () => router.refresh();

    const formatDate = (dateStr: string) => {
        const [y, m, d] = dateStr.split("-");
        const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        return {
            day: d,
            month: date.toLocaleDateString("es-ES", { month: "short" }).toUpperCase(),
            weekday: date.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase(),
        };
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] font-fredoka leading-none mb-1 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1E3A8A] text-white rounded-xl flex items-center justify-center">
                            <CalendarDays size={20} />
                        </div>
                        Clases Programadas
                    </h1>
                    <p className="text-gray-500 font-medium">Gestiona las sesiones activas de la escuela</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-5 py-3 bg-[#1E3A8A] text-white rounded-xl font-bold hover:bg-[#3F7FE3] transition-colors shadow-lg shadow-[#1E3A8A]/20 shrink-0"
                >
                    <Plus size={18} /> Nueva Clase
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
                {(["today", "week", "all"] as FilterTab[]).map(key => {
                    const labels = { today: "Hoy", week: "Esta semana", all: "Todas" };
                    return (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === key ? "bg-white text-[#1E3A8A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            {labels[key]}
                        </button>
                    );
                })}
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total clases", value: filteredClasses.length, color: "text-[#1E3A8A]" },
                    { label: "Programadas", value: filteredClasses.filter(c => c.status === "SCHEDULED").length, color: "text-blue-600" },
                    { label: "Sin monitor", value: filteredClasses.filter(c => c.total_pax > 0 && c.class_instructors.length < requiredInstructors(c.total_pax)).length, color: "text-amber-600" },
                    { label: "Canceladas", value: filteredClasses.filter(c => c.status === "CANCELLED").length, color: "text-red-500" },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                        <p className={`text-3xl font-black ${s.color} mt-1`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Class list */}
            {filteredClasses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                    <CalendarDays size={40} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="font-bold text-gray-400 text-lg mb-2">Sin clases</h3>
                    <p className="text-gray-400 text-sm mb-6">No hay clases para el filtro seleccionado.</p>
                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-bold hover:bg-[#3F7FE3] transition-colors"
                    >
                        <Plus size={16} /> Crear primera clase
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredClasses.map(cls => {
                        const { day, month, weekday } = formatDate(cls.date);
                        const statusCfg = STATUS_LABELS[cls.status] || STATUS_LABELS.SCHEDULED;
                        const levelCfg = LEVEL_LABELS[cls.level] || LEVEL_LABELS.BEGINNER;
                        const isCancelled = cls.status === "CANCELLED";
                        const isExpanded = expandedId === cls.id;
                        const needed = requiredInstructors(cls.total_pax);
                        const hasIssue = cls.total_pax > 0 && cls.class_instructors.length < needed;

                        return (
                            <div
                                key={cls.id}
                                className={`bg-white rounded-2xl border transition-all ${isCancelled ? "border-gray-100 opacity-60" : hasIssue ? "border-amber-200 shadow-sm shadow-amber-100" : "border-gray-200 shadow-sm"}`}
                            >
                                {/* Main row */}
                                <div className="flex items-center gap-4 p-4">
                                    {/* Date block */}
                                    <div className={`hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0 ${isCancelled ? "bg-gray-100" : "bg-[#1E3A8A]"}`}>
                                        <span className={`text-xs font-bold ${isCancelled ? "text-gray-400" : "text-blue-200"}`}>{weekday}</span>
                                        <span className={`text-xl font-black leading-none ${isCancelled ? "text-gray-500" : "text-white"}`}>{day}</span>
                                        <span className={`text-xs font-bold ${isCancelled ? "text-gray-400" : "text-blue-300"}`}>{month}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="font-bold text-[#0F172A] text-sm sm:text-base">
                                                {cls.service?.title || "Clase sin servicio"}
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${levelCfg.color}`}>
                                                {levelCfg.label}
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusCfg.color}`}>
                                                {statusCfg.label}
                                            </span>
                                            {hasIssue && (
                                                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                                    <AlertTriangle size={11} /> Bajo personal
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-400 text-xs">
                                            <span className="flex items-center gap-1 sm:hidden font-medium">{weekday} {day} {month}</span>
                                            <span className="flex items-center gap-1"><Clock size={11} /> {cls.time.substring(0, 5)}</span>
                                            <span className="flex items-center gap-1"><Waves size={11} /> {cls.duration_minutes} min</span>
                                            {cls.location && <span className="flex items-center gap-1 text-[#3F7FE3] font-bold"><CalendarDays size={11} /> {cls.location}</span>}
                                        </div>
                                    </div>

                                    {/* Capacity widget */}
                                    <div className="hidden md:block shrink-0">
                                        <CapacityWidget
                                            maxCapacity={cls.max_capacity}
                                            totalPax={cls.total_pax}
                                            assignedInstructors={cls.class_instructors.length}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        {!isCancelled && (
                                            <>
                                                <button
                                                    onClick={() => handleOpenEdit(cls)}
                                                    className="p-2 text-gray-400 hover:text-[#3F7FE3] hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setMergeSourceClass(cls)}
                                                    className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                                    title="Fusionar con otra clase"
                                                >
                                                    <GitMerge size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(cls.id)}
                                                    disabled={loadingId === cls.id}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Cancelar clase"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : cls.id)}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                            title="Ver detalles"
                                        >
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded detail panel */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                                        <div className="md:hidden">
                                            <CapacityWidget
                                                maxCapacity={cls.max_capacity}
                                                totalPax={cls.total_pax}
                                                assignedInstructors={cls.class_instructors.length}
                                            />
                                        </div>

                                        {cls.notes && (
                                            <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                                                📝 {cls.notes}
                                            </p>
                                        )}

                                        {!isCancelled && (
                                            <InstructorAssigner
                                                classId={cls.id}
                                                assignedInstructors={cls.class_instructors}
                                                allInstructors={instructors}
                                            />
                                        )}

                                        <div className="text-xs text-gray-400 pt-1">
                                            <span className="font-bold text-gray-500">{cls.booking_count}</span> reservas ·{" "}
                                            <span className="font-bold text-gray-500">{cls.total_pax}</span> alumnos de{" "}
                                            <span className="font-bold text-gray-500">{cls.max_capacity}</span> plazas
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <ClassFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingClass={editingClass}
                services={services}
                instructors={instructors}
                onSaved={handleSaved}
            />

            {mergeSourceClass && (
                <MergeClassModal
                    isOpen={!!mergeSourceClass}
                    onClose={() => setMergeSourceClass(null)}
                    sourceClass={mergeSourceClass}
                    allClasses={classes}
                />
            )}
        </div>
    );
}
