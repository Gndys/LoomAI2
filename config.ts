// Function to get environment variables
function getEnv(key: string): string | undefined {
  return process.env[key];
}

// Warning function
function warnMissingEnv(key: string, service: string): void {
  console.warn(`Warning: Missing environment variable ${key} for ${service} service. This service will not be available.`);
}

// Function to get environment variables for optional services
function getEnvForService(key: string, service: string): string | undefined {
  const value = getEnv(key);
  if (!value) {
    warnMissingEnv(key, service);
  }
  return value;
}

// Function to get environment variables for required services with development defaults
function requireEnvForService(key: string, service: string, devDefault?: string): string {
  const value = getEnv(key);
  if (!value) {
    // In development, use default values if provided
    if (process.env.NODE_ENV === 'development' && devDefault) {
      console.warn(`Warning: Using default value for ${key} in development. Set ${key} in .env file for production.`);
      return devDefault;
    }
    throw new Error(`Missing required environment variable: ${key} for ${service} service. This service is required for the application to function.`);
  }
  return value;
}

// Theme and i18n type definitions
type Theme = 'light' | 'dark';
type ColorScheme = 'default' | 'claude' | 'cosmic-night' | 'modern-minimal' | 'ocean-breeze';
type Locale = 'en' | 'zh-CN';

// 计划类型定义

type BasePlan = {
  id: string;
  provider: string;
  amount: number;
  currency: string;
  recommended?: boolean;
  i18n: {
    [locale: string]: {
      name: string;
      description: string;
      duration: string;
      features: string[];
    }
  };
};

export type RecurringPlan = BasePlan & {
  duration: { type: 'recurring'; months: number };
  stripePriceId?: string | undefined;
  stripeProductId?: string | undefined;
  creemProductId?: string | undefined;
};

export type OneTimePlan = BasePlan & {
  duration: { type: 'one_time'; months: number };
  stripePriceId?: string | undefined;
  stripeProductId?: string | undefined;
  creemProductId?: string | undefined;
};

export type Plan = RecurringPlan | OneTimePlan;

/**
 * Application Configuration
 */
export const config = {
  /**
   * Application Configuration
   */
  app: {
    /**
     * Application Name
     * This will be used throughout the application for branding
     */
    name: 'TinyShip',

    /**
     * Base URL Configuration
     * This will be used for all callback URLs and webhooks
     */
    get baseUrl() {
      return requireEnvForService('APP_BASE_URL', 'Application', 'http://localhost:7001');
    },

    /**
     * Theme Configuration
     * Default theme and color scheme for the application
     */
    theme: {
      /**
       * Default theme mode
       * @type {'light' | 'dark'}
       */
      defaultTheme: 'light' as const,
      
      /**
       * Default color scheme
       * @type {'default' | 'claude' | 'cosmic-night' | 'modern-minimal' | 'ocean-breeze'}
       */
      defaultColorScheme: 'claude' as const,
      
      /**
       * Storage key for theme persistence
       */
      storageKey: 'tinyship-ui-theme'
    },

    /**
     * Internationalization Configuration
     * Default language and locale settings
     */
    i18n: {
      /**
       * Default locale
       * @type {'en' | 'zh-CN'}
       */
      defaultLocale: 'zh-CN' as const,
      
      /**
       * Available locales
       */
      locales: ['en', 'zh-CN'] as const,
      
      /**
       * Cookie key for locale persistence
       * Used by both Next.js middleware and Nuxt.js i18n module
       */
      cookieKey: 'NEXT_LOCALE',
      
      /**
       * Auto-detect browser language
       * When true, detects user's browser language preference
       * When false, always uses defaultLocale for new users
       * Cookie preferences always take priority when set
       */
      autoDetect: false
    },

    /**
     * Payment Related URLs
     */
    payment: {
      /**
       * Payment Success/Cancel URLs
       * These URLs will be used by payment providers for redirects
       * The locale middleware will automatically add locale prefix
       */
      get successUrl() {
        return `${config.app.baseUrl}/payment-success`;
      },
      get cancelUrl() {
        return `${config.app.baseUrl}/payment-cancel`;
      },
    }
  },
  /**
   * Authentication Service Configuration
   */
  auth: {
    requireEmailVerification: true,

    /**
     * Social Login Providers Configuration
     */
    socialProviders: {
      /**
       * Google OAuth Configuration
       */
      google: {
        get clientId() {
          return getEnvForService('GOOGLE_CLIENT_ID', 'Google Auth');
        },
        get clientSecret() {
          return getEnvForService('GOOGLE_CLIENT_SECRET', 'Google Auth');
        }
      },

      /**
       * GitHub OAuth Configuration
       */
      github: {
        get clientId() {
          return getEnvForService('GITHUB_CLIENT_ID', 'GitHub Auth');
        },
        get clientSecret() {
          return getEnvForService('GITHUB_CLIENT_SECRET', 'GitHub Auth');
        }
      },

      /**
       * WeChat OAuth Configuration
       */
      wechat: {
        get appId() {
          return getEnvForService('WECHAT_APP_ID', 'WeChat Auth');
        },
        get appSecret() {
          return getEnvForService('WECHAT_APP_SECRET', 'WeChat Auth');
        }
      }
    }
  },
  /**
   * Payment Configuration
   */
  payment: {
    /**
     * Available Payment Providers
     */
    providers: {
      /**
       * WeChat Pay Configuration
       */
      wechat: {
        get appId() {
          return requireEnvForService('WECHAT_PAY_APP_ID', 'WeChat Pay');
        },
        get mchId() {
          return requireEnvForService('WECHAT_PAY_MCH_ID', 'WeChat Pay');
        },
        get apiKey() {
          return requireEnvForService('WECHAT_PAY_API_KEY', 'WeChat Pay');
        }
      },

      /**
       * Stripe Configuration
       */
      stripe: {
        get secretKey() {
          return requireEnvForService('STRIPE_SECRET_KEY', 'Stripe');
        },
        get publicKey() {
          return requireEnvForService('STRIPE_PUBLIC_KEY', 'Stripe');
        },
        get webhookSecret() {
          return requireEnvForService('STRIPE_WEBHOOK_SECRET', 'Stripe');
        }
      },

      /**
       * Creem Configuration
       */
      creem: {
        get apiKey() {
          return requireEnvForService('CREEM_API_KEY', 'Creem');
        },
        get serverUrl() {
          return getEnvForService('CREEM_SERVER_URL', 'Creem') || 'https://test-api.creem.io';
        },
        get webhookSecret() {
          return requireEnvForService('CREEM_WEBHOOK_SECRET', 'Creem');
        }
      }
    },

    /**
     * Subscription Plans
     */
    plans: {
      monthlyWechat: {
        provider: 'wechat',
        id: 'monthlyWechat',
        amount: 0.01,
        currency: 'CNY',
        duration: {
          months: 1,
          type: 'one_time'
        },
        i18n: {
          'en': {
            name: 'Monthly Plan',
            description: 'Perfect for short-term projects',
            duration: 'month',
            features: [
              'All premium features',
              'Priority support'
            ]
          },
          'zh-CN': {
            name: '月度订阅wechat',
            description: '每月订阅，灵活管理',
            duration: '月',
            features: [
              '所有高级功能',
              '优先支持'
            ]
          }
        }
      },
      monthly: {
        provider: 'stripe',
        id: 'monthly',
        amount: 10,
        currency: 'CNY',
        duration: {
          months: 1,
          type: 'recurring'
        },
        // 当使用 Stripe 支付时，订阅的时长和价格将由 stripePriceId 决定
        // 这里的 duration 和 amount 仅用于显示和计算，实际订阅周期和价格以 Stripe 后台配置为准
        stripePriceId: 'price_1RL2GgDjHLfDWeHDBHjoZaap',
        i18n: {
          'en': {
            name: 'Monthly Plan',
            description: 'Perfect for short-term projects',
            duration: 'month',
            features: [
              'All premium features',
              'Priority support'
            ]
          },
          'zh-CN': {
            name: '月度订阅',
            description: '每月订阅，灵活管理',
            duration: '月',
            features: [
              '所有高级功能',
              '优先支持'
            ]
          }
        }
      },
      'monthly-pro': {
        provider: 'stripe',
        id: 'monthly-pro',
        amount: 20,
        currency: 'CNY',
        duration: {
          months: 1,
          type: 'recurring'
        },
        stripePriceId: 'price_1RMmc4DjHLfDWeHDp9Xhpn5X',
        i18n: {
          'en': {
            name: 'Monthly Pro Plan',
            description: 'Enhanced monthly plan with extra features',
            duration: 'month',
            features: [
              'All premium features',
              'Priority support',
              'Free lifetime updates'
            ]
          },
          'zh-CN': {
            name: '月度专业版',
            description: '每月订阅，专业功能',
            duration: '月',
            features: [
              '所有高级功能',
              '优先支持',
              '终身免费更新'
            ]
          }
        }
      },
      lifetime: {
        provider: 'stripe',
        id: 'lifetime',
        amount: 999,
        currency: 'CNY',
        recommended: true,
        duration: {
          months: 999999,
          type: 'one_time'
        },
        stripePriceId: 'price_1RL2IcDjHLfDWeHDMCmobkzb',
        i18n: {
          'en': {
            name: 'Lifetime',
            description: 'One-time payment, lifetime access',
            duration: 'lifetime',
            features: [
              'All premium features',
              'Priority support',
              'Free lifetime updates'
            ]
          },
          'zh-CN': {
            name: '终身会员',
            description: '一次付费，永久使用',
            duration: '终身',
            features: [
              '所有高级功能',
              '优先支持',
              '终身免费更新'
            ]
          }
        }
      },
      monthlyCreem: {
        provider: 'creem',
        id: 'monthlyCreem',
        amount: 10,
        currency: 'USD',
        duration: {
          months: 1,
          type: 'recurring'
        },
        creemProductId: 'prod_1M1c4ktVmvLgrNtpVB9oQf', // Will be set after creating product in Creem
        i18n: {
          'en': {
            name: 'Monthly Plan (Creem)',
            description: 'Perfect for short-term projects via Creem',
            duration: 'month',
            features: [
              'All premium features',
              'Priority support'
            ]
          },
          'zh-CN': {
            name: '月度订阅 (Creem)',
            description: '每月订阅，通过Creem支付',
            duration: '月',
            features: [
              '所有高级功能',
              '优先支持'
            ]
          }
        }
      }
    } as const,
  },



  /**
   * SMS Service Configuration
   */
  sms: {
    /**
     * Default SMS Provider
     */
    defaultProvider: 'aliyun',

    /**
     * Aliyun SMS Configuration
     */
    aliyun: {
      // Optional service, using warning instead of error
      get accessKeyId() {
        return getEnvForService('ALIYUN_ACCESS_KEY_ID', 'Aliyun SMS');
      },
      get accessKeySecret() {
        return getEnvForService('ALIYUN_ACCESS_KEY_SECRET', 'Aliyun SMS');
      },
      endpoint: 'dysmsapi.aliyuncs.com',
      signName: '上海挚箴技术服务中心',
      templateCode: 'SMS_1234567890',
    },

    /**
     * Twilio SMS Configuration
     */
    twilio: {
      // Optional service, using warning instead of error
      get accountSid() {
        return getEnvForService('TWILIO_ACCOUNT_SID', 'Twilio SMS');
      },
      get authToken() {
        return getEnvForService('TWILIO_AUTH_TOKEN', 'Twilio SMS');
      },
      defaultFrom: '+1234567890',
    }
  },

  /**
   * Email Service Configuration
   */
  email: {
    /**
     * Default Email Provider
     */
    defaultProvider: 'resend',

    /**
     * Default Sender Email
     */
    defaultFrom: 'noreply@tailwindresume.co',

    /**
     * Resend Configuration
     */
    resend: {
      // Optional service, using warning instead of error
      get apiKey() {
        return getEnvForService('RESEND_API_KEY', 'Resend Email');
      }
    },
  },

  /**
   * Captcha Service Configuration
   */
  captcha: {
    /**
     * Enable/Disable Captcha Verification
     */
    enabled: true,

    /**
     * Default Captcha Provider
     */
    defaultProvider: 'cloudflare-turnstile',

    /**
     * Cloudflare Turnstile Configuration
     */
    cloudflare: {
      // 服务端使用的 secret key（用于 better-auth）
      get secretKey() {
        // 开发环境fallback到测试key
        if (process.env.NODE_ENV === 'development') {
          return '1x0000000000000000000000000000000AA'; // 测试用的 siteKey
        }
        return getEnvForService('TURNSTILE_SECRET_KEY', 'Cloudflare Turnstile');
      },
      // 客户端使用的 site key（使用 NEXT_PUBLIC_ 前缀）
      get siteKey() {
        // 开发环境fallback到测试key
        if (process.env.NODE_ENV === 'development') {
          return '1x00000000000000000000AA'; // 测试用的 siteKey
        }
        // 直接访问 process.env，不通过 getEnv 函数（因为客户端环境下 dotenv 不工作）
        const publicKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
        if (publicKey) return publicKey;
        
        // 生产环境必须配置
        return getEnvForService('TURNSTILE_SITE_KEY', 'Cloudflare Turnstile');
      }
    }
  },

  /**
   * Database Configuration
   */
  database: {
    // Required core service, using error instead of warning
    get url() {
      return requireEnvForService('DATABASE_URL', 'Database', 'postgresql://username:password@localhost:5432/database_name');
    }
  },
} as const; 