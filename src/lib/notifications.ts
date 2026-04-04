"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
    sendEmail,
    emailHeading,
    emailParagraph,
    emailInfoBox,
    emailButton,
    emailDivider,
} from "./email";

// ─────────────────────────────────────────────
// Admin Supabase Client (server-only)
// ─────────────────────────────────────────────
function getAdmin() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// ─────────────────────────────────────────────
// Helper: Save In-App Notification
// ─────────────────────────────────────────────
async function saveNotification(data: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
}) {
    const admin = getAdmin();
    const { error } = await admin.from("notifications").insert(data);
    if (error) console.error("[saveNotification] Error:", error.message);
}

// ─────────────────────────────────────────────
// Helper: Get admin emails
// ─────────────────────────────────────────────
async function getAdminUsers() {
    const admin = getAdmin();
    const { data } = await admin
        .from("users")
        .select("id, email, name")
        .eq("role", "ADMIN");
    return data || [];
}

// ─────────────────────────────────────────────
// Helper: Get user info
// ─────────────────────────────────────────────
async function getUserInfo(userId: string) {
    const admin = getAdmin();
    const { data } = await admin
        .from("users")
        .select("id, email, name, role")
        .eq("id", userId)
        .single();
    return data;
}

// ═════════════════════════════════════════════
// NOTIFICATION FUNCTIONS
// ═════════════════════════════════════════════

/**
 * 1. Welcome email — sent when a student registers
 */
export async function notifyWelcome(userId: string, email: string, name: string) {
    try {
        // In-app
        await saveNotification({
            user_id: userId,
            type: "WELCOME",
            title: "¡Bienvenido/a a TGN Surf School!",
            message: `Hola ${name}, tu cuenta ha sido creada correctamente. ¡Ya puedes reservar tu primera clase de surf!`,
            link: "/area-privada",
        });

        // Email
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

/**
 * 2. Booking confirmation — sent to the student after booking
 */
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

        // In-app
        await saveNotification({
            user_id: userId,
            type: "BOOKING_CONFIRMED",
            title: "Reserva confirmada",
            message: `Tu reserva para ${details.serviceName || "clase de surf"} el ${dateStr} a las ${details.time}h ha sido registrada.`,
            link: "/area-privada/mis-reservas",
        });

        // Email
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

/**
 * 3. New booking alert — sent to all admin users
 */
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
            // In-app
            await saveNotification({
                user_id: admin.id,
                type: "NEW_BOOKING",
                title: "Nueva reserva recibida",
                message: `${details.studentName} ha reservado ${details.serviceName || "una clase"} para el ${dateStr} (${details.pax} pax).`,
                link: "/admin/bookings",
            });
        }

        // Email to first admin (or all)
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

/**
 * 4. Booking status change — sent to the student
 */
export async function notifyBookingStatusChange(
    bookingId: string,
    newStatus: string
) {
    try {
        const adminClient = getAdmin();
        const { data: booking } = await adminClient
            .from("bookings")
            .select("user_id, date, time, pax, services(title)")
            .eq("id", bookingId)
            .single();

        if (!booking) return;

        const user = await getUserInfo(booking.user_id);
        if (!user) return;

        const service = Array.isArray(booking.services) ? booking.services[0] : booking.services;
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

        // In-app
        await saveNotification({
            user_id: user.id,
            type: "BOOKING_STATUS_CHANGE",
            title: `Reserva ${statusLabel}`,
            message: `Tu reserva de ${service?.title || "clase de surf"} del ${dateStr} ha sido ${statusLabel.toLowerCase()}.`,
            link: "/area-privada/mis-reservas",
        });

        // Email
        const body = [
            emailHeading(`Reserva ${statusLabel}`),
            emailParagraph(`Hola <strong>${user.name}</strong>,`),
            emailParagraph(`Tu reserva ha cambiado de estado:`),
            emailInfoBox([
                { label: "Servicio", value: service?.title || "Clase de Surf" },
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

/**
 * 5. Class assignment — sent to the instructor
 */
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

        // In-app
        await saveNotification({
            user_id: instructorId,
            type: "CLASS_ASSIGNED",
            title: "Nueva clase asignada",
            message: `Se te ha asignado una clase de ${classDetails.serviceName || "surf"} el ${dateStr} a las ${classDetails.time}h.`,
            link: "/instructor/asignaciones",
        });

        // Email
        const infoItems = [
            { label: "Servicio", value: classDetails.serviceName || "Clase de Surf" },
            { label: "Fecha", value: dateStr },
            { label: "Hora", value: `${classDetails.time}h` },
        ];
        if (classDetails.level) {
            infoItems.push({ label: "Nivel", value: classDetails.level });
        }

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

/**
 * 6. Assignment response — sent to admins when instructor accepts/rejects
 */
export async function notifyAssignmentResponse(
    instructorId: string,
    classId: string,
    response: "ACCEPTED" | "REJECTED"
) {
    try {
        const instructor = await getUserInfo(instructorId);
        if (!instructor) return;

        const adminClient = getAdmin();
        const { data: cls } = await adminClient
            .from("classes")
            .select("date, time, service:service_id(title)")
            .eq("id", classId)
            .single();

        const service = cls?.service ? (Array.isArray(cls.service) ? cls.service[0] : cls.service) : null;
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
                message: `${instructor.name} ha ${statusText} la clase de ${service?.title || "surf"} del ${dateStr}.`,
                link: "/admin/classes",
            });
        }

        const body = [
            emailHeading(`${statusEmoji} Respuesta de monitor`),
            emailParagraph(`<strong>${instructor.name}</strong> ha <strong>${statusText}</strong> la asignación:`),
            emailInfoBox([
                { label: "Monitor", value: instructor.name },
                { label: "Servicio", value: service?.title || "Clase de Surf" },
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

/**
 * 7. Class cancelled — sent to all booked students + assigned instructors
 */
export async function notifyClassCancelled(classId: string) {
    try {
        const adminClient = getAdmin();

        // Get class details
        const { data: cls } = await adminClient
            .from("classes")
            .select("date, time, service:service_id(title)")
            .eq("id", classId)
            .single();

        if (!cls) return;

        const service = cls.service ? (Array.isArray(cls.service) ? cls.service[0] : cls.service) : null;
        const dateStr = new Date(cls.date).toLocaleDateString("es-ES", {
            weekday: "long", day: "numeric", month: "long",
        });

        // Get booked students
        const { data: bookings } = await adminClient
            .from("bookings")
            .select("user_id")
            .eq("class_id", classId)
            .neq("status", "CANCELLED");

        const studentIds = [...new Set((bookings || []).map(b => b.user_id))];

        // Get assigned instructors
        const { data: assignments } = await adminClient
            .from("class_instructors")
            .select("instructor_id")
            .eq("class_id", classId);

        const instructorIds = [...new Set((assignments || []).map(a => a.instructor_id))];

        const allUserIds = [...new Set([...studentIds, ...instructorIds])];

        const emailBody = [
            emailHeading("Clase cancelada ❌"),
            emailParagraph("Lamentamos informarte de que la siguiente clase ha sido cancelada:"),
            emailInfoBox([
                { label: "Servicio", value: service?.title || "Clase de Surf" },
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

            // In-app
            await saveNotification({
                user_id: uid,
                type: "CLASS_CANCELLED",
                title: "Clase cancelada",
                message: `La clase de ${service?.title || "surf"} del ${dateStr} a las ${cls.time}h ha sido cancelada.`,
                link: user.role === "STUDENT" ? "/area-privada/mis-reservas" : "/instructor/clases",
            });

            // Email
            await sendEmail(user.email, "❌ Clase cancelada — TGN Surf School", emailBody);
        }
    } catch (err) {
        console.error("[notifyClassCancelled] Error:", err);
    }
}

/**
 * 8. Pass purchase confirmation — sent to student + admins
 */
export async function notifyPassPurchase(
    userId: string,
    passType: string,
    classes: number
) {
    try {
        const user = await getUserInfo(userId);
        if (!user) return;

        const passLabels: Record<string, string> = {
            BONO_1: "Clase Suelta (1 clase)",
            BONO_5: "Bono 5 Clases",
            BONO_10: "Bono 10 Clases",
        };

        const passLabel = passLabels[passType] || passType;

        // In-app (student)
        await saveNotification({
            user_id: userId,
            type: "PASS_PURCHASED",
            title: "¡Bono comprado!",
            message: `Tu ${passLabel} está activo. Tienes ${classes} clase(s) disponibles para reservar.`,
            link: "/area-privada/bonos",
        });

        // Email (student)
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

        // Admin notification
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
