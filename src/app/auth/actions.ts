'use server'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

export async function signOut() {
    const session = await getSession()
    session.destroy()
    return redirect('/login')
}
