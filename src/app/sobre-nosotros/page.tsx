import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Droplets, Heart, Anchor, ShieldCheck } from "lucide-react";

export const metadata = {
    title: "Sobre Nosotros | TGN Surf School",
    description: "Conoce la historia de TGN Surf School, la primera escuela de surf de Tarragona fundada por Eric Faura.",
};

export default function SobreNosotros() {
    return (
        <div className="pt-24 min-h-screen bg-white">
            {/* HEADER SECTION */}
            <section className="relative py-20 bg-[#111827] overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('/Copia de DJI_0882.JPG')] bg-cover bg-center"></div>
                <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
                    <span className="text-[#3F7FE3] font-bold tracking-widest uppercase text-sm mb-4 block">Nuestra Historia</span>
                    <h1 className="text-5xl md:text-6xl font-black text-white font-fredoka mb-6">
                        La Primera Escuela de Surf <br className="hidden md:block" /> en Tarragona
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
                        Más que enseñarte a surfear, queremos transmitirte una forma de vivir conectada con el Mediterráneo.
                    </p>
                </div>
            </section>

            {/* HISTORIA DE ERIC & LA ESCUELA */}
            <section className="py-24">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        {/* Imágenes Columna Izquierda */}
                        <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4 relative">
                            <div className="absolute -inset-4 bg-[#3F7FE3]/5 rounded-3xl -z-10 rotate-3"></div>
                            <img
                                src="/Copia de DSC05277.jpg"
                                alt="Eric Faura surfeando"
                                className="w-full h-80 object-cover rounded-2xl shadow-lg mt-8"
                            />
                            <img
                                src="/Copia de DJI_0880.JPG"
                                alt="Tarragona line up"
                                className="w-full h-80 object-cover rounded-2xl shadow-lg"
                            />
                        </div>

                        {/* Texto Columna Derecha */}
                        <div className="w-full lg:w-1/2">
                            <h2 className="text-4xl font-bold font-fredoka text-[#111827] mb-8">
                                Un proyecto nacido de <span className="text-[#3F7FE3]">pasión real</span>.
                            </h2>
                            <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-light">
                                <p>
                                    Todo empezó con <strong className="text-[#111827]">Eric Faura</strong>. Su vida siempre ha estado ligada a la costa, a las madrugadas escaneando el horizonte en busca del mejor pico y a la sal en la piel. Lo que comenzó como un amor incondicional por las olas se transformó rápidamente en una vocación: compartir esa misma sensación de libertad.
                                </p>
                                <p>
                                    Así nació <strong className="text-[#111827]">TGN Surf School</strong>. Somos orgullosamente la primera escuela de surf de Tarragona, un título que llevamos con responsabilidad. Nuestro Mediterráneo no es el océano furioso, pero tiene su magia, sus días dorados y su energía que hay que saber leer y respetar.
                                </p>
                                <p>
                                    Aquí no creamos "clientes", creamos <strong className="text-[#111827]">comunidad</strong>. Mezclamos la enseñanza técnica rigurosa con un profundo respeto por la naturaleza marina.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* VALORES */}
            <section className="py-24 bg-[var(--surf-sand)]">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold font-fredoka text-[#111827]">Nuestros Pilares</h2>
                        <p className="text-gray-600 mt-4 text-lg">Los valores que definen cada clase que impartimos.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-white hover:border-[#3F7FE3]/20 text-center">
                            <div className="w-16 h-16 bg-[#3F7FE3]/10 text-[#3F7FE3] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Droplets size={32} />
                            </div>
                            <h3 className="text-xl font-bold font-fredoka text-[#111827] mb-3">La Naturaleza</h3>
                            <p className="text-gray-600">Aprendemos a leer el mar, a entender las mareas y el viento, siempre desde el respeto ecológico.</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-white hover:border-[#3F7FE3]/20 text-center">
                            <div className="w-16 h-16 bg-[#111827]/10 text-[#111827] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-xl font-bold font-fredoka text-[#111827] mb-3">Seguridad</h3>
                            <p className="text-gray-600">Material de primera, seguros y protocolos estrictos para que tú solo te preocupes de disfrutar.</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-white hover:border-[#3F7FE3]/20 text-center">
                            <div className="w-16 h-16 bg-[#3F7FE3]/10 text-[#3F7FE3] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Anchor size={32} />
                            </div>
                            <h3 className="text-xl font-bold font-fredoka text-[#111827] mb-3">Técnica</h3>
                            <p className="text-gray-600">Metodología paso a paso real y probada, tanto en surf de agua como en surfskate de asfalto.</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-white hover:border-[#3F7FE3]/20 text-center">
                            <div className="w-16 h-16 bg-[#111827]/10 text-[#111827] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Heart size={32} />
                            </div>
                            <h3 className="text-xl font-bold font-fredoka text-[#111827] mb-3">Comunidad</h3>
                            <p className="text-gray-600">Conocerás a personas con tus mismas inquietudes. Más que clases, vivimos experiencias.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section className="py-24 bg-white text-center">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-4xl font-bold font-fredoka text-[#111827] mb-6">¿Quieres formar parte de esto?</h2>
                    <p className="text-xl text-gray-600 mb-10">Nos adaptamos a tu nivel, desde cero absoluto hasta tecnificación avanzada.</p>
                    <div className="flex justify-center gap-4">
                        <Link href="/clases" className="px-8 py-4 bg-[#3F7FE3] hover:bg-[#2A5BA6] text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                            Explorar Clases <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
