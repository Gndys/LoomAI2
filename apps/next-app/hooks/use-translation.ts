'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import { translations, type SupportedLocale, defaultLocale, locales, type Translations } from '@libs/i18n';

export function useTranslation() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params?.lang as SupportedLocale) || defaultLocale;
  const t = translations[locale] as Translations;

  const changeLocale = (newLocale: SupportedLocale) => {
    // Get the current path without the locale prefix
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    
    // Navigate to the new locale path
    router.push(`/${newLocale}${pathWithoutLocale}`);
    
    // Store the preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
  };

  return {
    t,
    locale,
    locales,
    defaultLocale,
    changeLocale,
    isDefaultLocale: locale === defaultLocale,
  } as const;
} 