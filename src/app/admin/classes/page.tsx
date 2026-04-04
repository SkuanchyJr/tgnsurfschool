import { getClasses, getAllInstructors } from "../actions";
import pool from "@/lib/db";
import ClassManagerClient from "./ClassManagerClient";
import { CalendarDays } from "lucide-react";

export const metadata = { title: "Clases | Admin TGN Surf" };

export default async function AdminClassesPage() {
    const [classes, instructors, servicesResult] = await Promise.all([
        getClasses(),
        getAllInstructors(),
        pool.query(`SELECT id, title, type FROM services WHERE is_active = true ORDER BY type`),
    ]);

    return (
        <ClassManagerClient
            initialClasses={classes}
            services={servicesResult.rows}
            instructors={instructors as any[]}
        />
    );
}
