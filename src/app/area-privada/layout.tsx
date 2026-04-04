import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import StudentSidebar from "./StudentSidebar";

export default async function StudentAreaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    return (
        <div className="flex min-h-screen">
            <StudentSidebar />
            <main className="flex-1 overflow-auto bg-gray-50">
                {children}
            </main>
        </div>
    );
}
