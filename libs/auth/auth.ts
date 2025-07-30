import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { phoneNumber, admin, captcha } from "better-auth/plugins"
import { validator, StandardAdapter } from "validation-better-auth"
import { createAuthMiddleware } from "better-auth/api"

import { db, user, account, session, verification } from '@libs/database'
import { sendSMS } from '@libs/sms';
import { emailSignInSchema, emailSignUpSchema } from '@libs/validators/user'
import { wechatPlugin } from './plugins/wechat'
import { sendVerificationEmail, sendResetPasswordEmail } from '@libs/email'
import { locales, defaultLocale } from '@libs/email/templates'
import { config } from '@config'
export { toNextJsHandler } from "better-auth/next-js";
/**
 * 从 referer URL 中提取信息
 * @param request 请求对象
 * @returns 返回语言代码和最后的路径段
 */
function getRefererInfo(request?: Request): { locale: string; lastSegment: string } {
  const referer = request?.headers?.get('referer');
  if (!referer) return { locale: defaultLocale, lastSegment: '' };

  try {
    const url = new URL(referer);
    const pathParts = url.pathname.split('/').filter(Boolean);
    // 检查第一个路径部分是否是有效的语言代码
    const locale = pathParts[0];
    // 获取最后一个路径段
    const lastSegment = pathParts[pathParts.length - 1] || '';
    // 检查是否是支持的语言
    return {
      locale: locale in locales ? locale : defaultLocale,
      lastSegment
    };
  } catch (error) {
    console.error('Failed to parse referer URL:', error);
    return { locale: defaultLocale, lastSegment: '' };
  }
}

export const auth = betterAuth({
  appName: 'shipeasy',
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      account,
      session,
      verification
    }
  }),
  
  // Development hooks for returning verification links and OTP codes
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (process.env.NODE_ENV === 'development') {
        const returned = ctx.context.returned;
        
        // Check if there's dev data stored in the request context
        const devData = (ctx.request as any)?.context;
        
        if (returned && devData) {
          const devResponse: any = { ...returned };
          
          // Add verification URL if available
          if (devData.verificationUrl) {
            devResponse.dev = {
              verificationUrl: devData.verificationUrl,
              message: 'Development mode: Use this verification URL instead of checking email'
            };
          }
          
          // Add OTP code if available
          if (devData.otpCode) {
            devResponse.dev = {
              otpCode: devData.otpCode,
              message: 'Development mode: Use this OTP code for verification'
            };
          }
          
          // Add reset URL if available
          if (devData.resetUrl) {
            devResponse.dev = {
              resetUrl: devData.resetUrl,
              message: 'Development mode: Use this reset URL instead of checking email'
            };
          }
          
          if (devResponse.dev) {
            return ctx.json(devResponse);
          }
        }
      }
    }),
  },
  // https://www.better-auth.com/docs/concepts/users-accounts#delete-user
  user: {
    deleteUser: {
      enabled: true
    }
  },
  // https://www.better-auth.com/docs/concepts/email
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: config.auth.requireEmailVerification,
    sendResetPassword: async ({user, url, token}, request) => {
      // 从 referer 中获取语言信息
      const { locale } = getRefererInfo(request);
      
      // 开发环境：将重置密码链接存储到 context 中，通过 hooks 返回
      if (process.env.NODE_ENV === 'development') {
        (request as any).context = (request as any).context || {};
        (request as any).context.resetUrl = url;
        console.log('🔗 [DEVELOPMENT MODE] Reset password URL stored in context:', url);
      }
      
      try {
        // 使用我们的邮件模块发送重置密码邮件
        await sendResetPasswordEmail(user.email, {
          name: user.name || user.email.split('@')[0], // 如果没有名字，使用邮箱前缀
          reset_url: url,
          expiry_hours: 1,
          locale: locale as 'en' | 'zh-CN' // 类型转换
        });
        
        console.log(`Reset password email sent to ${user.email} in ${locale} language`);
      } catch (error) {
        console.error('Failed to send reset password email:', error);
      }
    },
  },
  emailVerification: {
    sendOnSignUp: config.auth.requireEmailVerification,
    sendVerificationEmail: async ( { user, url, token }, request) => {
      // 从 referer 中获取语言信息和最后的路径段
      const { locale, lastSegment } = getRefererInfo(request);
      console.log('headers', request?.headers?.get('referer'))
      
      // 检查是否是用户主动重发请求
      const isUserInitiated = request?.headers?.get('x-resend-source') === 'user-initiated';
      
      // 特殊处理：如果是从登录页面（signin）发起的验证，不发送邮件
      // 但如果是用户主动重发请求，则允许发送
      // 这是因为 better-auth 在用户未验证时登录会自动触发验证邮件发送
      // 但我们希望只在注册时发送验证邮件
      if (lastSegment === 'signin' && !isUserInitiated) {
        console.log('Skipping verification email for signin request');
        return;
      }
      
      // 开发环境：将验证链接存储到 context 中，通过 hooks 返回
      if (process.env.NODE_ENV === 'development') {
        // 将验证链接存储到全局上下文中，hooks 可以访问
        (request as any).context = (request as any).context || {};
        (request as any).context.verificationUrl = url;
        console.log('🔗 [DEVELOPMENT MODE] Verification URL stored in context:', url);
      }
      
      try {
        // 使用我们的邮件模块发送验证邮件
        await sendVerificationEmail(user.email, {
          name: user.name || user.email.split('@')[0], // 如果没有名字，使用邮箱前缀
          verification_url: url,
          expiry_hours: 1,
          locale: locale as 'en' | 'zh-CN' // 类型转换
        });
        
        console.log(`Verification email sent to ${user.email} in ${locale} language`);
      } catch (error) {
        console.error('Failed to send verification email:', error);
      }
    },
    autoSignInAfterVerification: true,
  },

  socialProviders: {
    google: {
      clientId: config.auth.socialProviders.google.clientId!,
      clientSecret: config.auth.socialProviders.google.clientSecret!,
    },
    github: {
      clientId: config.auth.socialProviders.github.clientId!,
      clientSecret: config.auth.socialProviders.github.clientSecret!,
    }
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "wechat"]
    }
  },
  plugins: [
    // https://www.better-auth.com/docs/plugins/admin
    admin({
      adminRoles: ["admin"],
    }),

    // 根据配置决定是否添加验证码插件
    ...(config.captcha.enabled ? [
      captcha({
        provider: "cloudflare-turnstile",
        secretKey: config.captcha.cloudflare.secretKey!,
        endpoints: ["/sign-up/email", "/sign-in/email", "/forget-password", '/phone-number/send-otp', '/send-verification-email']
      })
    ] : []),

    // 添加微信登录插件
    wechatPlugin({
      appId: config.auth.socialProviders.wechat.appId!,
      appSecret: config.auth.socialProviders.wechat.appSecret!,
    }),

    // https://www.better-auth.com/docs/plugins/phone-number
    phoneNumber({
      //otpLength: 4,
      sendOTP: async ({ phoneNumber, code }, request) => { 
        console.log(`Attempting to send OTP to ${phoneNumber} with code ${code}`);
        
        // 开发环境：将 OTP 代码存储到 context 中，通过 hooks 返回
        if (process.env.NODE_ENV === 'development') {
          (request as any).context = (request as any).context || {};
          (request as any).context.otpCode = code;
          console.log('📱 [DEVELOPMENT MODE] OTP code stored in context:', code);
        }
        
        try {
          // Implement sending OTP code via SMS
          const result = await sendSMS({
            to: phoneNumber,
            templateParams: {
              code
            },
            provider: 'aliyun'
          });
          
          console.log('SMS send result:', result);
          
          if (!result.success) {
            const errorMessage = result.error?.message || 'Failed to send SMS';
            console.error('SMS sending failed:', errorMessage);
            throw new Error(errorMessage);
          }
          
          console.log(`OTP ${code} sent successfully to ${phoneNumber}`);
          // 成功时不需要返回值，better-auth会自动处理
        } catch (error) {
          console.error('Failed to send OTP:', error);
          // 重新抛出异常，确保better-auth能捕获到
          throw new Error(`SMS sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
            return `${phoneNumber}@tinyship.co`
        },
        //optionally, you can also pass `getTempName` function to generate a temporary name for the user
        getTempName: (phoneNumber) => {
          // 提取手机号的后4位作为临时用户名
          const cleanPhone = phoneNumber.replace(/\D/g, ''); // 移除非数字字符
          const suffix = cleanPhone.slice(-4); // 取后4位
          return suffix;
        }
      }
    }),
    // https://github.com/Daanish2003/validation-better-auth
    validator(
      [
        {path: "/sign-up/email", adapter: StandardAdapter(emailSignUpSchema)},
        {path: "/sign-in/email", adapter: StandardAdapter(emailSignInSchema)},
      ]
    ),
  ],
  rateLimit: {
    enabled: true,
    customRules: {
      "/send-verification-email": {
        window: 60, 
        max: 1,    
      },
      "/forget-password": {
        window: 60, 
        max: 1, 
      },
    },
  }
})
