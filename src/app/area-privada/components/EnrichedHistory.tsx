import { Clock, MapPin, Users, Droplets, MessageSquare, ExternalLink } from "lucide-react";
import Link from "next/link";

export interface PastClass {
    id: string;
    date: string;
    time: string;
    title: string;
    level: string;
    instructor?: string;
    spot?: string;
    conditions?: string;
    feedback?: string;
}

interface EnrichedHistoryProps {
    pastClasses: (PastClass | null)[];
    levelConfig: Record<string, { label: string; color: string; border: string; bg: string }>;
}

export function EnrichedHistory({ pastClasses, levelConfig }: EnrichedHistoryProps) {
    // Filter out potential nulls
    const validClasses = pastClasses.filter(Boolean) as PastClass[];

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div>
                    <h2 className="font-black text-[#0F172A] font-fredoka text-xl">Tu Historial de Surf</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Últimas clases completadas</p>
                </div>
                <Link href="/area-privada/mis-reservas" className="text-xs text-[#3F7FE3] font-bold hover:underline flex items-center gap-1">
                    Ver todo <ExternalLink size={12} />
                </Link>
            </div>

            {validClasses.length === 0 ? (
                <div className="p-8 text-center bg-sand-50">
                    <Droplets size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium text-sm mb-1">Aún no has completado ninguna clase.</p>
                    <p className="text-gray-400 text-xs text-balance">Cuando empieces a surfear con nosotros, verás aquí el registro de tus sesiones, monitores y feedback.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {validClasses.map((cls) => {
                        const dateObj = new Date(cls.date.replace(/-/g, '/'));
                        const dayNum = dateObj.getDate();
                        const monthStr = dateObj.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
                        const lv = levelConfig[cls.level] || levelConfig.BEGINNER;

                        return (
                            <div key={cls.id} className="p-5 sm:p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                    {/* Date Column */}
                                    <div className="flex flex-row sm:flex-col items-center sm:w-16 shrink-0 gap-3 sm:gap-1">
                                        <div className="w-14 h-14 bg-gray-900 rounded-xl flex flex-col items-center justify-center shadow-inner">
                                            <span className="text-blue-300 text-[10px] font-bold">{monthStr}</span>
                                            <span className="text-white font-black text-xl leading-none">{dayNum}</span>
                                        </div>
                                        <div className="sm:hidden flex-1">
                                            <p className="font-bold text-[#0F172A] text-lg">{cls.title}</p>
                                            <div className="flex items-center text-xs text-gray-500 gap-2 mt-1">
                                                <span className="flex items-center gap-1"><Clock size={11} /> {cls.time.substring(0, 5)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Info Grid */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                        <div>
                                            <div className="hidden sm:block mb-3">
                                                <p className="font-black text-[#0F172A] text-lg leading-tight">{cls.title}</p>
                                                <div className="flex items-center text-xs font-bold text-gray-500 gap-3 mt-1.5">
                                                    <span className="flex items-center gap-1"><Clock size={12} className="text-gray-400"/> {cls.time.substring(0, 5)}</span>
                                                    <span className={`px-2 py-0.5 rounded border ${lv.bg} ${lv.border} ${lv.color} text-[10px] uppercase`}>{lv.label}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2 mt-2 sm:mt-0">
                                                {cls.spot && (
                                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                                        <MapPin size={16} className="text-ocean-400 mt-0.5 shrink-0" />
                                                        <span><strong className="text-gray-900">Spot:</strong> {cls.spot}</span>
                                                    </div>
                                                )}
                                                {cls.instructor && (
                                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                                        <Users size={16} className="text-ocean-400 mt-0.5 shrink-0" />
                                                        <span><strong className="text-gray-900">Monitor:</strong> {cls.instructor}</span>
                                                    </div>
                                                )}
                                                {cls.conditions && (
                                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                                        <Droplets size={16} className="text-ocean-400 mt-0.5 shrink-0" />
                                                        <span><strong className="text-gray-900">Condiciones:</strong> {cls.conditions}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Feedback Column */}
                                        <div className="bg-sand-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
                                            {cls.feedback ? (
                                                <div className="relative">
                                                    <MessageSquare size={16} className="text-ocean-300 absolute -top-1 -left-1 opacity-50" />
                                                    <p className="text-sm italic text-gray-700 pl-6 relative z-10">"{cls.feedback}"</p>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-2 pl-6 uppercase tracking-wider">— {cls.instructor || "Equipo TGN"}</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <MessageSquare size={20} className="mx-auto text-gray-200 mb-2" />
                                                    <p className="text-xs text-gray-400 font-medium">No hay feedback para esta sesión.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
