"use server";

import { getUser } from "@/lib/session";
import pool from "@/lib/db";
import Stripe from "stripe";

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
    'BONO_1': { title: 'Clase Suelta', classes: 1, price: 3500 },
    'BONO_5': { title: 'Bono 5 Clases', classes: 5, price: 16000 },
    'BONO_10': { title: 'Bono 10 Clases', classes: 10, price: 30000 },
};

export async function getStudentPasses(): Promise<{ success: boolean; data?: UserPass[]; error?: string }> {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "No autenticado" };

        const now = new Date().toISOString();
        const result = await pool.query(
            `SELECT * FROM user_passes
             WHERE user_id = $1 AND status = 'ACTIVE' AND expiry_date > $2
             ORDER BY created_at DESC`,
            [user.id, now]
        );

        return { success: true, data: result.rows as UserPass[] };
    } catch (e) {
        console.error("Unexpected error in getStudentPasses:", e);
        return { success: false, error: "Error de servidor al cargar bonos." };
    }
}

export async function createPassCheckoutSession(passType: PassType): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const user = await getUser();
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
