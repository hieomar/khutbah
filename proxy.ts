import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/auth/auth';

/**
 * Next.js Middleware / Proxy to enforce authentication and authorization.
 * Only users with the 'admin' role and 'active' status can access /admin routes.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow admin login page without authentication
  if (pathname === '/admin/login' || pathname === '/auth/admin/login') {
    // If the user is already authenticated as an active admin, redirect to admin dashboard
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      const user = session?.user as { role?: string; status?: string } | undefined;
      if (session && user?.role === 'admin' && user?.status === 'active') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } catch {
      // If session check fails on login page, proceed to show login form
    }
    return NextResponse.next();
  }

  // Redirect /admin/login alias to /auth/admin/login if requested
  if (pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/auth/admin/login', request.url));
  }

  // Check authentication & admin authorization for all /admin routes
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const user = session?.user as { role?: string; status?: string } | undefined;

    // Check if user is authenticated and is an active admin
    const isAuthenticated = Boolean(session && user);
    const isAdmin = user?.role === 'admin';
    const isActive = user?.status === 'active';

    if (!isAuthenticated || !isAdmin || !isActive) {
      const loginUrl = new URL('/auth/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    // Fallback redirect on session verification failure
    const loginUrl = new URL('/auth/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export default proxy;

export const config = {
  matcher: ['/admin', '/admin/:path*', '/auth/admin/login'],
};
