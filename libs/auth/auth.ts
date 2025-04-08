import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { genericOAuth, phoneNumber, admin } from "better-auth/plugins"

import { validator, StandardAdapter} from "validation-better-auth"


import { db, user, account, session, verification } from '@libs/database'
// import { sendSMSByAliyun } from '@libs/sms/aliyun'
import { emailSignInSchema, emailSignUpSchema } from '@libs/validators/user'
export { toNextJsHandler } from "better-auth/next-js";

interface WeChatProfile {
  unionid?: string;
  openid: string;
  nickname: string;
  headimgurl: string;
}

interface WeChatTokens {
  access_token: string;
  openid: string;
}

export const auth = betterAuth({
  appName: 'shipeasy',
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
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
      trustedProviders: ["google", "github"] 
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
    genericOAuth({
      config: [
        {
          providerId: "wechat",
          clientId: process.env.WECHAT_APP_ID!,
          clientSecret: process.env.WECHAT_APP_SECRET!,
          authorizationUrl: "https://open.weixin.qq.com/connect/qrconnect",
          tokenUrl: "https://api.weixin.qq.com/sns/oauth2/access_token",
          userInfoUrl: "https://api.weixin.qq.com/sns/userinfo",
          scopes: ["snsapi_login"],
          getUserInfo: async (tokens) => {
            const wechatTokens = tokens as unknown as WeChatTokens;
            const response = await fetch(`https://api.weixin.qq.com/sns/userinfo?access_token=${wechatTokens.access_token}&openid=${wechatTokens.openid}&lang=zh_CN`);
            const profile: WeChatProfile = await response.json();
            
            return {
              id: profile.unionid || profile.openid,
              name: profile.nickname,
              email: `${profile.openid}@wechat.com`,  // 微信不提供邮箱，我们创建一个虚拟邮箱
              emailVerified: true,
              image: profile.headimgurl,
              createdAt: new Date(),
              updatedAt: new Date()
            };
          }
        }
      ]
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
