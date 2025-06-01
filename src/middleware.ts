// filepath: /home/nathfavour/Documents/code/web3lancer/pay/src/middleware.ts
import { NextResponse, userAgent } from 'next/server';
import type { NextRequest } from 'next/server';

// --- Configuration --- 

interface RouteConfig {
  path: string; // Path pattern (e.g., '/dashboard', '/admin/:path*')
  type: 'public' | 'authenticated' | 'role-based';
  roles?: string[]; // Required roles if type is 'role-based'
  redirectIfAuthenticated?: string; // e.g., redirect from /login to /dashboard if already logged in
}

// Define your application's routes and their access controls
const routeConfigs: RouteConfig[] = [
  // Public pages (e.g., landing, login, registration)
  { path: '/', type: 'public' },
  { path: '/login', type: 'public', redirectIfAuthenticated: '/dashboard' },
  { path: '/register', type: 'public', redirectIfAuthenticated: '/dashboard' },
  // Authenticated user pages
  { path: '/dashboard', type: 'authenticated' },
  { path: '/profile', type: 'authenticated' },
  { path: '/settings', type: 'authenticated' },
  { path: '/pay/:slug', type: 'public' }, // Example: /pay/[slug] is public by default
                                        // More granular control for /pay might be needed inside the page component
                                        // or by adding more specific routeConfigs if parts of /pay are protected.
  // Role-based pages (example)
  // { path: '/admin', type: 'role-based', roles: ['admin'] },
  // { path: '/editor', type: 'role-based', roles: ['editor', 'admin'] },
];

const LOGIN_PATH = '/login';
const DEFAULT_AUTHENTICATED_REDIRECT = '/dashboard';

// --- Helper Functions --- 

/**
 * Checks if the user is authenticated.
 * Replace this with your actual authentication logic.
 */
function isAuthenticated(request: NextRequest): boolean {
  // Example: Check for a session cookie or token
  return !!request.cookies.get('auth-token')?.value;
}

/**
 * Fetches the user's roles.
 * Replace this with your actual role-fetching logic.
 */
async function getUserRoles(request: NextRequest): Promise<string[]> {
  // Example: Fetch roles from a decoded token or an API call
  // const token = request.cookies.get('auth-token')?.value;
  // if (token) { /* decode token and get roles */ return ['user']; }
  return [];
}

/**
 * Matches a given pathname against a route config path pattern.
 * Supports basic wildcards like ':slug' and '*' at the end.
 */
function matchPath(pathname: string, routePath: string): boolean {
  if (routePath.endsWith('*')) {
    return pathname.startsWith(routePath.slice(0, -1));
  }
  const pathSegments = pathname.split('/').filter(Boolean);
  const routeSegments = routePath.split('/').filter(Boolean);

  if (pathSegments.length !== routeSegments.length) {
    return false;
  }

  return routeSegments.every((segment, i) => {
    return segment.startsWith(':') || segment === pathSegments[i];
  });
}

// --- Middleware Logic --- 

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isUserAuthenticated = isAuthenticated(request);

  console.log(`[Middleware] Path: ${pathname}, Authenticated: ${isUserAuthenticated}`);

  let matchedConfig: RouteConfig | undefined;
  for (const config of routeConfigs) {
    if (matchPath(pathname, config.path)) {
      matchedConfig = config;
      break;
    }
  }

  if (!matchedConfig) {
    // If no specific config matches, default to allowing (or deny if preferred)
    console.log(`[Middleware] No specific route config for ${pathname}. Allowing.`);
    return NextResponse.next();
  }

  console.log(`[Middleware] Matched config for ${pathname}:`, matchedConfig);

  // Handle redirection for authenticated users on public-only pages (e.g., /login)
  if (matchedConfig.type === 'public' && matchedConfig.redirectIfAuthenticated && isUserAuthenticated) {
    console.log(`[Middleware] Authenticated user on public page ${pathname}. Redirecting to ${matchedConfig.redirectIfAuthenticated}.`);
    return NextResponse.redirect(new URL(matchedConfig.redirectIfAuthenticated, request.url));
  }

  // Handle protected routes
  if (matchedConfig.type === 'authenticated' && !isUserAuthenticated) {
    console.log(`[Middleware] Unauthenticated user on protected page ${pathname}. Redirecting to login.`);
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle role-based routes
  if (matchedConfig.type === 'role-based') {
    if (!isUserAuthenticated) {
      console.log(`[Middleware] Unauthenticated user on role-based page ${pathname}. Redirecting to login.`);
      const loginUrl = new URL(LOGIN_PATH, request.url);
      loginUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated, now check roles
    const userRoles = await getUserRoles(request);
    const hasRequiredRole = matchedConfig.roles?.some(requiredRole => userRoles.includes(requiredRole));

    if (!hasRequiredRole) {
      console.log(`[Middleware] User does not have required roles for ${pathname}. Roles: ${userRoles}. Required: ${matchedConfig.roles}`);
      // Redirect to an unauthorized page or the default authenticated redirect
      return NextResponse.redirect(new URL(DEFAULT_AUTHENTICATED_REDIRECT, request.url)); // Or a specific '/unauthorized' page
    }
    console.log(`[Middleware] User has required roles for ${pathname}.`);
  }

  // If all checks pass, proceed to the requested page
  console.log(`[Middleware] Access granted for ${pathname}.`);
  return NextResponse.next();
}

// --- Middleware Config --- 

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes - unless you want middleware to run on them)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - manifest.json, robots.txt, sitemap.xml (SEO/PWA files)
    // Add any other patterns to exclude from middleware processing
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml).*)',
  ],
};
