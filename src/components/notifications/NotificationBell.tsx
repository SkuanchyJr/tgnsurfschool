"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getMyNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead, type Notification } from "@/lib/notificationActions";

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

interface NotificationBellProps {
    /** Base path for the "see all" link, e.g. "/admin/notificaciones" */
    allNotificationsHref: string;
    /** Accent color for badge. Default: "#3F7FE3" */
    accentColor?: string;
}

export default function NotificationBell({
    allNotificationsHref,
    accentColor = "#3F7FE3",
}: NotificationBellProps) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const fetchData = useCallback(async () => {
        try {
            const [count, notifs] = await Promise.all([
                getUnreadCount(),
                open ? getMyNotifications() : Promise.resolve(null),
            ]);
            setUnread(count);
            if (notifs) setNotifications(notifs);
        } catch { /* silent */ }
    }, [open]);

    // Initial + polling
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    // Fetch full list when opening
    useEffect(() => {
        if (open) {
            setLoading(true);
            getMyNotifications().then(n => {
                setNotifications(n);
                setLoading(false);
            });
        }
    }, [open]);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const handleMarkRead = async (id: string) => {
        await markNotificationRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnread(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllRead = async () => {
        await markAllNotificationsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnread(0);
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Ahora";
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d`;
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-xl hover:bg-white/10 transition-all group"
                aria-label="Notificaciones"
            >
                <Bell
                    size={20}
                    className={`transition-colors ${unread > 0 ? "text-white" : "text-white/50 group-hover:text-white/80"}`}
                />
                {unread > 0 && (
                    <span
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-black text-white rounded-full px-1 animate-pulse"
                        style={{ background: accentColor }}
                    >
                        {unread > 99 ? "99+" : unread}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div
                    className="absolute right-0 top-full mt-2 w-[360px] max-h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[9999] flex flex-col"
                    style={{ animation: "fadeInScale 0.15s ease-out" }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-sm font-black text-gray-900">Notificaciones</h3>
                        {unread > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <CheckCheck size={13} /> Marcar todo leído
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                        {loading ? (
                            <div className="py-12 text-center">
                                <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
                                <p className="text-xs text-gray-400 mt-3">Cargando...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <Bell size={32} className="mx-auto text-gray-200 mb-3" />
                                <p className="text-sm font-bold text-gray-400">Sin notificaciones</p>
                                <p className="text-xs text-gray-300 mt-1">Aquí aparecerán tus alertas</p>
                            </div>
                        ) : (
                            notifications.slice(0, 15).map(n => (
                                <div
                                    key={n.id}
                                    className={`flex gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50/80 group ${!n.read ? "bg-blue-50/40" : ""}`}
                                >
                                    {/* Icon */}
                                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-base">
                                        {TYPE_ICONS[n.type] || "🔔"}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-[13px] font-bold truncate ${!n.read ? "text-gray-900" : "text-gray-500"}`}>
                                                {n.title}
                                            </p>
                                            {!n.read && (
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: accentColor }} />
                                            )}
                                        </div>
                                        <p className="text-[12px] text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">
                                            {n.message}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                                                {timeAgo(n.created_at)}
                                            </span>
                                            {n.link && (
                                                <Link
                                                    href={n.link}
                                                    className="text-[10px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-0.5"
                                                    onClick={() => { setOpen(false); if (!n.read) handleMarkRead(n.id); }}
                                                >
                                                    Ver <ExternalLink size={9} />
                                                </Link>
                                            )}
                                            {!n.read && (
                                                <button
                                                    onClick={() => handleMarkRead(n.id)}
                                                    className="text-[10px] font-bold text-gray-300 hover:text-emerald-500 flex items-center gap-0.5 transition-colors"
                                                >
                                                    <Check size={10} /> Leído
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 bg-gray-50/50">
                        <Link
                            href={allNotificationsHref}
                            onClick={() => setOpen(false)}
                            className="block py-3 text-center text-xs font-black text-blue-600 hover:text-blue-800 hover:bg-gray-100 transition-all"
                        >
                            Ver todas las notificaciones →
                        </Link>
                    </div>
                </div>
            )}

            {/* Inline animation keyframes */}
            <style jsx>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: translateY(-4px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
