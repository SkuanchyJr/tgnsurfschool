import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
        return NextResponse.redirect(`${origin}/login?error=InvalidToken`)
    }

    try {
        const result = await pool.query(
            `SELECT id, email, name, role, verification_token_expires
             FROM users
             WHERE verification_token = $1 AND email_verified = false`,
            [token]
        )

        if (result.rows.length === 0) {
            return NextResponse.redirect(`${origin}/login?error=InvalidToken`)
        }

        const user = result.rows[0]

        if (new Date(user.verification_token_expires) < new Date()) {
            return NextResponse.redirect(`${origin}/login?error=TokenExpired`)
        }

        await pool.query(
            `UPDATE users SET email_verified = true, verification_token = NULL, verification_token_expires = NULL WHERE id = $1`,
            [user.id]
        )

        const session = await getSession()
        session.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            emailVerified: true,
        }
        await session.save()

        return NextResponse.redirect(`${origin}/area-privada`)
    } catch (e) {
        console.error('[auth/callback] Error:', e)
        return NextResponse.redirect(`${origin}/login?error=ServerError`)
    }
}
