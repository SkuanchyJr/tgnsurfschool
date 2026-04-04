import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import ClassBrowserClient from "./ClassBrowserClient";
import { Waves } from "lucide-react";

export const metadata = { title: "Reservar Clase | TGN Surf" };

export default async function StudentClassesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    const today = new Date().toISOString().split("T")[0];

    // Fetch available classes (scheduled, from today onward)
    const { data: classes } = await supabaseAdmin
        .from("classes")
        .select(`
            id, date, time, duration_minutes, level, max_capacity, status, location, notes,
            service:service_id ( title, type ),
            class_instructors (
                id, instructor_id, status,
                instructor:instructor_id ( id, name, email )
            )
        `)
        .eq("status", "SCHEDULED")
        .gte("date", today)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

    // Compute pax per class
    const classIds = (classes || []).map((c: any) => c.id);
    const { data: bookings } = classIds.length > 0
        ? await supabaseAdmin.from("bookings").select("class_id, pax").in("class_id", classIds).neq("status", "CANCELLED")
        : { data: [] };

    const paxByClass: Record<string, number> = {};
    for (const b of (bookings || [])) {
        if (b.class_id) paxByClass[b.class_id] = (paxByClass[b.class_id] || 0) + b.pax;
    }

    const enrichedClasses = (classes || []).map((c: any) => ({
        ...c,
        total_pax: paxByClass[c.id] || 0,
        remaining: c.max_capacity - (paxByClass[c.id] || 0),
    }));

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-[#0F172A] font-fredoka leading-none mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3F7FE3]/10 text-[#3F7FE3] rounded-xl flex items-center justify-center">
                        <Waves size={20} />
                    </div>
                    Reservar una Clase
                </h1>
                <p className="text-gray-500 font-medium">Plazas disponibles en tiempo real. Reserva en segundos.</p>
            </div>
            <ClassBrowserClient classes={enrichedClasses} />
        </div>
    );
}
