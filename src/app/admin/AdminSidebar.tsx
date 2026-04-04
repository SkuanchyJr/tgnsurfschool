"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, CalendarDays, ClipboardList,
    Users, LifeBuoy, Package, LogOut, BarChart3, Calendar, Bell
} from "lucide-react";
import { signOut } from "@/app/auth/actions";
import NotificationBell from "@/components/notifications/NotificationBell";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
    { name: "Analíticas", href: "/admin/analytics", icon: BarChart3 },
    { name: "Calendario", href: "/admin/calendar", icon: Calendar },
    { name: "Clases", href: "/admin/classes", icon: CalendarDays },
    { name: "Reservas", href: "/admin/bookings", icon: ClipboardList },
    { name: "Monitores", href: "/admin/instructors", icon: LifeBuoy },
    { name: "Alumnos", href: "/admin/students", icon: Users },
    { name: "Servicios", href: "/admin/services", icon: Package },
    { name: "Notificaciones", href: "/admin/notificaciones", icon: Bell },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href) && href !== "/admin";
    };

    return (
        <aside className="w-64 shrink-0 bg-[#0F172A] min-h-screen flex flex-col">
            {/* Logo + Notification Bell */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <Link href="/admin" className="block relative h-10 flex-1">
                    <Image 
                        src="/logo.png" 
                        alt="TGN Surf Logo" 
                        fill 
                        className="object-contain object-left"
                        priority
                    />
                </Link>
                <NotificationBell
                    allNotificationsHref="/admin/notificaciones"
                    accentColor="#3F7FE3"
                />
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {navItems.map(item => {
                    const active = isActive(item.href, item.exact);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${active
                                ? "bg-[#3F7FE3] text-white shadow-lg shadow-[#3F7FE3]/20"
                                : "text-white/60 hover:text-white hover:bg-white/10"
                                }`}
                        >
                            <item.icon size={17} className={active ? "text-white" : "text-white/50"} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Sign out */}
            <div className="p-3 border-t border-white/10">
                <form action={signOut}>
                    <button
                        type="submit"
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut size={17} />
                        Cerrar sesión
                    </button>
                </form>
            </div>
        </aside>
    );
}
