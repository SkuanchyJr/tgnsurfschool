import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Do not add logic between createServerClient and getUser().
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    const isStudentProtectedRoute = pathname.startsWith('/area-privada') || pathname.startsWith('/webcam')
    const isAdminRoute = pathname.startsWith('/admin')
    const isInstructorRoute = pathname.startsWith('/instructor')
    const isRoleRestrictedRoute = isAdminRoute || isInstructorRoute
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/registro')

    // 1. Unauthenticated user trying to access any protected route → /login
    if (!user && (isStudentProtectedRoute || isRoleRestrictedRoute)) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/login'
        return NextResponse.redirect(loginUrl)
    }

    // 2. Authenticated user trying to access /admin or /instructor → role check
    if (user && isRoleRestrictedRoute) {
        // Use service role client to bypass RLS and read the user's role reliably
        const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        const { data: publicUser } = await adminClient
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        const allowedRoles = isAdminRoute
            ? ['ADMIN', 'INSTRUCTOR']
            : ['ADMIN', 'INSTRUCTOR'] // /instructor requires same roles for now

        if (!publicUser || !allowedRoles.includes(publicUser.role)) {
            // Authenticated but wrong role → send to student area
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/area-privada'
            return NextResponse.redirect(redirectUrl)
        }
    }

    // 3. Authenticated user trying to access login/register → student area
    if (user && isAuthRoute) {
        const dashboardUrl = request.nextUrl.clone()
        dashboardUrl.pathname = '/area-privada'
        return NextResponse.redirect(dashboardUrl)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
