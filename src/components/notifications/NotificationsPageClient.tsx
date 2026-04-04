"use client";

import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, ExternalLink, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    type Notification,
} from "@/lib/notificationActions";

const TYPE_ICONS: Record<string, string> = {
    WELCOME: "👋",
    BOOKING_CONFIRMED: "✅",
    NEW_BOOKING: "📋",
    BOOKING_STATUS_CHANGE: "🔄",
    CLASS_ASSIGNED: "📌",
    ASSIGNMENT_RESPONSE: "💬",
    CLASS_CANCELLED: "❌",
    PASS_PURCHASED: "🎉",
};

interface NotificationsPageClientProps {
    backHref: string;
    backLabel: string;
    accentColor?: string;
}

export default function NotificationsPageClient({
    backHref,
    backLabel,
    accentColor = "#3F7FE3",
}: NotificationsPageClientProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");

    useEffect(() => {
        setLoading(true);
        getMyNotifications().then(n => {
            setNotifications(n);
            setLoading(false);
        });
    }, []);

    const handleMarkRead = async (id: string) => {
        await markNotificationRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleMarkAllRead = async () => {
        await markAllNotificationsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const filtered = filter === "unread" ? notifications.filter(n => !n.read) : notifications;
    const unreadCount = notifications.filter(n => !n.read).length;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Ahora mismo";
        if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? "s" : ""}`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? "s" : ""}`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? "s" : ""}`;

        return date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <Link
                    href={backHref}
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft size={16} /> {backLabel}
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black font-fredoka text-[#0F172A]">
                            Notificaciones
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {unreadCount > 0
                                ? `Tienes ${unreadCount} notificación${unreadCount !== 1 ? "es" : ""} sin leer`
                                : "Estás al día con todas tus notificaciones"}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:opacity-90"
                            style={{ background: accentColor }}
                        >
                            <CheckCheck size={16} /> Marcar todo leído
                        </button>
                    )}
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                        filter === "all"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                    Todas ({notifications.length})
                </button>
                <button
                    onClick={() => setFilter("unread")}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                        filter === "unread"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                    Sin leer ({unreadCount})
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-gray-300" />
                    <p className="text-sm text-gray-400 mt-4 font-bold">Cargando notificaciones...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                        <Bell size={32} className="text-gray-200" />
                    </div>
                    <p className="text-lg font-black text-gray-300">
                        {filter === "unread" ? "No tienes notificaciones sin leer" : "Sin notificaciones"}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                        Las notificaciones aparecerán aquí automáticamente
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(n => (
                        <div
                            key={n.id}
                            className={`flex gap-4 p-5 rounded-2xl border transition-all hover:shadow-md ${
                                !n.read
                                    ? "bg-white border-blue-100 shadow-sm"
                                    : "bg-white/50 border-gray-100"
                            }`}
                        >
                            {/* Icon */}
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg ${
                                !n.read ? "bg-blue-50" : "bg-gray-50"
                            }`}>
                                {TYPE_ICONS[n.type] || "🔔"}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className={`text-sm font-bold truncate ${
                                        !n.read ? "text-gray-900" : "text-gray-500"
                                    }`}>
                                        {n.title}
                                    </h3>
                                    {!n.read && (
                                        <span
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ background: accentColor }}
                                        />
                                    )}
                                </div>
                                <p className="text-[13px] text-gray-400 leading-relaxed">
                                    {n.message}
                                </p>
                                <div className="flex items-center gap-4 mt-2.5">
                                    <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                                        {formatDate(n.created_at)}
                                    </span>
                                    {n.link && (
                                        <Link
                                            href={n.link}
                                            className="text-[11px] font-bold flex items-center gap-1 transition-colors hover:opacity-80"
                                            style={{ color: accentColor }}
                                        >
                                            Ver detalle <ExternalLink size={10} />
                                        </Link>
                                    )}
                                    {!n.read && (
                                        <button
                                            onClick={() => handleMarkRead(n.id)}
                                            className="text-[11px] font-bold text-gray-300 hover:text-emerald-500 flex items-center gap-1 transition-colors"
                                        >
                                            <Check size={11} /> Marcar leído
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
