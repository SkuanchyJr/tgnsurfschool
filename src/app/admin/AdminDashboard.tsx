"use client";

import { useState } from "react";
import { updateBookingStatus } from "./actions";
import { Search, Loader2, CheckCircle, XCircle, Clock, Anchor } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserType = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
};

type ServiceType = {
    title: string;
    type: string;
};

type BookingType = {
    id: string;
    date: string;
    time: string;
    pax: number;
    status: string;
    users: UserType;
    services: ServiceType;
};

export default function AdminDashboard({ initialBookings }: { initialBookings: BookingType[] }) {
    const [bookings, setBookings] = useState<BookingType[]>(initialBookings);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingId, setLoadingId] = useState<string | null>(null);
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

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'CONFIRMED': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle size={14} /> Confirmada</span>;
            case 'PENDING': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock size={14} /> Pendiente</span>;
            case 'CANCELLED': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><XCircle size={14} /> Cancelada</span>;
            case 'COMPLETED': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Anchor size={14} /> Completada</span>;
            default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    const filteredBookings = bookings.filter(b =>
        b.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.services?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-6 px-8 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/" className="w-10 h-10 bg-[#1E3A8A] text-white rounded-xl flex items-center justify-center font-bold">
                        TGN
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-[#0F172A] font-fredoka leading-none">Panel de Control</h1>
                        <p className="text-xs font-medium text-gray-500">Gestión de Reservas</p>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar alumno, clase..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-[#3F7FE3] focus:ring-1 focus:ring-[#3F7FE3]"
                    />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-gray-500 text-sm font-bold mb-1">Total Reservas</h3>
                            <p className="text-3xl font-black text-[#0F172A]">{bookings.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-gray-500 text-sm font-bold mb-1">Pendientes</h3>
                            <p className="text-3xl font-black text-yellow-600">
                                {bookings.filter(b => b.status === 'PENDING').length}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-gray-500 text-sm font-bold mb-1">Confirmadas</h3>
                            <p className="text-3xl font-black text-green-600">
                                {bookings.filter(b => b.status === 'CONFIRMED').length}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-gray-500 text-sm font-bold mb-1">Completadas</h3>
                            <p className="text-3xl font-black text-blue-600">
                                {bookings.filter(b => b.status === 'COMPLETED').length}
                            </p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Actividad</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Alumno</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-[#0F172A]">{new Date(booking.date).toLocaleDateString('es-ES')}</div>
                                                <div className="text-sm font-medium text-gray-500">{booking.time}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-[#3F7FE3]">{booking.services?.title}</div>
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{booking.pax} Pax</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-[#0F172A]">{booking.users?.name}</div>
                                                <div className="text-sm text-gray-500">{booking.users?.email}</div>
                                                {booking.users?.phone && <div className="text-xs text-gray-400 mt-0.5">{booking.users.phone}</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={booking.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {loadingId === booking.id ? (
                                                        <Loader2 className="animate-spin text-gray-400" size={20} />
                                                    ) : (
                                                        <>
                                                            {booking.status !== 'CONFIRMED' && booking.status !== 'COMPLETED' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                                                                    className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors"
                                                                >
                                                                    Confirmar
                                                                </button>
                                                            )}
                                                            {booking.status === 'CONFIRMED' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                                                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                                                                >
                                                                    Completar
                                                                </button>
                                                            )}
                                                            {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                                                                    className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredBookings.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                                                No hay reservas que coincidan con la búsqueda.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
