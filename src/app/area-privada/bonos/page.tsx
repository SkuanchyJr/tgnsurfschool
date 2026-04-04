"use client";

import { useState, useEffect } from "react";
import { 
    ArrowLeft, CreditCard, CheckCircle2, TrendingUp, 
    Zap, Gem, Waves, Loader2, Calendar, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { createPassCheckoutSession, getStudentPasses, type UserPass, type PassType } from "./actions";
import { useSearchParams } from "next/navigation";

const PASS_OPTIONS = [
    {
        id: 'BONO_1' as PassType,
        title: "Clase Suelta",
        price: 35,
        classes: 1,
        description: "Ideal para probar una sesión sin compromiso.",
        features: ["Material incluido", "Monitor titulado", "Seguro RC"],
        icon: Waves,
        color: "blue"
    },
    {
        id: 'BONO_5' as PassType,
        title: "Bono 5 Clases",
        price: 160,
        classes: 5,
        description: "El pack perfecto para empezar a notar progreso real.",
        features: ["Ahorra 15€", "Validez 6 meses", "Todas las ventajas del club"],
        icon: Zap,
        color: "emerald",
        popular: true
    },
    {
        id: 'BONO_10' as PassType,
        title: "Bono 10 Clases",
        price: 300,
        classes: 10,
        description: "Para los más comprometidos que quieren dominar las olas.",
        features: ["Ahorra 50€", "Mejor precio/clase", "Prioridad en reservas"],
        icon: Gem,
        color: "violet"
    }
];

export default function BonosPage() {
    const searchParams = useSearchParams();
    const isSuccess = searchParams.get("success") === "true";
    const isCancel = searchParams.get("cancel") === "true";

    const [passes, setPasses] = useState<UserPass[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasingId, setPurchasingId] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await getStudentPasses();
            if (res.success && res.data) {
                setPasses(res.data);
            }
            setLoading(false);
        }
        load();
    }, []);

    const handleBuy = async (id: PassType) => {
        setPurchasingId(id);
        const res = await createPassCheckoutSession(id);
        if (res.success && res.url) {
            window.location.href = res.url;
        } else {
            alert(res.error || "Error al iniciar el pago");
            setPurchasingId(null);
        }
    };

    const activePass = passes.find(p => p.status === 'ACTIVE');

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-10">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <Link href="/area-privada/perfil" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors mb-4">
                        <ArrowLeft size={16} /> Volver al perfil
                    </Link>
                    <h1 className="text-4xl font-black font-fredoka text-[#0F172A]">Bonos y Membresías</h1>
                    <p className="text-gray-500 mt-2">Compra packs de clases y ahorra en tus sesiones de surf.</p>
                </div>
                
                {activePass && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Tienes saldo activo</p>
                            <p className="text-xl font-black text-emerald-900">{activePass.remaining_classes} Clases <span className="font-medium text-sm text-emerald-700/70">restantes</span></p>
                        </div>
                    </div>
                )}
            </div>

            {/* Notifications */}
            {isSuccess && (
                <div className="bg-emerald-500 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <p className="font-black text-lg">¡Compra completada!</p>
                        <p className="text-emerald-50 text-sm">Tu nuevo bono ya está activo y puedes usarlo para reservar clases inmediatamente.</p>
                    </div>
                </div>
            )}

            {isCancel && (
                <div className="bg-amber-500 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <p className="font-black text-lg">Pago cancelado</p>
                        <p className="text-amber-50 text-sm">No se ha realizado ningún cargo. Puedes intentarlo de nuevo cuando quieras.</p>
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PASS_OPTIONS.map((pkg) => {
                    const isPurchasing = purchasingId === pkg.id;
                    const Icon = pkg.icon;
                    return (
                        <div key={pkg.id} className={`relative bg-white rounded-3xl border-2 p-8 transition-all hover:shadow-2xl flex flex-col ${pkg.popular ? 'border-emerald-500 shadow-xl scale-105 z-10' : 'border-gray-100 hover:border-gray-200'}`}>
                            {pkg.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Más recomendado
                                </div>
                            )}
                            
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${pkg.color === 'blue' ? 'bg-blue-100 text-blue-600' : pkg.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-violet-600'}`}>
                                <Icon size={28} />
                            </div>

                            <h3 className="text-2xl font-black text-[#0F172A] mb-2">{pkg.title}</h3>
                            <p className="text-gray-500 text-sm mb-6 flex-1">{pkg.description}</p>
                            
                            <div className="mb-8">
                                <p className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-[#0F172A]">{pkg.price}€</span>
                                    <span className="text-gray-400 font-bold text-sm">/ pack</span>
                                </p>
                                <p className="text-xs text-slate-400 font-bold mt-1">
                                    {(pkg.price / pkg.classes).toFixed(2)}€ por clase
                                </p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {pkg.features.map((feat, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                        <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={12} />
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleBuy(pkg.id)}
                                disabled={!!purchasingId}
                                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                    pkg.popular 
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30' 
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isPurchasing ? (
                                    <><Loader2 size={18} className="animate-spin" /> Procesando...</>
                                ) : (
                                    <>Comprar ahora <CreditCard size={18} /></>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Info Footer */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                        <Calendar size={32} className="text-slate-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-[#0F172A] mb-2">Información sobre los bonos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm text-slate-600">
                            <p>• Los bonos tienen una <strong>validez de 6 meses</strong> desde la fecha de compra.</p>
                            <p>• Se pueden compartir con amigos o familiares contactando con la escuela.</p>
                            <p>• El material (tabla y neopreno) está siempre incluido en todos los packs.</p>
                            <p>• Recibirás confirmación inmediata por email tras el pago.</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
