import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware / Proxy to enforce authentication routing.
 * Checks for session presence quickly in middleware and lets Server Components
 * perform full database authorization checks.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /admin/login alias to /auth/admin/login
  if (pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/auth/admin/login', request.url));
  }

  // Check for Better Auth session token cookie
  const sessionCookie =
    request.cookies.get('better-auth.session_token') ||
    request.cookies.get('__Secure-better-auth.session_token');

  // Allow login page without authentication
  if (pathname === '/auth/admin/login') {
    return NextResponse.next();
  }

  // If attempting to access /admin without a session token, redirect to login
  if (!sessionCookie?.value) {
    const loginUrl = new URL('/auth/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow request to proceed to server components where full session & role
  // authorization is performed via requireAdmin()
  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ['/admin', '/admin/:path*', '/auth/admin/login'],
};
