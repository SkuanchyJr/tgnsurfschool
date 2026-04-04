import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This is the standard client using the ANON key. It obeys Row Level Security (RLS).
export const supabase = createClient(supabaseUrl, supabaseKey);

// For admin tasks in Server Actions or API Routes where we need to bypass RLS.
// NEVER EXPOSE THIS TO THE CLIENT.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
