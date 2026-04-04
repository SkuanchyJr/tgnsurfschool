import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { StudentProfileSummary } from "../components/StudentProfileSummary";
import { ActivePassCard } from "../components/ActivePassCard";
import { DocumentStatusCard } from "../components/DocumentStatusCard";
import { getStudentDocuments } from "../documentos/actions";
import { getStudentPasses } from "../bonos/actions";

export const metadata = {
    title: "Mi Perfil | TGN Surf School",
    description: "Tus datos personales, preferencias, bonos y documentación.",
};

const Q_LABELS: Record<string, string> = {
    previous_surf: "Experiencia previa", water_comfort: "Comodidad en el agua",
    wave_preference: "Olas preferidas", fitness_level: "Forma física", main_goal: "Objetivo",
};
const A_LABELS: Record<string, Record<string, string>> = {
    previous_surf:   { no: "Primera vez", yes_little: "Un par de veces", yes_regular: "Con regularidad", yes_lots: "Años surfeando" },
    water_comfort:   { nervous: "Me pongo nervioso/a", ok: "Me defiendo", comfortable: "Cómodo/a", very_comfortable: "Muy cómodo/a" },
    wave_preference: { small: "Pequeñas y suaves", medium: "Medias", big: "Grandes", any: "Cualquiera" },
    fitness_level:   { low: "Baja", moderate: "Moderada", high: "Alta", athlete: "Deportista" },
    main_goal:       { learn_standup: "Ponerme de pie", improve_technique: "Mejorar técnica", ride_better_waves: "Olas más grandes", compete: "Competir" },
};

const LEVEL_CFG: Record<string, { label: string; emoji: string; color: string; bg: string; border: string; tagline: string; rec: string }> = {
    BEGINNER:     { label: "Principiante", emoji: "🏄", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", tagline: "¡Bienvenido/a al surf! Estás en el mejor punto de partida.", rec: "Te recomendamos nuestras clases de Iniciación con olas pequeñas y suaves. Aprenderás las bases en un entorno seguro." },
    INITIATION:   { label: "Iniciación",   emoji: "🏄", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", tagline: "¡Bienvenido/a al surf!",                                                rec: "Nuestras clases de iniciación son perfectas para ti." },
    INTERMEDIATE: { label: "Intermedio",   emoji: "🌊", color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   tagline: "Buen nivel — ya tienes la base, es hora de afinar la técnica.",    rec: "Prueba nuestras clases de Perfeccionamiento: olas medias y trabajo de maniobras." },
    ADVANCED:     { label: "Avanzado",     emoji: "⚡", color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",     tagline: "¡Top surfer! Estás listo para los retos más exigentes.",           rec: "Nuestras clases avanzadas y de alto rendimiento son para ti: olas grandes, maniobras complejas." },
};

export default async function PerfilPage() {
    const user = await getUser();
    if (!user) return redirect("/login");

    const profileResult = await pool.query(
        `SELECT surf_level, surf_assessment, name FROM users WHERE id = $1`,
        [user.id]
    );
    const profile = profileResult.rows[0] || {};

    const surfLevel: string = profile.surf_level || "BEGINNER";
    const surfAssessment: Record<string, string> | null = profile.surf_assessment || null;
    const displayName = profile.name || user.name || "Alumno";
    const lv = LEVEL_CFG[surfLevel] || LEVEL_CFG.BEGINNER;

    const documents = await getStudentDocuments();
    const { data: passes } = await getStudentPasses();
    const activePass = (passes || []).find(p => p.status === 'ACTIVE');

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
            <div className="mb-2">
                <h1 className="text-3xl sm:text-4xl font-black font-fredoka text-[#0F172A]">Mi Perfil</h1>
                <p className="text-gray-500 mt-2">Gestiona tus preferencias, bonos activos y documentación de la escuela.</p>
            </div>

            <StudentProfileSummary 
                name={displayName} 
                email={user.email!} 
                levelName={lv.label} 
                assessment={surfAssessment}
                qLabels={Q_LABELS}
                aLabels={A_LABELS}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <ActivePassCard 
                    hasPass={!!activePass} 
                    totalClasses={activePass?.total_classes || 0} 
                    remainingClasses={activePass?.remaining_classes || 0} 
                    expiryDate={activePass?.expiry_date} 
                />
                <DocumentStatusCard documents={documents} />
            </div>
        </div>
    );
}
