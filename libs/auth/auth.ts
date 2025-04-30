import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { phoneNumber, admin } from "better-auth/plugins"
import { validator, StandardAdapter } from "validation-better-auth"

import { db, user, account, session, verification } from '@libs/database'
// import { sendSMSByAliyun } from '@libs/sms/aliyun'
import { emailSignInSchema, emailSignUpSchema } from '@libs/validators/user'
import { wechatPlugin } from './plugins/wechat'
import { sendVerificationEmail, sendResetPasswordEmail } from '@libs/email'
export { toNextJsHandler } from "better-auth/next-js";


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
  // https://www.better-auth.com/docs/concepts/email
  emailAndPassword: {
    enabled: true,
    autoSignIn: false, //defaults to true
    requireEmailVerification: true,
    sendResetPassword: async ({user, url, token}, request) => {
      // 从请求头中获取语言信息，默认为英文
      const locale = request?.headers?.get('X-Locale') || 'en';
      
      try {
        // 使用我们的邮件模块发送重置密码邮件
        await sendResetPasswordEmail(user.email, {
          name: user.name || user.email.split('@')[0], // 如果没有名字，使用邮箱前缀
          reset_url: url,
          expiry_hours: 24, // 假设链接24小时后过期，可以根据实际情况调整
          locale: locale as 'en' | 'zh-CN' // 类型转换
        });
        
        console.log(`Reset password email sent to ${user.email} in ${locale} language`);
      } catch (error) {
        console.error('Failed to send reset password email:', error);
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ( { user, url, token }, request) => {
      // 从请求头中获取语言信息，默认为英文
      const locale = request?.headers?.get('X-Locale') || 'en';
      
      try {
        // 使用我们的邮件模块发送验证邮件
        // await sendVerificationEmail(user.email, {
        //   name: user.name || user.email.split('@')[0], // 如果没有名字，使用邮箱前缀
        //   verification_url: url,
        //   expiry_hours: 24, // 假设链接24小时后过期，可以根据实际情况调整
        //   locale: locale as 'en' | 'zh-CN' // 类型转换
        // });
        
        console.log(`Verification email sent to ${user.email} in ${locale} language`);
      } catch (error) {
        console.error('Failed to send verification email:', error);
      }
    },
    autoSignInAfterVerification: true
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
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
    admin(
      {
        adminRoles: ["admin"],
      }
    ),
    // https://www.better-auth.com/docs/plugins/generic-oauth#custom-user-info-fetching
    // https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html
    // genericOAuth({
    //   config: [
    //     {
    //       providerId: "wechat",
    //       clientId: process.env.WECHAT_APP_ID!,
    //       clientSecret: process.env.WECHAT_APP_SECRET!,
    //       authorizationUrl: "https://open.weixin.qq.com/connect/qrconnect",
    //       tokenUrl: "https://api.weixin.qq.com/sns/oauth2/access_token",
    //       userInfoUrl: "https://api.weixin.qq.com/sns/userinfo",
    //       scopes: ["snsapi_login"],
    //       getUserInfo: async (tokens) => {
    //         const wechatTokens = tokens as unknown as WeChatTokens;
    //         const response = await fetch(`https://api.weixin.qq.com/sns/userinfo?access_token=${wechatTokens.accessToken}&openid=${wechatTokens.openid}&lang=zh_CN`);
    //         const profile = await response.json();
            
    //         return {
    //           id: profile.unionid || profile.openid,
    //           name: profile.nickname,
    //           email: `${profile.openid}@wechat.com`,  // 微信不提供邮箱，我们创建一个虚拟邮箱
    //           emailVerified: true,
    //           image: profile.headimgurl,
    //           createdAt: new Date(),
    //           updatedAt: new Date()
    //         };
    //       }
    //     }
    //   ]
    // }),

    // 添加微信插件
    wechatPlugin({
      appId: process.env.WECHAT_APP_ID!,
      appSecret: process.env.WECHAT_APP_SECRET!,
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
