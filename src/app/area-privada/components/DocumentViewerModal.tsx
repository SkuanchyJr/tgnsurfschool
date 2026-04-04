"use client";

import { useState } from "react";
import { X, CheckCircle2, ShieldAlert, Loader2, Info } from "lucide-react";
import { StudentDocumentState, acceptDocument } from "../documentos/actions";

interface DocumentViewerModalProps {
    document: StudentDocumentState;
    onClose: () => void;
    onAccepted?: () => void;
}

export function DocumentViewerModal({ document, onClose, onAccepted }: DocumentViewerModalProps) {
    const [acceptedChecked, setAcceptedChecked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isPending = document.status === "PENDING" || document.status === "OPTIONAL_PENDING";
    const isUpdateRequired = document.status === "UPDATE_REQUIRED";
    const needsAction = isPending || isUpdateRequired;

    const handleAccept = async () => {
        if (!acceptedChecked) return;
        setIsSubmitting(true);
        setError(null);

        try {
            await acceptDocument(document.id, document.version);
            if (onAccepted) onAccepted();
            onClose();
        } catch (e) {
            console.error(e);
            setError("Hubo un error al guardar tu aceptación. Inténtalo de nuevo.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* HEAD */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {document.is_required ? (
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Obligatorio</span>
                            ) : (
                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Opcional</span>
                            )}
                            <span className="text-gray-400 text-xs font-bold">v{document.version}</span>
                        </div>
                        <h2 className="text-xl font-black text-[#0F172A]">{document.title}</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {isUpdateRequired && (
                    <div className="bg-amber-50 border-b border-amber-100 p-4 flex gap-3 shrink-0">
                        <Info size={20} className="text-amber-500 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-amber-900">Actualización Requerida</p>
                            <p className="text-xs text-amber-700 mt-0.5">Hemos actualizado este documento. Por favor, lee la nueva versión (v{document.version}) y vuelve a darnos tu consentimiento.</p>
                        </div>
                    </div>
                )}

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
                    {document.description && (
                        <p className="text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                            <strong>Resumen:</strong> {document.description}
                        </p>
                    )}
                    
                    <div 
                        className="prose prose-sm max-w-none text-gray-700
                                   prose-headings:font-bold prose-headings:text-[#0F172A] prose-headings:mb-3 prose-headings:mt-6 first:prose-headings:mt-0
                                   prose-p:mb-4 prose-p:leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: document.content }}
                    />
                </div>

                {/* FOOTER / ACTION */}
                <div className="p-5 border-t border-gray-100 bg-white shrink-0">
                    {needsAction ? (
                        <div className="flex flex-col gap-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="mt-0.5 relative flex items-center justify-center w-5 h-5 shrink-0">
                                    <input 
                                        type="checkbox" 
                                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-ocean-500/20 checked:bg-ocean-600 checked:border-ocean-600 transition-all cursor-pointer"
                                        checked={acceptedChecked}
                                        onChange={(e) => setAcceptedChecked(e.target.checked)}
                                    />
                                    <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                </div>
                                <span className="text-sm text-gray-700 font-medium select-none group-hover:text-gray-900 transition-colors">
                                    He leído, entiendo y acepto las condiciones establecidas en este documento (v{document.version}).
                                </span>
                            </label>

                            {error && <p className="text-xs text-red-500 font-bold">{error}</p>}

                            <button 
                                disabled={!acceptedChecked || isSubmitting}
                                onClick={handleAccept}
                                className="w-full sm:w-auto self-end px-6 py-2.5 bg-ocean-600 hover:bg-ocean-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <><Loader2 size={16} className="animate-spin" /> Guardando...</>
                                ) : (
                                    "Aceptar Documento"
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm font-bold w-full sm:w-auto justify-center">
                                <CheckCircle2 size={16} />
                                Documento Firmado y Aceptado
                            </div>
                            {document.accepted_at && (
                                <p className="text-xs text-gray-500 font-medium">
                                    Aceptado el {new Date(document.accepted_at).toLocaleString("es-ES", {
                                        day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                                    })}
                                </p>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
