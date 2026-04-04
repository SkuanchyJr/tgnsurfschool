import { getAllStudents } from "../actions";
import StudentsTable from "./StudentsTable";

export const metadata = {
    title: "Alumnos | Admin TGN Surf",
};

export default async function StudentsAdminPage() {
    const students = await getAllStudents();

    // Safety mapping for relation counts (Supabase might return an array)
    const mappedStudents = students.map((s: any) => ({
        ...s,
        bookings: Array.isArray(s.bookings) ? s.bookings : [s.bookings]
    }));

    return <StudentsTable initialStudents={mappedStudents} />;
}
