import Link from "next/link";
import { CheckCircle2, Waves } from "lucide-react";

export default function SuccessPage() {
    return (
        <div className="pt-28 min-h-screen bg-sand-50 flex flex-col items-center justify-center">
            <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 text-center">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 size={48} />
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                    ¡Pago Confirmado!
                </h1>
                <p className="text-lg text-slate-600 mb-10 max-w-md mx-auto leading-relaxed">
                    Hemos recibido correctamente tu pago y tu reserva está en proceso de confirmación. Te notificaremos enseguida. ¡Nos vemos en el agua!
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        href="/area-privada"
                        className="px-8 py-4 bg-ocean-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-ocean-600 transition-colors shadow-lg shadow-ocean-500/20"
                    >
                        <Waves size={20} />
                        Ir a Área Privada
                    </Link>
                    <Link
                        href="/reservas"
                        className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                    >
                        Volver a Reservas
                    </Link>
                </div>
            </div>
        </div>
    );
}
