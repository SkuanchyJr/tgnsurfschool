import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { notifySessionReminder } from "@/lib/notifications";

/**
 * GET /api/cron/reminders
 *
 * Sends session reminder emails for all bookings whose class is tomorrow.
 * Protected with a secret token passed as ?secret=... query param.
 *
 * Call daily from: cron-job.org, Vercel cron, or Replit scheduler.
 * Example: https://yourdomain.com/api/cron/reminders?secret=YOUR_CRON_SECRET
 */
export async function GET(req: NextRequest) {
    const secret = req.nextUrl.searchParams.get("secret");
    if (!secret || secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // We target classes happening tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    try {
        // Find bookings for classes scheduled tomorrow that haven't received a reminder
        const result = await pool.query(
            `SELECT
                b.id                  AS booking_id,
                u.name                AS user_name,
                u.email               AS user_email,
                u.phone               AS user_phone,
                c.date                AS class_date,
                c.time                AS class_time,
                c.location            AS class_location,
                c.maps_url            AS maps_url,
                s.title               AS service_title,
                (
                    SELECT u2.name
                    FROM class_instructors ci2
                    JOIN users u2 ON u2.id = ci2.instructor_id
                    WHERE ci2.class_id = c.id
                    LIMIT 1
                )                     AS instructor_name
             FROM bookings b
             JOIN users u  ON u.id  = b.user_id
             JOIN classes c ON c.id = b.class_id
             LEFT JOIN services s ON s.id = b.service_id
             WHERE c.date = $1
               AND b.status IN ('CONFIRMED', 'PENDING')
               AND b.reminder_sent = false`,
            [tomorrowStr]
        );

        const bookings = result.rows as Array<{
            booking_id:     string;
            user_name:      string;
            user_email:     string;
            user_phone:     string | null;
            class_date:     string;
            class_time:     string;
            class_location: string | null;
            maps_url:       string | null;
            service_title:  string | null;
            instructor_name: string | null;
        }>;

        if (bookings.length === 0) {
            return NextResponse.json({ sent: 0, message: "No bookings to remind" });
        }

        let sent = 0;
        const errors: string[] = [];

        for (const b of bookings) {
            try {
                await notifySessionReminder({
                    bookingId:     b.booking_id,
                    userName:      b.user_name,
                    userEmail:     b.user_email,
                    userPhone:     b.user_phone ?? undefined,
                    classDate:     b.class_date,
                    classTime:     b.class_time,
                    location:      b.class_location ?? undefined,
                    mapsUrl:       b.maps_url ?? undefined,
                    serviceName:   b.service_title ?? undefined,
                    instructorName: b.instructor_name ?? undefined,
                });

                // Mark as sent
                await pool.query(
                    `UPDATE bookings SET reminder_sent = true WHERE id = $1`,
                    [b.booking_id]
                );
                sent++;
            } catch (err: any) {
                errors.push(`Booking ${b.booking_id}: ${err.message}`);
            }
        }

        return NextResponse.json({
            sent,
            total: bookings.length,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (err: any) {
        console.error("[cron/reminders] Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
