"use client";

import { X } from "lucide-react";

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LegalModal({ isOpen, onClose }: LegalModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 font-fredoka leading-tight">
                            Condiciones Legales de Participación
                        </h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                            Versión Abril 2026
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body - Scrollable content */}
                <div className="p-8 overflow-y-auto text-slate-600 space-y-8 prose prose-slate prose-sm max-w-none">
                    
                    <section>
                        <h3 className="text-slate-900 font-bold text-lg mb-4 flex items-center gap-2">
                            Términos y Condiciones de Reserva y Participación
                        </h3>
                        <p className="font-bold text-slate-700">TGN Surf School / La Pineda Surf Club</p>
                        
                        <div className="mt-4 space-y-4">
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">1. Objeto</h4>
                                <p>Las presentes condiciones regulan la reserva, participación y asistencia a las actividades organizadas por TGN Surf School / La Pineda Surf Club, incluyendo clases de surf, sesiones técnicas, actividades para grupos, experiencias Erasmus, entrenamientos específicos y demás servicios deportivos ofertados a través de la página web.</p>
                                <p>La realización de una reserva implica la aceptación íntegra de las presentes condiciones.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">2. Datos personales y privacidad</h4>
                                <p>Los datos facilitados por el usuario serán tratados con la finalidad de gestionar reservas, pagos, control de bonos y packs, historial deportivo, seguimiento de progresión técnica, contacto de emergencia, recordatorios automáticos, comunicaciones relativas al servicio y mejora continua de la experiencia.</p>
                                <p>La escuela aplicará las medidas de seguridad y confidencialidad necesarias conforme al Reglamento General de Protección de Datos (RGPD).</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">3. Requisitos de participación</h4>
                                <p>La persona participante declara: saber nadar, encontrarse en condiciones físicas adecuadas, participar de forma voluntaria, aceptar los riesgos inherentes al surf y al medio marino e informar de cualquier lesión, alergia, asma o limitación relevante.</p>
                                <p>La escuela se reserva el derecho de adaptar la sesión o limitar la participación cuando existan circunstancias que puedan comprometer la seguridad del alumno o del grupo.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">4. Seguro y responsabilidad civil</h4>
                                <p>La escuela dispone de seguro de responsabilidad civil profesional aplicable al desarrollo de las actividades dirigidas dentro del marco de la actividad profesional.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">5. Reservas, pagos y cancelaciones</h4>
                                <p>La reserva quedará confirmada tras completar el pago o señal establecida. Las cancelaciones deberán comunicarse con un mínimo de 24 horas de antelación. La no asistencia sin previo aviso podrá suponer la pérdida de la señal, consumo automático de la sesión o descuento del bono.</p>
                                <p>Cuando las condiciones meteorológicas o del mar no sean seguras, la escuela podrá reprogramar la sesión, modificar horario o reagendar sin coste.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">6. Uso de imágenes y contenido audiovisual</h4>
                                <p>Durante las sesiones podrán captarse fotografías y vídeos con fines educativos, corrección técnica, comunicación con el alumno, promoción de la escuela, página web, redes sociales y campañas publicitarias.</p>
                                <p>En caso de no querer aparecer en dicho contenido, deberá comunicarse al instructor antes del inicio de la actividad.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">7. Menores de edad</h4>
                                <p>La participación de menores requerirá la autorización expresa de padre, madre o tutor legal. La persona responsable declara que el menor sabe nadar, está en condiciones adecuadas y cuenta con autorización para participar.</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-sand-50 p-6 rounded-2xl border border-sand-200">
                        <h3 className="text-slate-900 font-bold text-lg mb-4">Normas de la Escuela</h3>
                        <p className="text-sm leading-relaxed">
                            La persona participante declara saber nadar, encontrarse en condiciones físicas adecuadas para la práctica del surf y participar de forma voluntaria, aceptando los riesgos inherentes al medio marino, al oleaje, corrientes, fondo y uso del material deportivo durante las clases.
                        </p>
                        <p className="text-sm leading-relaxed mt-3">
                            Será obligatorio seguir en todo momento las indicaciones del instructor, respetar las normas de seguridad en el agua, mantener una actitud adecuada con el grupo y utilizar correctamente el material facilitado durante la sesión.
                        </p>
                        <p className="text-sm leading-relaxed mt-3">
                            Las cancelaciones deberán comunicarse con un mínimo de 24 horas de antelación. La no asistencia sin previo aviso podrá comportar el consumo automático de la sesión.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-slate-900 font-bold text-lg mb-4">Derechos de Imagen</h3>
                        <p className="text-sm leading-relaxed">
                            Podrán realizarse fotografías y vídeos con fines educativos, corrección técnica, promoción de la escuela, redes sociales y campañas publicitarias. 
                            La aceptación de la reserva implica la autorización para la captación y uso de este contenido audiovisual dentro del ámbito profesional de la escuela.
                        </p>
                    </section>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-sand-50/50 flex justify-center">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-ocean-500 text-white rounded-xl font-bold hover:bg-ocean-600 transition-all shadow-lg shadow-ocean-500/20"
                    >
                        Entendido, cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
