import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/register'];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Redirect to login if accessing protected route without authentication
  if (!sessionToken && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Redirect to PLC Control if accessing auth pages while authenticated
  if (sessionToken && isPublicPath) {
    return NextResponse.redirect(new URL('/plc-control', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 