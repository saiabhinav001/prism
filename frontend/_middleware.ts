import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // We cannot check localStorage in middleware (it runs on server/edge), 
    // but we can check for a cookie if we had one. 
    // Since we use localStorage, we rely on client-side protection (AuthProvider).
    // However, we can basic route protection logic here if needed.

    // For this architecture (JWT in localStorage), middleware is limited.
    // We will rely on AuthProvider for auth guards.
    return NextResponse.next()
}

export const config = {
    matcher: '/dashboard/:path*',
}
