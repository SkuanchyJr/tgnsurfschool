import { NextResponse } from "next/server";
import Stripe from "stripe";
import pool from "@/lib/db";
import { notifyPassPurchase, notifyBookingConfirmation, notifyNewBookingToAdmin } from "@/lib/notifications";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-02-24.acacia" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get("stripe-signature");

        if (!signature || !webhookSecret) {
            console.error("Missing Stripe signature or webhook secret");
            return NextResponse.json({ error: "Missing configuration" }, { status: 400 });
        }

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error(`Webhook Error: ${err.message}`);
            return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const metadata = session.metadata;

            if (!metadata) {
                console.error("Missing metadata in checkout session.");
                return NextResponse.json({ received: true });
            }

            if (metadata.type === 'PASS_PURCHASE' && metadata.userId && metadata.passType && metadata.classCount) {
                const classCount = parseInt(metadata.classCount, 10);
                const expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + 6);

                try {
                    await pool.query(
                        `INSERT INTO user_passes (user_id, type, total_classes, remaining_classes, status, expiry_date, stripe_session_id)
                         VALUES ($1, $2, $3, $3, 'ACTIVE', $4, $5)`,
                        [metadata.userId, metadata.passType, classCount, expiryDate.toISOString(), session.id]
                    );
                    console.log(`Pass created for user ${metadata.userId}`);
                    notifyPassPurchase(metadata.userId, metadata.passType, classCount).catch(console.error);
                } catch (e) {
                    console.error("Error creating user pass:", e);
                }
            } else if (metadata.classId && metadata.userId && metadata.pax) {
                const existingResult = await pool.query(
                    `SELECT id FROM bookings WHERE class_id = $1 AND user_id = $2 AND status != 'CANCELLED'`,
                    [metadata.classId, metadata.userId]
                );

                if (existingResult.rows.length === 0) {
                    const clsResult = await pool.query(
                        `SELECT service_id, date, time FROM classes WHERE id = $1`,
                        [metadata.classId]
                    );

                    if (clsResult.rows.length > 0) {
                        const cls = clsResult.rows[0];
                        const pax = parseInt(metadata.pax, 10);

                        try {
                            await pool.query(
                                `INSERT INTO bookings (user_id, class_id, service_id, date, time, pax, status)
                                 VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')`,
                                [metadata.userId, metadata.classId, cls.service_id, cls.date, cls.time, pax]
                            );
                            console.log("Booking created from webhook for class:", metadata.classId);

                            let serviceName = "Clase de Surf";
                            if (cls.service_id) {
                                const svcResult = await pool.query(`SELECT title FROM services WHERE id = $1`, [cls.service_id]);
                                if (svcResult.rows.length > 0) serviceName = svcResult.rows[0].title;
                            }
                            const userResult = await pool.query(`SELECT name, email FROM users WHERE id = $1`, [metadata.userId]);
                            const userInfo = userResult.rows[0];

                            notifyBookingConfirmation(metadata.userId, { date: cls.date, time: cls.time, pax, serviceName }).catch(console.error);
                            notifyNewBookingToAdmin({
                                studentName: userInfo?.name || 'Alumno',
                                studentEmail: userInfo?.email || '',
                                date: cls.date,
                                time: cls.time,
                                pax,
                                serviceName,
                            }).catch(console.error);
                        } catch (e) {
                            console.error("Error inserting booking from webhook:", e);
                        }
                    } else {
                        console.error("Class not found for ID:", metadata.classId);
                    }
                } else {
                    console.log("Booking already exists, skipping (idempotency).");
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (e: any) {
        console.error("Unexpected error in webhook handler:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
