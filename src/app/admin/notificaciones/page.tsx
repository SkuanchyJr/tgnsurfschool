import NotificationsPageClient from "@/components/notifications/NotificationsPageClient";

export const metadata = {
    title: "Notificaciones | Admin — TGN Surf School",
};

export default function AdminNotificationsPage() {
    return (
        <NotificationsPageClient
            backHref="/admin"
            backLabel="Volver al dashboard"
            accentColor="#3F7FE3"
        />
    );
}
