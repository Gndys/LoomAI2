import { translations, locales } from '@libs/i18n';

export type Locale = keyof typeof translations;

export const i18n = {
  defaultLocale: 'en' as const,
  locales: locales as unknown as readonly [Locale, ...Locale[]],
} as const;

export type I18nConfig = typeof i18n; 