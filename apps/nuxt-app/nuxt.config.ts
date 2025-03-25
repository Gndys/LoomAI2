// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'path';
import { loadEnv } from 'vite'
import tailwindcss from "@tailwindcss/vite";


// 加载根目录的环境变量
const rootEnv = loadEnv('', resolve(__dirname, '../..'), '')

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  // 配置环境变量
  runtimeConfig: {
    // 服务端环境变量
    databaseUrl: rootEnv.DATABASE_URL,
    betterAuthSecret: rootEnv.BETTER_AUTH_SECRET,
    
    // 公共环境变量（客户端可访问）
    public: {
      betterAuthUrl: rootEnv.BETTER_AUTH_URL,
      apiBaseUrl: rootEnv.API_BASE_URL
    }
  },

  // 配置路径别名
  alias: {
    "@libs": resolve(__dirname, '../../libs'),
  },

  // 加载根目录的环境变量
  nitro: {
    rootDir: resolve(__dirname, '../..'),
  }
})
