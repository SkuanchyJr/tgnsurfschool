import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) console.error(error);
    else console.log("Users columns:", Object.keys(data[0] || {}));

    // Try to find a vouchers table
    const { data: v, error: ve } = await supabase.from('vouchers').select('*').limit(1);
    if (ve) console.log("No vouchers table found or error:", ve.message);
    else console.log("Vouchers table exists. Columns:", Object.keys(v[0] || {}));
}

main();
