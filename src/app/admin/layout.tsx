import AdminSidebar from "./AdminSidebar";
import { verifyAdminAccess } from "./actions";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Panel de Administración | TGN Surf School",
    description: "Gestión avanzada de la escuela (ERP / CRM).",
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Verify Access at the Layout Level for all /admin routes
    const { hasAccess } = await verifyAdminAccess();

    if (!hasAccess) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* 2. Sidebar Navigation */}
            <AdminSidebar />

            {/* 3. Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
