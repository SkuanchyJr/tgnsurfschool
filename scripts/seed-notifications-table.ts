/**
 * Script to create the `notifications` table in Supabase.
 * Run with: npx tsx scripts/seed-notifications-table.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
    console.log("🔧 Creating notifications table...");

    const { error } = await supabase.rpc("exec_sql", {
        query: `
            CREATE TABLE IF NOT EXISTS notifications (
                id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type        text NOT NULL,
                title       text NOT NULL,
                message     text NOT NULL,
                link        text,
                read        boolean NOT NULL DEFAULT false,
                created_at  timestamptz NOT NULL DEFAULT now()
            );

            CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
            CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
        `,
    });

    if (error) {
        // If the RPC doesn't exist, try raw SQL via REST
        console.log("⚠️  RPC exec_sql not available, trying direct SQL...");
        
        // Fallback: create via the Supabase management API
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
                    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
                },
                body: JSON.stringify({
                    query: `
                        CREATE TABLE IF NOT EXISTS notifications (
                            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                            type text NOT NULL,
                            title text NOT NULL,
                            message text NOT NULL,
                            link text,
                            read boolean NOT NULL DEFAULT false,
                            created_at timestamptz NOT NULL DEFAULT now()
                        );
                        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
                        CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
                    `,
                }),
            }
        );

        if (!res.ok) {
            console.error("❌ Could not create table automatically.");
            console.log("\n📋 Please run this SQL manually in the Supabase SQL Editor:\n");
            console.log(`
CREATE TABLE IF NOT EXISTS notifications (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        text NOT NULL,
    title       text NOT NULL,
    message     text NOT NULL,
    link        text,
    read        boolean NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
            `);
            return;
        }
    }

    console.log("✅ Notifications table created successfully!");
}

main().catch(console.error);
