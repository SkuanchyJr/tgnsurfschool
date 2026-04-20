import Link from "next/link";
import { ArrowRight, Info, Anchor } from "lucide-react";

export const metadata = {
    title: "Alquiler de Material | TGN Surf School",
    description: "Alquiler de tablas de surf y neoprenos en Tarragona. Equipamiento de primera calidad para todos los niveles.",
};

export default function AlquilerPage() {
    return (
        <div className="pt-24 min-h-screen bg-[var(--surf-sand)]">
            {/* HEADER SECTION */}
            <section className="py-20 bg-white border-b border-gray-100 text-center px-4 lg:px-8">
                <span className="text-[#3F7FE3] font-bold tracking-widest uppercase text-sm mb-4 block">Independent Surfing</span>
                <h1 className="text-5xl md:text-6xl font-black text-[#111827] font-fredoka mb-6">
                    Alquiler de Material
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
                    ¿Ya sabes surfear y solo necesitas el equipo? Tenemos el mejor material esperándote a pie de playa.
                </p>
            </section>

            {/* CONTENT */}
            <section className="py-24">
                <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">

                        {/* Tablas */}
                        <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-transparent hover:border-[#3F7FE3]/20 transition-all flex flex-col group">
                            <div className="h-64 overflow-hidden">
                                <img
                                    src="/Copia de DSC05234.jpg"
                                    alt="Tablas de surf"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold font-fredoka text-[#111827] mb-4">Tablas de Surf</h3>
                                <p className="text-gray-600 mb-6 flex-1">
                                    Disponemos de una amplia gama de tablas Softboard ideales para olas del Mediterráneo y aprendizaje, así como evolutivas (Hardboards) para surfistas de nivel intermedio.
                                </p>
                                <div className="bg-[var(--surf-sand)] p-4 rounded-xl flex items-start gap-3">
                                    <Info className="text-[#3F7FE3] shrink-0" size={20} />
                                    <p className="text-sm text-gray-700 font-medium">Incluye invento (leash) y cera. Consulta disponibilidad de medidas.</p>
                                </div>
                            </div>
                        </div>

                        {/* Neoprenos */}
                        <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-transparent hover:border-[#3F7FE3]/20 transition-all flex flex-col group">
                            <div className="h-64 overflow-hidden">
                                <img
                                    src="/Copia de DSC03283.jpg"
                                    alt="Neoprenos"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold font-fredoka text-[#111827] mb-4">Neoprenos</h3>
                                <p className="text-gray-600 mb-6 flex-1">
                                    Neoprenos de altas prestaciones (3/2mm, 4/3mm) lavados y desinfectados tras cada uso. Marcas reconocidas para garantizar tu confort y aislamiento térmico en el mar.
                                </p>
                                <div className="bg-[var(--surf-sand)] p-4 rounded-xl flex items-start gap-3">
                                    <Info className="text-[#3F7FE3] shrink-0" size={20} />
                                    <p className="text-sm text-gray-700 font-medium">Disponibles en todas las tallas (niños, mujer, hombre).</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* TARIFAS CTA / INFO */}
                    <div className="bg-[#111827] rounded-[3rem] p-10 md:p-16 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3F7FE3]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10">
                            <Anchor className="mx-auto text-[#6A9DF0] mb-6" size={48} />
                            <h2 className="text-3xl md:text-5xl font-bold font-fredoka mb-6">
                                Consulta nuestras tarifas de alquiler por horas o por el día completo.
                            </h2>
                            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light">
                                Puedes hacernos tu consulta directamente por WhatsApp para confirmar stock y condiciones del mar antes de bajar a la playa.
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a href="https://wa.me/34678502482" className="px-8 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2">
                                    Consultar Disponibilidad
                                </a>
                                <Link href="/precios" className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center">
                                    Ver Tabla de Precios
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
