import Link from "next/link";
import { Sparkles, CalendarDays, ExternalLink, ArrowRight } from "lucide-react";
import { AvailableClass } from "../../reservas/actions";

interface BookingRecommendationsProps {
    recommendedClasses: AvailableClass[];
    levelName: string;
}

export function BookingRecommendations({ recommendedClasses, levelName }: BookingRecommendationsProps) {
    return (
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div className="flex items-center gap-2 mb-6 relative z-10">
                <Sparkles className="text-yellow-400" size={20} />
                <h2 className="font-black font-fredoka text-xl">Recomendado para ti</h2>
            </div>
            
            <p className="text-sm text-blue-200 mb-6 relative z-10">
                Hemos seleccionado estas próximas clases ideales para tu nivel: <strong>{levelName}</strong>.
            </p>

            {recommendedClasses.length === 0 ? (
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6 text-center">
                    <CalendarDays size={32} className="mx-auto text-white/50 mb-3" />
                    <p className="text-sm font-medium">No hay clases {levelName} programadas pronto.</p>
                    <Link href="/area-privada/clases" className="text-xs text-blue-300 hover:text-white mt-2 inline-flex items-center gap-1 font-bold">
                        Ver todo el calendario <ExternalLink size={12} />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                    {recommendedClasses.map((cls) => {
                        const dateObj = new Date(cls.date.replace(/-/g, '/'));
                        const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
                        const dayNum = dateObj.getDate();
                        const monthName = dateObj.toLocaleDateString('es-ES', { month: 'long' });

                        return (
                            <Link href="/area-privada/clases" key={cls.id} className="group bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-xl p-4 transition-all">
                                <div className="text-[10px] uppercase font-bold text-blue-300 tracking-wider mb-1 capitalize">
                                    {dayName}, {dayNum} de {monthName}
                                </div>
                                <div className="font-black text-lg mb-1">{cls.time.substring(0, 5)}</div>
                                <div className="text-sm font-medium opacity-90 truncate">{cls.service_title || "Clase de Surf"}</div>
                                
                                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-xs px-2 py-1 bg-white/10 rounded-md font-bold text-yellow-400">
                                        Quedan {cls.spots_left}
                                    </span>
                                    <ArrowRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
