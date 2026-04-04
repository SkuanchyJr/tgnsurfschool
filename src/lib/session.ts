import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export type SessionUser = {
    id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
};

export type AppSession = {
    user?: SessionUser;
};

export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_SECRET || 'fallback-secret-at-least-32-chars-long!!',
    cookieName: 'tgn_session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
    },
};

export async function getSession(): Promise<IronSession<AppSession>> {
    const cookieStore = await cookies();
    return getIronSession<AppSession>(cookieStore, sessionOptions);
}

export async function getUser(): Promise<SessionUser | null> {
    const session = await getSession();
    return session.user ?? null;
}
