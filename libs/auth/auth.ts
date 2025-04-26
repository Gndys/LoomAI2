import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { phoneNumber, admin } from "better-auth/plugins"
import { validator, StandardAdapter } from "validation-better-auth"

import { db, user, account, session, verification } from '@libs/database'
// import { sendSMSByAliyun } from '@libs/sms/aliyun'
import { emailSignInSchema, emailSignUpSchema } from '@libs/validators/user'
import { wechatPlugin } from './plugins/wechat'
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
    sendResetPassword: async ({user, url, token}) => {
      // await sendEmail({
      //   to: user.email,
      //   subject: "Reset your password",
      //   text: `Click the link to reset your password: ${url}`,
      // });
      console.log('the token', token)
      console.log(`Click the link to reset your password: ${url}`)
    },
  },
  emailVerification: {
    sendVerificationEmail: async ( { user, url, token }, request) => {
      // await sendEmail({
      //   to: user.email,
      //   subject: "Verify your email address",
      //   text: `Click the link to verify your email: ${url}`,
      // });
      console.log(`Click the link to verify your email${user.email}: ${url}`,)
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
