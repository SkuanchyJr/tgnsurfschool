"use client";

import { useState, useEffect } from "react";
import { 
    X, Loader2, Save, Calendar, Clock, Users, BookOpen, 
    Waves, StickyNote, ChevronRight, ChevronLeft, MapPin, Check,
    ChevronDown, ChevronUp, CalendarPlus
} from "lucide-react";
import { createClass, updateClass, type SurfClassWithBookings } from "../actions";

type Service = { id: string; title: string; type: string };

type Props = {
    isOpen: boolean;
    onClose: () => void;
    editingClass?: SurfClassWithBookings | null;
    services: Service[];
    instructors: { id: string; name: string }[];
    onSaved: (isEdit: boolean) => void;
};

const LEVELS = [
    { value: 'BEGINNER', label: 'Principiante', desc: 'Primera vez en tabla', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { value: 'INITIATION', label: 'Iniciación', desc: 'Ya se han levantado', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { value: 'INTERMEDIATE', label: 'Intermedio', desc: 'Surfean olas pequeñas', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    { value: 'ADVANCED', label: 'Avanzado', desc: 'Control de tabla', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    { value: 'UNDEFINED', label: 'No definido', desc: 'Sin nivel específico', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100' },
];

const DURATION_CHIPS = [
    { label: "1h", value: 60 },
    { label: "1h 30m", value: 90 },
    { label: "2h", value: 120 },
];

const TIME_CHIPS = ["08:00", "09:00", "10:00", "11:00", "16:00", "17:00"];

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export default function ClassFormModal({ isOpen, onClose, editingClass, services, instructors, onSaved }: Props) {
    const [step, setStep] = useState(1);
    const [serviceId, setServiceId] = useState("");
    const [date, setDate] = useState("");
    
    // Calendar state
    const [showCalendar, setShowCalendar] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());

    const [time, setTime] = useState("09:00");
    const [duration, setDuration] = useState(120);
    const [level, setLevel] = useState<string>("UNDEFINED");
    const [capacity, setCapacity] = useState(7);
    const [location, setLocation] = useState("");
    const [instructorIds, setInstructorIds] = useState<string[]>([]);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Populate form when editing
    useEffect(() => {
        if (editingClass) {
            setServiceId(editingClass.service_id || "");
            setDate(editingClass.date);
            setTime(editingClass.time.substring(0, 5));
            setDuration(editingClass.duration_minutes);
            setLevel(editingClass.level);
            setCapacity(editingClass.max_capacity);
            setLocation(editingClass.location || "");
            setInstructorIds(editingClass.class_instructors?.map(i => i.instructor_id) || []);
            setNotes(editingClass.notes || "");
            setStep(1);
        } else {
            // Find "Clase Surf Grupal" to set as default
            const defaultService = services.find(s => s.title.toLowerCase().includes("grupal"));
            setServiceId(defaultService?.id || "");
            
            setDate(new Date().toISOString().split('T')[0]);
            setTime("09:00");
            setDuration(120);
            setLevel("UNDEFINED");
            setCapacity(7);
            setLocation("");
            setInstructorIds([]);
            setNotes("");
            setStep(1);
        }
        setError("");
    }, [editingClass, isOpen]);

    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        const payload = {
            service_id: serviceId || null,
            date,
            time,
            duration_minutes: duration,
            level,
            max_capacity: capacity,
            location: location || undefined,
            instructorIds: instructorIds,
            notes: notes || undefined,
        };

        const res = editingClass
            ? await updateClass(editingClass.id, payload)
            : await createClass(payload);

        if (res.success) {
            onSaved(!!editingClass);
            onClose();
        } else {
            setError(res.error || "Error desconocido");
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1) {
            if (!date || !time) {
                setError("La fecha y la hora son obligatorias.");
                return;
            }
        }
        setError("");
        setStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => {
        setError("");
        setStep(prev => Math.max(prev - 1, 1));
    };

    // Helper: Next 7 days
    const getQuickDays = () => {
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            
            let label = "";
            if (i === 0) label = "Hoy";
            else if (i === 1) label = "Mañana";
            else {
                const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
                label = `${dayName.charAt(0).toUpperCase() + dayName.slice(1, 3)} ${d.getDate()}`;
            }
            days.push({ dateStr, label });
        }
        return days;
    };

    // Helper: Calendar Grid
    const getCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Adjust to Mon-Sun (0 is Sunday in JS, we want 0 as Monday)
        let firstDayIdx = firstDay.getDay() - 1;
        if (firstDayIdx === -1) firstDayIdx = 6;

        const days = [];
        // Prev month padding
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayIdx - 1; i >= 0; i--) {
            days.push({ day: prevMonthLastDay - i, current: false, date: new Date(year, month - 1, prevMonthLastDay - i) });
        }
        // Current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ day: i, current: true, date: new Date(year, month, i) });
        }
        // Next month padding
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, current: false, date: new Date(year, month + 1, i) });
        }
        return days;
    };

    if (!isOpen) return null;

    const instructorsNeeded = Math.ceil(capacity / 8);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[90vh] max-h-[700px]">
                
                {/* ── HEADER ── */}
                <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3F7FE3] px-6 py-5 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-white font-fredoka leading-none">
                            {editingClass ? "Editar Clase" : "Nueva Clase"}
                        </h2>
                        <p className="text-blue-100/70 text-[10px] font-bold uppercase tracking-widest mt-1">
                            Administración TGN Surf
                        </p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* ── STEPPER BAR ── */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
                    {[
                        { s: 1, label: "Cuándo" },
                        { s: 2, label: "Nivel" },
                        { s: 3, label: "Detalles" }
                    ].map((item, idx) => (
                        <div key={item.s} className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                                step > item.s ? "bg-green-500 text-white" : 
                                step === item.s ? "bg-[#1E3A8A] text-white" : 
                                "bg-gray-200 text-gray-400"
                            }`}>
                                {step > item.s ? <Check size={14} strokeWidth={4} /> : item.s}
                            </div>
                            <span className={`text-xs font-bold ${step === item.s ? "text-[#1E3A8A]" : "text-gray-400"}`}>
                                {item.label}
                            </span>
                            {idx < 2 && <div className="w-4 h-[2px] bg-gray-200 mx-1" />}
                        </div>
                    ))}
                </div>

                {/* ── CONTENT ── */}
                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2">
                            <X size={14} className="shrink-0" /> {error}
                        </div>
                    )}

                    {/* STEP 1: CUÁNDO */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                    <Calendar size={14} className="text-[#3F7FE3]" /> Fecha de la sesión
                                </label>
                                
                                {/* Quick Days Row */}
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
                                    {getQuickDays().map((d) => (
                                        <button
                                            key={d.dateStr}
                                            type="button"
                                            onClick={() => {
                                                setDate(d.dateStr);
                                                setShowCalendar(false);
                                            }}
                                            className={`shrink-0 px-4 py-3 rounded-2xl border-2 text-xs font-black transition-all ${
                                                date === d.dateStr 
                                                ? "bg-blue-50 border-[#3F7FE3] text-[#1E3A8A]" 
                                                : "bg-white border-gray-100 text-gray-400 hover:border-gray-200 shadow-sm"
                                            }`}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                    
                                    {/* Extra chip if date is far away */}
                                    {date && !getQuickDays().some(q => q.dateStr === date) && (
                                        <div className="shrink-0 px-4 py-3 rounded-2xl border-2 border-[#3F7FE3] bg-blue-50 text-[#1E3A8A] text-xs font-black flex items-center gap-2">
                                            <Calendar size={12} />
                                            {new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowCalendar(!showCalendar)}
                                    className="flex items-center gap-1.5 text-[10px] font-black text-[#3F7FE3] uppercase tracking-widest hover:opacity-80 transition-all ml-1 mb-2"
                                >
                                    {showCalendar ? <ChevronUp size={14} /> : <CalendarPlus size={14} />} 
                                    {showCalendar ? "Cerrar calendario" : "Elegir otra fecha 📅"}
                                </button>

                                {/* Inline Calendar */}
                                {showCalendar && (
                                    <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-xl shadow-blue-900/5 animate-in zoom-in-95 duration-200">
                                        <div className="flex items-center justify-between mb-4 px-2">
                                            <p className="text-sm font-black text-gray-700 capitalize">
                                                {viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                            </p>
                                            <div className="flex gap-1">
                                                <button 
                                                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                                                    className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                                                    className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-7 text-center mb-2">
                                            {DAY_LABELS.map(l => (
                                                <span key={l} className="text-[10px] font-black text-gray-300">{l}</span>
                                            ))}
                                        </div>
                                        
                                        <div className="grid grid-cols-7 gap-1">
                                            {getCalendarDays().map((d, i) => {
                                                const dStr = d.date.toISOString().split('T')[0];
                                                const isSelected = date === dStr;
                                                const isToday = new Date().toISOString().split('T')[0] === dStr;
                                                const isWeekend = d.date.getDay() === 0 || d.date.getDay() === 6;
                                                
                                                return (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => {
                                                            setDate(dStr);
                                                            setShowCalendar(false);
                                                        }}
                                                        className={`h-9 w-full rounded-xl text-xs font-bold transition-all flex items-center justify-center
                                                            ${!d.current ? "text-gray-200" : isSelected ? "bg-[#3F7FE3] text-white shadow-md shadow-blue-200" : "text-gray-700 hover:bg-blue-50"}
                                                            ${isToday && !isSelected ? "border-2 border-dashed border-gray-200" : ""}
                                                            ${isWeekend && d.current && !isSelected ? "bg-gray-50 text-gray-400" : ""}
                                                        `}
                                                    >
                                                        {d.day}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                    <Clock size={14} className="text-[#3F7FE3]" /> Duración
                                </label>
                                <div className="flex gap-2">
                                    {DURATION_CHIPS.map(chip => (
                                        <button
                                            key={chip.value}
                                            type="button"
                                            onClick={() => setDuration(chip.value)}
                                            className={`flex-1 py-3 px-2 rounded-2xl text-xs font-black transition-all border-2 ${
                                                duration === chip.value 
                                                ? "bg-blue-50 border-[#3F7FE3] text-[#1E3A8A]" 
                                                : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                                            }`}
                                        >
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                    <Clock size={14} className="text-[#3F7FE3]" /> Hora de inicio
                                </label>
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {TIME_CHIPS.map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setTime(t)}
                                            className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                                                time === t 
                                                ? "bg-[#1E3A8A] border-[#1E3A8A] text-white" 
                                                : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200"
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#3F7FE3]/20 focus:border-[#3F7FE3]"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                    <MapPin size={14} className="text-[#3F7FE3]" /> Lugar sugerido
                                </label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    placeholder="Ej: Platja de la Pineda"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#3F7FE3]/20 focus:border-[#3F7FE3]"
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: NIVEL Y AFORO */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                                    <Waves size={14} className="text-[#3F7FE3]" /> Nivel de la clase
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {LEVELS.filter(l => l.value !== 'UNDEFINED').map(l => (
                                        <button
                                            key={l.value}
                                            type="button"
                                            onClick={() => setLevel(l.value)}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                                                level === l.value 
                                                ? "bg-blue-50 border-[#3F7FE3]" 
                                                : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"
                                            }`}
                                        >
                                            {level === l.value && (
                                                <div className="absolute top-2 right-2 w-5 h-5 bg-[#3F7FE3] rounded-full flex items-center justify-center text-white">
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                            )}
                                            <p className={`text-xs font-black leading-none mb-1 ${level === l.value ? "text-[#1E3A8A]" : "text-gray-700"}`}>
                                                {l.label}
                                            </p>
                                            <p className={`text-[10px] font-medium leading-tight ${level === l.value ? "text-blue-500" : "text-gray-400 text-opacity-80"}`}>
                                                {l.desc}
                                            </p>
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setLevel('UNDEFINED')}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all col-span-2 ${
                                            level === 'UNDEFINED' 
                                            ? "bg-blue-50 border-[#3F7FE3]" 
                                            : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"
                                        }`}
                                    >
                                        <p className={`text-xs font-black leading-none mb-1 ${level === 'UNDEFINED' ? "text-[#1E3A8A]" : "text-gray-700"}`}>
                                            No definido
                                        </p>
                                        <p className="text-[10px] font-medium text-gray-400">Sin restricción de nivel específica</p>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                                    <Users size={14} className="text-[#3F7FE3]" /> Control de Aforo
                                </label>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setCapacity(Math.max(1, capacity - 1))}
                                            className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400 hover:border-[#3F7FE3] hover:text-[#3F7FE3] transition-all shadow-sm"
                                        >
                                            −
                                        </button>
                                        <div className="text-center w-8">
                                            <p className="text-3xl font-black text-[#0F172A] leading-none">{capacity}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Pax</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setCapacity(Math.min(20, capacity + 1))}
                                            className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400 hover:border-[#3F7FE3] hover:text-[#3F7FE3] transition-all shadow-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-[#1E3A8A]">Requeridos: {instructorsNeeded}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mt-0.5">(1 cada 8 alumnos)</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Asignar Monitores
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {instructors.map(ins => {
                                            const isSelected = instructorIds.includes(ins.id);
                                            return (
                                                <button
                                                    key={ins.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setInstructorIds(prev => prev.filter(id => id !== ins.id));
                                                        } else {
                                                            setInstructorIds(prev => [...prev, ins.id]);
                                                        }
                                                    }}
                                                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                                                        isSelected 
                                                        ? "bg-[#3F7FE3] border-[#3F7FE3] text-white shadow-md shadow-blue-200" 
                                                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                                    }`}
                                                >
                                                    {ins.name}
                                                </button>
                                            );
                                        })}
                                        {instructors.length === 0 && (
                                            <p className="text-[10px] text-gray-400 italic">No hay monitores disponibles</p>
                                        )}
                                    </div>
                                    {instructorIds.length > 0 && (
                                        <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-2">
                                            <Check size={10} strokeWidth={4} /> {instructorIds.length} monitores asignados {instructorIds.length > instructorsNeeded ? `(incluye ${instructorIds.length - instructorsNeeded} extras)` : ""}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: DETALLES */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                    <BookOpen size={14} className="text-[#3F7FE3]" /> Servicio vinculado
                                </label>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    <button
                                        type="button"
                                        onClick={() => setServiceId("")}
                                        className={`shrink-0 px-4 py-3 rounded-2xl border-2 text-xs font-black transition-all ${
                                            serviceId === "" ? "bg-blue-50 border-[#3F7FE3] text-[#1E3A8A]" : "bg-white border-gray-100 text-gray-400"
                                        }`}
                                    >
                                        Ninguno
                                    </button>
                                    {services.map(s => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setServiceId(s.id)}
                                            className={`shrink-0 px-4 py-3 rounded-2xl border-2 text-xs font-black transition-all ${
                                                serviceId === s.id ? "bg-blue-50 border-[#3F7FE3] text-[#1E3A8A]" : "bg-white border-gray-100 text-gray-400"
                                            }`}
                                        >
                                            {s.title}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                    <StickyNote size={14} className="text-[#3F7FE3]" /> Notas internas
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Ej: zona sur de la playa, traer neopreno..."
                                    rows={3}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3F7FE3]/20 focus:border-[#3F7FE3]"
                                />
                            </div>

                            <div className="bg-blue-900 rounded-3xl p-5 text-white shadow-lg shadow-blue-900/20">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3">Resumen de la clase</p>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase opacity-50">Fecha y hora</p>
                                        <p className="text-sm font-black flex items-center gap-1.5 mt-0.5">
                                            {date ? new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) : "---"} · {time}h
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase opacity-50">Duración</p>
                                        <p className="text-sm font-black mt-0.5">{duration} min</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase opacity-50">Nivel</p>
                                        <p className="text-sm font-black mt-0.5">{LEVELS.find(l => l.value === level)?.label || "No definido"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase opacity-50">Capacidad</p>
                                        <p className="text-sm font-black mt-0.5">{capacity} alumnos ({instructorIds.length} monitores)</p>
                                    </div>
                                    {location && (
                                        <div className="col-span-2">
                                            <p className="text-[10px] font-bold uppercase opacity-50">Lugar</p>
                                            <p className="text-sm font-black mt-0.5">{location}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── FOOTER ── */}
                <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
                    <div className="flex gap-2">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-gray-500 hover:bg-gray-200 transition-all border border-transparent"
                            >
                                <ChevronLeft size={16} strokeWidth={3} /> Atrás
                            </button>
                        )}
                    </div>

                    <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Paso {step} de 3</p>
                    </div>

                    <div className="flex gap-2">
                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#1E3A8A] text-white rounded-2xl text-xs font-black hover:bg-[#3F7FE3] transition-all shadow-lg shadow-blue-900/10"
                            >
                                Siguiente <ChevronRight size={16} strokeWidth={3} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black text-white transition-all shadow-lg ${
                                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/10"
                                }`}
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {editingClass ? "Guardar cambios" : "Crear clase"}
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
