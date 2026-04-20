"use server";

import pool from "@/lib/db";
import { getUser } from "@/lib/session";
import Stripe from "stripe";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { type LegalData } from "./components/LegalCheckbox";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'STRIPE_DUMMY_KEY', {
    apiVersion: "2025-02-24.acacia" as any,
});

export type Service = {
    id: string;
    title: string;
    description: string;
    price: number;
    type: string;
    is_active: boolean;
};

export type AvailableClass = {
    id: string;
    date: string;
    time: string;
    duration_minutes: number;
    level: string;
    max_capacity: number;
    spots_left: number;
    service_id: string | null;
    service_title: string | null;
    service_type: string | null;
    service_price: number | null;
    notes: string | null;
};

export async function getStudentProfile(): Promise<{ success: boolean; data?: { birthdate: string | null; dni: string | null }; error?: string }> {
    const user = await getUser();
    if (!user) return { success: false, error: "No autenticado" };

    try {
        const result = await pool.query(
            `SELECT birthdate, dni FROM users WHERE id = $1`,
            [user.id]
        );
        return { success: true, data: result.rows[0] };
    } catch (e) {
        console.error("[getStudentProfile] Error:", e);
        return { success: false, error: "Error al cargar perfil." };
    }
}

export async function getServices(): Promise<{ success: boolean; data?: Service[]; error?: string }> {
    try {
        const result = await pool.query<Service>(
            `SELECT * FROM services WHERE is_active = true ORDER BY type ASC`
        );
        return { success: true, data: result.rows };
    } catch (e) {
        console.error("[getServices] Error:", e);
        return { success: false, error: "No se pudieron cargar los servicios." };
    }
}

export async function getAvailableClasses(): Promise<{ success: boolean; data?: AvailableClass[]; error?: string }> {
    try {
        const today = new Date().toISOString().split("T")[0];

        const result = await pool.query(
            `SELECT
                c.id, c.date, c.time, c.duration_minutes, c.level, c.max_capacity, c.notes, c.service_id,
                s.title as service_title, s.type as service_type, s.price as service_price,
                COALESCE((
                    SELECT SUM(b.pax) FROM bookings b
                    WHERE b.class_id = c.id AND b.status != 'CANCELLED'
                ), 0) as booked_pax
             FROM classes c
             LEFT JOIN services s ON s.id = c.service_id
             WHERE c.status = 'SCHEDULED' AND c.date >= $1
             ORDER BY c.date ASC, c.time ASC`,
            [today]
        );

        const available: AvailableClass[] = result.rows
            .map((c: any) => ({
                id: c.id,
                date: c.date,
                time: c.time,
                duration_minutes: c.duration_minutes,
                level: c.level,
                max_capacity: c.max_capacity,
                spots_left: c.max_capacity - parseInt(c.booked_pax, 10),
                service_id: c.service_id,
                service_title: c.service_title,
                service_type: c.service_type,
                service_price: c.service_price ? parseFloat(c.service_price) : null,
                notes: c.notes,
            }))
            .filter((c: AvailableClass) => c.spots_left > 0);

        return { success: true, data: available };
    } catch (e) {
        console.error("[getAvailableClasses] Error:", e);
        return { success: false, error: "Error inesperado al cargar clases." };
    }
}

export async function createBooking(
    classId: string,
    pax: number,
    usePass: boolean = false,
    legalData?: LegalData
): Promise<{ success: boolean; error?: string }> {
    const user = await getUser();
    if (!user) return { success: false, error: "Debes iniciar sesión para completar la reserva." };

    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "unknown";
    const legalVersion = "2026-04-v1";

    const client = await pool.connect();
    try {
        const clsResult = await client.query(
            `SELECT id, date, time, max_capacity, status, service_id FROM classes WHERE id = $1`,
            [classId]
        );
        if (clsResult.rows.length === 0) return { success: false, error: "La clase seleccionada no existe." };
        const cls = clsResult.rows[0];

        if (cls.status !== "SCHEDULED") return { success: false, error: "Esta clase ya no está disponible para reservas." };

        const paxResult = await client.query(
            `SELECT COALESCE(SUM(pax), 0) as total FROM bookings WHERE class_id = $1 AND status != 'CANCELLED'`,
            [classId]
        );
        const totalBooked = parseInt(paxResult.rows[0].total, 10);
        if (totalBooked + pax > cls.max_capacity) {
            return { success: false, error: `Solo quedan ${cls.max_capacity - totalBooked} plazas disponibles.` };
        }

        const existingResult = await client.query(
            `SELECT id FROM bookings WHERE class_id = $1 AND user_id = $2 AND status != 'CANCELLED'`,
            [classId, user.id]
        );
        if (existingResult.rows.length > 0) return { success: false, error: "Ya tienes una reserva para esta clase." };

        if (usePass) {
            const passResult = await client.query(
                `SELECT id, remaining_classes FROM user_passes
                 WHERE user_id = $1 AND status = 'ACTIVE' AND expiry_date > NOW() AND remaining_classes >= $2
                 ORDER BY expiry_date ASC LIMIT 1`,
                [user.id, pax]
            );
            if (passResult.rows.length === 0) return { success: false, error: "No tienes un bono con clases suficientes disponible." };
            const pass = passResult.rows[0];
            const newRemaining = pass.remaining_classes - pax;

            await client.query(
                `UPDATE user_passes SET remaining_classes = $1, status = $2 WHERE id = $3`,
                [newRemaining, newRemaining === 0 ? "EXHAUSTED" : "ACTIVE", pass.id]
            );
            await client.query(
                `INSERT INTO bookings (
                    user_id, class_id, service_id, date, time, pax, status,
                    legal_accepted_at, legal_accepted_ip, legal_version,
                    is_minor, tutor_name, tutor_id, tutor_phone, emergency_contact
                 ) VALUES ($1, $2, $3, $4, $5, $6, 'CONFIRMED', NOW(), $7, $8, $9, $10, $11, $12, $13)`,
                [
                    user.id, classId, cls.service_id, cls.date, cls.time, pax,
                    ip, legalVersion,
                    legalData?.isMinor || false,
                    legalData?.tutorName || null,
                    legalData?.tutorId || null,
                    legalData?.tutorPhone || null,
                    legalData?.emergencyContact || null
                ]
            );

            // Update user DNI and Birthdate if not set
            if (legalData?.dni || legalData?.birthdate) {
                await client.query(
                    `UPDATE users SET 
                        dni = COALESCE(dni, $1), 
                        birthdate = COALESCE(birthdate, $2) 
                     WHERE id = $3`,
                    [legalData.dni || null, legalData.birthdate || null, user.id]
                );
            }
            revalidatePath("/area-privada");
            return { success: true };
        }

        await client.query(
            `INSERT INTO bookings (
                user_id, class_id, service_id, date, time, pax, status,
                legal_accepted_at, legal_accepted_ip, legal_version,
                is_minor, tutor_name, tutor_id, tutor_phone, emergency_contact
             ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', NOW(), $7, $8, $9, $10, $11, $12, $13)`,
            [
                user.id, classId, cls.service_id, cls.date, cls.time, pax,
                ip, legalVersion,
                legalData?.isMinor || false,
                legalData?.tutorName || null,
                legalData?.tutorId || null,
                legalData?.tutorPhone || null,
                legalData?.emergencyContact || null
            ]
        );

        // Update user DNI and Birthdate if not set
        if (legalData?.dni || legalData?.birthdate) {
            await client.query(
                `UPDATE users SET 
                    dni = COALESCE(dni, $1), 
                    birthdate = COALESCE(birthdate, $2) 
                 WHERE id = $3`,
                [legalData.dni || null, legalData.birthdate || null, user.id]
            );
        }
        return { success: true };
    } catch (e) {
        console.error("[createBooking] Error:", e);
        return { success: false, error: "Error de servidor al crear la reserva." };
    } finally {
        client.release();
    }
}

export async function createCheckoutSession(
    classId: string,
    pax: number,
    legalData?: LegalData
): Promise<{ success: boolean; url?: string; error?: string }> {
    const user = await getUser();
    if (!user) return { success: false, error: "Debes iniciar sesión para completar la reserva." };

    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "unknown";
    const legalVersion = "2026-04-v1";

    try {
        const clsResult = await pool.query(
            `SELECT id, date, time, max_capacity, status FROM classes WHERE id = $1`,
            [classId]
        );
        if (clsResult.rows.length === 0) return { success: false, error: "La clase seleccionada no existe." };
        const cls = clsResult.rows[0];

        if (cls.status !== "SCHEDULED") return { success: false, error: "Esta clase ya no está disponible para reservas." };

        const paxResult = await pool.query(
            `SELECT COALESCE(SUM(pax), 0) as total FROM bookings WHERE class_id = $1 AND status != 'CANCELLED'`,
            [classId]
        );
        const totalBooked = parseInt(paxResult.rows[0].total, 10);
        if (totalBooked + pax > cls.max_capacity) {
            return { success: false, error: `Solo quedan ${cls.max_capacity - totalBooked} plazas disponibles.` };
        }

        const existingResult = await pool.query(
            `SELECT id FROM bookings WHERE class_id = $1 AND user_id = $2 AND status != 'CANCELLED'`,
            [classId, user.id]
        );
        if (existingResult.rows.length > 0) return { success: false, error: "Ya tienes una reserva para esta clase." };

        const origin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: `Reserva Clase de Surf (${cls.date})`,
                        description: `Reserva para ${pax} persona(s) a las ${String(cls.time).substring(0, 5)}`,
                    },
                    unit_amount: 500,
                },
                quantity: 1,
            }],
            mode: "payment",
            success_url: `${origin}/reservas/success`,
            cancel_url: `${origin}/reservas/cancel`,
            metadata: { 
                classId, 
                userId: user.id, 
                pax: pax.toString(),
                legalIp: ip,
                legalVersion: legalVersion,
                legalDni: legalData?.dni || "",
                legalBirthdate: legalData?.birthdate || "",
                legalIsMinor: legalData?.isMinor ? "true" : "false",
                legalTutorName: legalData?.tutorName || "",
                legalTutorId: legalData?.tutorId || "",
                legalTutorPhone: legalData?.tutorPhone || "",
                legalEmergency: legalData?.emergencyContact || ""
            },
            customer_email: user.email,
        });

        return { success: true, url: session.url as string };
    } catch (e) {
        console.error("[createCheckoutSession] Error:", e);
        return { success: false, error: "Error de servidor al procesar el pago." };
    }
}
