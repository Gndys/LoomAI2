// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'path';
import { loadEnv } from 'vite';
import tailwindcss from "@tailwindcss/vite";
import svgLoader from 'vite-svg-loader';

// Load environment variables using Vite's loadEnv
const env = loadEnv(process.env.NODE_ENV || 'development', resolve(__dirname, '../..'), '');
// Merge environment variables into process.env
Object.assign(process.env, env);

import { config as appConfig } from '../../config';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  devServer: {
    port: 7001,
  },
  css: ['~/assets/css/main.css'],

  vite: {
    // Fix HMR issues with file watching
    server: {
      // host: '0.0.0.0',
      hmr: {
          protocol: 'ws',
          host: 'localhost'
      },
     /* client: {
          webSocketURL: 'ws://0.0.0.0:8080/ws',
      },*/
      watch: {
          usePolling: true,
          interval: 1000,
      },
      allowedHosts: [
        'test.vikingship.uk'
      ]
    },
    // Enable JSX support for Vue
    esbuild: {
      jsx: 'preserve',
      jsxFactory: 'h',
      jsxFragment: 'Fragment'
    },
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

  // Configure Nitro to support CommonJS modules and improve HMR
  nitro: {
    experimental: {
      wasm: true
    },
    commonJS: {
      include: [/pg/, /drizzle-orm/]
    },
    // Development specific settings
    dev: process.env.NODE_ENV === 'development'
  },

  // Configure environment variables using centralized config
  runtimeConfig: {
    // Server-side environment variables
    databaseUrl: appConfig.database.url,
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    openaiApiKey: process.env.OPENAI_API_KEY,
    
    // Public environment variables (accessible on client)
    public: {
      betterAuthUrl: appConfig.app.baseUrl,
      apiBaseUrl: appConfig.app.baseUrl,
      // Captcha configuration
      captchaEnabled: String(appConfig.captcha.enabled),
      turnstileSiteKey: appConfig.captcha.cloudflare.siteKey,
      // WeChat configuration
      wechatAppId: process.env.WECHAT_APP_ID || 'your-wechat-app-id',
      wechatRedirectUri: process.env.WECHAT_REDIRECT_URI || `${appConfig.app.baseUrl}/api/auth/oauth2/callback/wechat`,
      // Payment configuration
      paymentPlans: JSON.parse(JSON.stringify(appConfig.payment.plans))
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

  modules: ['shadcn-nuxt', '@pinia/nuxt', '@nuxtjs/i18n', '@nuxtjs/color-mode', 'nuxt-charts'],
  
  // Configure components auto-import
  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
      },
      {
        path: '~/components/admin',
        pathPrefix: false,
      },
      {
        path: '~/components/admin/users',
        pathPrefix: false,
      }
    ]
  },
  
  // Color mode configuration
  colorMode: {
    preference: 'system', // default value of $colorMode.preference
    fallback: 'light', // fallback value if not system preference found
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },
  
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