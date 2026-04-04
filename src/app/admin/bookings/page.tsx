import { getAllBookings, getClasses, getClassBookings } from "../actions";
import BookingsPageClient from "./BookingsPageClient";

export const metadata = { title: "Reservas | Admin TGN Surf" };

export default async function BookingsPage() {
    const [bookings, classes] = await Promise.all([
        getAllBookings(),
        getClasses(),
    ]);

    return <BookingsPageClient initialBookings={bookings} allClasses={classes} />;
}
