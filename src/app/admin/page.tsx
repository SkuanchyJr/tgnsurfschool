import { getAllBookings, getClassesForDate, verifyAdminAccess } from "./actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    CalendarDays, Users, TrendingUp, Clock, AlertTriangle,
    BookOpen, Plus, ChevronRight, Waves, LifeBuoy
} from "lucide-react";
import { requiredInstructors } from "./classes/CapacityWidget";

export const metadata = { title: "Dashboard | Admin TGN Surf" };

export default async function AdminPage() {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) return redirect("/login");

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const [bookings, todayClasses] = await Promise.all([
        getAllBookings(),
        getClassesForDate(todayStr),
    ]);

    // KPI calculations with real data
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length;
    const uniqueStudents = new Set(bookings.map(b => b.users?.id).filter(Boolean)).size;

    // Fixed: use real service.price instead of hardcoded 35€
    const estimatedRevenue = bookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum, b) => sum + ((b.pax || 0) * (b.services?.price || 0)), 0);

    // Classes needing attention (understaffed)
    const understaffedClasses = todayClasses.filter(c =>
        c.total_pax > 0 && c.class_instructors.length < requiredInstructors(c.total_pax)
    );

    // Recent activity (last 5 bookings)
    const recentBookings = bookings.slice(0, 5);

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-700",
        CONFIRMED: "bg-green-100 text-green-700",
        COMPLETED: "bg-blue-100 text-blue-700",
        CANCELLED: "bg-red-100 text-red-700",
    };
    const statusLabels: Record<string, string> = {
        PENDING: "Pendiente", CONFIRMED: "Confirmada", COMPLETED: "Completada", CANCELLED: "Cancelada",
    };
    const levelLabels: Record<string, string> = {
        BEGINNER: 'Principiante', INITIATION: 'Iniciación', INTERMEDIATE: 'Intermedio', ADVANCED: 'Avanzado',
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] font-fredoka leading-none">Dashboard</h1>
                    <p className="text-gray-500 font-medium mt-1">
                        {today.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <Link
                    href="/admin/classes"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white rounded-xl font-bold text-sm hover:bg-[#3F7FE3] transition-colors shadow-lg shadow-[#1E3A8A]/20"
                >
                    <Plus size={16} /> Nueva Clase
                </Link>
            </div>

            {/* Understaffing alert */}
            {understaffedClasses.length > 0 && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-amber-800">
                            {understaffedClasses.length} clase{understaffedClasses.length > 1 ? 's' : ''} hoy sin suficientes monitores
                        </p>
                        <p className="text-amber-700 text-sm mt-0.5">
                            {understaffedClasses.map(c => c.service?.title || 'Clase').join(', ')} — asigna monitores en{' '}
                            <Link href="/admin/classes" className="underline font-bold">Gestión de Clases</Link>.
                        </p>
                    </div>
                </div>
            )}

            {/* KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Reservas</p>
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <CalendarDays size={16} className="text-blue-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-[#0F172A]">{totalBookings}</p>
                    <p className="text-xs text-amber-600 font-bold mt-1">{pendingBookings} pendientes</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alumnos Activos</p>
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <Users size={16} className="text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-[#0F172A]">{uniqueStudents}</p>
                    <p className="text-xs text-emerald-600 font-bold mt-1">{confirmedBookings} confirmadas</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingresos Est.</p>
                        <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                            <TrendingUp size={16} className="text-violet-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-[#0F172A]">{estimatedRevenue.toLocaleString('es-ES')}€</p>
                    <p className="text-xs text-gray-400 font-bold mt-1">Confirmadas + completadas</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clases Hoy</p>
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                            <Waves size={16} className="text-amber-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-[#0F172A]">{todayClasses.length}</p>
                    <p className="text-xs text-gray-400 font-bold mt-1">sesiones programadas</p>
                </div>
            </div>

            {/* Two column layout: Today's classes + Recent bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's classes */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="font-black text-[#0F172A] font-fredoka text-lg">Clases de Hoy</h2>
                        <Link href="/admin/classes" className="text-xs font-bold text-[#3F7FE3] hover:underline flex items-center gap-1">
                            Ver todo <ChevronRight size={12} />
                        </Link>
                    </div>
                    {todayClasses.length === 0 ? (
                        <div className="p-8 text-center">
                            <CalendarDays size={32} className="mx-auto text-gray-200 mb-3" />
                            <p className="text-gray-400 font-medium text-sm">No hay clases programadas para hoy</p>
                            <Link
                                href="/admin/classes"
                                className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-[#3F7FE3] hover:underline"
                            >
                                <Plus size={12} /> Crear una clase
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {todayClasses.map(cls => {
                                const needed = requiredInstructors(cls.total_pax);
                                const understaffed = cls.total_pax > 0 && cls.class_instructors.length < needed;
                                return (
                                    <div key={cls.id} className={`flex items-center gap-4 px-6 py-4 ${understaffed ? 'bg-amber-50/50' : ''}`}>
                                        <div className="w-12 h-12 bg-[#1E3A8A] rounded-xl flex flex-col items-center justify-center shrink-0">
                                            <Clock size={12} className="text-blue-300" />
                                            <span className="text-white font-black text-sm leading-tight">{cls.time.substring(0, 5)}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-[#0F172A] text-sm truncate">{cls.service?.title || 'Clase'}</p>
                                            <p className="text-xs text-gray-500">{levelLabels[cls.level]} · {cls.duration_minutes} min</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-black text-[#0F172A]">{cls.total_pax}/{cls.max_capacity}</p>
                                            {understaffed ? (
                                                <p className="text-xs font-bold text-amber-600 flex items-center gap-0.5 justify-end">
                                                    <AlertTriangle size={10} /> {cls.class_instructors.length}/{needed} mon.
                                                </p>
                                            ) : (
                                                <p className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 justify-end">
                                                    <LifeBuoy size={10} /> {cls.class_instructors.length} mon.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent bookings */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="font-black text-[#0F172A] font-fredoka text-lg">Reservas Recientes</h2>
                        <Link href="/admin/bookings" className="text-xs font-bold text-[#3F7FE3] hover:underline flex items-center gap-1">
                            Ver todo <ChevronRight size={12} />
                        </Link>
                    </div>
                    {recentBookings.length === 0 ? (
                        <div className="p-8 text-center">
                            <BookOpen size={32} className="mx-auto text-gray-200 mb-3" />
                            <p className="text-gray-400 font-medium text-sm">Sin reservas todavía</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {recentBookings.map(b => (
                                <div key={b.id} className="flex items-center gap-4 px-6 py-4">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#3F7FE3] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                        {(b.users?.name || 'A').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[#0F172A] text-sm truncate">{b.users?.name || 'Alumno'}</p>
                                        <p className="text-xs text-gray-400 truncate">{b.services?.title || '–'} · {b.date}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${statusColors[b.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {statusLabels[b.status] || b.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
