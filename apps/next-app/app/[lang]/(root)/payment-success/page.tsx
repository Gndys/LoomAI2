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
  // Alipay uses out_trade_no as the order identifier
  const outTradeNo = searchParams.get('out_trade_no');
  
  // WeChat and Alipay don't need verification - they use webhooks for confirmation
  const skipVerification = provider === 'wechat' || provider === 'alipay';
  const [isVerifying, setIsVerifying] = useState(!skipVerification);
  const [isValid, setIsValid] = useState(skipVerification);

  useEffect(() => {
    // For WeChat and Alipay, payment status is confirmed via webhook
    // The return URL is just for user experience
    if (provider === 'wechat' || provider === 'alipay') {
      return;
    }

    // For Stripe and Creem, verify the session
    // For Creem, we need to verify the full URL (including signature)
    if (!sessionId && provider !== 'creem') {
      router.replace('/');
      return;
    }

    async function verifySession() {
      try {
        // Determine verification endpoint based on provider
        let verifyUrl;
        if (provider === 'stripe') {
          verifyUrl = `/api/payment/verify/stripe?session_id=${sessionId}`;
        } else if (provider === 'creem') {
          // Creem verification needs the full URL for signature verification
          verifyUrl = `/api/payment/verify/creem${window.location.search}`;
        } else {
          // Default to Stripe verification (backward compatibility)
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