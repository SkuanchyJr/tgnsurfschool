"use client";

import { useState } from "react";
import { Search, Mail, Phone, ExternalLink, Activity, Info } from "lucide-react";
import Link from "next/link";

type StudentType = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    surf_level: string;
    surf_assessment: Record<string, string> | null;
    active_vouchers: number;
    created_at: string;
    bookings: [{ count: number }];
};

const LEVEL_CONFIG: Record<string, { label: string; badge: string }> = {
    BEGINNER:     { label: "Principiante", badge: "bg-emerald-100 text-emerald-700" },
    INITIATION:   { label: "Iniciación",   badge: "bg-emerald-100 text-emerald-700" },
    INTERMEDIATE: { label: "Intermedio",   badge: "bg-orange-100 text-orange-700" },
    ADVANCED:     { label: "Avanzado",     badge: "bg-red-100 text-red-700" },
};

const Q_LABELS: Record<string, string> = {
    previous_surf: "Experiencia previa", water_comfort: "Comodidad en el agua",
    wave_preference: "Olas preferidas", fitness_level: "Forma física", main_goal: "Objetivo",
};
const A_LABELS: Record<string, Record<string, string>> = {
    previous_surf:   { no: "Primera vez", yes_little: "Un par de veces", yes_regular: "Con regularidad", yes_lots: "Años surfeando" },
    water_comfort:   { nervous: "Nervioso/a", ok: "Se defiende", comfortable: "Cómodo/a", very_comfortable: "Muy cómodo/a" },
    wave_preference: { small: "Pequeñas y suaves", medium: "Medias", big: "Grandes y potentes", any: "Cualquiera" },
    fitness_level:   { low: "Baja", moderate: "Moderada", high: "Alta", athlete: "Deportista" },
    main_goal:       { learn_standup: "Ponerme de pie", improve_technique: "Mejorar técnica", ride_better_waves: "Olas más grandes", compete: "Competir" },
};

function AssessmentPopover({ assessment }: { assessment: Record<string, string> }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative inline-block ml-1.5">
            <button
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onClick={() => setOpen(v => !v)}
                className="text-gray-400 hover:text-[#3F7FE3] transition-colors"
                title="Ver cuestionario"
            >
                <Info size={14} />
            </button>
            {open && (
                <div className="absolute z-50 bottom-6 left-1/2 -translate-x-1/2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Cuestionario de nivel</p>
                    <div className="space-y-2">
                        {Object.keys(Q_LABELS).map(k => {
                            const v = assessment[k];
                            if (!v) return null;
                            return (
                                <div key={k}>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">{Q_LABELS[k]}</p>
                                    <p className="text-xs font-semibold text-gray-700">{A_LABELS[k]?.[v] || v}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function StudentsTable({ initialStudents }: { initialStudents: StudentType[] }) {
    const [students] = useState<StudentType[]>(initialStudents);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 py-6 px-8 sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black text-[#0F172A] font-fredoka leading-none">Directorio de Alumnos</h1>
                    <p className="text-xs font-medium text-gray-500">Gestión de base de datos de usuarios (CRM)</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-[#3F7FE3]"
                    />
                </div>
            </header>

            <main className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Alumno</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Contacto</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-center">Nivel</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-center">Bonos Activos</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-center">Clases Totales</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredStudents.map((student) => {
                                        const lvCfg = LEVEL_CONFIG[student.surf_level] || LEVEL_CONFIG.BEGINNER;
                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#3F7FE3] text-white flex items-center justify-center font-bold text-lg">
                                                            {student.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[#0F172A]">{student.name}</div>
                                                            <div className="text-xs text-gray-500">Registrado: {new Date(student.created_at).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1 hover:text-[#3F7FE3] cursor-pointer">
                                                        <Mail size={14} /> {student.email}
                                                    </div>
                                                    {student.phone ? (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#3F7FE3] cursor-pointer">
                                                            <Phone size={14} /> {student.phone}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs italic text-gray-400">Sin teléfono</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${lvCfg.badge}`}>
                                                            {lvCfg.label}
                                                        </span>
                                                        {student.surf_assessment && (
                                                            <AssessmentPopover assessment={student.surf_assessment} />
                                                        )}
                                                    </div>
                                                    {!student.surf_assessment && (
                                                        <p className="text-[9px] text-gray-400 mt-0.5 italic">Sin cuestionario</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="font-black text-xl text-[#3F7FE3]">{student.active_vouchers}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="font-bold text-gray-500 flex items-center justify-center gap-1">
                                                        <Activity size={16} />
                                                        {student.bookings[0]?.count || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <Link 
                                                        href={`/admin/students/${student.id}`}
                                                        className="inline-block p-2 text-gray-400 hover:text-[#3F7FE3] bg-white rounded-lg border border-gray-200 hover:border-[#3F7FE3] transition-colors" 
                                                        title="Ver Perfil Detallado"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredStudents.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">
                                                No hay alumnos que coincidan con la búsqueda.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
