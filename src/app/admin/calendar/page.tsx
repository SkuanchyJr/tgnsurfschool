import { getClasses, verifyAdminAccess } from "../actions";
import { redirect } from "next/navigation";
import CalendarClient from "./CalendarClient";

export const metadata = { title: "Calendario | Admin TGN Surf" };

export default async function AdminCalendarPage() {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) return redirect("/login");

    const classes = await getClasses();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <CalendarClient initialClasses={classes} />
        </div>
    );
}
