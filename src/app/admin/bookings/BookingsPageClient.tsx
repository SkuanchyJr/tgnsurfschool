"use client";

import { useState, useTransition } from "react";
import { updateBookingStatus, getClassBookings, type SurfClassWithBookings } from "../actions";
import { Search, Loader2, CheckCircle, XCircle, Clock, Users, CalendarDays, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";

type UserType = { id: string; name: string; email: string; phone: string | null };
type ServiceType = { title: string; type: string };
type BookingType = { id: string; date: string; time: string; pax: number; status: string; users: UserType; services: ServiceType };

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-100",
    CONFIRMED: "bg-green-50 text-green-700 border-green-100",
    COMPLETED: "bg-blue-50 text-blue-700 border-blue-100",
    CANCELLED: "bg-red-50 text-red-700 border-red-100",
};
const STATUS_LABELS: Record<string, string> = {
    PENDING: "Pendiente", CONFIRMED: "Confirmada", COMPLETED: "Completada", CANCELLED: "Cancelada",
};
const LEVEL_LABELS: Record<string, string> = {
    BEGINNER: "Principiante", INITIATION: "Iniciación", INTERMEDIATE: "Intermedio", ADVANCED: "Avanzado",
};

type Props = { initialBookings: BookingType[]; allClasses: SurfClassWithBookings[] };
type TabKey = "todas" | "por-clase";

export default function BookingsPageClient({ initialBookings, allClasses }: Props) {
    const [tab, setTab] = useState<TabKey>("todas");
    const [bookings, setBookings] = useState<BookingType[]>(initialBookings);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [classRoster, setClassRoster] = useState<any[]>([]);
    const [loadingRoster, startRoster] = useTransition();
    const router = useRouter();

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setLoadingId(id);
        const { success } = await updateBookingStatus(id, newStatus);
        if (success) {
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
            router.refresh();
        } else {
            alert("No se pudo actualizar la reserva");
        }
        setLoadingId(null);
    };

    const handleSelectClass = (classId: string) => {
        setSelectedClassId(classId);
        if (!classId) { setClassRoster([]); return; }
        startRoster(async () => {
            const data = await getClassBookings(classId);
            setClassRoster(data);
        });
    };

    const filtered = bookings.filter(b => {
        const q = searchTerm.toLowerCase();
        return (
            b.users?.name?.toLowerCase().includes(q) ||
            b.users?.email?.toLowerCase().includes(q) ||
            b.services?.title?.toLowerCase().includes(q) ||
            b.date?.includes(q)
        );
    });

    const activeCls = allClasses.filter(c => c.status !== "CANCELLED");
    const selectedCls = activeCls.find(c => c.id === selectedClassId);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-[#0F172A] font-fredoka leading-none mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3F7FE3]/10 text-[#3F7FE3] rounded-xl flex items-center justify-center">
                        <ClipboardList size={20} />
                    </div>
                    Gestión de Reservas
                </h1>
                <p className="text-gray-500 font-medium">Administra todas las reservas de la escuela</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
                {([
                    { key: "todas", label: `Todas las reservas (${bookings.length})` },
                    { key: "por-clase", label: "Por clase" },
                ] as { key: TabKey; label: string }[]).map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.key ? "bg-white text-[#1E3A8A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "todas" && (
                <>
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por alumno, servicio o fecha..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#3F7FE3] focus:ring-2 focus:ring-[#3F7FE3]/10"
                        />
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Alumno</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Servicio</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Fecha</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Pax</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                                    <th className="text-right px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-400">Sin resultados</td>
                                    </tr>
                                ) : filtered.map(b => (
                                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-[#1E3A8A] to-[#3F7FE3] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                    {(b.users?.name || "A").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#0F172A] text-sm">{b.users?.name || "–"}</p>
                                                    <p className="text-xs text-gray-400">{b.users?.email || "–"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 hidden md:table-cell text-gray-600">{b.services?.title || "–"}</td>
                                        <td className="px-5 py-3 hidden lg:table-cell text-gray-600">
                                            <div className="flex items-center gap-1 text-xs"><CalendarDays size={12} />{b.date}<Clock size={12} className="ml-1" />{b.time?.substring(0, 5)}</div>
                                        </td>
                                        <td className="px-5 py-3 hidden lg:table-cell text-gray-600">
                                            <span className="flex items-center gap-1 text-xs"><Users size={12} />{b.pax}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[b.status] || ""}`}>
                                                {STATUS_LABELS[b.status] || b.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {b.status === "PENDING" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(b.id, "CONFIRMED")}
                                                        disabled={loadingId === b.id}
                                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Confirmar"
                                                    >
                                                        {loadingId === b.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                    </button>
                                                )}
                                                {b.status !== "CANCELLED" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(b.id, "CANCELLED")}
                                                        disabled={loadingId === b.id}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Cancelar"
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {tab === "por-clase" && (
                <div className="space-y-4">
                    {/* Class selector */}
                    <select
                        value={selectedClassId}
                        onChange={e => handleSelectClass(e.target.value)}
                        className="w-full md:w-96 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#3F7FE3] bg-white"
                    >
                        <option value="">Selecciona una clase...</option>
                        {activeCls.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.service?.title || "Clase"} · {c.date} {c.time?.substring(0, 5)} · {LEVEL_LABELS[c.level]} · {c.total_pax}/{c.max_capacity} alumnos
                            </option>
                        ))}
                    </select>

                    {selectedCls && (
                        <div className="bg-[#0F172A] text-white rounded-2xl p-5 flex flex-wrap gap-6">
                            <div>
                                <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">Clase</p>
                                <p className="font-black text-lg">{selectedCls.service?.title || "Clase"}</p>
                            </div>
                            <div>
                                <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">Fecha y hora</p>
                                <p className="font-bold">{selectedCls.date} · {selectedCls.time?.substring(0, 5)}</p>
                            </div>
                            <div>
                                <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">Nivel</p>
                                <p className="font-bold">{LEVEL_LABELS[selectedCls.level]}</p>
                            </div>
                            <div>
                                <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">Ocupación</p>
                                <p className="font-bold">{selectedCls.total_pax} / {selectedCls.max_capacity} alumnos</p>
                            </div>
                        </div>
                    )}

                    {loadingRoster ? (
                        <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                            <Loader2 size={20} className="animate-spin" /> Cargando lista de alumnos...
                        </div>
                    ) : classRoster.length === 0 && selectedClassId ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                            <Users size={32} className="mx-auto text-gray-200 mb-3" />
                            <p className="text-gray-400 font-medium">Aún no hay reservas para esta clase</p>
                        </div>
                    ) : classRoster.length > 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">#</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Alumno</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Pax</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {classRoster.map((b: any, i: number) => (
                                        <tr key={b.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-[#1E3A8A] to-[#3F7FE3] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        {(b.users?.name || "A").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#0F172A]">{b.users?.name || "–"}</p>
                                                        <p className="text-xs text-gray-400">{b.users?.email || "–"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="flex items-center gap-1 text-gray-600"><Users size={12} />{b.pax}</span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[b.status] || ""}`}>
                                                    {STATUS_LABELS[b.status] || b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
