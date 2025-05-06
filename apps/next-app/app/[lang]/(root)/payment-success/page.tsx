'use client';

import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      router.replace('/');
      return;
    }

    async function verifySession() {
      try {
        const response = await fetch(`/api/payment/verify?session_id=${sessionId}`);
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
  }, [sessionId, router]);

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
            <Link href="/dashboard/subscription">
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