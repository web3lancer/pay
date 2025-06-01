// filepath: /home/nathfavour/Documents/code/web3lancer/pay/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that require authentication
const protectedPaths = [
  '/dashboard', // Example: general dashboard
  '/profile',   // Example: user profile page
  '/settings',  // Example: user settings
  // Add other paths that should be protected, e.g., specific sections of /pay if needed
];

// Define paths that are public (e.g., login, register, landing page)
// Middleware will not redirect if current path is one of these, even if not authenticated.
const publicPaths = [
  '/login',
  '/register',
  '/', // Assuming landing page is public
  // Add any specific public sub-paths of /pay if they exist
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Attempt to get an authentication token (e.g., from a cookie)
  // Replace 'auth-token' with your actual cookie name or session check mechanism
  const isAuthenticated = !!request.cookies.get('auth-token')?.value;

  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));
  
  // Allow access to public paths regardless of authentication status,
  // unless specific logic below dictates otherwise (e.g., redirecting logged-in users from /login)
  if (publicPaths.some(path => pathname === path || (path !== '/' && pathname.startsWith(path + '/')) || (path === '/' && pathname === '/'))) {
    // Optional: If authenticated and trying to access a public-only page like login/register
    // if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    //   return NextResponse.redirect(new URL('/dashboard', request.url)); // Redirect to a default authenticated page
    // }
    return NextResponse.next();
  }

  if (isProtectedRoute && !isAuthenticated) {
    // If trying to access a protected route without authentication,
    // redirect to the login page.
    // Preserve the original path as a query parameter for redirection after login.
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Matcher to specify which paths the middleware should run on.
  // This helps to avoid running middleware on static assets or API routes unnecessarily.
  // Adjust this matcher according to your application's needs.
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - robots.txt (SEO)
     * - sitemap.xml (SEO)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml).*)',
  ],
};
