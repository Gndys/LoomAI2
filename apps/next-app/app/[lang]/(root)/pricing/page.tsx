'use client';

import { config } from '@config';
import { useTranslation } from "@/hooks/use-translation";
import type { Plan } from '@config';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { authClientReact } from "@libs/auth/authClient";

export default function PricingPage() {
  const { t, locale: currentLocale } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState<string | null>(null);
  const plans = Object.values(config.payment.plans) as Plan[];
  
  const { data: session, isPending } = authClientReact.useSession();
  const user = session?.user;

  const handleSubscribe = async (plan: Plan) => {
    try {
      // 检查用户是否已登录
    if (!user) {
        // 保存当前页面路径，以便登录后返回
        const returnPath = encodeURIComponent(pathname);
        router.push(`/${currentLocale}/signin?returnTo=${returnPath}`);
        return;
      }

      setLoading(plan.id);
      
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          provider: 'stripe'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }
      console.log('Payment initiation result:', data);
      // 对于 Stripe，重定向到 Checkout 页面
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(t.common.unexpectedError);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">{t.pricing.title}</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {t.pricing.subtitle}
          </p>
        </div>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10"
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8 text-gray-900">
                    {t.pricing.plans[plan.id as keyof typeof t.pricing.plans].name}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {t.pricing.plans[plan.id as keyof typeof t.pricing.plans].description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    {plan.currency === 'CNY' ? '¥' : '$'}{plan.amount}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-gray-600">
                    /{t.pricing.plans[plan.id as keyof typeof t.pricing.plans].duration}
                  </span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex gap-x-3">
                      <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      {t.pricing.plans[plan.id as keyof typeof t.pricing.plans].features[feature] || feature}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                disabled={loading === plan.id || isPending}
                onClick={() => handleSubscribe(plan)}
                className="mt-8 block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === plan.id ? t.common.loading : t.pricing.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 