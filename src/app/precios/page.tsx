import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export const metadata = {
    title: "Tarifas y Precios | TGN Surf School",
    description: "Consulta nuestras tarifas para clases sueltas y bonos de surf y surfskate en Tarragona.",
};

export default function PreciosPage() {
    return (
        <div className="pt-24 min-h-screen bg-[var(--surf-sand)]">
            {/* HEADER SECTION */}
            <section className="py-20 bg-white border-b border-gray-100 text-center px-4 lg:px-8">
                <span className="text-[#3F7FE3] font-bold tracking-widest uppercase text-sm mb-4 block">Inversión en ti mismo</span>
                <h1 className="text-5xl md:text-6xl font-black text-[#111827] font-fredoka mb-6">
                    Nuestras Tarifas
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
                    Opciones flexibles adaptadas a tu nivel de compromiso. Todo el material y seguros están siempre incluidos.
                </p>
            </section>

            {/* PRICING CARDS */}
            <section className="py-24">
                <div className="container mx-auto px-4 lg:px-8 max-w-6xl">

                    <div className="mb-16">
                        <h2 className="text-3xl font-bold font-fredoka text-[#111827] mb-8 text-center">Bonos de Surf (Agua)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                            {/* Tarjeta 1 */}
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-transparent hover:border-[#3F7FE3]/30 transition-all flex flex-col">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Clase Suelta</h3>
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-5xl font-black text-[#111827]">35€</span>
                                    <span className="text-gray-500">/ sesión</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-start gap-3 text-gray-600"><Check size={20} className="text-[#3F7FE3] shrink-0" /> Sesión de 2 horas</li>
                                    <li className="flex items-start gap-3 text-gray-600"><Check size={20} className="text-[#3F7FE3] shrink-0" /> Material incluido</li>
                                    <li className="flex items-start gap-3 text-gray-600"><Check size={20} className="text-[#3F7FE3] shrink-0" /> Seguro RC y accidentes</li>
                                </ul>
                                <Link href="#reservar" className="block w-full text-center py-4 rounded-xl border-2 border-[#111827] text-[#111827] font-bold hover:bg-[#111827] hover:text-white transition-colors">
                                    Elegir
                                </Link>
                            </div>

                            {/* Tarjeta 2 - DESTACADA */}
                            <div className="bg-[#111827] rounded-3xl p-8 shadow-2xl scale-100 md:scale-105 relative z-10 flex flex-col">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#3F7FE3] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                    MÁS POPULAR
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Bono 5 Clases</h3>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-5xl font-black text-white">160€</span>
                                    <span className="text-gray-400">/ bono</span>
                                </div>
                                <p className="text-[#6A9DF0] text-sm mb-6">Ahorras 15€ (32€/clase)</p>

                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-start gap-3 text-gray-300"><Check size={20} className="text-[#6A9DF0] shrink-0" /> 5 sesiones de 2 horas</li>
                                    <li className="flex items-start gap-3 text-gray-300"><Check size={20} className="text-[#6A9DF0] shrink-0" /> Flexibilidad de horarios</li>
                                    <li className="flex items-start gap-3 text-gray-300"><Check size={20} className="text-[#6A9DF0] shrink-0" /> Material y seguros incluidos</li>
                                    <li className="flex items-start gap-3 text-gray-300"><Check size={20} className="text-[#6A9DF0] shrink-0" /> Válido durante la temporada</li>
                                </ul>
                                <Link href="#reservar" className="block w-full text-center py-4 rounded-xl bg-[#3F7FE3] text-white font-bold hover:bg-[#2A5BA6] transition-colors shadow-lg">
                                    Comprar Bono
                                </Link>
                            </div>

                            {/* Tarjeta 3 */}
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-transparent hover:border-[#3F7FE3]/30 transition-all flex flex-col">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Bono 10 Clases</h3>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-5xl font-black text-[#111827]">280€</span>
                                    <span className="text-gray-500">/ bono</span>
                                </div>
                                <p className="text-[#3F7FE3] text-sm font-medium mb-6">Ahorras 70€ (28€/clase)</p>

                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-start gap-3 text-gray-600"><Check size={20} className="text-[#3F7FE3] shrink-0" /> 10 sesiones de 2 horas</li>
                                    <li className="flex items-start gap-3 text-gray-600"><Check size={20} className="text-[#3F7FE3] shrink-0" /> Mejor precio garantizado</li>
                                    <li className="flex items-start gap-3 text-gray-600"><Check size={20} className="text-[#3F7FE3] shrink-0" /> Material y seguros incluidos</li>
                                </ul>
                                <Link href="#reservar" className="block w-full text-center py-4 rounded-xl border-2 border-[#111827] text-[#111827] font-bold hover:bg-[#111827] hover:text-white transition-colors">
                                    Elegir
                                </Link>
                            </div>

                        </div>
                    </div>

                    {/* OTRAS OPCIONES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        <div className="bg-white p-8 rounded-[2rem] shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold font-fredoka text-[#111827] mb-2">Progresión Total</h3>
                                <p className="text-gray-600 mb-6">Para los que lo tienen claro y vienen a por todas. La opción más rentable.</p>
                                <div className="flex items-center justify-between p-4 bg-[var(--surf-sand)] rounded-xl mb-6">
                                    <span className="font-bold text-[#111827]">Bono 20 Clases</span>
                                    <span className="text-2xl font-black text-[#3F7FE3]">450€</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-6">(Sale a 22,50€ la clase)</p>
                            </div>
                            <Link href="#reservar" className="text-[#3F7FE3] font-bold flex items-center gap-2 hover:gap-3 transition-all">
                                Solicitar este bono <ArrowRight size={20} />
                            </Link>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] shadow-sm flex flex-col justify-between border-2 border-[var(--surf-sand)]">
                            <div>
                                <h3 className="text-2xl font-bold font-fredoka text-[#111827] mb-2">Bono Surfskate</h3>
                                <p className="text-gray-600 mb-6">Mejora tu técnica en asfalto con sesiones de 1h 15min.</p>
                                <div className="flex items-center justify-between p-4 bg-[var(--surf-sand)] rounded-xl mb-6">
                                    <span className="font-bold text-[#111827]">Bono 5 Clases</span>
                                    <span className="text-2xl font-black text-[#3F7FE3]">150€</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-6">Material y protecciones incluidas.</p>
                            </div>
                            <Link href="#reservar" className="text-[#3F7FE3] font-bold flex items-center gap-2 hover:gap-3 transition-all">
                                Aprender Surfskate <ArrowRight size={20} />
                            </Link>
                        </div>

                    </div>

                </div>
            </section>

            {/* AVISOS CTA */}
            <section className="py-16 bg-[#111827] text-center" id="reservar">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl font-bold font-fredoka text-white mb-6">¿Quieres clases privadas o tienes dudas?</h2>
                    <p className="text-gray-300 mb-8">
                        Si buscas un curso intensivo, clases one-to-one o tienes cualquier pregunta sobre qué bono elegir, escríbenos.
                    </p>
                    <div className="flex justify-center flex-col sm:flex-row gap-4">
                        <Link href="/contacto" className="px-8 py-4 bg-white text-[#111827] rounded-xl font-bold text-lg transition-all hover:bg-gray-100 shadow-lg">
                            Ir a Contacto
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
