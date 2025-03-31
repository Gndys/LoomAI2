import { en, zhCN } from './locales'

export const defaultLocale = 'en'
export const locales = ['en', 'zh-CN'] as const

export type SupportedLocale = typeof locales[number]

export const translations = {
  en,
  'zh-CN': zhCN
} as const

export function isValidLocale(locale: string): locale is SupportedLocale {
  return locales.includes(locale as SupportedLocale)
}

export * from './locales' 