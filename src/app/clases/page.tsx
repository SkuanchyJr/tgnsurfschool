import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Camera, Clock, Zap, Target } from "lucide-react";

export const metadata = {
    title: "Clases de Surf y Surfskate | TGN Surf School",
    description: "Aprende a surfear en Tarragona con nuestras clases de surf de 2 horas y de surfskate de 1h 15m. Todo el material incluido.",
};

export default function ClasesPage() {
    return (
        <div className="pt-24 min-h-screen bg-[var(--surf-sand)]">
            {/* HEADER SECTION */}
            <section className="py-16 bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 lg:px-8 text-center max-w-4xl">
                    <span className="text-[#3F7FE3] font-bold tracking-widest uppercase text-sm mb-4 block">Nuestros Servicios</span>
                    <h1 className="text-5xl md:text-6xl font-black text-[#111827] font-fredoka mb-6">
                        Clases de Surf & Surfskate
                    </h1>
                    <p className="text-xl text-gray-600 font-light">
                        Experiencias deportivas premium y en conexión con la costa. Nos adaptamos a las condiciones del mar para ofrecerte la sesión perfecta.
                    </p>
                </div>
            </section>

            {/* CLASES DE SURF */}
            <section className="py-20" id="surf">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl relative">
                                <img
                                    src="https://images.unsplash.com/photo-1544551763-8a3fcab89196?q=80&w=1000&auto=format&fit=crop"
                                    alt="Clases de surf en agua"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/60 via-transparent to-transparent flex items-end p-8">
                                    <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-medium border border-white/30 truncate">
                                        📍 La Pineda & Platja del Miracle
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3F7FE3]/10 text-[#3F7FE3] font-bold text-sm mb-4">
                                <Target size={16} /> Agua
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold font-fredoka text-[#111827] mb-6 shadow-sm">
                                Clases de Surf
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Nuestras sesiones en el agua están diseñadas para exprimir al máximo cada ola. Ya sea tu primer día o vengas a perfeccionar tu "pato" y "take off", te garantizamos aprendizaje, diversión y progresión continua.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-r-6 gap-y-6 mb-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-[#111827]">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#111827]">2 Horas</h4>
                                        <p className="text-sm text-gray-500">Duración total</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-[#3F7FE3]">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#111827]">Seguro Incluido</h4>
                                        <p className="text-sm text-gray-500">RC y Accidentes</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-[#111827]">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#111827]">Horario Flexible</h4>
                                        <p className="text-sm text-gray-500">Según mar/condiciones</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-[#3F7FE3]">
                                        <Camera size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#111827]">Fotos y Vídeos</h4>
                                        <p className="text-sm text-gray-500">Para tu recuerdo</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
                                <h4 className="font-bold text-[#111827] mb-4">¿Qué incluye la clase?</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-2 text-gray-600"><CheckCircle2 className="text-[#3F7FE3] shrink-0" size={20} /> Teoría de las corrientes y el mar.</li>
                                    <li className="flex gap-2 text-gray-600"><CheckCircle2 className="text-[#3F7FE3] shrink-0" size={20} /> Calentamiento específico.</li>
                                    <li className="flex gap-2 text-gray-600"><CheckCircle2 className="text-[#3F7FE3] shrink-0" size={20} /> Práctica de simulación en la arena.</li>
                                    <li className="flex gap-2 text-gray-600"><CheckCircle2 className="text-[#3F7FE3] shrink-0" size={20} /> Entrada al agua junto al monitor.</li>
                                    <li className="flex gap-2 text-gray-600"><CheckCircle2 className="text-[#3F7FE3] shrink-0" size={20} /> Material: tabla de surf adecuada, neopreno y leash.</li>
                                </ul>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/precios" className="px-8 py-4 bg-[#111827] text-white rounded-xl font-bold text-center hover:bg-[#1F2937] transition-all shadow-lg hover:-translate-y-1">
                                    Ver Tarifas y Bonos
                                </Link>
                                <Link href="/#reservar" className="px-8 py-4 bg-white border border-gray-200 text-[#111827] rounded-xl font-bold text-center hover:border-[#3F7FE3] hover:text-[#3F7FE3] transition-all">
                                    Reservar Ahora
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SURFSKATE */}
            <section className="py-24 bg-white border-t border-gray-100" id="surfskate">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        <div className="order-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111827]/10 text-[#111827] font-bold text-sm mb-4">
                                <Target size={16} /> Asfalto
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold font-fredoka text-[#111827] mb-6 shadow-sm">
                                Clases de Surfskate
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Cuando el mar está plato, el asfalto es nuestra ola. El surfskate es la mejor herramienta para tecnificar tus movimientos de surf: mejora tu equilibrio, tu postura, el bombeo y las maniobras de manera repetitiva.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-r-6 gap-y-6 mb-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--surf-sand)] flex items-center justify-center shrink-0 shadow-sm text-[#111827]">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#111827]">1h 15min</h4>
                                        <p className="text-sm text-gray-500">Dinámicas e intensas</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--surf-sand)] flex items-center justify-center shrink-0 shadow-sm text-[#3F7FE3]">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#111827]">Protecciones</h4>
                                        <p className="text-sm text-gray-500">Casco, rodilleras incluidas</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[var(--surf-sand)] p-6 rounded-2xl border border-transparent mb-8">
                                <h4 className="font-bold text-[#111827] mb-4">¿Qué incluye la sesión?</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-2 text-gray-600"><CheckCircle2 className="text-[#3F7FE3] shrink-0" size={20} /> Teoría de transferencia del surf al skate.</li>
                                    <li className="flex gap-2 text-gray-600"><CheckCircle2 className="text-[#3F7FE3] shrink-0" size={20} /> Material: Surfskate (Yow, Carver, Smoothstar...)</li>
                                    <li className="flex gap-2 text-gray-600"><CheckCircle2 className="text-[#3F7FE3] shrink-0" size={20} /> Equipamiento de seguridad completo.</li>
                                    <li className="flex gap-2 text-gray-600"><CheckCircle2 className="text-[#3F7FE3] shrink-0" size={20} /> Seguimiento con fotos y vídeos para corrección.</li>
                                    <li className="flex gap-2 text-gray-600"><CheckCircle2 className="text-[#3F7FE3] shrink-0" size={20} /> Seguro de Responsabilidad Civil.</li>
                                </ul>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/precios" className="px-8 py-4 bg-[#3F7FE3] hover:bg-[#2A5BA6] text-white rounded-xl font-bold text-center transition-all shadow-lg hover:-translate-y-1">
                                    Ver Tarifas Surfskate
                                </Link>
                                <Link href="/programas" className="px-8 py-4 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-center hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                    Ver Programa Activo <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>

                        <div className="order-2 relative">
                            <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl relative">
                                <img
                                    src="https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?q=80&w=1000&auto=format&fit=crop"
                                    alt="Surfskate"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/60 via-transparent to-transparent flex items-end p-8">
                                    <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-medium border border-white/30 truncate">
                                        📍 Paseos / Skateparks locales
                                    </span>
                                </div>
                            </div>

                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#3F7FE3]/10 rounded-full blur-2xl -z-10"></div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
