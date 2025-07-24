'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { nanoid } from 'nanoid'
import { config } from '@config';

declare global {
  interface Window {
    WxLogin: any;
  }
}

export default function WeixinLoginPage() {
  const { t, locale } = useTranslation();
  console.log('process.env.NEXT_PUBLIC_WECHAT_APP_ID', process.env.NEXT_PUBLIC_WECHAT_APP_ID)
  console.log('process.env.NEXT_PUBLIC_WECHAT_REDIRECT_URI', process.env.NEXT_PUBLIC_WECHAT_REDIRECT_URI)
  useEffect(() => {

    const initWxLogin = () => {
      if (typeof window.WxLogin !== 'undefined') {
        new window.WxLogin({
          id: 'login_container',
          appid: process.env.NEXT_PUBLIC_WECHAT_APP_ID,
          scope: 'snsapi_login',
          redirect_uri: encodeURIComponent(`${config.app.baseUrl}/api/auth/oauth2/callback/wechat`),
          state: nanoid(10),
          style: 'black',
          href: 'https://api.easycv.cn/public/wxLogin.css',
          onReady: (isReady: boolean) => {
            console.log('WeChat login iframe ready:', isReady);
          }
        });
      }
    };

    // Initialize after a short delay to ensure the script is loaded
    const timer = setTimeout(initWxLogin, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container flex items-center justify-center min-h-screen py-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {t.auth.wechat.title}
          </CardTitle>
          <CardDescription className="text-center">
            {t.auth.wechat.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="relative">
              <div 
                id="login_container" 
                className="flex items-center justify-center min-h-[300px]"
              >
                <div className="text-center text-muted-foreground">
                  {t.auth.wechat.loadingQRCode}
                </div>
              </div>
            </div>
            <div className="text-muted-foreground text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary">
              {t.auth.wechat.termsNotice} <a href="#">{t.auth.wechat.termsOfService}</a>
              {" "}{t.common.and} <a href="#">{t.auth.wechat.privacyPolicy}</a>.
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <Link href={`/${locale}/signin`} className="text-primary hover:underline">
                {t.auth.signin.title}
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link href={`/${locale}/signup`} className="text-primary hover:underline">
                {t.auth.signup.createAccount}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      <Script 
        src="http://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
