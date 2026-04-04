import { Camera, Lock, Video } from "lucide-react";

export const metadata = {
    title: "Webcam en Directo | TGN Surf School",
    description: "Consulta el estado del mar en vivo desde nuestra webcam exclusiva en Tarragona.",
};

export default function WebcamPage() {
    return (
        <div className="pt-24 min-h-screen bg-[#111827]">
            {/* HEADER SECTION */}
            <section className="py-16 text-center px-4 lg:px-8">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 text-red-500 text-sm font-bold mb-6 tracking-widest uppercase border border-red-500/30">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> EN DIRECTO
                </span>
                <h1 className="text-5xl md:text-6xl font-black text-white font-fredoka mb-6">
                    Webcam La Pineda
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                    No te imagines las olas. Míralas.
                </p>
            </section>

            {/* WEBCAM VIEWER */}
            <section className="pb-24">
                <div className="container mx-auto px-4 lg:px-8 max-w-6xl">

                    <div className="bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-video relative group flex items-center justify-center">

                        {/* Mockup de Imagen de Webcam */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544414603-fc01db8c2274?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-80 mix-blend-luminosity brightness-75 filter blur-[2px]"></div>

                        {/* Paywall / Socio overlay arquitectónico */}
                        <div className="relative z-10 bg-[#111827]/80 backdrop-blur-xl p-10 md:p-16 rounded-[2rem] max-w-xl text-center border border-white/10 shadow-2xl m-4 transform transition-transform group-hover:scale-105 duration-500">
                            <div className="w-16 h-16 bg-[#3F7FE3]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Lock className="text-[#3F7FE3]" size={32} />
                            </div>
                            <h3 className="text-2xl font-bold font-fredoka text-white mb-4">Acceso Exclusivo Socios</h3>
                            <p className="text-gray-300 mb-8 leading-relaxed">
                                La visualización de nuestra cámara HD en directo con refresco a 60fps y sin publicidad es un servicio exclusivo para miembros de la TGN Surf Community y alumnos con bonos activos.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="px-8 py-3 bg-[#3F7FE3] text-white font-bold rounded-xl hover:bg-[#2A5BA6] transition-colors shadow-lg shadow-[#3F7FE3]/20">
                                    Iniciar Sesión
                                </button>
                                <button className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                                    Hazte Miembro
                                </button>
                            </div>
                        </div>

                        {/* UI overlay parameters */}
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-white font-mono text-sm border border-white/10 opacity-70">
                            CAM_01_PINEDA_NORD | 1080p 60FPS
                        </div>
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-white font-mono text-sm border border-white/10 flex items-center gap-2 opacity-70">
                            <Video size={16} className="text-gray-400" /> REC
                        </div>

                    </div>

                    <div className="mt-12 text-center text-gray-500 max-w-2xl mx-auto">
                        <p className="text-sm">
                            * Nota de desarrollo: Esta sección está preparada arquitectónicamente para incrustar un iframe a YouTube Live, Skyline Webcams, o un stream RTSP propio de la escuela protegidos tras login.
                        </p>
                    </div>

                </div>
            </section>
        </div>
    );
}
