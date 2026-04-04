"use server";

import pool from "@/lib/db";
import {
    sendEmail,
    emailHeading,
    emailParagraph,
    emailInfoBox,
    emailButton,
    emailDivider,
} from "./email";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

async function saveNotification(data: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
}) {
    try {
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, $2, $3, $4, $5)`,
            [data.user_id, data.type, data.title, data.message, data.link ?? null]
        );
    } catch (e) {
        console.error("[saveNotification] Error:", e);
    }
}

async function getAdminUsers() {
    const result = await pool.query<{ id: string; email: string; name: string }>(
        `SELECT id, email, name FROM users WHERE role = 'ADMIN'`
    );
    return result.rows;
}

async function getUserInfo(userId: string) {
    const result = await pool.query<{ id: string; email: string; name: string; role: string }>(
        `SELECT id, email, name, role FROM users WHERE id = $1`,
        [userId]
    );
    return result.rows[0] ?? null;
}

export async function notifyWelcome(userId: string, email: string, name: string) {
    try {
        await saveNotification({
            user_id: userId,
            type: "WELCOME",
            title: "¡Bienvenido/a a TGN Surf School!",
            message: `Hola ${name}, tu cuenta ha sido creada correctamente. ¡Ya puedes reservar tu primera clase de surf!`,
            link: "/area-privada",
        });

        const body = [
            emailHeading("¡Bienvenido/a a TGN Surf School! 🏄"),
            emailParagraph(`Hola <strong>${name}</strong>,`),
            emailParagraph("Tu cuenta ha sido creada correctamente. Ahora puedes acceder a tu área privada, explorar nuestros servicios y reservar tu primera clase de surf."),
            emailInfoBox([
                { label: "Nombre", value: name },
                { label: "Email", value: email },
            ]),
            emailParagraph("¿Listo para coger tu primera ola?"),
            emailButton("Reservar mi primera clase", `${BASE_URL}/area-privada/clases`),
        ].join("");

        await sendEmail(email, "¡Bienvenido/a a TGN Surf School! 🏄", body);
    } catch (err) {
        console.error("[notifyWelcome] Error:", err);
    }
}

export async function notifyBookingConfirmation(
    userId: string,
    details: { date: string; time: string; pax: number; serviceName?: string }
) {
    try {
        const user = await getUserInfo(userId);
        if (!user) return;

        const dateStr = new Date(details.date).toLocaleDateString("es-ES", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
        });

        await saveNotification({
            user_id: userId,
            type: "BOOKING_CONFIRMED",
            title: "Reserva confirmada",
            message: `Tu reserva para ${details.serviceName || "clase de surf"} el ${dateStr} a las ${details.time}h ha sido registrada.`,
            link: "/area-privada/mis-reservas",
        });

        const body = [
            emailHeading("¡Reserva confirmada! ✅"),
            emailParagraph(`Hola <strong>${user.name}</strong>,`),
            emailParagraph("Tu reserva ha sido registrada correctamente. Aquí tienes los detalles:"),
            emailInfoBox([
                { label: "Servicio", value: details.serviceName || "Clase de Surf" },
                { label: "Fecha", value: dateStr },
                { label: "Hora", value: `${details.time}h` },
                { label: "Participantes", value: String(details.pax) },
            ]),
            emailParagraph("Recuerda llegar 15 minutos antes de la hora de inicio. ¡Nos vemos en el agua!"),
            emailButton("Ver mis reservas", `${BASE_URL}/area-privada/mis-reservas`),
        ].join("");

        await sendEmail(user.email, "✅ Reserva confirmada — TGN Surf School", body);
    } catch (err) {
        console.error("[notifyBookingConfirmation] Error:", err);
    }
}

export async function notifyNewBookingToAdmin(details: {
    studentName: string;
    studentEmail: string;
    date: string;
    time: string;
    pax: number;
    serviceName?: string;
}) {
    try {
        const admins = await getAdminUsers();
        const dateStr = new Date(details.date).toLocaleDateString("es-ES", {
            weekday: "long", day: "numeric", month: "long",
        });

        for (const admin of admins) {
            await saveNotification({
                user_id: admin.id,
                type: "NEW_BOOKING",
                title: "Nueva reserva recibida",
                message: `${details.studentName} ha reservado ${details.serviceName || "una clase"} para el ${dateStr} (${details.pax} pax).`,
                link: "/admin/bookings",
            });
        }

        const body = [
            emailHeading("Nueva reserva recibida 📋"),
            emailParagraph("Se ha registrado una nueva reserva:"),
            emailInfoBox([
                { label: "Alumno/a", value: `${details.studentName} (${details.studentEmail})` },
                { label: "Servicio", value: details.serviceName || "Clase de Surf" },
                { label: "Fecha", value: dateStr },
                { label: "Hora", value: `${details.time}h` },
                { label: "Participantes", value: String(details.pax) },
            ]),
            emailButton("Ver reservas", `${BASE_URL}/admin/bookings`),
        ].join("");

        for (const admin of admins) {
            await sendEmail(admin.email, "📋 Nueva reserva — TGN Surf School", body);
        }
    } catch (err) {
        console.error("[notifyNewBookingToAdmin] Error:", err);
    }
}

export async function notifyBookingStatusChange(bookingId: string, newStatus: string) {
    try {
        const result = await pool.query(
            `SELECT b.user_id, b.date, b.time, b.pax, s.title as service_title
             FROM bookings b
             LEFT JOIN services s ON s.id = b.service_id
             WHERE b.id = $1`,
            [bookingId]
        );
        if (result.rows.length === 0) return;
        const booking = result.rows[0];

        const user = await getUserInfo(booking.user_id);
        if (!user) return;

        const dateStr = new Date(booking.date).toLocaleDateString("es-ES", {
            weekday: "long", day: "numeric", month: "long",
        });

        const statusLabels: Record<string, string> = {
            CONFIRMED: "✅ Confirmada",
            CANCELLED: "❌ Cancelada",
            COMPLETED: "🎉 Completada",
            PENDING: "⏳ Pendiente",
        };
        const statusLabel = statusLabels[newStatus] || newStatus;
        const isCancelled = newStatus === "CANCELLED";

        await saveNotification({
            user_id: user.id,
            type: "BOOKING_STATUS_CHANGE",
            title: `Reserva ${statusLabel}`,
            message: `Tu reserva de ${booking.service_title || "clase de surf"} del ${dateStr} ha sido ${statusLabel.toLowerCase()}.`,
            link: "/area-privada/mis-reservas",
        });

        const body = [
            emailHeading(`Reserva ${statusLabel}`),
            emailParagraph(`Hola <strong>${user.name}</strong>,`),
            emailParagraph("Tu reserva ha cambiado de estado:"),
            emailInfoBox([
                { label: "Servicio", value: booking.service_title || "Clase de Surf" },
                { label: "Fecha", value: dateStr },
                { label: "Hora", value: `${booking.time}h` },
                { label: "Nuevo estado", value: statusLabel },
            ]),
            isCancelled
                ? emailParagraph("Si tienes alguna pregunta, no dudes en contactarnos.")
                : emailParagraph("¡Nos vemos en el agua! 🌊"),
            emailButton("Ver mis reservas", `${BASE_URL}/area-privada/mis-reservas`),
        ].join("");

        await sendEmail(user.email, `${statusLabel} — Tu reserva en TGN Surf`, body);
    } catch (err) {
        console.error("[notifyBookingStatusChange] Error:", err);
    }
}

export async function notifyClassAssignment(
    instructorId: string,
    classDetails: { classId: string; date: string; time: string; level?: string; serviceName?: string }
) {
    try {
        const instructor = await getUserInfo(instructorId);
        if (!instructor) return;

        const dateStr = new Date(classDetails.date).toLocaleDateString("es-ES", {
            weekday: "long", day: "numeric", month: "long",
        });

        await saveNotification({
            user_id: instructorId,
            type: "CLASS_ASSIGNED",
            title: "Nueva clase asignada",
            message: `Se te ha asignado una clase de ${classDetails.serviceName || "surf"} el ${dateStr} a las ${classDetails.time}h.`,
            link: "/instructor/asignaciones",
        });

        const infoItems = [
            { label: "Servicio", value: classDetails.serviceName || "Clase de Surf" },
            { label: "Fecha", value: dateStr },
            { label: "Hora", value: `${classDetails.time}h` },
        ];
        if (classDetails.level) infoItems.push({ label: "Nivel", value: classDetails.level });

        const body = [
            emailHeading("Nueva clase asignada 📌"),
            emailParagraph(`Hola <strong>${instructor.name}</strong>,`),
            emailParagraph("Se te ha asignado una nueva clase. Aquí tienes los detalles:"),
            emailInfoBox(infoItems),
            emailParagraph("Accede a tu panel para aceptar o rechazar la asignación."),
            emailButton("Ver asignaciones", `${BASE_URL}/instructor/asignaciones`),
        ].join("");

        await sendEmail(instructor.email, "📌 Nueva clase asignada — TGN Surf School", body);
    } catch (err) {
        console.error("[notifyClassAssignment] Error:", err);
    }
}

export async function notifyAssignmentResponse(
    instructorId: string,
    classId: string,
    response: "ACCEPTED" | "REJECTED"
) {
    try {
        const instructor = await getUserInfo(instructorId);
        if (!instructor) return;

        const clsResult = await pool.query(
            `SELECT c.date, c.time, s.title as service_title
             FROM classes c LEFT JOIN services s ON s.id = c.service_id
             WHERE c.id = $1`,
            [classId]
        );
        const cls = clsResult.rows[0];
        const dateStr = cls?.date
            ? new Date(cls.date).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
            : "—";

        const isAccepted = response === "ACCEPTED";
        const statusEmoji = isAccepted ? "✅" : "❌";
        const statusText = isAccepted ? "aceptado" : "rechazado";

        const admins = await getAdminUsers();
        for (const admin of admins) {
            await saveNotification({
                user_id: admin.id,
                type: "ASSIGNMENT_RESPONSE",
                title: `Monitor ha ${statusText} la asignación`,
                message: `${instructor.name} ha ${statusText} la clase de ${cls?.service_title || "surf"} del ${dateStr}.`,
                link: "/admin/classes",
            });
        }

        const body = [
            emailHeading(`${statusEmoji} Respuesta de monitor`),
            emailParagraph(`<strong>${instructor.name}</strong> ha <strong>${statusText}</strong> la asignación:`),
            emailInfoBox([
                { label: "Monitor", value: instructor.name },
                { label: "Servicio", value: cls?.service_title || "Clase de Surf" },
                { label: "Fecha", value: dateStr },
                { label: "Hora", value: cls?.time ? `${cls.time}h` : "—" },
                { label: "Respuesta", value: isAccepted ? "✅ Aceptada" : "❌ Rechazada" },
            ]),
            emailButton("Ver clases", `${BASE_URL}/admin/classes`),
        ].join("");

        for (const admin of admins) {
            await sendEmail(admin.email, `${statusEmoji} Monitor ha ${statusText} una asignación`, body);
        }
    } catch (err) {
        console.error("[notifyAssignmentResponse] Error:", err);
    }
}

export async function notifyClassCancelled(classId: string) {
    try {
        const clsResult = await pool.query(
            `SELECT c.date, c.time, s.title as service_title
             FROM classes c LEFT JOIN services s ON s.id = c.service_id
             WHERE c.id = $1`,
            [classId]
        );
        if (clsResult.rows.length === 0) return;
        const cls = clsResult.rows[0];

        const dateStr = new Date(cls.date).toLocaleDateString("es-ES", {
            weekday: "long", day: "numeric", month: "long",
        });

        const bookingsResult = await pool.query(
            `SELECT DISTINCT user_id FROM bookings WHERE class_id = $1 AND status != 'CANCELLED'`,
            [classId]
        );
        const assignmentsResult = await pool.query(
            `SELECT DISTINCT instructor_id FROM class_instructors WHERE class_id = $1`,
            [classId]
        );

        const studentIds = bookingsResult.rows.map((r: any) => r.user_id);
        const instructorIds = assignmentsResult.rows.map((r: any) => r.instructor_id);
        const allUserIds = [...new Set([...studentIds, ...instructorIds])];

        const emailBody = [
            emailHeading("Clase cancelada ❌"),
            emailParagraph("Lamentamos informarte de que la siguiente clase ha sido cancelada:"),
            emailInfoBox([
                { label: "Servicio", value: cls.service_title || "Clase de Surf" },
                { label: "Fecha", value: dateStr },
                { label: "Hora", value: `${cls.time}h` },
                { label: "Estado", value: "❌ Cancelada" },
            ]),
            emailParagraph("Si tenías una reserva, contacta con nosotros para reagendar."),
            emailDivider(),
            emailParagraph("Disculpa las molestias. ¡El surf te espera otro día! 🌊"),
        ].join("");

        for (const uid of allUserIds) {
            const user = await getUserInfo(uid);
            if (!user) continue;

            await saveNotification({
                user_id: uid,
                type: "CLASS_CANCELLED",
                title: "Clase cancelada",
                message: `La clase de ${cls.service_title || "surf"} del ${dateStr} a las ${cls.time}h ha sido cancelada.`,
                link: user.role === "STUDENT" ? "/area-privada/mis-reservas" : "/instructor/clases",
            });

            await sendEmail(user.email, "❌ Clase cancelada — TGN Surf School", emailBody);
        }
    } catch (err) {
        console.error("[notifyClassCancelled] Error:", err);
    }
}

export async function notifyPassPurchase(userId: string, passType: string, classes: number) {
    try {
        const user = await getUserInfo(userId);
        if (!user) return;

        const passLabels: Record<string, string> = {
            BONO_1: "Clase Suelta (1 clase)",
            BONO_5: "Bono 5 Clases",
            BONO_10: "Bono 10 Clases",
        };
        const passLabel = passLabels[passType] || passType;

        await saveNotification({
            user_id: userId,
            type: "PASS_PURCHASED",
            title: "¡Bono comprado!",
            message: `Tu ${passLabel} está activo. Tienes ${classes} clase(s) disponibles para reservar.`,
            link: "/area-privada/bonos",
        });

        const studentBody = [
            emailHeading("¡Bono activado! 🎉"),
            emailParagraph(`Hola <strong>${user.name}</strong>,`),
            emailParagraph("Tu compra se ha procesado correctamente. Tu bono ya está activo:"),
            emailInfoBox([
                { label: "Bono", value: passLabel },
                { label: "Clases disponibles", value: String(classes) },
            ]),
            emailParagraph("Ya puedes usar tu bono para reservar clases."),
            emailButton("Reservar clase", `${BASE_URL}/area-privada/clases`),
        ].join("");

        await sendEmail(user.email, "🎉 Bono activado — TGN Surf School", studentBody);

        const admins = await getAdminUsers();
        const adminBody = [
            emailHeading("Nuevo bono comprado 💰"),
            emailParagraph(`<strong>${user.name}</strong> ha comprado un bono:`),
            emailInfoBox([
                { label: "Alumno/a", value: `${user.name} (${user.email})` },
                { label: "Bono", value: passLabel },
                { label: "Clases", value: String(classes) },
            ]),
            emailButton("Ver alumnos", `${BASE_URL}/admin/students`),
        ].join("");

        for (const admin of admins) {
            await saveNotification({
                user_id: admin.id,
                type: "PASS_PURCHASED",
                title: "Nuevo bono comprado",
                message: `${user.name} ha comprado ${passLabel}.`,
                link: "/admin/students",
            });
            await sendEmail(admin.email, "💰 Nuevo bono comprado — TGN Surf School", adminBody);
        }
    } catch (err) {
        console.error("[notifyPassPurchase] Error:", err);
    }
}
