import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { genericOAuth, phoneNumber } from "better-auth/plugins"

import { db, user, account, session, verification } from '@libs/database'
import { sendSMSByAliyun } from '@libs/sms/aliyun'

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
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: {
      user,
      account,
      session,
      verification
    }
  }),
  emailAndPassword: {
    enabled: true,
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
  plugins: [
    // https://www.better-auth.com/docs/plugins/generic-oauth#custom-user-info-fetching
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
      sendOTP: async ({ phoneNumber, code }, request) => { 
        try {
          // Implement sending OTP code via SMS
          await sendSMSByAliyun({
            phoneNumber,
            signName: '阿里云短信测试',
            templateCode: 'SMS_154950105',
            templateParam: { code }
          })
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
      }
    }) 
  ]
})
