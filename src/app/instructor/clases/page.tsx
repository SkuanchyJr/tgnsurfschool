import { getMyAssignedClasses } from "../actions";
import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import AssignmentListClient from "../AssignmentListClient";
import { CalendarDays } from "lucide-react";

export const metadata = { title: "Mis Clases | TGN Surf Monitor" };

export default async function InstructorClasesPage() {
    const user = await getUser();
    if (!user) return redirect("/login");

    const assignments = await getMyAssignedClasses();

    // Sort: pending first, then by date
    const sorted = [...assignments].sort((a, b) => {
        const order = { ASSIGNED: 0, ACCEPTED: 1, REJECTED: 2 };
        const statusDiff = (order[a.assignmentStatus as keyof typeof order] ?? 1) - (order[b.assignmentStatus as keyof typeof order] ?? 1);
        if (statusDiff !== 0) return statusDiff;
        return a.date.localeCompare(b.date);
    });

    const pending = assignments.filter(a => a.assignmentStatus === "ASSIGNED").length;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-[#0F172A] font-fredoka leading-none mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600/10 text-emerald-600 rounded-xl flex items-center justify-center">
                        <CalendarDays size={20} />
                    </div>
                    Mis Clases Asignadas
                </h1>
                <p className="text-gray-500 font-medium">
                    {sorted.length} clase{sorted.length !== 1 ? "s" : ""} en total
                    {pending > 0 && <span className="ml-2 text-amber-600 font-bold">· {pending} pendiente{pending !== 1 ? "s" : ""} de respuesta</span>}
                </p>
            </div>

            <AssignmentListClient assignments={sorted} />
        </div>
    );
}
