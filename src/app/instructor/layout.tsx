import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import InstructorSidebar from "./InstructorSidebar";

export default async function InstructorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    // Verify role
    const { data: publicUser } = await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!publicUser || (publicUser.role !== "INSTRUCTOR" && publicUser.role !== "ADMIN")) {
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
