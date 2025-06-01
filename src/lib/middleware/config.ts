// filepath: /home/nathfavour/Documents/code/web3lancer/pay/src/lib/middleware/config.ts
import type { NextRequest } from 'next/server';

export interface RouteConfig {
  path: string; // Path pattern (e.g., '/dashboard', '/admin/:path*')
  type: 'public' | 'authenticated' | 'role-based';
  roles?: string[]; // Required roles if type is 'role-based'
  redirectIfAuthenticated?: string; // e.g., redirect from /login to /dashboard if already logged in
}

// Define your application's routes and their access controls
export const routeConfigs: RouteConfig[] = [
  // Public pages
  { path: '/', type: 'public' },
  { path: '/login', type: 'public', redirectIfAuthenticated: '/dashboard' },
  { path: '/register', type: 'public', redirectIfAuthenticated: '/dashboard' },
  { path: '/auth/verify', type: 'public' }, // For email verification links
  { path: '/auth/recovery', type: 'public' }, // For password recovery links
  { path: '/auth/magic-url', type: 'public' }, // For magic URL login links

  // Authenticated user pages
  { path: '/dashboard', type: 'authenticated' },
  { path: '/profile', type: 'authenticated' },
  { path: '/settings', type: 'authenticated' },
  { path: '/wallets', type: 'authenticated' },
  { path: '/transactions', type: 'authenticated' },
  { path: '/pay/create', type: 'authenticated' }, // Example: Creating a payment request

  // Publicly accessible dynamic routes (content determines further auth if needed)
  { path: '/pay/:slug', type: 'public' }, 
  { path: '/user/:username', type: 'public' }, // Example: Public user profiles

  // Role-based pages (examples - uncomment and define roles as needed)
  // { path: '/admin', type: 'role-based', roles: ['admin'] },
  // { path: '/admin/:path*', type: 'role-based', roles: ['admin'] }, // Catch-all for admin sections
  // { path: '/editor', type: 'role-based', roles: ['editor', 'admin'] },
];

export const LOGIN_PATH = '/login';
export const DEFAULT_AUTHENTICATED_REDIRECT = '/dashboard';
export const UNAUTHORIZED_REDIRECT = '/unauthorized'; // Optional: A specific page for unauthorized access

// Matcher for the main middleware.ts file
export const middlewareMatcher = [
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - manifest.json (PWA manifest)
   * - robots.txt (SEO)
   * - sitemap.xml (SEO)
   * - specific public assets if any (e.g. /img/logo.png)
   */
  '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml).*)',
];
