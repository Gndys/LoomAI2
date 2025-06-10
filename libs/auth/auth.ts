import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { phoneNumber, admin } from "better-auth/plugins"
import { validator, StandardAdapter } from "validation-better-auth"

import { db, user, account, session, verification } from '@libs/database'
// import { sendSMSByAliyun } from '@libs/sms/aliyun'
import { emailSignInSchema, emailSignUpSchema } from '@libs/validators/user'
import { wechatPlugin } from './plugins/wechat'
import { sendVerificationEmail, sendResetPasswordEmail } from '@libs/email'
import { locales, defaultLocale } from '@libs/email/templates'
import { config } from '@config'
export { toNextJsHandler } from "better-auth/next-js";
console.log('env', process.env.BETTER_AUTH_URL)
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
    requireEmailVerification: true,
    sendResetPassword: async ({user, url, token}, request) => {
      // 从 referer 中获取语言信息
      const { locale } = getRefererInfo(request);
      
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
    sendOnSignUp: true,
    sendVerificationEmail: async ( { user, url, token }, request) => {
      // 从 referer 中获取语言信息和最后的路径段
      const { locale, lastSegment } = getRefererInfo(request);
      console.log('headers', request?.headers?.get('referer'))
      
      // 特殊处理：如果是从登录页面（signin）发起的验证，不发送邮件
      // 这是因为 better-auth 在用户未验证时登录会自动触发验证邮件发送
      // 但我们希望只在注册时发送验证邮件
      if (lastSegment === 'signin') {
        console.log('Skipping verification email for signin request');
        return;
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

    // 添加微信登录插件
    wechatPlugin({
      appId: config.auth.socialProviders.wechat.appId!,
      appSecret: config.auth.socialProviders.wechat.appSecret!,
    }),

    // https://www.better-auth.com/docs/plugins/phone-number
    phoneNumber({
      //otpLength: 4,
      sendOTP: async ({ phoneNumber, code }, request) => { 
        try {
          // Implement sending OTP code via SMS
          // await sendSMSByAliyun({
          //   phoneNumber,
          //   signName: '阿里云短信测试',
          //   templateCode: 'SMS_154950105',
          //   templateParam: { code }
          // })
          console.log(`OTP ${code} sent to ${phoneNumber}`);
        } catch (error) {
          console.error('Failed to send OTP:', error);
          throw error;
        }
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
            return `${phoneNumber}@test.com`
        },
        //optionally, you can also pass `getTempName` function to generate a temporary name for the user
        getTempName: (phoneNumber) => {
          return phoneNumber //by default, it will use the phone number as the name
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
  ]
})
