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
    // External Next.js modules to avoid build conflicts
    build: {
      rollupOptions: {
        external: ['next/headers', 'next/server', 'next/navigation']
      }
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
    // AI configuration is handled by @libs/ai directly from environment variables
    
    // Public environment variables (accessible on client)
    public: {
      // Captcha configuration
      captchaEnabled: String(appConfig.captcha.enabled),
      turnstileSiteKey: appConfig.captcha.cloudflare.siteKey || '0x4AAAAAAABkMYinukNdH9ly', // Default development key
      // WeChat configuration
      wechatAppId: appConfig.auth.socialProviders.wechat.appId || 'wx_default_dev_key', // Safe default for development
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

  modules: ['shadcn-nuxt', '@pinia/nuxt', '@nuxtjs/i18n', 'nuxt-charts', 'motion-v/nuxt'],
  
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
  
  // Theme configuration is now handled by our custom useTheme composable
  // and theme.client.ts plugin
  
  // Internationalization configuration
  i18n: {
    locales: appConfig.app.i18n.locales.map(code => ({
      code,
      name: code === 'en' ? 'English' : '中文',
    })),
    defaultLocale: appConfig.app.i18n.defaultLocale,
    strategy: 'prefix',
    detectBrowserLanguage: appConfig.app.i18n.autoDetect ? {
      useCookie: true,
      cookieKey: appConfig.app.i18n.cookieKey,
      redirectOn: 'root',
      alwaysRedirect: true,
      fallbackLocale: appConfig.app.i18n.defaultLocale,
    } : false, // Disable browser detection if autoDetect is false
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
  },

  // App configuration including favicon and metadata
  app: {
    head: {
      link: [
        // Favicon configuration - matching Next.js app
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-chrome-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/android-chrome-512x512.png' },
        { rel: 'mask-icon', href: '/logo.svg', color: '#3b82f6' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      meta: [
        { name: 'theme-color', content: '#3b82f6' },
        { name: 'msapplication-TileColor', content: '#3b82f6' },
        { name: 'msapplication-config', content: 'none' }
      ]
    }
  }

})