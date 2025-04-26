'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import { translations, type SupportedLocale, defaultLocale, locales } from '@libs/i18n';
import type { Translations, TranslationPath, TranslationValue } from '@/types/i18n';

export function useTranslation() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params?.lang as SupportedLocale) || defaultLocale;
  const t = translations[locale];

  const changeLocale = (newLocale: SupportedLocale) => {
    // Get the current path without the locale prefix
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    
    // Navigate to the new locale path
    router.push(`/${newLocale}${pathWithoutLocale}`);
    
    // Store the preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
  };

  // Type-safe translation function
  function translate<
    Path extends TranslationPath<Translations>
  >(path: Path): TranslationValue<Translations, Path> {
    return path.reduce((obj, key) => obj[key as keyof typeof obj], t as any);
  }

  return {
    t,
    locale,
    locales,
    defaultLocale,
    changeLocale,
    translate,
    isDefaultLocale: locale === defaultLocale,
  } as const;
} 