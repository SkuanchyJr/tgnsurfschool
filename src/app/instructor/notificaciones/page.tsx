import NotificationsPageClient from "@/components/notifications/NotificationsPageClient";

export const metadata = {
    title: "Notificaciones | Monitor — TGN Surf School",
};

export default function InstructorNotificationsPage() {
    return (
        <NotificationsPageClient
            backHref="/instructor"
            backLabel="Volver al dashboard"
            accentColor="#059669"
        />
    );
}
