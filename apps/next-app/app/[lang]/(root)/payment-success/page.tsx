'use client';

import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function PaymentSuccessContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const provider = searchParams.get('provider');
  const [isVerifying, setIsVerifying] = useState(provider !== 'wechat');
  const [isValid, setIsValid] = useState(provider === 'wechat');

  useEffect(() => {
    // 如果是微信支付，已经在前一个页面通过轮询确认过支付状态，直接视为有效
    if (provider === 'wechat') {
      return;
    }

    // 对于其他支付方式（如 Stripe、Creem），需要验证 session
    // 对于 Creem，我们需要验证完整的 URL（包含签名）
    if (!sessionId && provider !== 'creem') {
      router.replace('/');
      return;
    }

    async function verifySession() {
      try {
        // 根据 provider 确定验证端点
        let verifyUrl;
        if (provider === 'stripe') {
          verifyUrl = `/api/payment/verify/stripe?session_id=${sessionId}`;
        } else if (provider === 'creem') {
          // Creem 验证需要传递完整的 URL 以进行签名验证
          verifyUrl = `/api/payment/verify/creem${window.location.search}`;
        } else {
          // 默认使用 Stripe 验证（向后兼容）
          verifyUrl = `/api/payment/verify/stripe?session_id=${sessionId}`;
        }

        const response = await fetch(verifyUrl);
        if (!response.ok) {
          throw new Error('Invalid session');
        }
        const data = await response.json();
        setIsValid(true);
      } catch (error) {
        console.error('Session verification failed:', error);
        router.replace('/pricing');
      } finally {
        setIsVerifying(false);
      }
    }

    verifySession();
  }, [sessionId, router, provider]);

  if (isVerifying) {
    return (
      <div className="container max-w-2xl py-20">
        <div className="flex flex-col items-center text-center space-y-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return null; // Router will handle the redirect
  }

  return (
    <div className="container max-w-2xl py-20">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold">
          {t.payment.result.success.title}
        </h1>
        
        <p className="text-muted-foreground">
          {t.payment.result.success.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button asChild>
            <Link href="/dashboard">
              {t.payment.result.success.actions.viewSubscription}
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/">
              {t.payment.result.success.actions.backToHome}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="container max-w-2xl py-20">
      <div className="flex flex-col items-center text-center space-y-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
} 