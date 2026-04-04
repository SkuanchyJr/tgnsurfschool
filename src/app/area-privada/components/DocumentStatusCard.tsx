"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, ShieldAlert, ArrowRight, FileText, Info } from "lucide-react";
import Link from "next/link";
import { StudentDocumentState, DocumentStatus } from "../documentos/actions";
import { DocumentViewerModal } from "./DocumentViewerModal";
import { useRouter } from "next/navigation";

interface DocumentStatusProps {
    documents: StudentDocumentState[];
}

const STATUS_UI: Record<DocumentStatus, { icon: any, colorClass: string, bgClass: string, label: string }> = {
    SIGNED: { icon: CheckCircle2, colorClass: "text-emerald-500", bgClass: "bg-emerald-50/50 border-emerald-100", label: "Firmado" },
    PENDING: { icon: AlertCircle, colorClass: "text-red-500", bgClass: "bg-red-50/50 border-red-100", label: "Pendiente" },
    UPDATE_REQUIRED: { icon: Info, colorClass: "text-amber-500", bgClass: "bg-amber-50/50 border-amber-100", label: "Requiere Actualización" },
    OPTIONAL_PENDING: { icon: AlertCircle, colorClass: "text-gray-400", bgClass: "bg-gray-50 border-gray-100", label: "Pendiente" }
};

export function DocumentStatusCard({ documents }: DocumentStatusProps) {
    const router = useRouter();
    const [selectedDoc, setSelectedDoc] = useState<StudentDocumentState | null>(null);

    const allRequiredAccepted = documents
        .filter(d => d.is_required)
        .every(d => d.status === "SIGNED");
        
    const pendingRequired = documents.filter(d => d.is_required && d.status !== "SIGNED").length;

    const handleDocumentAccepted = () => {
        // Refresh server data
        router.refresh();
    };

    return (
        <>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-hidden relative flex flex-col h-full">
                
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <div>
                        <h2 className="font-black text-[#0F172A] font-fredoka text-xl flex items-center gap-2">
                            <ShieldAlert size={20} className={allRequiredAccepted ? "text-emerald-500" : "text-amber-500"} /> 
                            Documentación
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Consentimientos e información legal</p>
                    </div>
                    {!allRequiredAccepted && (
                        <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                            {pendingRequired} pendiente{pendingRequired > 1 ? "s" : ""}
                        </div>
                    )}
                </div>

                <div className="space-y-3 mb-6 flex-1">
                    {documents.length === 0 ? (
                        <div className="text-center py-6">
                            <FileText size={24} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500 font-medium">No hay documentos disponibles.</p>
                        </div>
                    ) : (
                        documents.map((doc) => {
                            const ui = STATUS_UI[doc.status] || STATUS_UI.OPTIONAL_PENDING;
                            const Icon = ui.icon;

                            return (
                                <button 
                                    key={doc.id} 
                                    onClick={() => setSelectedDoc(doc)}
                                    className={`w-full text-left flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:px-4 rounded-xl border transition-all hover:shadow-md ${ui.bgClass}`}
                                >
                                    <div className="flex items-start sm:items-center gap-3 mb-2 sm:mb-0">
                                        <Icon size={18} className={`${ui.colorClass} shrink-0 mt-0.5 sm:mt-0`} />
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold ${doc.status === 'SIGNED' ? 'text-gray-700' : 'text-gray-900'}`}>
                                                {doc.title}
                                                {!doc.is_required && <span className="text-[10px] ml-2 text-gray-400 font-normal uppercase">(Opcional)</span>}
                                            </span>
                                            {doc.status === "UPDATE_REQUIRED" && (
                                                <span className="text-[10px] text-amber-600 font-bold uppercase mt-0.5">Versión v{doc.version} disponible</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-xs font-black px-2 py-1 rounded-md bg-white/50 ${ui.colorClass} self-start sm:self-auto`}>
                                        {ui.label}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="shrink-0 mt-auto">
                    {!allRequiredAccepted && documents.length > 0 && (
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left mb-4">
                            <div className="w-10 h-10 bg-amber-200 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                                <AlertCircle size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-amber-900">Documentación incompleta</p>
                                <p className="text-xs text-amber-700 mt-0.5">Firma los documentos obligatorios para acceder a tus clases con normalidad.</p>
                            </div>
                        </div>
                    )}
                    
                    <Link href="/area-privada/documentos" className="w-full text-xs font-bold text-gray-400 hover:text-ocean-600 hover:underline flex items-center justify-center sm:justify-end gap-1 transition-colors">
                        Ver mis documentos extendido <ArrowRight size={12} />
                    </Link>
                </div>
            </div>

            {selectedDoc && (
                <DocumentViewerModal 
                    document={selectedDoc} 
                    onClose={() => setSelectedDoc(null)} 
                    onAccepted={handleDocumentAccepted}
                />
            )}
        </>
    );
}
