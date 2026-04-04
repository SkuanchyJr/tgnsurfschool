import { MapPin, Phone, Mail, Instagram, Send, Clock } from "lucide-react";

export const metadata = {
    title: "Contacto | TGN Surf School",
    description: "Contacta con TGN Surf School. Reserva tu clase en La Pineda o Platja del Miracle.",
};

export default function ContactoPage() {
    return (
        <div className="pt-24 min-h-screen bg-white">
            {/* HEADER SECTION */}
            <section className="py-20 bg-[var(--surf-sand)] text-center px-4 lg:px-8 border-b border-gray-100">
                <span className="text-[#3F7FE3] font-bold tracking-widest uppercase text-sm mb-4 block">Hablemos</span>
                <h1 className="text-5xl md:text-6xl font-black text-[#111827] font-fredoka mb-6">
                    Contacto & Reservas
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
                    Te resolvemos cualquier duda sobre niveles, condiciones del mar o alquiler de material.
                </p>
            </section>

            {/* INFO & FORM */}
            <section className="py-24">
                <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                        {/* Contact Info */}
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-3xl font-bold font-fredoka text-[#111827] mb-8">Información Directa</h2>
                                <div className="space-y-6">

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-[#25D366]/10 text-[#25D366] rounded-2xl flex items-center justify-center shrink-0">
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#111827]">Teléfono / WhatsApp</h4>
                                            <a href="https://wa.me/34678502482" className="text-gray-600 hover:text-[#25D366] transition-colors text-lg">+34 678 502 482</a>
                                            <p className="text-sm text-gray-400 mt-1">La forma más rápida de saber si hay olas hoy.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-[#3F7FE3]/10 text-[#3F7FE3] rounded-2xl flex items-center justify-center shrink-0">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#111827]">Email</h4>
                                            <a href="mailto:tgnsurfschool@gmail.com" className="text-gray-600 hover:text-[#3F7FE3] transition-colors text-lg">tgnsurfschool@gmail.com</a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-pink-500/10 text-pink-500 rounded-2xl flex items-center justify-center shrink-0">
                                            <Instagram size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#111827]">Instagram</h4>
                                            <a href="https://instagram.com/tgnsurfschool" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-500 transition-colors text-lg">@tgnsurfschool</a>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold font-fredoka text-[#111827] mb-8">Ubicaciones</h2>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="bg-[var(--surf-sand)] p-6 rounded-2xl">
                                        <MapPin className="text-[#3F7FE3] mb-3" size={24} />
                                        <h4 className="font-bold text-[#111827]">Platja de la Pineda</h4>
                                        <p className="text-sm text-gray-500 mt-2">Nuestra ubicación principal para días con marejadas de Levante fuertes, muy resguardada.</p>
                                    </div>
                                    <div className="bg-[var(--surf-sand)] p-6 rounded-2xl">
                                        <MapPin className="text-[#3F7FE3] mb-3" size={24} />
                                        <h4 className="font-bold text-[#111827]">Platja del Miracle</h4>
                                        <p className="text-sm text-gray-500 mt-2">La playa urbana de Tarragona, ideal para el swell de sur y extraescolares.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FORM */}
                        <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 border border-gray-100">
                            <h3 className="text-2xl font-bold font-fredoka text-[#111827] mb-2">Envíanos un mensaje</h3>
                            <p className="text-gray-500 mb-8">Responderemos lo antes posible para confirmar tu reserva o resolver tus dudas.</p>

                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#111827]">Nombre</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3F7FE3] focus:ring-2 focus:ring-[#3F7FE3]/20 bg-[var(--surf-sand)]"
                                            placeholder="Ej. Laura García"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#111827]">Teléfono</label>
                                        <input
                                            type="tel"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3F7FE3] focus:ring-2 focus:ring-[#3F7FE3]/20 bg-[var(--surf-sand)]"
                                            placeholder="+34 600 000 000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#111827]">Motivo</label>
                                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3F7FE3] focus:ring-2 focus:ring-[#3F7FE3]/20 bg-[var(--surf-sand)] appearance-none">
                                        <option value="">Selecciona una opción...</option>
                                        <option value="surf">Reserva Clase de Surf</option>
                                        <option value="surfskate">Reserva Clase de Surfskate</option>
                                        <option value="bono">Comprar Bono</option>
                                        <option value="verano">Escuela de Verano / Extraescolar</option>
                                        <option value="alquiler">Alquiler de Material</option>
                                        <option value="otro">Otras consultas</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#111827]">Mensaje / Nivel</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3F7FE3] focus:ring-2 focus:ring-[#3F7FE3]/20 bg-[var(--surf-sand)] resize-none"
                                        placeholder="Cuéntanos si tienes experiencia previa, fechas preferidas, cuántas personas sois, etc."
                                    ></textarea>
                                </div>

                                <button
                                    type="button"
                                    className="w-full px-6 py-4 bg-[#111827] text-white font-bold rounded-xl hover:bg-[#1F2937] transition-colors shadow-lg flex items-center justify-center gap-2"
                                >
                                    Enviar Mensaje <Send size={18} />
                                </button>
                                <p className="text-xs text-center text-gray-400 mt-4">
                                    Al enviar aceptas nuestra política de privacidad.
                                </p>
                            </form>
                        </div>

                    </div>
                </div>
            </section>

            {/* MAPA PLACEHOLDER (iframe visual) */}
            <section className="h-96 w-full bg-gray-200 relative">
                <div className="absolute inset-0 bg-[#111827]/10 flex items-center justify-center overflow-hidden">
                    {/* Un iframe real a Google Maps podría ir aquí, por ahora usamos un placeholder visual premium */}
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
                    <div className="absolute p-6 bg-white rounded-2xl shadow-2xl flex items-center gap-4 hover:scale-105 transition-transform z-10 cursor-pointer">
                        <div className="w-12 h-12 bg-[#3F7FE3] rounded-full flex items-center justify-center animate-bounce shadow-lg">
                            <MapPin className="text-white" size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#111827]">Abrir en Google Maps</h4>
                            <p className="text-sm text-gray-500">TGN Surf School</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
