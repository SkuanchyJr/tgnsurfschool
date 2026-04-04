"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { revalidatePath } from "next/cache";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia" as any, // using current types
});

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
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

// Helper: admin client (bypasses RLS for reads)
function getAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// ─────────────────────────────────────────────
// 1. Fetch active services (for the filter)
// ─────────────────────────────────────────────
export async function getServices(): Promise<{ success: boolean; data?: Service[]; error?: string }> {
    try {
        const admin = getAdminClient();
        const { data, error } = await admin
            .from("services")
            .select("*")
            .eq("is_active", true)
            .order("type", { ascending: true });

        if (error) {
            console.error("Error fetching services:", error);
            return { success: false, error: "No se pudieron cargar los servicios." };
        }

        return { success: true, data };
    } catch (e) {
        console.error("Unexpected error in getServices:", e);
        return { success: false, error: "Error inesperado al cargar servicios." };
    }
}

// ─────────────────────────────────────────────
// 2. Fetch available classes (public, no auth)
//    Only returns SCHEDULED classes with spots remaining,
//    from today onwards.
// ─────────────────────────────────────────────
export async function getAvailableClasses(): Promise<{ success: boolean; data?: AvailableClass[]; error?: string }> {
    try {
        const admin = getAdminClient();
        const today = new Date().toISOString().split("T")[0];

        // Fetch all scheduled classes from today onwards
        const { data: classes, error } = await admin
            .from("classes")
            .select(`
                id, date, time, duration_minutes, level, max_capacity, notes, service_id,
                service:service_id ( title, type, price )
            `)
            .eq("status", "SCHEDULED")
            .gte("date", today)
            .order("date", { ascending: true })
            .order("time", { ascending: true });

        if (error) {
            console.error("Error fetching classes:", error);
            return { success: false, error: "No se pudieron cargar las clases disponibles." };
        }

        if (!classes || classes.length === 0) {
            return { success: true, data: [] };
        }

        // Fetch booking counts per class (non-cancelled)
        const classIds = (classes as any[]).map(c => c.id);
        const { data: bookings } = await admin
            .from("bookings")
            .select("class_id, pax")
            .in("class_id", classIds)
            .neq("status", "CANCELLED");

        const paxByClass: Record<string, number> = {};
        for (const b of (bookings || [])) {
            if (b.class_id) {
                paxByClass[b.class_id] = (paxByClass[b.class_id] || 0) + b.pax;
            }
        }

        // Build available classes with spots left
        const available: AvailableClass[] = (classes as any[])
            .map(c => {
                const totalBooked = paxByClass[c.id] || 0;
                const spotsLeft = c.max_capacity - totalBooked;
                const service = Array.isArray(c.service) ? c.service[0] : c.service;

                return {
                    id: c.id,
                    date: c.date,
                    time: c.time,
                    duration_minutes: c.duration_minutes,
                    level: c.level,
                    max_capacity: c.max_capacity,
                    spots_left: spotsLeft,
                    service_id: c.service_id,
                    service_title: service?.title || null,
                    service_type: service?.type || null,
                    service_price: service?.price || null,
                    notes: c.notes,
                };
            })
            .filter(c => c.spots_left > 0); // Only show classes with remaining spots

        return { success: true, data: available };
    } catch (e) {
        console.error("Unexpected error in getAvailableClasses:", e);
        return { success: false, error: "Error inesperado al cargar clases." };
    }
}

// ─────────────────────────────────────────────
// 3. Create booking linked to a specific class
// ─────────────────────────────────────────────
export async function createBooking(
    classId: string,
    pax: number,
    usePass: boolean = false
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        // 1. Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Debes iniciar sesión para completar la reserva." };
        }

        const admin = getAdminClient();

        // 2. Ensure user exists in public.users
        await admin.from("users").upsert({
            id: user.id,
            email: user.email,
            name: user.email?.split("@")[0] || "Alumno",
            role: "STUDENT",
        }, { onConflict: "id" });

        // 3. Fetch the class to validate availability
        const { data: cls, error: clsError } = await admin
            .from("classes")
            .select("id, date, time, max_capacity, status, service_id")
            .eq("id", classId)
            .single();

        if (clsError || !cls) {
            return { success: false, error: "La clase seleccionada no existe." };
        }

        if (cls.status !== "SCHEDULED") {
            return { success: false, error: "Esta clase ya no está disponible para reservas." };
        }

        // 4. Check capacity
        const { data: existingBookings } = await admin
            .from("bookings")
            .select("pax")
            .eq("class_id", classId)
            .neq("status", "CANCELLED");

        const totalBooked = (existingBookings || []).reduce((sum: number, b: any) => sum + b.pax, 0);
        if (totalBooked + pax > cls.max_capacity) {
            return { success: false, error: `Solo quedan ${cls.max_capacity - totalBooked} plazas disponibles.` };
        }

        // 5. Check if user already has a booking for this class
        const { data: existingUserBooking } = await admin
            .from("bookings")
            .select("id")
            .eq("class_id", classId)
            .eq("user_id", user.id)
            .neq("status", "CANCELLED")
            .maybeSingle();

        if (existingUserBooking) {
            return { success: false, error: "Ya tienes una reserva para esta clase." };
        }

        // 6. Handle Pass usage
        if (usePass) {
            const now = new Date().toISOString();
            // Find an active pass with enough classes
            const { data: pass, error: passError } = await admin
                .from("user_passes")
                .select("id, remaining_classes")
                .eq("user_id", user.id)
                .eq("status", "ACTIVE")
                .gt("expiry_date", now)
                .gte("remaining_classes", pax)
                .order("expiry_date", { ascending: true }) // Use the one that expires sooner
                .limit(1)
                .maybeSingle();

            if (passError || !pass) {
                return { success: false, error: "No tienes un bono con clases suficientes disponible." };
            }

            // 7. Deduct classes and record booking
            const { error: updateError } = await admin
                .from("user_passes")
                .update({ 
                    remaining_classes: pass.remaining_classes - pax,
                    status: (pass.remaining_classes - pax) === 0 ? 'EXHAUSTED' : 'ACTIVE'
                })
                .eq("id", pass.id);

            if (updateError) {
                console.error("Error updating pass balance:", updateError);
                return { success: false, error: "Error al descontar las clases del bono." };
            }

            const { error: insertError } = await admin
                .from("bookings")
                .insert({
                    user_id: user.id,
                    class_id: classId,
                    service_id: cls.service_id,
                    date: cls.date,
                    time: cls.time,
                    pax: pax,
                    status: "CONFIRMED", // Fully paid via pass
                });

            if (insertError) {
                console.error("Error inserting booking with pass:", insertError);
                return { success: false, error: "Error al registrar la reserva." };
            }

            revalidatePath("/area-privada");
            return { success: true };
        }

        // 8. INSERTING PENDING BOOKING (For manual wire/other if needed, though Stripe is the main path)
        // Note: For Stripe flow, booking is created by the webhook or we can pre-create it here as PENDING.
        // The current implementation seems to only use createCheckoutSession for Stripe and webhook for creation.
        // We leave this here as a fallback if the user wants to support manual booking creation as PENDING.
        const { error: insertError } = await admin
            .from("bookings")
            .insert({
                user_id: user.id,
                class_id: classId,
                service_id: cls.service_id,
                date: cls.date,
                time: cls.time,
                pax: pax,
                status: "PENDING",
            });

        if (insertError) {
            console.error("Error inserting booking:", insertError);
            return { success: false, error: "Hubo un error al procesar tu reserva. Inténtalo de nuevo." };
        }

        return { success: true };
    } catch (e) {
        console.error("Unexpected error in createBooking:", e);
        return { success: false, error: "Error de servidor al crear la reserva." };
    }
}

// ─────────────────────────────────────────────
// 4. Create Stripe Checkout Session
// ─────────────────────────────────────────────
export async function createCheckoutSession(
    classId: string,
    pax: number
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const supabase = await createClient();

        // 1. Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Debes iniciar sesión para completar la reserva." };
        }

        const admin = getAdminClient();

        // 2. Fetch the class to validate availability
        const { data: cls, error: clsError } = await admin
            .from("classes")
            .select("id, date, time, max_capacity, status, service_id")
            .eq("id", classId)
            .single();

        if (clsError || !cls) {
            return { success: false, error: "La clase seleccionada no existe." };
        }

        if (cls.status !== "SCHEDULED") {
            return { success: false, error: "Esta clase ya no está disponible para reservas." };
        }

        // 3. Check capacity
        const { data: existingBookings } = await admin
            .from("bookings")
            .select("pax")
            .eq("class_id", classId)
            .neq("status", "CANCELLED");

        const totalBooked = (existingBookings || []).reduce((sum: number, b: any) => sum + b.pax, 0);
        if (totalBooked + pax > cls.max_capacity) {
            return { success: false, error: `Solo quedan ${cls.max_capacity - totalBooked} plazas disponibles.` };
        }

        // 4. Check if user already has a booking for this class
        const { data: existingUserBooking } = await admin
            .from("bookings")
            .select("id")
            .eq("class_id", classId)
            .eq("user_id", user.id)
            .neq("status", "CANCELLED")
            .maybeSingle();

        if (existingUserBooking) {
            return { success: false, error: "Ya tienes una reserva para esta clase." };
        }

        // 5. Create Stripe Checkout Session
        // Deposit is flat 5 EUR per PAX or always 5 EUR?
        // User requested: "Antes de reservar, debe pagar 5€". Let's assume 5 EUR total or per pax. Usually it's per pax or a flat fee. Let's make it 5 EUR total for simplicity or 5*pax. Let's do 5 EUR total deposit as simple implementation or 5 EUR pax. I'll make it 5 EUR total to be safe, or 500 cents. Wait, "Before booking, user pays 5€". It doesn't say per person, let's say 500 cents (5€) flat deposit.
        const origin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: `Reserva Clase de Surf (${cls.date})`,
                            description: `Reserva para ${pax} persona(s) a las ${cls.time.substring(0, 5)}`,
                        },
                        unit_amount: 500, // 5€
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${origin}/reservas/success`,
            cancel_url: `${origin}/reservas/cancel`,
            metadata: {
                classId: classId,
                userId: user.id,
                pax: pax.toString(),
            },
            customer_email: user.email,
        });

        return { success: true, url: session.url as string };
    } catch (e) {
        console.error("Unexpected error in createCheckoutSession:", e);
        return { success: false, error: "Error de servidor al procesar el pago." };
    }
}
