import Link from "next/link";
import { ArrowRight, Plane, Map, Globe, Users } from "lucide-react";

export const metadata = {
    title: "Viajes y Experiencias de Surf | TGN Surf School",
    description: "Forma parte de nuestros Surf Trips y Escapadas. Viaja con TGN Surf School en busca de los mejores picos del mundo.",
};

export default function ViajesPage() {
    return (
        <div className="pt-24 min-h-screen bg-white">
            {/* HEADER SECTION */}
            <section className="relative py-28 bg-[#111827] overflow-hidden">
                <div className="absolute inset-0 opacity-40 bg-[url('/Copia de tgnsurf_gavina_-51.jpg')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent"></div>

                <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center max-w-4xl">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 text-sm font-bold mb-6 tracking-widest uppercase">
                        <Plane size={16} /> Experiencias Premium
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-white font-fredoka mb-6">
                        Viajes de Surf
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
                        Escapadas organizadas para conectar, descubrir nuevas olas y vivir la cultura del surf más allá del Mediterráneo.
                    </p>
                </div>
            </section>

            {/* CONTENT */}
            <section className="py-24">
                <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                        <div>
                            <h2 className="text-4xl font-bold font-fredoka text-[#111827] mb-6 shadow-sm">
                                Más kilómetros, más olas, más comunidad.
                            </h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Nuestros Surf Trips no son simples vacaciones, son expediciones diseñadas al milímetro para que solo te preocupes de remar y disfrutar. Nosotros ponemos la logística, el coaching en el agua y el buen rollo.
                            </p>

                            <ul className="space-y-4 mb-8">
                                <li className="flex gap-4">
                                    <div className="w-12 h-12 bg-[var(--surf-sand)] rounded-2xl flex items-center justify-center shrink-0">
                                        <Globe className="text-[#3F7FE3]" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#111827]">Destinos Nacionales e Internacionales</h4>
                                        <p className="text-gray-600">Cantábrico, Portugal, Marruecos...</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-12 h-12 bg-[var(--surf-sand)] rounded-2xl flex items-center justify-center shrink-0">
                                        <Users className="text-[#3F7FE3]" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#111827]">Grupos Reducidos</h4>
                                        <p className="text-gray-600">Para garantizar una atención personalizada y crear vínculos reales.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-12 h-12 bg-[var(--surf-sand)] rounded-2xl flex items-center justify-center shrink-0">
                                        <Map className="text-[#3F7FE3]" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#111827]">Todo Organizado</h4>
                                        <p className="text-gray-600">Alojamiento, traslados, clases, vídeo corrección y actividades extra.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-[#3F7FE3] rounded-[3rem] rotate-3 opacity-10"></div>
                            <img
                                src="/Copia de _DRE4740.jpg"
                                alt="Surf Trip furgo"
                                className="rounded-[3rem] shadow-2xl relative z-10 w-full object-cover aspect-square"
                            />
                        </div>
                    </div>

                    <div className="bg-[var(--surf-sand)] rounded-[3rem] p-10 md:p-16 text-center">
                        <h2 className="text-3xl font-bold font-fredoka text-[#111827] mb-4">Próximos Destinos</h2>
                        <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
                            Actualmente estamos preparando el calendario de la nueva temporada. Déjanos tus datos y serás el primero en enterarte de las nuevas fechas. (Plazas muy limitadas, se agotan rápido).
                        </p>

                        <form className="max-w-md mx-auto flex flex-col gap-4">
                            <input
                                type="email"
                                placeholder="Tu email"
                                className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3F7FE3] focus:ring-2 focus:ring-[#3F7FE3]/20 bg-white"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full px-6 py-4 bg-[#111827] text-white font-bold rounded-xl hover:bg-[#1F2937] transition-colors shadow-lg"
                            >
                                Avisadme de nuevos viajes
                            </button>
                        </form>
                    </div>

                </div>
            </section>
        </div>
    );
}
