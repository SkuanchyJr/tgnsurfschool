import { getAllBookings, getClasses, getAllInstructors, verifyAdminAccess } from "../actions";
import { redirect } from "next/navigation";
import AnalyticsClient from "./AnalyticsClient";

export const metadata = { title: "Analíticas | Admin TGN Surf" };

export default async function AdminAnalyticsPage() {
    const { hasAccess } = await verifyAdminAccess();
    if (!hasAccess) return redirect("/login");

    const [bookings, classes, instructors] = await Promise.all([
        getAllBookings(),
        getClasses(),
        getAllInstructors(),
    ]);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <AnalyticsClient 
                bookings={bookings} 
                classes={classes} 
                instructors={instructors as any[]} 
            />
        </div>
    );
}
