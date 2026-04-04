import Link from "next/link";
import { ArrowRight, Calendar, Users, MapPin, CheckCircle } from "lucide-react";

export const metadata = {
    title: "Programas Extraescolares y Escuela de Verano | TGN Surf School",
    description: "Descubre nuestros programas recurrentes: extraescolar de surf/surfskate durante el curso y nuestra escuela de verano en Tarragona.",
};

export default function ProgramasPage() {
    return (
        <div className="pt-24 min-h-screen bg-white">
            {/* HEADER SECTION */}
            <section className="py-20 bg-[#111827] text-center px-4 lg:px-8">
                <span className="text-[#3F7FE3] font-bold tracking-widest uppercase text-sm mb-4 block">Rutina y Deporte</span>
                <h1 className="text-5xl md:text-6xl font-black text-white font-fredoka mb-6">
                    Nuestros Programas
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
                    Para los que quieren surfear todo el año o buscan la mejor experiencia para el verano.
                </p>
            </section>

            {/* EXTRAESCOLAR */}
            <section className="py-24" id="extraescolar">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="w-full lg:w-1/2">
                            <h2 className="text-4xl font-bold font-fredoka text-[#111827] mb-6">
                                Extraescolar de<br /> <span className="text-[#3F7FE3]">Surf & Surfskate</span>
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Un programa serio, recurrente y educativo para aquellos que quieren incorporar el boardriding a su rutina semanal. Si el mar acompaña, surfeamos las olas. Si el Mediterráneo está plato, el asfalto es nuestro patio de recreo con el surfskate.
                            </p>

                            <div className="space-y-6 mb-10">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--surf-sand)]">
                                    <Users className="text-[#3F7FE3] shrink-0" size={24} />
                                    <div>
                                        <h4 className="font-bold text-[#111827]">Grupos por edades</h4>
                                        <p className="text-gray-600">Grupos infantiles y de adultos organizados.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--surf-sand)]">
                                    <Calendar className="text-[#3F7FE3] shrink-0" size={24} />
                                    <div>
                                        <h4 className="font-bold text-[#111827]">Martes y Jueves (17:30 - 19:00)</h4>
                                        <p className="text-gray-600">Rutina fija b semanal para garantizar progresión.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--surf-sand)]">
                                    <MapPin className="text-[#3F7FE3] shrink-0" size={24} />
                                    <div>
                                        <h4 className="font-bold text-[#111827]">Ubicaciones Flexibles</h4>
                                        <p className="text-gray-600">Platja de la Pineda, Miracle, Arrabassada. <br />Skateparks de Salou y Reus para asfalto.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="bg-[#111827] text-white px-6 py-4 rounded-xl flex-1 text-center">
                                    <span className="block text-sm text-gray-400 mb-1">Niños (Mensual)</span>
                                    <span className="text-3xl font-bold">59€</span>
                                </div>
                                <div className="bg-[#111827] text-white px-6 py-4 rounded-xl flex-1 text-center">
                                    <span className="block text-sm text-gray-400 mb-1">Adultos (Mensual)</span>
                                    <span className="text-3xl font-bold">90€</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-4 text-center sm:text-left">* +30€ matrícula inicial que incluye pack de bienvenida.</p>
                        </div>

                        <div className="w-full lg:w-1/2">
                            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1596489391099-0785081c7e93?q=80&w=1000&auto=format&fit=crop"
                                    alt="Niños en clase de surf"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ESCUELA DE VERANO */}
            <section className="py-24 bg-[var(--surf-sand)]" id="verano">
                <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold font-fredoka text-[#111827] mb-6">
                            Escuela de Verano
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Mañanas activas orientadas a la diversión y conexión con el mar. Orientado a niños y jóvenes activos que no quieren pasar el verano en el sofá.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-transparent hover:border-[#3F7FE3]/30 transition-colors">
                            <h4 className="text-xl font-bold text-[#111827] mb-4 flex items-center gap-2"><Calendar className="text-[#3F7FE3]" /> Cuándo y Dónde</h4>
                            <ul className="space-y-3 text-gray-600">
                                <li>• 25 Junio al 30 de Agosto</li>
                                <li>• Lunes a Viernes</li>
                                <li>• 09:00 a 13:00 h</li>
                                <li>• Bases en Tarragona</li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-transparent hover:border-[#3F7FE3]/30 transition-colors">
                            <h4 className="text-xl font-bold text-[#111827] mb-4 flex items-center gap-2"><CheckCircle className="text-[#3F7FE3]" /> Qué Hacemos</h4>
                            <ul className="space-y-3 text-gray-600">
                                <li>• Clases de Surf guiadas</li>
                                <li>• Surfskate y Skate tradicional</li>
                                <li>• Paddle Surf (SUP)</li>
                                <li>• Juegos y talleres en arena</li>
                            </ul>
                        </div>
                        <div className="bg-[#111827] text-white p-6 rounded-3xl shadow-lg border border-[#3F7FE3]/30">
                            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2 text-[#3F7FE3]">👕 Qué Traer</h4>
                            <ul className="space-y-3 text-gray-300">
                                <li>✓ Bañador y ropa deportiva</li>
                                <li>✓ Chanclas o zapatillas</li>
                                <li>✓ Poncho o toalla</li>
                                <li>✓ Almuerzo, agua y crema solar</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3F7FE3]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <h3 className="text-3xl font-bold font-fredoka text-[#111827] mb-10 text-center">Tarifas Verano</h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-4xl mx-auto mb-10">
                            <div className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50">
                                <span className="block text-gray-500 mb-2">1 Día</span>
                                <span className="text-3xl font-bold text-[#3F7FE3]">35€</span>
                            </div>
                            <div className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50">
                                <span className="block text-gray-500 mb-2">1 Semana</span>
                                <span className="text-3xl font-bold text-[#3F7FE3]">110€</span>
                            </div>
                            <div className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50">
                                <span className="block text-gray-500 mb-2">2 Semanas</span>
                                <span className="text-3xl font-bold text-[#3F7FE3]">200€</span>
                            </div>
                            <div className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50">
                                <span className="block text-gray-500 mb-2">3 Semanas</span>
                                <span className="text-3xl font-bold text-[#3F7FE3]">265€</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 max-w-2xl mx-auto text-center mb-8">
                            <span className="bg-gray-100 px-4 py-2 rounded-full">4 Semanas: <strong className="text-[#111827]">315€</strong></span>
                            <span className="bg-gray-100 px-4 py-2 rounded-full">Semanas extra: <strong className="text-[#111827]">65€/semana</strong></span>
                            <span className="bg-gray-100 px-4 py-2 rounded-full">Camiseta: <strong className="text-[#111827]">10€</strong></span>
                        </div>

                        <div className="bg-[#3F7FE3]/10 text-[#111827] p-4 rounded-xl text-center font-bold mb-10 max-w-md mx-auto">
                            ¡10% de descuento para hermanos!
                        </div>

                        <div className="text-center">
                            <Link href="/contacto" className="inline-flex items-center gap-2 px-8 py-4 bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:-translate-y-1">
                                Solicitar Plaza <ArrowRight size={20} />
                            </Link>
                            <p className="mt-4 text-sm text-gray-500">* Plazas limitadas</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
