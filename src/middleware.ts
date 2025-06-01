// filepath: /home/nathfavour/Documents/code/web3lancer/pay/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routeConfigs, middlewareMatcher } from '@/lib/middleware/config';
import { matchPath } from '@/lib/middleware/utils';
import { handleRoute } from '@/lib/middleware/handlers';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`[Middleware] Processing request for: ${pathname}`);

  let matchedConfig = null;
  for (const config of routeConfigs) {
    if (matchPath(pathname, config.path)) {
      matchedConfig = config;
      break;
    }
  }

  if (!matchedConfig) {
    console.log(`[Middleware] No specific route config found for ${pathname}. Allowing.`);
    return NextResponse.next(); // Default behavior: allow if no specific config matches
  }

  console.log(`[Middleware] Matched config for ${pathname}:`, matchedConfig);
  
  const response = await handleRoute(request, matchedConfig);
  if (response) {
    return response; // If a handler decided to redirect or rewrite
  }

  // If all checks pass and no redirection was triggered by handlers
  console.log(`[Middleware] Access granted for ${pathname}. Proceeding to page.`);
  return NextResponse.next();
}

// Export the matcher from the config file
export const config = {
  matcher: middlewareMatcher,
};
