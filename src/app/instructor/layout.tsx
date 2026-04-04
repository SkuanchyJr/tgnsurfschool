import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import InstructorSidebar from "./InstructorSidebar";

export default async function InstructorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUser();

    if (!user) return redirect("/login");

    if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
        return redirect("/area-privada");
    }

    return (
        <div className="flex min-h-screen">
            <InstructorSidebar />
            <main className="flex-1 overflow-auto bg-gray-50">
                {children}
            </main>
        </div>
    );
}
