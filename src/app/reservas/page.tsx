"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    ArrowLeft, ArrowRight, Waves, Calendar as CalendarIcon,
    Users, CheckCircle2, ShieldAlert, Loader2, Clock,
    MapPin, ChevronLeft, ChevronRight, Minus, Plus,
    CreditCard, TrendingUp,
} from "lucide-react";
import {
    getAvailableClasses, createCheckoutSession, createBooking,
    type AvailableClass,
} from "./actions";
import { getStudentPasses, type UserPass } from "../area-privada/bonos/actions";

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
    BEGINNER: { label: "Principiante", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    INITIATION: { label: "Iniciación", color: "bg-sky-50 text-sky-700 border-sky-200" },
    INTERMEDIATE: { label: "Intermedio", color: "bg-violet-50 text-violet-700 border-violet-200" },
    ADVANCED: { label: "Avanzado", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

function formatDateLong(dateStr: string) {
    const [y, m, d] = dateStr.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString("es-ES", {
        weekday: "long", day: "numeric", month: "long",
    });
}

function formatDateShort(dateStr: string) {
    const [y, m, d] = dateStr.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return {
        weekday: date.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase(),
        day: d,
        month: date.toLocaleDateString("es-ES", { month: "short" }).toUpperCase(),
    };
}

export default function ReservasPage() {
    const [step, setStep] = useState(1);

    // Data
    const [allClasses, setAllClasses] = useState<AvailableClass[]>([]);
    const [loading, setLoading] = useState(true);

    // Selection
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedClassId, setSelectedClassId] = useState("");
    const [pax, setPax] = useState(1);

    // Submission
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState(false);

    // Passes
    const [passes, setPasses] = useState<UserPass[]>([]);
    const [usePass, setUsePass] = useState(false);

    const activePass = useMemo(() => {
        return passes.find(p => p.remaining_classes >= pax);
    }, [passes, pax]);

    // Fetch classes on mount
    useEffect(() => {
        async function fetchClasses() {
            setLoading(true);
            const { success, data, error } = await getAvailableClasses();
            if (success && data) {
                setAllClasses(data);
            } else {
                setErrorMsg(error || "Error al cargar las clases.");
            }
            setLoading(false);
        }
        fetchClasses();

        async function fetchPasses() {
            const res = await getStudentPasses();
            if (res.success && res.data) {
                setPasses(res.data);
                // Auto-select pass if available
                if (res.data.length > 0) setUsePass(true);
            }
        }
        fetchPasses();
    }, [pax]);

    // ─── Derived data ───
    // Available dates (unique, sorted)
    const availableDates = useMemo(() => {
        const dates = [...new Set(allClasses.map(c => c.date))];
        return dates.sort();
    }, [allClasses]);

    // Classes for selected date
    const classesForDate = useMemo(() => {
        if (!selectedDate) return [];
        return allClasses.filter(c => c.date === selectedDate);
    }, [allClasses, selectedDate]);

    // Selected class object
    const selectedClass = allClasses.find(c => c.id === selectedClassId);

    // ─── Date carousel ───
    const [dateOffset, setDateOffset] = useState(0);
    const DATES_PER_VIEW = 7;
    const visibleDates = availableDates.slice(dateOffset, dateOffset + DATES_PER_VIEW);

    // ─── Handlers ───
    const handleSelectDate = (date: string) => {
        setSelectedDate(date);
        setSelectedClassId(""); // Reset class when changing date
    };

    const handleBooking = async () => {
        if (!selectedClassId) return;
        setIsSubmitting(true);
        setErrorMsg("");

        if (usePass) {
            const { success, error } = await createBooking(selectedClassId, pax, true);
            if (success) {
                setStep(3);
                setSuccess(true);
            } else {
                setErrorMsg(error || "Error al procesar el bono.");
            }
            setIsSubmitting(false);
        } else {
            const { success, url, error } = await createCheckoutSession(selectedClassId, pax);

            if (success && url) {
                window.location.href = url; // Redirect to Stripe Checkout
            } else {
                setErrorMsg(error || "Ocurrió un error.");
                setIsSubmitting(false);
            }
        }
    };

    const resetForm = () => {
        setStep(1);
        setSelectedDate("");
        setSelectedClassId("");
        setPax(1);
        setSuccess(false);
        setErrorMsg("");
    };

    // ─── Render ───
    return (
        <div className="pt-28 min-h-screen bg-sand-50 flex flex-col">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col items-center w-full">

                {/* Back link */}
                <div className="w-full mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm"
                    >
                        <ArrowLeft size={16} /> Volver al inicio
                    </Link>
                </div>

                {/* ── Progress bar ── */}
                <div className="w-full mb-12">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full">
                            <div
                                className="h-full bg-ocean-500 rounded-full transition-all duration-500"
                                style={{ width: `${((step - 1) / 2) * 100}%` }}
                            />
                        </div>
                        {[
                            { num: 1, label: "Elige Clase", icon: Waves },
                            { num: 2, label: "Resumen", icon: Users },
                            { num: 3, label: "Confirmación", icon: CheckCircle2 },
                        ].map((s) => (
                            <div key={s.num} className="flex flex-col items-center bg-sand-50 px-3">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 transition-all ${
                                        step >= s.num
                                            ? "bg-ocean-500 border-ocean-500 text-white shadow-lg shadow-ocean-500/20"
                                            : "bg-white border-slate-200 text-slate-400"
                                    }`}
                                >
                                    <s.icon size={20} />
                                </div>
                                <span className={`mt-2 text-xs sm:text-sm font-bold ${step >= s.num ? "text-slate-900" : "text-slate-400"}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ═══ STEP 1: SELECT CLASS ═══ */}
                <div className={`w-full bg-white rounded-2xl shadow-lg p-6 sm:p-10 border border-slate-100 transition-all ${step === 1 ? "block" : "hidden"}`}>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                        Elige tu clase
                    </h2>
                    <p className="text-slate-500 mb-8">
                        Selecciona un día y la clase a la que quieres asistir. Solo se muestran clases con plazas disponibles.
                    </p>

                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-16 gap-3">
                            <Loader2 className="animate-spin text-ocean-500 w-10 h-10" />
                            <span className="text-slate-400 text-sm">Cargando clases disponibles…</span>
                        </div>
                    ) : allClasses.length === 0 ? (
                        <div className="text-center py-16">
                            <CalendarIcon size={48} className="mx-auto text-slate-200 mb-4" />
                            <h3 className="text-lg font-bold text-slate-400 mb-2">No hay clases disponibles</h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Actualmente no hay clases programadas con plazas libres.
                                <br />Contáctanos por WhatsApp para más información.
                            </p>
                            <a
                                href="https://wa.me/34678502482"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-whatsapp inline-flex text-sm px-6 py-3"
                            >
                                Contactar por WhatsApp
                            </a>
                        </div>
                    ) : (
                        <>
                            {/* ── Date selector ── */}
                            <div className="mb-8">
                                <p className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">
                                    Selecciona un día
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setDateOffset(Math.max(0, dateOffset - DATES_PER_VIEW))}
                                        disabled={dateOffset === 0}
                                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <div className="flex gap-2 overflow-x-auto flex-1 justify-center">
                                        {visibleDates.map(date => {
                                            const { weekday, day, month } = formatDateShort(date);
                                            const isSelected = selectedDate === date;
                                            const classCount = allClasses.filter(c => c.date === date).length;
                                            return (
                                                <button
                                                    key={date}
                                                    onClick={() => handleSelectDate(date)}
                                                    className={`flex flex-col items-center p-3 rounded-xl min-w-[70px] border-2 transition-all ${
                                                        isSelected
                                                            ? "border-ocean-500 bg-ocean-500 text-white shadow-lg shadow-ocean-500/20"
                                                            : "border-slate-200 bg-white hover:border-ocean-300 text-slate-700"
                                                    }`}
                                                >
                                                    <span className={`text-[10px] font-bold ${isSelected ? "text-ocean-100" : "text-slate-400"}`}>
                                                        {weekday}
                                                    </span>
                                                    <span className="text-xl font-extrabold leading-none mt-0.5">{day}</span>
                                                    <span className={`text-[10px] font-bold ${isSelected ? "text-ocean-200" : "text-slate-400"}`}>
                                                        {month}
                                                    </span>
                                                    <span className={`text-[9px] font-medium mt-1 ${isSelected ? "text-ocean-100" : "text-slate-400"}`}>
                                                        {classCount} {classCount === 1 ? "clase" : "clases"}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setDateOffset(Math.min(availableDates.length - DATES_PER_VIEW, dateOffset + DATES_PER_VIEW))}
                                        disabled={dateOffset + DATES_PER_VIEW >= availableDates.length}
                                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* ── Class list for selected date ── */}
                            {selectedDate && (
                                <div>
                                    <p className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">
                                        Clases disponibles — {formatDateLong(selectedDate)}
                                    </p>

                                    {classesForDate.length === 0 ? (
                                        <p className="text-slate-400 text-sm py-6 text-center">
                                            No hay clases disponibles para este día.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {classesForDate.map(cls => {
                                                const level = LEVEL_LABELS[cls.level] || LEVEL_LABELS.BEGINNER;
                                                const isSelected = selectedClassId === cls.id;
                                                const spotsWarning = cls.spots_left <= 3;
                                                return (
                                                    <button
                                                        key={cls.id}
                                                        onClick={() => setSelectedClassId(cls.id)}
                                                        className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                                                            isSelected
                                                                ? "border-ocean-500 bg-ocean-500/5 ring-4 ring-ocean-500/10"
                                                                : "border-slate-200 hover:border-ocean-300 bg-white"
                                                        }`}
                                                    >
                                                        {/* Time block */}
                                                        <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl shrink-0 ${
                                                            isSelected ? "bg-ocean-500 text-white" : "bg-slate-100 text-slate-700"
                                                        }`}>
                                                            <Clock size={14} className={isSelected ? "text-ocean-200" : "text-slate-400"} />
                                                            <span className="text-lg font-extrabold leading-tight mt-0.5">
                                                                {cls.time.substring(0, 5)}
                                                            </span>
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                <span className="font-bold text-slate-900">
                                                                    {cls.service_title || "Clase de Surf"}
                                                                </span>
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${level.color}`}>
                                                                    {level.label}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock size={11} /> {cls.duration_minutes} min
                                                                </span>
                                                                <span className={`flex items-center gap-1 font-medium ${spotsWarning ? "text-amber-600" : ""}`}>
                                                                    <Users size={11} />
                                                                    {cls.spots_left} {cls.spots_left === 1 ? "plaza" : "plazas"} {spotsWarning ? "⚡" : ""}
                                                                </span>
                                                                {cls.service_price && (
                                                                    <span className="font-bold text-ocean-600">
                                                                        {cls.service_price}€
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Radio dot */}
                                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                            isSelected ? "border-ocean-500 bg-ocean-500" : "border-slate-300"
                                                        }`}>
                                                            {isSelected && <CheckCircle2 size={14} className="text-white" />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-end mt-8">
                        <button
                            disabled={!selectedClassId}
                            onClick={() => { setErrorMsg(""); setStep(2); }}
                            className="px-8 py-4 bg-ocean-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center gap-2 hover:bg-ocean-600 transition-colors shadow-lg shadow-ocean-500/20"
                        >
                            Siguiente paso <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* ═══ STEP 2: SUMMARY & CONFIRM ═══ */}
                <div className={`w-full bg-white rounded-2xl shadow-lg p-6 sm:p-10 border border-slate-100 transition-all ${step === 2 ? "block" : "hidden"}`}>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">
                        Resumen de tu reserva
                    </h2>

                    {selectedClass && (
                        <>
                            <div className="bg-sand-50 p-6 rounded-xl border border-slate-100 mb-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-base">
                                    <div className="text-slate-500">Actividad:</div>
                                    <div className="font-bold text-slate-900 sm:text-right">
                                        {selectedClass.service_title || "Clase de Surf"}
                                    </div>

                                    <div className="text-slate-500">Nivel:</div>
                                    <div className="font-bold text-slate-900 sm:text-right">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full border text-xs font-bold ${(LEVEL_LABELS[selectedClass.level] || LEVEL_LABELS.BEGINNER).color}`}>
                                            {(LEVEL_LABELS[selectedClass.level] || LEVEL_LABELS.BEGINNER).label}
                                        </span>
                                    </div>

                                    <div className="text-slate-500">Día:</div>
                                    <div className="font-bold text-slate-900 sm:text-right capitalize">
                                        {formatDateLong(selectedClass.date)}
                                    </div>

                                    <div className="text-slate-500">Hora:</div>
                                    <div className="font-bold text-slate-900 sm:text-right">
                                        {selectedClass.time.substring(0, 5)}
                                    </div>

                                    <div className="text-slate-500">Duración:</div>
                                    <div className="font-bold text-slate-900 sm:text-right">
                                        {selectedClass.duration_minutes} min
                                    </div>

                                    <div className="text-slate-500">Plazas disponibles:</div>
                                    <div className="font-bold text-slate-900 sm:text-right">
                                        {selectedClass.spots_left}
                                    </div>

                                    <div className="text-slate-500 flex items-center">Nº personas (Pax):</div>
                                    <div className="sm:text-right flex items-center sm:justify-end gap-3">
                                        <button
                                            onClick={() => setPax(Math.max(1, pax - 1))}
                                            className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:border-ocean-500 font-bold flex items-center justify-center transition-colors"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="font-extrabold text-slate-900 text-xl w-8 text-center">{pax}</span>
                                        <button
                                            onClick={() => setPax(Math.min(selectedClass.spots_left, pax + 1))}
                                            className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:border-ocean-500 font-bold flex items-center justify-center transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="mb-8">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <CreditCard size={18} className="text-slate-400" /> Método de pago
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Option 1: Pass */}
                                    <button
                                        onClick={() => activePass && setUsePass(true)}
                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                                            usePass
                                                ? "border-emerald-500 bg-emerald-50"
                                                : activePass ? "border-slate-200 bg-white hover:border-emerald-300" : "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                            usePass ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                                        }`}>
                                            <TrendingUp size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900 text-sm">Usar mi Bono active</p>
                                            {activePass ? (
                                                <p className="text-[10px] text-emerald-600 font-bold uppercase">{activePass.remaining_classes} clases disponibles</p>
                                            ) : (
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">No tienes saldo disponible</p>
                                            )}
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            usePass ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                                        }`}>
                                            {usePass && <CheckCircle2 size={12} className="text-white" />}
                                        </div>
                                    </button>

                                    {/* Option 2: Stripe Deposit */}
                                    <button
                                        onClick={() => setUsePass(false)}
                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                                            !usePass
                                                ? "border-ocean-500 bg-ocean-50"
                                                : "border-slate-200 bg-white hover:border-ocean-300"
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                            !usePass ? "bg-ocean-500 text-white" : "bg-slate-200 text-slate-500"
                                        }`}>
                                            <CreditCard size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900 text-sm">Reserva con Tarjeta</p>
                                            <p className="text-[10px] text-ocean-600 font-bold uppercase">Depósito de 5€</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            !usePass ? "border-ocean-500 bg-ocean-500" : "border-slate-300"
                                        }`}>
                                            {!usePass && <CheckCircle2 size={12} className="text-white" />}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {errorMsg && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 mb-8 border border-red-100">
                            <ShieldAlert className="shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">No se pudo completar</p>
                                <p className="text-sm">{errorMsg}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => { setErrorMsg(""); setStep(1); }}
                            className="px-8 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                            Atrás
                        </button>

                        {errorMsg?.includes("iniciar sesión") ? (
                            <Link
                                href="/login?redirect=/reservas"
                                className="px-8 py-4 bg-ocean-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-ocean-600 transition-colors shadow-lg"
                            >
                                Iniciar Sesión para Reservar
                            </Link>
                        ) : (
                            <button
                                onClick={handleBooking}
                                disabled={isSubmitting}
                                className="px-8 py-4 bg-ocean-500 disabled:bg-ocean-300 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-ocean-600 transition-colors shadow-lg shadow-ocean-500/20"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 size={20} /> Confirmar Reserva
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* ═══ STEP 3: SUCCESS ═══ */}
                <div className={`w-full bg-white rounded-2xl shadow-lg p-6 sm:p-10 text-center border border-emerald-100 transition-all ${step === 3 ? "block" : "hidden"}`}>
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                        ¡Reserva Confirmada!
                    </h2>
                    <p className="text-lg text-slate-500 mb-8 max-w-md mx-auto">
                        Te esperamos el{" "}
                        <strong className="capitalize">{selectedClass ? formatDateLong(selectedClass.date) : ""}</strong>{" "}
                        a las <strong>{selectedClass?.time.substring(0, 5)}</strong> para tu{" "}
                        {selectedClass?.service_title || "clase"}.
                        <br />
                        Puedes revisar los detalles en tu Área Privada.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href="/area-privada"
                            className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center"
                        >
                            Ir a Área Privada
                        </Link>
                        <button
                            onClick={resetForm}
                            className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                        >
                            Hacer otra reserva
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
