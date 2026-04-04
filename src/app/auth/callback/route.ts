import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/area-privada'

    if (code) {
        const supabase = await createClient()
        const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && sessionData?.user) {
            const user = sessionData.user

            // Ensure a public.users row exists for this user.
            // This runs after email confirmation — the authoritative moment
            // a user becomes "active" in the system.
            const adminClient = createAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                { auth: { autoRefreshToken: false, persistSession: false } }
            )

            const { error: upsertError } = await adminClient
                .from('users')
                .upsert(
                    {
                        id: user.id,
                        email: user.email,
                        name: user.user_metadata?.full_name
                            || user.email?.split('@')[0]
                            || 'Alumno',
                        role: 'STUDENT', // safe default — admin can promote via Supabase dashboard
                    },
                    { onConflict: 'id' } // idempotent: re-sending confirmation email is safe
                )

            if (upsertError) {
                // Log but do not block the user — they can still use the app.
                // A broken users row is recoverable; blocking login is not.
                console.error('[auth/callback] Failed to upsert public.users:', upsertError)
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=InvalidToken`)
}
