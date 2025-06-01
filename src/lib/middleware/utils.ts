// filepath: /home/nathfavour/Documents/code/web3lancer/pay/src/lib/middleware/utils.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { LOGIN_PATH } from './config';

/**
 * Matches a given pathname against a route config path pattern.
 * Supports basic dynamic segments like ':slug' and catch-all segments like ':path*'.
 * @param pathname The current URL pathname.
 * @param routePath The route pattern from config (e.g., '/users/:id', '/files/:path*').
 * @returns True if the pathname matches the routePath, false otherwise.
 */
export function matchPath(pathname: string, routePath: string): boolean {
  const cleanPathname = pathname.split('?')[0].split('#')[0]; // Remove query params and hash
  const pathSegments = cleanPathname.split('/').filter(Boolean);
  const routeSegments = routePath.split('/').filter(Boolean);

  if (routeSegments.length === 0 && pathSegments.length === 0) {
    return routePath === '/' && cleanPathname === '/'; // Root path exact match
  }
  
  if (routeSegments.length === 0 && routePath !== '/') return false;
  if (pathSegments.length === 0 && cleanPathname !== '/') return false;


  let routeIdx = 0;
  let pathIdx = 0;

  while (routeIdx < routeSegments.length && pathIdx < pathSegments.length) {
    const routeSegment = routeSegments[routeIdx];
    const pathSegment = pathSegments[pathIdx];

    if (routeSegment.startsWith(':')) {
      if (routeSegment.endsWith('*')) { // Catch-all segment (e.g., :path*)
        return true; // If it's a catch-all, it matches the rest of the path
      }
      // Dynamic segment (e.g., :id)
      routeIdx++;
      pathIdx++;
    } else if (routeSegment === pathSegment) {
      routeIdx++;
      pathIdx++;
    } else {
      return false; // Static segments don't match
    }
  }

  // Check if all segments in both arrays were consumed
  return routeIdx === routeSegments.length && pathIdx === pathSegments.length;
}

/**
 * Creates a redirect response to the login page, preserving the original path.
 */
export function redirectToLogin(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL(LOGIN_PATH, request.url);
  // Preserve original path and query parameters for redirection after login
  loginUrl.searchParams.set('redirectedFrom', pathname + search);
  return NextResponse.redirect(loginUrl);
}

/**
 * Creates a redirect response to a specified path.
 */
export function redirectToPath(request: NextRequest, path: string): NextResponse {
  const targetUrl = new URL(path, request.url);
  return NextResponse.redirect(targetUrl);
}
