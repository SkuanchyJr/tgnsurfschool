"use client";

import { useState } from "react";
import { 
    format, addMonths, subMonths, startOfMonth, endOfMonth, 
    startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, 
    eachDayOfInterval, parseISO 
} from "date-fns";
import { es } from "date-fns/locale";
import { 
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
    Clock, Users, MapPin 
} from "lucide-react";
import { SurfClassWithBookings } from "../actions";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarClientProps {
    initialClasses: SurfClassWithBookings[];
}

export default function CalendarClient({ initialClasses }: CalendarClientProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const getClassesForDay = (day: Date) => {
        return initialClasses.filter(c => isSameDay(parseISO(c.date), day));
    };

    const statusColors: Record<string, string> = {
        SCHEDULED: "bg-blue-500",
        CONFIRMED: "bg-emerald-500",
        CANCELLED: "bg-rose-500",
        COMPLETED: "bg-slate-500",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] font-fredoka flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#3F7FE3] rounded-xl flex items-center justify-center text-white shadow-lg">
                            <CalendarIcon size={20} />
                        </div>
                        Calendario de Clases
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        Visualiza y gestiona la programación mensual
                    </p>
                </div>

                <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="px-4 font-bold text-[#0F172A] min-w-[140px] text-center capitalize">
                        {format(currentMonth, "MMMM yyyy", { locale: es })}
                    </div>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                {/* Day Names */}
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                    {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
                        <div key={day} className="py-3 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, i) => {
                        const dayClasses = getClassesForDay(day);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div
                                key={i}
                                onClick={() => setSelectedDate(day)}
                                className={`min-h-[120px] p-2 border-r border-b border-gray-100 transition-all cursor-pointer hover:bg-blue-50/30 ${
                                    !isCurrentMonth ? "bg-gray-50/50" : ""
                                } ${isSelected ? "bg-blue-50/50" : ""}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`
                                        text-sm font-bold flex items-center justify-center w-7 h-7 rounded-lg
                                        ${isToday ? "bg-[#3F7FE3] text-white shadow-md shadow-blue-200" : "text-gray-400"}
                                        ${!isCurrentMonth ? "opacity-30" : "opacity-100"}
                                    `}>
                                        {format(day, "d")}
                                    </span>
                                    {dayClasses.length > 0 && (
                                        <span className="text-[10px] font-black text-[#3F7FE3] bg-blue-50 px-1.5 py-0.5 rounded-md">
                                            {dayClasses.length} {dayClasses.length === 1 ? 'clase' : 'clases'}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    {dayClasses.slice(0, 3).map(cls => (
                                        <div 
                                            key={cls.id}
                                            className="text-[10px] font-bold py-1 px-2 rounded-md truncate flex items-center gap-1.5 bg-white border border-gray-100 shadow-sm"
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${statusColors[cls.status]}`} />
                                            <span className="text-gray-700">{cls.time.substring(0, 5)}</span>
                                            <span className="text-gray-400 truncate tracking-tight">{cls.service?.title}</span>
                                        </div>
                                    ))}
                                    {dayClasses.length > 3 && (
                                        <div className="text-[9px] font-bold text-gray-400 pl-2">
                                            + {dayClasses.length - 3} más
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day Details */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <h3 className="text-lg font-black text-[#0F172A] font-fredoka mb-4 flex items-center gap-2">
                    Clases del {format(selectedDate, "d 'de' MMMM", { locale: es })}
                </h3>
                
                {getClassesForDay(selectedDate).length === 0 ? (
                    <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">No hay clases programadas para este día</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getClassesForDay(selectedDate).map(cls => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={cls.id}
                                className="p-4 rounded-xl border border-gray-200 hover:border-[#3F7FE3] transition-all group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 transition-transform group-hover:scale-110 ${statusColors[cls.status]}`} />
                                
                                <div className="flex items-start justify-between mb-3">
                                    <div className="px-2.5 py-1 rounded-lg bg-gray-100 text-[#0F172A] font-black text-xs">
                                        {cls.time.substring(0, 5)}
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white ${statusColors[cls.status]}`}>
                                        {cls.status}
                                    </span>
                                </div>
                                
                                <h4 className="font-black text-[#0F172A] text-sm mb-1">{cls.service?.title || 'Clase Surf'}</h4>
                                <div className="space-y-1.5">
                                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                                        <Clock size={12} className="text-gray-400" /> {cls.duration_minutes} min
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                                        <Users size={12} className="text-gray-400" /> {cls.total_pax} / {cls.max_capacity} alumnos
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                                        <MapPin size={12} className="text-gray-400" /> {cls.level}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {cls.class_instructors.map((ci, idx) => (
                                            <div 
                                                key={idx}
                                                className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-blue-600"
                                                title={ci.instructor?.name}
                                            >
                                                {ci.instructor?.name.charAt(0)}
                                            </div>
                                        ))}
                                        {cls.class_instructors.length === 0 && (
                                            <span className="text-[10px] text-rose-500 font-bold">Sin monitor</span>
                                        )}
                                    </div>
                                    <button className="text-[11px] font-black text-[#3F7FE3] hover:underline">
                                        Gestionar
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
