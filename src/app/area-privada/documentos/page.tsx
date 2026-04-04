import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getStudentDocuments, StudentDocumentState, DocumentStatus } from "./actions";
import { ShieldCheck, FileText, CheckCircle2, AlertCircle, Info, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DocumentStatusCard } from "../components/DocumentStatusCard";

export const metadata = {
    title: "Mis Documentos | TGN Surf School",
    description: "Gestiona tus documentos legales, consentimientos y políticas de la escuela.",
};

const STATUS_UI: Record<DocumentStatus, { icon: any, colorClass: string, bgClass: string, label: string }> = {
    SIGNED: { icon: CheckCircle2, colorClass: "text-emerald-600", bgClass: "bg-emerald-50", label: "Firmado y Aceptado" },
    PENDING: { icon: AlertCircle, colorClass: "text-red-600", bgClass: "bg-red-50", label: "Pendiente de Firma" },
    UPDATE_REQUIRED: { icon: Info, colorClass: "text-amber-600", bgClass: "bg-amber-50", label: "Actualización Requerida" },
    OPTIONAL_PENDING: { icon: AlertCircle, colorClass: "text-gray-500", bgClass: "bg-gray-50", label: "Opcional - Pendiente" }
};

export default async function DocumentosPage() {
    const user = await getUser();
    if (!user) return redirect("/login");

    const documents = await getStudentDocuments();
    
    // Grouping
    const requiredDocs = documents.filter(d => d.is_required);
    const optionalDocs = documents.filter(d => !d.is_required);

    const pendingRequired = requiredDocs.filter(d => d.status !== "SIGNED").length;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
            <Link href="/area-privada/perfil" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft size={16} /> Volver a mi perfil
            </Link>

            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black font-fredoka text-[#0F172A]">Mis Documentos</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Consulta y gestiona tus permisos y consentimientos legales de la escuela.</p>
                    </div>
                </div>
            </div>

            {pendingRequired > 0 && (
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-12 h-12 bg-amber-200 text-amber-600 rounded-full flex flex-col items-center justify-center shrink-0">
                        <AlertCircle size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-base font-bold text-amber-900">Acción Requerida</p>
                        <p className="text-sm text-amber-800 mt-1">
                            Tienes {pendingRequired} documento{pendingRequired > 1 ? "s" : ""} obligatorio{pendingRequired > 1 ? "s" : ""} pendiente{pendingRequired > 1 ? "s" : ""} de firmar. Debes aceptarlos para poder asistir a tus reservas.
                        </p>
                    </div>
                </div>
            )}

            {/* Reutilizamos directamente la DocumentStatusCard ya que es interactiva y maneja el modal */}
            <div className="mt-8">
                <h2 className="text-lg font-black text-[#0F172A] mb-4">Gestión de Documentos</h2>
                <DocumentStatusCard documents={documents} />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-hidden mt-8">
                <h2 className="text-lg font-black text-[#0F172A] mb-4">¿Por qué necesito firmar esto?</h2>
                <div className="prose prose-sm text-gray-600">
                    <p>En TGN Surf School nos tomamos muy en serio tu seguridad y tu privacidad. Los documentos legales nos permiten:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li><strong>Protección de Datos:</strong> Asegurar que tus datos de contacto y facturación se utilizan exclusivamente para los propósitos previstos.</li>
                        <li><strong>Normas de Seguridad:</strong> Garantizar que conoces las directrices básicas para disfrutar de las olas sin riesgos para ti o para el material.</li>
                        <li><strong>Material Multimedia:</strong> Pedirte permiso si deseamos capturar tus mejores momentos sobre la tabla para nuestro portfolio y redes sociales (Opcional).</li>
                    </ul>
                </div>
            </div>
            
        </div>
    );
}
