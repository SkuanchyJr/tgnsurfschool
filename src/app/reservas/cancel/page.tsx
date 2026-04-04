import Link from "next/link";
import { XCircle, RefreshCcw } from "lucide-react";

export default function CancelPage() {
    return (
        <div className="pt-28 min-h-screen bg-sand-50 flex flex-col items-center justify-center">
            <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 text-center">
                <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-500/20">
                    <XCircle size={48} />
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                    Pago Cancelado
                </h1>
                <p className="text-lg text-slate-600 mb-10 max-w-md mx-auto leading-relaxed">
                    Has cancelado el proceso de pago. Tu reserva no ha sido confirmada y no se ha realizado ningún cargo en tu tarjeta.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        href="/reservas"
                        className="px-8 py-4 bg-ocean-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-ocean-600 transition-colors shadow-lg shadow-ocean-500/20"
                    >
                        <RefreshCcw size={20} />
                        Intentar otra vez
                    </Link>
                    <Link
                        href="/"
                        className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}
