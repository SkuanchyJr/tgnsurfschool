"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Info, UserRound, Phone, HeartPulse, CreditCard } from "lucide-react";
import LegalModal from "./LegalModal";

interface LegalCheckboxProps {
    isAccepted: boolean;
    onToggle: (val: boolean) => void;
    // Minor detection & data
    birthdate?: string;
    dni?: string;
    onLegalDataChange: (data: LegalData) => void;
}

export interface LegalData {
    dni: string;
    birthdate: string;
    isMinor: boolean;
    tutorName?: string;
    tutorId?: string;
    tutorPhone?: string;
    emergencyContact?: string;
}

export default function LegalCheckbox({ isAccepted, onToggle, birthdate: initialBirthdate, dni: dniProp, onLegalDataChange }: LegalCheckboxProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMinor, setIsMinor] = useState(false);
    
    // Form fields
    const [dni, setDni] = useState(dniProp || "");
    const [birthdate, setBirthdate] = useState(initialBirthdate || "");
    const [tutorName, setTutorName] = useState("");
    const [tutorId, setTutorId] = useState("");
    const [tutorPhone, setTutorPhone] = useState("");
    const [emergencyContact, setEmergencyContact] = useState("");

    // Calculate if minor
    useEffect(() => {
        if (!birthdate) {
            setIsMinor(false);
            return;
        }
        const birth = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        setIsMinor(age < 18);
    }, [birthdate]);

    // Emit changes to parent
    useEffect(() => {
        onLegalDataChange({
            dni,
            birthdate,
            isMinor,
            tutorName: isMinor ? tutorName : undefined,
            tutorId: isMinor ? tutorId : undefined,
            tutorPhone: isMinor ? tutorPhone : undefined,
            emergencyContact: isMinor ? emergencyContact : undefined
        });
    }, [dni, birthdate, isMinor, tutorName, tutorId, tutorPhone, emergencyContact]);

    return (
        <div className="mt-8 space-y-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                <ShieldCheck size={20} className="text-ocean-500" /> Confirmación Legal
            </h3>

            <div className="bg-sand-50 rounded-2xl border border-sand-200 p-6 space-y-6">
                
                {/* 1. Identification (DNI & Birthdate) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard size={12} /> Tu DNI / Pasaporte
                        </label>
                        <input 
                            type="text"
                            value={dni}
                            onChange={(e) => setDni(e.target.value.toUpperCase())}
                            placeholder="Ej: 12345678X"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 outline-none transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Info size={12} /> Fecha de nacimiento
                        </label>
                        <input 
                            type="date"
                            value={birthdate}
                            onChange={(e) => setBirthdate(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 outline-none transition-all"
                            required
                        />
                    </div>
                </div>

                {/* 2. Minor extra fields (Conditional) */}
                {isMinor && (
                    <div className="bg-ocean-50/50 rounded-xl p-5 border border-ocean-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2 text-ocean-700 mb-1">
                            <UserRound size={16} />
                            <span className="font-bold text-sm">Autorización de Menor</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-ocean-400 uppercase tracking-wider">Nombre del Tutor Legal</label>
                                <input 
                                    type="text"
                                    value={tutorName}
                                    onChange={(e) => setTutorName(e.target.value)}
                                    placeholder="Nombre y apellidos"
                                    className="w-full bg-white border border-ocean-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ocean-500/20 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-ocean-400 uppercase tracking-wider">DNI Tutor</label>
                                <input 
                                    type="text"
                                    value={tutorId}
                                    onChange={(e) => setTutorId(e.target.value.toUpperCase())}
                                    placeholder="Ej: 12345678X"
                                    className="w-full bg-white border border-ocean-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ocean-500/20 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-ocean-400 uppercase tracking-wider flex items-center gap-1">
                                    <Phone size={10} /> Teléfono Tutor
                                </label>
                                <input 
                                    type="tel"
                                    value={tutorPhone}
                                    onChange={(e) => setTutorPhone(e.target.value)}
                                    placeholder="+34 000 000 000"
                                    className="w-full bg-white border border-ocean-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ocean-500/20 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-ocean-400 uppercase tracking-wider flex items-center gap-1">
                                    <HeartPulse size={10} /> Contacto Emergencia
                                </label>
                                <input 
                                    type="text"
                                    value={emergencyContact}
                                    onChange={(e) => setEmergencyContact(e.target.value)}
                                    placeholder="Nombre y relación"
                                    className="w-full bg-white border border-ocean-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ocean-500/20 outline-none"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-ocean-600 leading-tight">
                            * Al ser menor de edad, el tutor legal debe prestar su consentimiento a los términos mediante la aceptación final.
                        </p>
                    </div>
                )}

                {/* 3. The Checkbox */}
                <div className="flex items-start gap-4 cursor-pointer group" onClick={() => onToggle(!isAccepted)}>
                    <div className={`w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${
                        isAccepted ? "bg-ocean-500 border-ocean-500 shadow-md" : "border-slate-300 bg-white group-hover:border-ocean-300"
                    }`}>
                        {isAccepted && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-slate-600 leading-snug">
                            He leído y acepto la <span className="text-ocean-600 font-bold hover:underline" onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}>política de privacidad, las condiciones de participación deportiva, las normas de la escuela</span>, así como el uso de imágenes con fines educativos y promocionales.
                        </p>
                    </div>
                </div>
            </div>

            <LegalModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
}
