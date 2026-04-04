"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { revalidatePath } from "next/cache";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-02-24.acacia" as any,
});

export type PassType = 'BONO_5' | 'BONO_10' | 'BONO_1';

export interface UserPass {
    id: string;
    user_id: string;
    type: PassType;
    total_classes: number;
    remaining_classes: number;
    status: 'ACTIVE' | 'EXHAUSTED' | 'EXPIRED';
    expiry_date: string;
    created_at: string;
}

const PASS_CONFIG: Record<PassType, { title: string; classes: number; price: number }> = {
    'BONO_1': { title: 'Clase Suelta', classes: 1, price: 3500 }, // 35€
    'BONO_5': { title: 'Bono 5 Clases', classes: 5, price: 16000 }, // 160€
    'BONO_10': { title: 'Bono 10 Clases', classes: 10, price: 30000 }, // 300€
};

function getAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

/**
 * 1. Get active passes for the logged-in student
 */
export async function getStudentPasses(): Promise<{ success: boolean; data?: UserPass[]; error?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "No autenticado" };

        const admin = getAdminClient();
        const now = new Date().toISOString();

        const { data, error } = await admin
            .from("user_passes")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "ACTIVE")
            .gt("expiry_date", now)
            .order("created_at", { ascending: false });

        if (error) {
            // Handle table not found or other errors as 0 passes if DB isn't ready
            console.error("Error fetching passes:", error);
            return { success: true, data: [] };
        }

        return { success: true, data };
    } catch (e) {
        console.error("Unexpected error in getStudentPasses:", e);
        return { success: false, error: "Error de servidor al cargar bonos." };
    }
}

/**
 * 2. Create Stripe Checkout Session for buying a pass
 */
export async function createPassCheckoutSession(passType: PassType): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Debes iniciar sesión para comprar un bono." };

        const config = PASS_CONFIG[passType];
        if (!config) return { success: false, error: "Tipo de bono no válido." };

        const origin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: config.title,
                            description: `Acceso a ${config.classes} clases de surf en TGN Surf School.`,
                        },
                        unit_amount: config.price,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${origin}/area-privada/bonos?success=true`,
            cancel_url: `${origin}/area-privada/bonos?cancel=true`,
            metadata: {
                type: 'PASS_PURCHASE',
                userId: user.id,
                passType: passType,
                classCount: config.classes.toString(),
            },
            customer_email: user.email,
        });

        return { success: true, url: session.url as string };
    } catch (e) {
        console.error("Unexpected error in createPassCheckoutSession:", e);
        return { success: false, error: "Error al procesar la compra del bono." };
    }
}
