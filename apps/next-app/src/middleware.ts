import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './app/i18n-config';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

function getLocale(request: NextRequest): string {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // Use negotiator and intl-localematcher to get best locale
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  
  // Try to get locale from cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && i18n.locales.includes(cookieLocale as any)) {
    languages = [cookieLocale, ...languages];
  }
  
  return matchLocale(languages, i18n.locales as unknown as string[], i18n.defaultLocale);
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip if the request is for:
  // - api routes
  // - static files (/_next/*)
  // - images
  // - favicon
  if (
    /^\/api\/.*$/.test(pathname) ||
    /^\/(_next|images)\/.*$/.test(pathname) ||
    pathname.includes('/api/') ||
    pathname.includes('.') // This covers favicon.ico, manifest.json etc.
  ) {
    return;
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // e.g. incoming request is /products
    // The new URL is now /en/products
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        request.url
      )
    );
  }
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|images|[\\w-]+\\.\\w+).*)',
  ],
};