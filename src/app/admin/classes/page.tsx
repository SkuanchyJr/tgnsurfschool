import { getClasses, getAllInstructors } from "../actions";
import { createClient } from "@supabase/supabase-js";
import ClassManagerClient from "./ClassManagerClient";
import { CalendarDays } from "lucide-react";

export const metadata = { title: "Clases | Admin TGN Surf" };

export default async function AdminClassesPage() {
    const [classes, instructors] = await Promise.all([
        getClasses(),
        getAllInstructors(),
    ]);

    // Fetch active services for the class form modal dropdown
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: services } = await supabase
        .from("services")
        .select("id, title, type")
        .eq("is_active", true)
        .order("type");

    return (
        <ClassManagerClient
            initialClasses={classes}
            services={services || []}
            instructors={instructors as any[]}
        />
    );
}
