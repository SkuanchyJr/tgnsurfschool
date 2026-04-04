import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { StudentProgressCard } from "../components/StudentProgressCard";
import { EnrichedHistory } from "../components/EnrichedHistory";

export const metadata = {
    title: "Mi Progreso | TGN Surf School",
    description: "Tu progreso y registro de clases de surf.",
};

const LEVEL_CFG: Record<string, { label: string; emoji: string; color: string; bg: string; border: string; tagline: string; rec: string }> = {
    BEGINNER:     { label: "Principiante", emoji: "🏄", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", tagline: "¡Bienvenido/a al surf! Estás en el mejor punto de partida.", rec: "Te recomendamos nuestras clases de Iniciación con olas pequeñas y suaves. Aprenderás las bases en un entorno seguro." },
    INITIATION:   { label: "Iniciación",   emoji: "🏄", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", tagline: "¡Bienvenido/a al surf!",                                                rec: "Nuestras clases de iniciación son perfectas para ti." },
    INTERMEDIATE: { label: "Intermedio",   emoji: "🌊", color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   tagline: "Buen nivel — ya tienes la base, es hora de afinar la técnica.",    rec: "Prueba nuestras clases de Perfeccionamiento: olas medias y trabajo de maniobras." },
    ADVANCED:     { label: "Avanzado",     emoji: "⚡", color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",     tagline: "¡Top surfer! Estás listo para los retos más exigentes.",           rec: "Nuestras clases avanzadas y de alto rendimiento son para ti: olas grandes, maniobras complejas." },
};

export default async function ProgresoPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    const today = new Date().toISOString().split("T")[0];

    // Fetch user surf level
    const { data: profile } = await supabaseAdmin
        .from("users")
        .select("surf_level")
        .eq("id", user.id)
        .single();

    const surfLevel: string = (profile as any)?.surf_level || "BEGINNER";
    const lv = LEVEL_CFG[surfLevel] || LEVEL_CFG.BEGINNER;

    // Fetch past bookings for history and progress count
    const { data: pastBookings } = await supabaseAdmin
        .from("bookings")
        .select(`id, date, time, pax, status, class_id, services:service_id (title, type), class:class_id (level)`)
        .eq("user_id", user.id)
        .lte("date", today)
        .order("date", { ascending: false })
        .order("time", { ascending: false });

    const completedClasses = (pastBookings || []).filter((b: any) => b.status === "COMPLETED");
    const completedClassesCount = completedClasses.length;

    const pastClassesFormatted = pastBookings?.slice(0, 10).map((b: any) => ({
        id: b.id,
        date: b.date,
        time: b.time,
        title: b.services?.title || "Clase de Surf",
        level: b.class?.level || "BEGINNER",
        instructor: "Monitor TGN",
        spot: "Playa Larga",
        conditions: "Buenas olas, viento suave",
        feedback: b.status === "COMPLETED" ? "¡Buena sesión!" : undefined
    })) || [];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
            <div className="mb-2">
                <h1 className="text-3xl sm:text-4xl font-black font-fredoka text-[#0F172A]">Mi Progreso</h1>
                <p className="text-gray-500 mt-2">Sigue tu evolución en el agua y revisa el historial de tus sesiones.</p>
            </div>

            <StudentProgressCard 
                level={surfLevel} 
                levelName={lv.label}
                levelColor={lv.color}
                completedClasses={completedClassesCount} 
                hoursInWater={completedClassesCount * 2} // mock: 2hrs per class
                nextStepRec={lv.rec} 
            />

            <EnrichedHistory pastClasses={pastClassesFormatted} levelConfig={LEVEL_CFG} />
        </div>
    );
}
