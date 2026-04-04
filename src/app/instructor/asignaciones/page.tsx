import { getMyAssignedClasses } from "../actions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AssignmentListClient from "../AssignmentListClient";
import { ClipboardList } from "lucide-react";

export const metadata = { title: "Asignaciones Pendientes | TGN Surf Monitor" };

export default async function InstructorAsignacionesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    const all = await getMyAssignedClasses();
    const pending = all.filter(a => a.assignmentStatus === "ASSIGNED");

    // Sort by date ascending (soonest first)
    const sorted = [...pending].sort((a, b) => a.date.localeCompare(b.date));

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-[#0F172A] font-fredoka leading-none mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
                        <ClipboardList size={20} />
                    </div>
                    Asignaciones Pendientes
                </h1>
                <p className="text-gray-500 font-medium">
                    {sorted.length === 0
                        ? "¡Todo al día! No tienes asignaciones pendientes."
                        : `${sorted.length} asignación${sorted.length !== 1 ? "es" : ""} esperando tu respuesta. Responde cuanto antes.`}
                </p>
            </div>

            <AssignmentListClient assignments={sorted} pendingOnly />
        </div>
    );
}
