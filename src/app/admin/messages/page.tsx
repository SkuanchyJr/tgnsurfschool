import { Send, Bell, Calendar, MessageSquare } from "lucide-react";
import CampaignComposer from "./CampaignComposer";

export const metadata = {
    title: "Mensajería | Admin TGN Surf",
    description: "Canal de comunicación automática segmentada con alumnos de TGN Surf School.",
};

export default function AdminMessagesPage() {
    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A8A] to-[#3F7FE3] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/15">
                            <Send size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-[#0F172A] font-fredoka leading-none">
                                Canal de Comunicación
                            </h1>
                            <p className="text-sm text-gray-500 font-medium mt-0.5">
                                Mensajería segmentada y campañas automáticas
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats / Info pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { icon: <Bell size={15} />,        label: "Recordatorios automáticos", desc: "24h antes de cada sesión via cron" },
                        { icon: <Calendar size={15} />,    label: "Campañas segmentadas",      desc: "Por nivel, actividad o playa" },
                        { icon: <MessageSquare size={15}/>, label: "WhatsApp manual",           desc: "Mensaje preformateado listo para enviar" },
                    ].map(item => (
                        <div key={item.label} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#3F7FE3]/10 text-[#3F7FE3] rounded-xl flex items-center justify-center shrink-0">
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-700">{item.label}</p>
                                <p className="text-[11px] text-gray-400">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cron reminder info */}
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                        <Bell size={18} className="text-[#3F7FE3] shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-black text-[#1E3A8A] text-sm mb-1">Recordatorio automático pre-sesión</p>
                            <p className="text-xs text-[#3F7FE3] font-medium mb-3">
                                El sistema envía un email de recordatorio automático 24h antes de cada sesión.
                                Para activarlo, configura un cron job que llame a este endpoint:
                            </p>
                            <code className="text-xs bg-white border border-blue-200 rounded-lg px-3 py-2 block font-mono text-gray-700 break-all">
                                GET /api/cron/reminders?secret=TU_CRON_SECRET
                            </code>
                            <p className="text-xs text-gray-500 mt-2">
                                Añade <code className="bg-blue-50 px-1 rounded">CRON_SECRET=tu_clave_secreta</code> a tus variables de entorno (.env.local).
                                Puedes programarlo en <a href="https://cron-job.org" target="_blank" rel="noopener noreferrer" className="text-[#3F7FE3] font-bold underline">cron-job.org</a> (gratuito).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Campaign Composer */}
                <CampaignComposer />
            </div>
        </div>
    );
}
