import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import ClassBrowserClient from "./ClassBrowserClient";
import { Waves } from "lucide-react";

export const metadata = { title: "Reservar Clase | TGN Surf" };

export default async function StudentClassesPage() {
    const user = await getUser();
    if (!user) return redirect("/login");

    const today = new Date().toISOString().split("T")[0];

    // Fetch available classes with instructor info and pax counts
    const classesResult = await pool.query(
        `SELECT c.id, c.date, c.time, c.duration_minutes, c.level, c.max_capacity, c.status, c.location, c.notes,
                s.title as service_title, s.type as service_type,
                COALESCE((
                    SELECT SUM(b.pax) FROM bookings b WHERE b.class_id = c.id AND b.status != 'CANCELLED'
                ), 0) as booked_pax
         FROM classes c
         LEFT JOIN services s ON s.id = c.service_id
         WHERE c.status = 'SCHEDULED' AND c.date >= $1
         ORDER BY c.date ASC, c.time ASC`,
        [today]
    );

    // Fetch instructors for each class
    const instructorResult = await pool.query(
        `SELECT ci.class_id, ci.id, ci.instructor_id, ci.status, u.name, u.email
         FROM class_instructors ci
         JOIN users u ON u.id = ci.instructor_id
         WHERE ci.class_id = ANY($1::uuid[])`,
        [classesResult.rows.map((c: any) => c.id)]
    );

    const instructorsByClass: Record<string, any[]> = {};
    for (const row of instructorResult.rows) {
        if (!instructorsByClass[row.class_id]) instructorsByClass[row.class_id] = [];
        instructorsByClass[row.class_id].push({
            id: row.id, instructor_id: row.instructor_id, status: row.status,
            instructor: { id: row.instructor_id, name: row.name, email: row.email },
        });
    }

    const enrichedClasses = classesResult.rows.map((c: any) => ({
        ...c,
        service: { title: c.service_title, type: c.service_type },
        class_instructors: instructorsByClass[c.id] || [],
        total_pax: parseInt(c.booked_pax, 10),
        remaining: c.max_capacity - parseInt(c.booked_pax, 10),
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
