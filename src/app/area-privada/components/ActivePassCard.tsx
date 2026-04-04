import Link from "next/link";
import { CreditCard, ShoppingBag, ArrowRight } from "lucide-react";

interface ActivePassCardProps {
    hasPass: boolean;
    remainingClasses?: number;
    totalClasses?: number;
    expiryDate?: string;
}

export function ActivePassCard({ hasPass, remainingClasses = 0, totalClasses = 0, expiryDate }: ActivePassCardProps) {
    if (!hasPass) {
        return (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-6 flex items-center justify-between text-left group hover:border-ocean-300 transition-colors">
                <div>
                    <h2 className="font-bold text-[#0F172A] flex items-center gap-2 mb-1">
                        <ShoppingBag size={18} className="text-gray-400 group-hover:text-ocean-500 transition-colors" />
                        Bonos y Membresías
                    </h2>
                    <p className="text-sm text-gray-500">No tienes ningún bono activo.</p>
                </div>
                <Link href="/area-privada/bonos" className="shrink-0 px-4 py-2 bg-slate-100 hover:bg-ocean-50 text-slate-700 hover:text-ocean-700 rounded-xl text-sm font-bold transition-colors">
                    Ver opciones
                </Link>
            </div>
        );
    }

    const progressPercent = Math.min(((totalClasses - remainingClasses) / totalClasses) * 100, 100);
    const dateObj = expiryDate ? new Date(expiryDate.replace(/-/g, '/')) : null;
    const isExpiringSoon = dateObj && (dateObj.getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 15;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col sm:flex-row">
            {/* The "Card" part */}
            <div className="bg-gradient-to-br from-ocean-500 to-[#1E3A8A] p-6 text-white sm:w-64 shrink-0 relative flex flex-col justify-between">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
                
                <div className="relative z-10 flex items-center justify-between mb-8">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Bono Activo</span>
                    <CreditCard size={18} className="text-white/70" />
                </div>
                
                <div className="relative z-10">
                    <p className="text-3xl font-black font-fredoka">{remainingClasses}</p>
                    <p className="text-sm text-white/80 font-medium">Clases restantes</p>
                </div>
            </div>

            {/* Info part */}
            <div className="p-6 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-[#0F172A]">Bono de {totalClasses} Clases</h3>
                        {dateObj && (
                            <p className={`text-xs mt-1 font-bold ${isExpiringSoon ? 'text-amber-500' : 'text-gray-400'}`}>
                                Válido hasta: {dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {isExpiringSoon && " (¡Pronto!)"}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-bold">
                        <span>Consumidas: {totalClasses - remainingClasses}</span>
                        <span>Total: {totalClasses}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-ocean-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>

                <div className="text-right">
                    <Link href="/area-privada/bonos" className="text-xs text-ocean-600 font-bold hover:underline inline-flex items-center gap-1">
                        Renovar Bono <ArrowRight size={12} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
