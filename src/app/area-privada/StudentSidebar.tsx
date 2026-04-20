"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Waves, LogOut, TrendingUp, UserCircle, CreditCard, Bell, ClipboardList } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import NotificationBell from "@/components/notifications/NotificationBell";

const navItems = [
    { name: "Dashboard",         href: "/area-privada",                    icon: LayoutDashboard, exact: true },
    { name: "Mis Bonos",         href: "/area-privada/bonos",               icon: CreditCard },
    { name: "Mi Progreso",       href: "/area-privada/progreso",            icon: TrendingUp },
    { name: "Mi Perfil",         href: "/area-privada/perfil",              icon: UserCircle },
    { name: "Mis Reservas",      href: "/area-privada/mis-reservas",        icon: CalendarDays },
    { name: "Reservar Clase",    href: "/area-privada/clases",              icon: Waves },
    { name: "Formulario Previo", href: "/area-privada/formulario-previo",   icon: ClipboardList, badge: "Nuevo" },
    { name: "Notificaciones",    href: "/area-privada/notificaciones",      icon: Bell },
];

export default function StudentSidebar() {
    const pathname = usePathname();

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-60 shrink-0 bg-[#0F172A] min-h-screen flex flex-col">
            {/* Brand + Notification Bell */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-[#3F7FE3] rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg">
                        TGN
                    </div>
                    <div>
                        <p className="font-black text-white text-sm leading-none font-fredoka">TGN Surf</p>
                        <p className="text-[11px] text-white/40 font-medium">Área Alumno</p>
                    </div>
                </Link>
                <NotificationBell
                    allNotificationsHref="/area-privada/notificaciones"
                    accentColor="#3F7FE3"
                />
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5">
                {navItems.map((item: any) => {
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
                            <span className="flex-1">{item.name}</span>
                            {item.badge && !active && (
                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-amber-400 text-white rounded-full">
                                    {item.badge}
                                </span>
                            )}
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
