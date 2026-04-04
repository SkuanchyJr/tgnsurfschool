"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getAdmin() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

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

/**
 * Get all notifications for the currently authenticated user
 */
export async function getMyNotifications(): Promise<Notification[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const admin = getAdmin();
    const { data } = await admin
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

    return (data || []) as Notification[];
}

/**
 * Get unread notification count for the current user
 */
export async function getUnreadCount(): Promise<number> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const admin = getAdmin();
    const { count } = await admin
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);

    return count || 0;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<{ success: boolean }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const admin = getAdmin();
    const { error } = await admin
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", user.id);

    return { success: !error };
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const admin = getAdmin();
    const { error } = await admin
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

    return { success: !error };
}
