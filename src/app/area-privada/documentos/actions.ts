"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type DocumentStatus = "SIGNED" | "PENDING" | "UPDATE_REQUIRED" | "OPTIONAL_PENDING";

export interface LegalDocument {
    id: string;
    type: string;
    title: string;
    description?: string;
    content: string;
    is_required: boolean;
    version: number;
    updated_at: string;
}

export interface DocumentAcceptance {
    document_id: string;
    accepted_version: number;
    accepted_at: string;
}

export interface StudentDocumentState extends LegalDocument {
    status: DocumentStatus;
    accepted_at?: string;
    accepted_version?: number;
}

/**
 * ---------------------------------------------------------------------------
 * 🛠 MOCK DATA - PREPARADO PARA MIGRAR A SUPABASE
 * ---------------------------------------------------------------------------
 * Esta tabla reemplazaría a la real `legal_documents` en tu base de datos.
 */
const MOCK_LEGAL_DOCUMENTS: LegalDocument[] = [
    {
        id: "doc_rgpd_01",
        type: "rgpd",
        title: "Política de Privacidad (RGPD)",
        description: "Consentimiento para el tratamiento de tus datos personales, facturación y gestión de reservas.",
        content: `<h3>1. Responsable del Tratamiento</h3>
<p>TGN Surf School S.L. es el responsable del tratamiento de los datos personales del Alumno/a.</p>
<h3>2. Finalidad</h3>
<p>Mantener una relación comercial y el envío de comunicaciones sobre nuestros productos y servicios.</p>
<h3>3. Legitimación</h3>
<p>Consentimiento del interesado.</p>
<h3>4. Conservación</h3>
<p>Se conservarán mientras exista un interés mutuo para mantener el fin del tratamiento.</p>`,
        is_required: true,
        version: 2, // Si cambias esto a 3, a los alumnos les saldrá "Requiere actualización"
        updated_at: "2026-03-01T10:00:00Z"
    },
    {
        id: "doc_rules_01",
        type: "rules",
        title: "Normas de la Escuela",
        description: "Reglamento interno, seguridad en el agua y política de cancelaciones.",
        content: `<h3>1. Seguridad en el Agua</h3>
<p>El alumno debe seguir en todo momento las instrucciones del monitor. No se permite alejarse del grupo sin permiso.</p>
<h3>2. Material</h3>
<p>El material prestado (tabla, neopreno) debe ser devuelto en su estado original y limpio de arena.</p>
<h3>3. Cancelaciones</h3>
<p>Las clases deben cancelarse con al menos 24 horas de antelación para no perder la sesión del bono o la reserva.</p>`,
        is_required: true,
        version: 1,
        updated_at: "2025-01-15T09:00:00Z"
    },
    {
        id: "doc_image_01",
        type: "image_rights",
        title: "Derechos de Imagen",
        description: "Permiso para tomar fotografías y vídeos durante las clases para nuestras redes sociales.",
        content: `<h3>Uso de Imágenes</h3>
<p>Autorizo a TGN Surf School a tomar imágenes (fotografías y vídeos) durante el desarrollo de las actividades deportivas.</p>
<p>Dichas imágenes podrán ser utilizadas exclusivamente para la promoción de la escuela en su página web, redes sociales y material publicitario, siempre respetando mi honor e intimidad.</p>
<p>Este consentimiento es revocable en cualquier momento notificándolo por escrito.</p>`,
        is_required: false,
        version: 1,
        updated_at: "2025-01-15T09:00:00Z"
    }
];

/**
 * 🔑 COOKIE KEY MOCK
 * En producción esto se buscará en Supabase: `select * from user_document_acceptances where user_id = auth.uid()`
 */
const ACCEPTANCES_COOKIE_KEY = "mock_tgn_document_acceptances";

export async function getStudentDocuments(): Promise<StudentDocumentState[]> {
    // 1. Simular latencia de red para UX más real
    await new Promise(resolve => setTimeout(resolve, 400));

    const cookieStore = await cookies();
    const acceptancesCookie = cookieStore.get(ACCEPTANCES_COOKIE_KEY)?.value;
    
    let acceptances: DocumentAcceptance[] = [];
    if (acceptancesCookie) {
        try {
            acceptances = JSON.parse(acceptancesCookie);
        } catch (e) {
            acceptances = [];
        }
    }

    // 2. Cruzar documentos existentes con las aceptaciones del alumno
    const documentStates: StudentDocumentState[] = MOCK_LEGAL_DOCUMENTS.map(doc => {
        const acc = acceptances.find(a => a.document_id === doc.id);
        
        let status: DocumentStatus;

        if (!acc) {
            status = doc.is_required ? "PENDING" : "OPTIONAL_PENDING";
        } else if (acc.accepted_version < doc.version) {
            status = "UPDATE_REQUIRED";
        } else {
            status = "SIGNED";
        }

        return {
            ...doc,
            status,
            accepted_version: acc?.accepted_version,
            accepted_at: acc?.accepted_at
        };
    });

    return documentStates;
}

export async function acceptDocument(documentId: string, version: number) {
    // 1. Simular latencia
    await new Promise(resolve => setTimeout(resolve, 600));

    const cookieStore = await cookies();
    const acceptancesCookie = cookieStore.get(ACCEPTANCES_COOKIE_KEY)?.value;
    
    let acceptances: DocumentAcceptance[] = [];
    if (acceptancesCookie) {
        try {
            acceptances = JSON.parse(acceptancesCookie);
        } catch (e) {}
    }

    // Actualizar o insertar
    const existingIndex = acceptances.findIndex(a => a.document_id === documentId);
    if (existingIndex >= 0) {
        acceptances[existingIndex] = {
            document_id: documentId,
            accepted_version: version,
            accepted_at: new Date().toISOString()
        };
    } else {
        acceptances.push({
            document_id: documentId,
            accepted_version: version,
            accepted_at: new Date().toISOString()
        });
    }

    // Guardar en cookie por 1 año para modo mock
    cookieStore.set(ACCEPTANCES_COOKIE_KEY, JSON.stringify(acceptances), {
        maxAge: 60 * 60 * 24 * 365,
        path: '/'
    });

    // Revalidar las rutas que dependan de esta data
    revalidatePath("/area-privada/perfil");
    revalidatePath("/area-privada/documentos");
    
    return { success: true };
}
