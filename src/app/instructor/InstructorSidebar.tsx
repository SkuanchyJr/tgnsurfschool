"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, ClipboardList, LogOut, Bell } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import NotificationBell from "@/components/notifications/NotificationBell";

const navItems = [
    { name: "Dashboard", href: "/instructor", icon: LayoutDashboard, exact: true },
    { name: "Mis Clases", href: "/instructor/clases", icon: CalendarDays },
    { name: "Asignaciones", href: "/instructor/asignaciones", icon: ClipboardList },
    { name: "Notificaciones", href: "/instructor/notificaciones", icon: Bell },
];

export default function InstructorSidebar() {
    const pathname = usePathname();

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-60 shrink-0 bg-[#0F172A] min-h-screen flex flex-col">
            {/* Brand + Notification Bell */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg">
                        TGN
                    </div>
                    <div>
                        <p className="font-black text-white text-sm leading-none font-fredoka">TGN Surf</p>
                        <p className="text-[11px] text-white/40 font-medium">Panel Monitor</p>
                    </div>
                </Link>
                <NotificationBell
                    allNotificationsHref="/instructor/notificaciones"
                    accentColor="#059669"
                />
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5">
                {navItems.map(item => {
                    const active = isActive(item.href, item.exact);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${active
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
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
