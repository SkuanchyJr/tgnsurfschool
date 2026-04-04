"use server";

import pool from "@/lib/db";
import { getUser } from "@/lib/session";

export type Notification = {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    read: boolean;
    created_at: string;
};

export async function getMyNotifications(): Promise<Notification[]> {
    const user = await getUser();
    if (!user) return [];

    const result = await pool.query<Notification>(
        `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
        [user.id]
    );
    return result.rows;
}

export async function getUnreadCount(): Promise<number> {
    const user = await getUser();
    if (!user) return 0;

    const result = await pool.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false`,
        [user.id]
    );
    return parseInt(result.rows[0]?.count ?? "0", 10);
}

export async function markNotificationRead(notificationId: string): Promise<{ success: boolean }> {
    const user = await getUser();
    if (!user) return { success: false };

    await pool.query(
        `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`,
        [notificationId, user.id]
    );
    return { success: true };
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
    const user = await getUser();
    if (!user) return { success: false };

    await pool.query(
        `UPDATE notifications SET read = true WHERE user_id = $1 AND read = false`,
        [user.id]
    );
    return { success: true };
}
