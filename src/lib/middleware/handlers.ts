// filepath: /home/nathfavour/Documents/code/web3lancer/pay/src/lib/middleware/handlers.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { RouteConfig } from './config';
import { isAuthenticated, getUserRoles } from './auth';
import { LOGIN_PATH, DEFAULT_AUTHENTICATED_REDIRECT, UNAUTHORIZED_REDIRECT } from './config';

/**
 * Handles redirection for authenticated users trying to access public-only pages 
 * (e.g., redirecting from /login to /dashboard if already logged in).
 */
function handlePublicRoute(request: NextRequest, routeConfig: RouteConfig, isUserAuthenticated: boolean): NextResponse | null {
  if (routeConfig.type === 'public' && routeConfig.redirectIfAuthenticated && isUserAuthenticated) {
    console.log(`[Middleware] Authenticated user on public page ${request.nextUrl.pathname}. Redirecting to ${routeConfig.redirectIfAuthenticated}.`);
    return NextResponse.redirect(new URL(routeConfig.redirectIfAuthenticated, request.url));
  }
  return null;
}

/**
 * Handles protected routes that require authentication.
 */
function handleAuthenticatedRoute(request: NextRequest, routeConfig: RouteConfig, isUserAuthenticated: boolean): NextResponse | null {
  if (routeConfig.type === 'authenticated' && !isUserAuthenticated) {
    console.log(`[Middleware] Unauthenticated user on protected page ${request.nextUrl.pathname}. Redirecting to login.`);
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return null;
}

/**
 * Handles role-based routes, checking for authentication and required roles.
 */
async function handleRoleBasedRoute(request: NextRequest, routeConfig: RouteConfig, isUserAuthenticated: boolean): Promise<NextResponse | null> {
  if (routeConfig.type !== 'role-based') return null;

  if (!isUserAuthenticated) {
    console.log(`[Middleware] Unauthenticated user on role-based page ${request.nextUrl.pathname}. Redirecting to login.`);
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, now check roles
  const userRoles = await getUserRoles(request);
  const hasRequiredRole = routeConfig.roles?.some(requiredRole => userRoles.includes(requiredRole));

  if (!hasRequiredRole) {
    console.log(`[Middleware] User does not have required roles for ${request.nextUrl.pathname}. User Roles: ${userRoles}. Required: ${routeConfig.roles}`);
    // Redirect to an unauthorized page or the default authenticated redirect
    return NextResponse.redirect(new URL(UNAUTHORIZED_REDIRECT || DEFAULT_AUTHENTICATED_REDIRECT, request.url));
  }
  
  console.log(`[Middleware] User has required roles for ${request.nextUrl.pathname}.`);
  return null;
}

export async function handleRoute(request: NextRequest, routeConfig: RouteConfig): Promise<NextResponse | null> {
  const isUserAuthenticated = isAuthenticated(request);
  let response: NextResponse | null = null;

  response = handlePublicRoute(request, routeConfig, isUserAuthenticated);
  if (response) return response;

  response = handleAuthenticatedRoute(request, routeConfig, isUserAuthenticated);
  if (response) return response;

  response = await handleRoleBasedRoute(request, routeConfig, isUserAuthenticated);
  if (response) return response;
  
  return null; // No redirection needed based on this handler
}
