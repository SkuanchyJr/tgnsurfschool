import { NextResponse, type NextRequest } from 'next/server'
import { unsealData } from 'iron-session'
import type { AppSession } from '@/lib/session'

const sessionPassword = process.env.SESSION_SECRET || 'fallback-secret-at-least-32-chars-long!!'
const cookieName = 'tgn_session'

async function getSessionFromRequest(request: NextRequest): Promise<AppSession['user'] | null> {
    try {
        const cookieValue = request.cookies.get(cookieName)?.value
        if (!cookieValue) return null
        const session = await unsealData<AppSession>(cookieValue, { password: sessionPassword })
        return session.user ?? null
    } catch {
        return null
    }
}

export async function middleware(request: NextRequest) {
    const response = NextResponse.next({ request })
    const user = await getSessionFromRequest(request)

    const { pathname } = request.nextUrl

    const isStudentProtectedRoute = pathname.startsWith('/area-privada') || pathname.startsWith('/webcam')
    const isAdminRoute = pathname.startsWith('/admin')
    const isInstructorRoute = pathname.startsWith('/instructor')
    const isRoleRestrictedRoute = isAdminRoute || isInstructorRoute
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/registro')

    if (!user && (isStudentProtectedRoute || isRoleRestrictedRoute)) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/login'
        return NextResponse.redirect(loginUrl)
    }

    if (user && isRoleRestrictedRoute) {
        const allowedRoles = ['ADMIN', 'INSTRUCTOR']
        if (!allowedRoles.includes(user.role)) {
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/area-privada'
            return NextResponse.redirect(redirectUrl)
        }
    }

    if (user && isAuthRoute) {
        const dashboardUrl = request.nextUrl.clone()
        dashboardUrl.pathname = '/area-privada'
        return NextResponse.redirect(dashboardUrl)
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
