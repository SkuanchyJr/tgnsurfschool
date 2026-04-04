"use client";

import { useMemo } from "react";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend 
} from "recharts";
import { format, parseISO, subDays, isAfter, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { 
    TrendingUp, Users, Calendar, Award, 
    DollarSign, BookOpen, UserCheck, Activity 
} from "lucide-react";
import { SurfClassWithBookings } from "../actions";

interface AnalyticsClientProps {
    bookings: any[];
    classes: SurfClassWithBookings[];
    instructors: any[];
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#EC4899"];

export default function AnalyticsClient({ bookings, classes, instructors }: AnalyticsClientProps) {
    // 1. Revenue over time (Last 30 days)
    const revenueData = useMemo(() => {
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = subDays(new Date(), 29 - i);
            return {
                date: format(date, "MMM dd", { locale: es }),
                fullDate: format(date, "yyyy-MM-dd"),
                revenue: 0,
                bookings: 0
            };
        });

        bookings.forEach(b => {
            if (b.status === 'CONFIRMED' || b.status === 'COMPLETED') {
                const dayData = last30Days.find(d => d.fullDate === b.date);
                if (dayData) {
                    dayData.revenue += (b.pax || 0) * (b.services?.price || 0);
                    dayData.bookings += 1;
                }
            }
        });

        return last30Days;
    }, [bookings]);

    // 2. Service Popularity
    const serviceData = useMemo(() => {
        const services: Record<string, { name: string, value: number }> = {};
        bookings.forEach(b => {
            const title = b.services?.title || "Otro";
            if (!services[title]) services[title] = { name: title, value: 0 };
            services[title].value += 1;
        });
        return Object.values(services).sort((a, b) => b.value - a.value);
    }, [bookings]);

    // 3. Class Occupancy (Average % per level)
    const occupancyData = useMemo(() => {
        const levels: Record<string, { name: string, totalPax: number, maxCap: number, count: number }> = {};
        classes.forEach(c => {
            if (c.status !== 'CANCELLED') {
                const level = c.level || "Sin nivel";
                if (!levels[level]) levels[level] = { name: level, totalPax: 0, maxCap: 0, count: 0 };
                levels[level].totalPax += c.total_pax;
                levels[level].maxCap += c.max_capacity;
                levels[level].count += 1;
            }
        });

        return Object.values(levels).map(l => ({
            name: l.name,
            occupancy: Math.round((l.totalPax / l.maxCap) * 100) || 0,
            avgPax: (l.totalPax / l.count).toFixed(1)
        }));
    }, [classes]);

    // 4. Instructor Workload (Classes assigned)
    const instructorWorkload = useMemo(() => {
        const workloads: Record<string, { name: string, classes: number }> = {};
        instructors.forEach(i => {
            workloads[i.id] = { name: i.name, classes: 0 };
        });

        classes.forEach(c => {
            c.class_instructors.forEach(ci => {
                if (workloads[ci.instructor_id]) {
                    workloads[ci.instructor_id].classes += 1;
                }
            });
        });

        return Object.values(workloads).sort((a, b) => b.classes - a.classes).slice(0, 8);
    }, [classes, instructors]);

    // KPIs
    const totalRevenue = bookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum, b) => sum + ((b.pax || 0) * (b.services?.price || 0)), 0);
    
    const avgBookingValue = totalRevenue / bookings.filter(b => b.status !== 'CANCELLED').length || 0;
    const globalOccupancy = Math.round((classes.reduce((s, c) => s + c.total_pax, 0) / classes.reduce((s, c) => s + c.max_capacity, 0)) * 100) || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] font-fredoka flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Activity size={20} />
                        </div>
                        Analíticas Reales
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        Métricas de rendimiento e impacto del negocio
                    </p>
                </div>
                
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200">
                    <button className="px-4 py-2 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-lg">Últimos 30 días</button>
                    <button className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 rounded-lg">Este año</button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Ingresos Totales", value: `${totalRevenue.toLocaleString()}€`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Valor Medio Reserva", value: `${avgBookingValue.toFixed(1)}€`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Ocupación Global", value: `${globalOccupancy}%`, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Clases Impartidas", value: classes.filter(c => c.status === 'COMPLETED' || c.status === 'CONFIRMED').length, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</p>
                            <div className={`w-8 h-8 ${kpi.bg} rounded-lg flex items-center justify-center`}>
                                <kpi.icon size={16} className={kpi.color} />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-[#0F172A]">{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Revenue Over Time */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-black text-[#0F172A] mb-6 flex items-center gap-2">
                        <DollarSign size={18} className="text-gray-400" /> Ingresos Diarios
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94A3B8'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94A3B8'}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#4F46E5', strokeWidth: 2 }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Service Popularity */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-black text-[#0F172A] mb-6 flex items-center gap-2">
                        <BookOpen size={18} className="text-gray-400" /> Distribución de Servicios
                    </h3>
                    <div className="h-[300px] w-full flex flex-col md:flex-row items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={serviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {serviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Class Occupancy */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-black text-[#0F172A] mb-6 flex items-center gap-2">
                        <Activity size={18} className="text-gray-400" /> Ocupación por Nivel (%)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={occupancyData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                                <XAxis type="number" hide domain={[0, 100]} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fontSize: 10, fontWeight: 600, fill: '#475569'}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="occupancy" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Instructor Workload */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-black text-[#0F172A] mb-6 flex items-center gap-2">
                        <UserCheck size={18} className="text-gray-400" /> Carga de Trabajo Monitores
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={instructorWorkload}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94A3B8'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94A3B8'}} />
                                <Tooltip cursor={{fill: '#F8FAFC'}} />
                                <Bar dataKey="classes" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
