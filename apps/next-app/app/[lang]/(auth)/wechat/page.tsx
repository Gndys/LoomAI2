'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { nanoid } from 'nanoid'
declare global {
  interface Window {
    WxLogin: any;
  }
}

export default function WeixinLoginPage() {
  const { t } = useTranslation();

  useEffect(() => {

    const initWxLogin = () => {
      if (typeof window.WxLogin !== 'undefined') {
        new window.WxLogin({
          id: 'login_container',
          appid: process.env.NEXT_PUBLIC_WECHAT_APP_ID,
          scope: 'snsapi_login',
          redirect_uri: encodeURIComponent(process.env.NEXT_PUBLIC_WECHAT_REDIRECT_URI!),
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
    <div className="container flex items-center justify-center min-h-screen py-12">
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
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t.auth.wechat.orUseOtherMethods}
                </span>
              </div>
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
