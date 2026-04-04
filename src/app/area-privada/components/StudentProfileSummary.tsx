import { UserCircle, Mail, MapPin, Waves, Target, Search } from "lucide-react";

interface StudentProfileProps {
    name: string;
    email: string;
    levelName: string;
    assessment: Record<string, string> | null;
    qLabels: Record<string, string>;
    aLabels: Record<string, Record<string, string>>;
}

export function StudentProfileSummary({ name, email, levelName, assessment, qLabels, aLabels }: StudentProfileProps) {
    // Determine info to show
    const goal = assessment?.main_goal ? (aLabels.main_goal?.[assessment.main_goal] || assessment.main_goal) : "Mejorar técnica";
    const waterComfort = assessment?.water_comfort ? (aLabels.water_comfort?.[assessment.water_comfort] || assessment.water_comfort) : "Cómodo/a";
    
    // We add some mock preferences as placeholders until implemented in DB
    const stance = "Regular (Pie izquierdo delante)";
    const wetsuitSize = "M";
    const favoriteSpot = "Playa Larga";

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-black text-[#0F172A] font-fredoka text-xl mb-6">Tu Perfil</h2>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-8 pb-8 border-b border-gray-100/80">
                <div className="w-16 h-16 bg-gradient-to-br from-ocean-100 to-ocean-200 text-ocean-600 rounded-full flex flex-col items-center justify-center shrink-0">
                    <UserCircle size={32} />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-lg text-gray-900 leading-tight">{name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Mail size={14} className="text-gray-400" /> {email}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Datos Técnicos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                        <div className="flex items-start gap-3">
                            <Waves size={16} className="text-ocean-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Nivel Actual</p>
                                <p className="text-sm font-bold text-gray-900">{levelName}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Target size={16} className="text-ocean-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Objetivo Principal</p>
                                <p className="text-sm font-bold text-gray-900">{goal}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Search size={16} className="text-ocean-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Comodidad en el Agua</p>
                                <p className="text-sm font-bold text-gray-900">{waterComfort}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block border-t border-gray-100 pt-6">Preferencias</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Stance (Postura)</span>
                            <span className="text-sm font-bold text-gray-900">{stance}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Talla Neopreno</span>
                            <span className="text-sm font-bold text-gray-900">{wetsuitSize}</span>
                        </div>
                        <div className="flex items-start gap-2 col-span-1 sm:col-span-2 text-gray-900">
                            <MapPin size={16} className="text-ocean-400 mt-0.5" />
                            <div>
                                <span className="text-xs text-gray-500 block">Spot Favorito</span>
                                <span className="text-sm font-bold">{favoriteSpot}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
