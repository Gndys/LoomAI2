import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { localeMiddleware } from './middlewares/localeMiddleware';
import { authMiddleware } from './middlewares/authMiddleware';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // --- Skip static files and images --- 
  if (
    /^\/(_next|images)\/.*$/.test(pathname) ||
    pathname.includes('.') // This covers files like favicon.ico, manifest.json etc.
  ) {
    return NextResponse.next(); // Let these requests pass through
  }

  // --- Locale Handling --- 
  // Note: Locale middleware might not be relevant for all API routes.
  // Consider if API routes should have locale prefixes or be handled differently.
  const localeResponse = localeMiddleware(request);
  if (localeResponse) {
    return localeResponse; // Redirect if locale is missing (primarily for pages)
  }

  // --- Authentication Check --- 
  const authResponse = await authMiddleware(request);
  if (authResponse) {
    return authResponse; // Redirect (pages) or return 401 (API) if auth fails
  }

  // --- Default: Continue Request --- 
  return NextResponse.next(); // If all checks pass, continue
}

export const config = {
  runtime: 'nodejs',
  // Matcher包含API路径以便进行权限检查
  matcher: [
    // Skip all internal paths (_next) but include API routes for auth check
    '/((?!_next|images|[\\w-]+\\.\\w+).*)',
  ],
};