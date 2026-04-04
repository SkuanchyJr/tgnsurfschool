import NotificationsPageClient from "@/components/notifications/NotificationsPageClient";

export const metadata = {
    title: "Notificaciones | Área Privada — TGN Surf School",
};

export default function StudentNotificationsPage() {
    return (
        <NotificationsPageClient
            backHref="/area-privada"
            backLabel="Volver al dashboard"
            accentColor="#3F7FE3"
        />
    );
}
