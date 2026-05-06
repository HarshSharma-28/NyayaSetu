import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip static files, api routes, images, etc.
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/images')) {
    return NextResponse.next();
  }

  // Auth pages
  if (pathname === '/login' || pathname === '/otp') {
    return NextResponse.next();
    // In a real app with cookies, we'd check if token exists and redirect to dashboard
  }

  // Prototype: Note that localStorage is not accessible in middleware.
  // Real implementation requires httpOnly cookies for JWT.
  // For the prototype, we assume client-side checks handle the actual unauthenticated redirects
  // if not using cookies. However, to fulfill the prompt exactly as requested ("Read session from localStorage cookie"):
  // We can't actually read localStorage here. But we can read cookies.
  
  // Since we can't read localStorage in middleware, we'll let the client components handle it,
  // or assume we use cookies in production.
  
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
