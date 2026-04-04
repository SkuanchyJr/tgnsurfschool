import { Waves, TrendingUp, Trophy, Clock } from "lucide-react";

interface StudentProgressCardProps {
    level: string;
    completedClasses: number;
    hoursInWater: number;
    nextStepRec: string;
    levelName: string;
    levelColor: string;
}

export function StudentProgressCard({
    level,
    completedClasses,
    hoursInWater,
    nextStepRec,
    levelName,
    levelColor
}: StudentProgressCardProps) {
    
    // Simple logic to mock next level threshold
    const classesForNextLevel = 10;
    const progressPercent = Math.min((completedClasses / classesForNextLevel) * 100, 100);
    const classesLeft = Math.max(classesForNextLevel - completedClasses, 0);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-ocean-50 rounded-bl-full opacity-50 -z-10" />
            
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="font-black text-[#0F172A] font-fredoka text-xl flex items-center gap-2">
                        <TrendingUp size={20} className="text-ocean-500" /> Progreso del Surfista
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Mira lo lejos que has llegado</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full font-black text-sm border bg-opacity-10 ${levelColor.replace('text-', 'bg-').replace('text-', 'border-')} ${levelColor}`}>
                    Nivel: {levelName}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Visual Progress */}
                <div className="col-span-1 flex flex-col items-center justify-center p-4 bg-sand-50 rounded-2xl border border-gray-100">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            {/* Background Circle */}
                            <path
                                className="text-gray-200 stroke-current"
                                strokeWidth="3"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {/* Progress Circle */}
                            <path
                                className="text-ocean-500 stroke-current"
                                strokeWidth="3"
                                strokeDasharray={`${progressPercent}, 100`}
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-2xl font-black text-[#0F172A]">{completedClasses}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Clases</span>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500 font-medium text-center">
                        {classesLeft > 0 
                            ? `¡A ${classesLeft} clases de subir de nivel!` 
                            : "¡Listo para el siguiente nivel!"}
                    </p>
                </div>

                {/* Stats */}
                <div className="col-span-1 md:col-span-2 flex flex-col justify-center space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white border text-center border-gray-100 p-4 rounded-xl shadow-sm">
                            <Clock size={24} className="mx-auto text-ocean-400 mb-2" />
                            <p className="text-2xl font-black text-[#0F172A]">{hoursInWater}h</p>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">En el agua</p>
                        </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
                        <Trophy size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-emerald-900 mb-1">Tu próximo objetivo</p>
                            <p className="text-xs text-emerald-700 leading-relaxed">{nextStepRec}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
