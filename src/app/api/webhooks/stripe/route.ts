import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { notifyPassPurchase, notifyBookingConfirmation, notifyNewBookingToAdmin } from "@/lib/notifications";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-02-24.acacia" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function getAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

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

            const admin = getAdminClient();

            // CASE 1: PASS PURCHASE
            if (metadata.type === 'PASS_PURCHASE' && metadata.userId && metadata.passType && metadata.classCount) {
                const classCount = parseInt(metadata.classCount, 10);
                const expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months validity

                const { error: passError } = await admin
                    .from("user_passes")
                    .insert({
                        user_id: metadata.userId,
                        type: metadata.passType,
                        total_classes: classCount,
                        remaining_classes: classCount,
                        status: 'ACTIVE',
                        expiry_date: expiryDate.toISOString(),
                        stripe_session_id: session.id,
                    });

                if (passError) {
                    console.error("Error creating user pass in webhook:", passError);
                } else {
                    console.log(`Pass created successfully for user ${metadata.userId} (Type: ${metadata.passType})`);
                    // Notify student + admins about pass purchase (non-blocking)
                    notifyPassPurchase(metadata.userId, metadata.passType, classCount).catch(console.error);
                }
            } 
            // CASE 2: SINGLE CLASS RESERVATION (DEPOSIT)
            else if (metadata.classId && metadata.userId && metadata.pax) {
                // 1. Check if we already created the booking (Idempotency)
                const { data: existingUserBooking } = await admin
                    .from("bookings")
                    .select("id")
                    .eq("class_id", metadata.classId)
                    .eq("user_id", metadata.userId)
                    .neq("status", "CANCELLED")
                    .maybeSingle();

                if (!existingUserBooking) {
                    // 2. Fetch the class to get service_id, date, time
                    const { data: cls } = await admin
                        .from("classes")
                        .select("service_id, date, time")
                        .eq("id", metadata.classId)
                        .single();

                    if (cls) {
                        // 3. Insert booking
                        const { error: insertError } = await admin
                            .from("bookings")
                            .insert({
                                user_id: metadata.userId,
                                class_id: metadata.classId,
                                service_id: cls.service_id,
                                date: cls.date,
                                time: cls.time,
                                pax: parseInt(metadata.pax, 10),
                                status: "PENDING", // Confirmed deposit
                            });

                        if (insertError) {
                            console.error("Error inserting booking from webhook:", insertError);
                        } else {
                            console.log("Booking created successfully from webhook for class:", metadata.classId);
                            // Fetch service name and user info for notifications
                            let serviceName = "Clase de Surf";
                            if (cls.service_id) {
                                const { data: svc } = await admin.from('services').select('title').eq('id', cls.service_id).single();
                                if (svc) serviceName = svc.title;
                            }
                            const { data: userInfo } = await admin.from('users').select('name, email').eq('id', metadata.userId).single();
                            const pax = parseInt(metadata.pax, 10);
                            notifyBookingConfirmation(metadata.userId, { date: cls.date, time: cls.time, pax, serviceName }).catch(console.error);
                            notifyNewBookingToAdmin({
                                studentName: userInfo?.name || 'Alumno',
                                studentEmail: userInfo?.email || '',
                                date: cls.date,
                                time: cls.time,
                                pax,
                                serviceName,
                            }).catch(console.error);
                        }
                    } else {
                        console.error("Class not found for ID:", metadata.classId);
                    }
                } else {
                    console.log("Booking already exists, skipping idempotency.");
                }
            } else {
                console.error("Unknown metadata configuration in checkout session payload.");
            }
        }

        return NextResponse.json({ received: true });
    } catch (e: any) {
        console.error("Unexpected error in webhook handler:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
