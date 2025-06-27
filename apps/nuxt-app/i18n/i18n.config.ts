import { translations } from '@libs/i18n'

export default defineI18nConfig(() => {
  return {
    legacy: false,
    locale: 'zh-CN', // Keep consistent with defaultLocale in nuxt.config.ts
    messages: translations
  }
})
