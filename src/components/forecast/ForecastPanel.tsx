"use client";

import { useState, useEffect } from "react";
import { Waves, Clock, Shield, Anchor, AlertCircle, RefreshCw } from "lucide-react";

type ForecastData = {
    generalState: string;
    bestTime: string;
    recommendedLevel: string;
    recommendedActivity: string;
    aiObservation: string;
    tipOfTheDay: string;
};

export function ForecastPanel() {
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchForecast = async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await fetch('/api/surf-forecast');
            if (!response.ok) throw new Error("Error fetching forecast");
            const result = await response.json();
            if (result.success) {
                setForecast(result.data);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForecast();
    }, []);

    if (loading) {
        return (
            <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-3xl p-10 shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
                <RefreshCw size={40} className="text-[#3F7FE3] animate-spin mb-4" />
                <p className="text-gray-400">Analizando datos del mar con IA...</p>
            </div>
        );
    }

    if (error || !forecast) {
        return (
            <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-3xl p-10 shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
                <AlertCircle size={40} className="text-red-400 mb-4" />
                <p className="text-gray-400 mb-4">No se pudieron cargar las condiciones del mar.</p>
                <button onClick={fetchForecast} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm">
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-10 shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold font-fredoka text-white">Reporte Actual</h3>
                <button onClick={fetchForecast} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Actualizar">
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="flex flex-col gap-1 bg-black/20 p-4 rounded-2xl relative overflow-hidden border border-white/5">
                    <div className="w-1.5 h-full absolute left-0 top-0 bg-green-400" />
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Waves size={16} className="text-green-400" /> Estado
                    </div>
                    <p className="text-xl font-bold text-white">{forecast.generalState}</p>
                </div>

                <div className="flex flex-col gap-1 bg-black/20 p-4 rounded-2xl relative overflow-hidden border border-white/5">
                    <div className="w-1.5 h-full absolute left-0 top-0 bg-[#3F7FE3]" />
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Clock size={16} className="text-[#3F7FE3]" /> Mejor Hora
                    </div>
                    <p className="text-xl font-bold text-white">{forecast.bestTime}</p>
                </div>

                <div className="flex flex-col gap-1 bg-black/20 p-4 rounded-2xl relative overflow-hidden border border-white/5">
                    <div className="w-1.5 h-full absolute left-0 top-0 bg-yellow-400" />
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Shield size={16} className="text-yellow-400" /> Nivel Mínimo
                    </div>
                    <p className="text-xl font-bold text-white">{forecast.recommendedLevel}</p>
                </div>

                <div className="flex flex-col gap-1 bg-black/20 p-4 rounded-2xl relative overflow-hidden border border-white/5">
                    <div className="w-1.5 h-full absolute left-0 top-0 bg-purple-400" />
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Anchor size={16} className="text-purple-400" /> Actividad
                    </div>
                    <p className="text-xl font-bold text-white">{forecast.recommendedActivity}</p>
                </div>
            </div>

            <div className="border border-[#3F7FE3]/30 bg-[#3F7FE3]/5 rounded-2xl p-6 relative mb-6">
                <div className="absolute -top-3 left-6 bg-[#111827] px-3 py-1 rounded-full text-xs font-bold text-[#6A9DF0] border border-[#6A9DF0]/30 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#6A9DF0] animate-pulse" /> IA Analysis
                </div>
                <p className="text-lg text-gray-200 leading-relaxed italic mt-2">
                    "{forecast.aiObservation}"
                </p>
            </div>

            <div className="bg-white/5 p-4 rounded-xl flex items-start gap-3 border border-white/5">
                <AlertCircle size={20} className="text-[#3F7FE3] shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-bold text-white mb-1">Consejo del instructor:</p>
                    <p className="text-sm text-gray-400">{forecast.tipOfTheDay}</p>
                </div>
            </div>
        </div>
    );
}
