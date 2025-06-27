// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'path';
import { loadEnv } from 'vite'
import tailwindcss from "@tailwindcss/vite";
import svgLoader from 'vite-svg-loader';


// Load environment variables from root directory
const rootEnv = loadEnv('', resolve(__dirname, '../..'), '')

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
      svgLoader({
        defaultImport: 'component', // Default import as Vue component
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false, // Keep viewBox attribute
                },
              },
            },
          ],
        },
      }),
    ],
    optimizeDeps: {
      include: ['pg', 'drizzle-orm']
    }
  },

  // Configure Nitro to support CommonJS modules
  nitro: {
    rootDir: resolve(__dirname, '../..'),
    experimental: {
      wasm: true
    },
    commonJS: {
      include: [/pg/, /drizzle-orm/]
    }
  },

  // Configure environment variables
  runtimeConfig: {
    // Server-side environment variables
    databaseUrl: rootEnv.DATABASE_URL,
    betterAuthSecret: rootEnv.BETTER_AUTH_SECRET,
    
    // Public environment variables (accessible on client)
    public: {
      betterAuthUrl: rootEnv.BETTER_AUTH_URL,
      apiBaseUrl: rootEnv.API_BASE_URL,
      // Captcha configuration
      captchaEnabled: rootEnv.CAPTCHA_ENABLED || 'true',
      turnstileSiteKey: rootEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY || rootEnv.TURNSTILE_SITE_KEY || '1x00000000000000000000AA'
    }
  },

  // Configure path aliases
  alias: {
    "@": resolve(__dirname, '.'),
    "@libs": resolve(__dirname, '../../libs'),
    "@config": resolve(__dirname, '../../config.ts'),
  },

  // Configure build options to support CommonJS
  build: {
    transpile: ['pg', 'drizzle-orm']
  },

  modules: ['shadcn-nuxt', '@pinia/nuxt', '@nuxtjs/i18n'],
  
  // Internationalization configuration
  i18n: {
    locales: [
      {
        code: 'en',
        name: 'English',
      },
      {
        code: 'zh-CN',
        name: '中文',
      }
    ],
    defaultLocale: 'zh-CN',
    strategy: 'prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'NEXT_LOCALE',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'zh-CN'
    },
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  }

})