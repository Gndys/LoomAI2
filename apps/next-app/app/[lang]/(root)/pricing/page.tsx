'use client';

import { config } from '@config';
import { useTranslation } from "@/hooks/use-translation";
import type { Plan } from '@config';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { authClientReact } from "@libs/auth/authClient";
import QRCode from 'qrcode';
import { motion } from "framer-motion";
import { 
  Check, 
  Star, 
  Sparkles,
  Crown,
  Zap,
  Shield,
  Heart,
  ArrowRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Steps, Step } from "@/components/ui/steps";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const { t, locale: currentLocale } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  const { data: session, isPending } = authClientReact.useSession();
  const user = session?.user;

  const plans = Object.values(config.payment.plans) as unknown as Plan[];

  // 清理轮询定时器
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const startPolling = (orderId: string) => {
    // 先清除可能存在的轮询
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/query?orderId=${orderId}&provider=wechat`);
        const data = await response.json();

        if (data.status === 'paid') {
          clearInterval(interval);
          setPollingInterval(null);
          router.push(`/${currentLocale}/payment-success?provider=wechat`);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setPollingInterval(null);
          toast.error(t.payment.result.failed);
          closeQrCodeModal();
        }
      } catch (error) {
        console.error('Payment polling error:', error);
      }
    }, 3000); // 每3秒查询一次

    setPollingInterval(interval);
  };

  const handleSubscribe = async (plan: Plan) => {
    try {
      if (!user) {
        const returnPath = encodeURIComponent(pathname);
        router.push(`/${currentLocale}/signin?returnTo=${returnPath}`);
        return;
      }

      setLoading(plan.id);
      const provider = plan.provider || 'stripe';
      setCurrentPlan(plan);
      
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          provider
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }
      
      if (provider === 'wechat') {
        if (data.paymentUrl) {
          try {
            const qrDataUrl = await QRCode.toDataURL(data.paymentUrl);
            setQrCodeUrl(qrDataUrl);
            setOrderId(data.providerOrderId);
            setCurrentStep(1);
            startPolling(data.providerOrderId);
          } catch (err) {
            console.error('QR code generation error:', err);
            toast.error(t.common.unexpectedError);
          }
        }
      } else {
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(t.common.unexpectedError);
    } finally {
      setLoading(null);
    }
  };

  const closeQrCodeModal = () => {
    // 如果当前正在处理支付，提示用户确认是否取消
    if (currentStep < 2 && orderId) { // 还未完成支付且有订单ID
      const confirmCancel = window.confirm(t.payment.confirmCancel);
      if (!confirmCancel) {
        return; // 用户取消关闭，继续支付流程
      }
      
      // 调用关闭订单API
      fetch(`/api/payment/cancel?orderId=${orderId}&provider=wechat`, {
        method: 'POST'
      }).then(response => {
        if (response.ok) {
          toast.info(t.payment.orderCanceled);
        } else {
          console.error('Failed to cancel order');
          toast.error(t.common.unexpectedError);
        }
      }).catch(error => {
        console.error('Cancel order error:', error);
        toast.error(t.common.unexpectedError);
      });
    }
    
    setQrCodeUrl(null);
    setCurrentPlan(null);
    setCurrentStep(0);
    setOrderId(null);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const steps: Step[] = [
    { title: t.payment.steps.initiate, description: t.payment.steps.initiateDesc },
    { title: t.payment.steps.scan, description: t.payment.steps.scanDesc },
    { title: t.payment.steps.pay, description: t.payment.steps.payDesc },
  ];

  // 获取推荐计划
  const getRecommendedPlan = () => {
    return plans.find(plan => plan.recommended) || plans[0];
  };

  const recommendedPlan = getRecommendedPlan();

  return (
    <>
      <style jsx>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Hero Section */}
        <section className="relative py-24 sm:py-32 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <motion.div 
              className="mx-auto max-w-4xl text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full border border-blue-200 dark:border-blue-700 mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-900 dark:text-blue-100">{t.pricing.title}</span>
              </motion.div>

              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {t.pricing.subtitle}
                </span>
              </h2>
              
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                选择最适合你的方案，开始你的 TinyShip 之旅。
                一次购买，终身使用，早鸟价仅限前 100 名用户。
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {plans.map((plan, index) => {
                const i18n = plan.i18n && typeof plan.i18n === 'object' ? plan.i18n[currentLocale] : undefined;
                const isRecommended = plan.recommended;
                const isLifetime = plan.id === 'lifetime';
                
                return (
                  <motion.div
                    key={plan.id}
                    className={`relative rounded-xl p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                      isRecommended 
                        ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-500 dark:border-blue-400 shadow-blue-500/20' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {/* Recommended Badge */}
                    {isRecommended && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-md">
                          <Crown className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">推荐选择</span>
                        </div>
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <h3 className={`text-xl font-bold mb-2 ${
                        isRecommended ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'
                      }`}>
                        {i18n?.name || plan.name}
                      </h3>
                      
                      <p className={`text-sm ${
                        isRecommended ? 'text-blue-700 dark:text-blue-200' : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {i18n?.description || plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="flex items-baseline justify-center space-x-2">
                        <span className={`text-4xl font-bold ${
                          isRecommended ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'
                        }`}>
                          {plan.currency === 'CNY' ? '¥' : '$'}{plan.amount}
                        </span>
                        <span className={`text-base font-medium ${
                          isRecommended ? 'text-blue-700 dark:text-blue-200' : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          /{i18n?.duration || plan.duration.description}
                        </span>
                      </div>
                      
                      {isLifetime && (
                        <div className="mt-2 inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-xs font-medium">
                          <Heart className="h-3.5 w-3.5" />
                          <span>一次购买，终身使用</span>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={feature} className="flex items-start space-x-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isRecommended 
                              ? 'bg-blue-100 dark:bg-blue-900/50' 
                              : 'bg-green-100 dark:bg-green-900/50'
                          }`}>
                            <Check className={`h-3 w-3 ${
                              isRecommended 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-green-600 dark:text-green-400'
                            }`} />
                          </div>
                          <span className={`text-sm leading-6 ${
                            isRecommended ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {i18n?.features && Array.isArray(i18n.features) && featureIndex < i18n.features.length
                              ? i18n.features[featureIndex]
                              : feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleSubscribe(plan)}
                      disabled={loading === plan.id || isPending}
                      className={`w-full py-3 rounded-lg font-semibold text-base transition-all duration-300 hover:scale-[1.02] ${
                        isRecommended
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
                          : isLifetime
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg'
                          : 'bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-md hover:shadow-lg'
                      } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                    >
                      {loading === plan.id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>{t.common.loading}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>{t.pricing.cta}</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>

                    {/* Special Effects for Recommended Plan */}
                    {isRecommended && (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-xl pointer-events-none"></div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Additional Info */}
            <motion.div 
              className="mt-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">安全支付</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">支持微信支付、Stripe 等多种安全支付方式</p>
                </div>
                
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">终身更新</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">一次购买即可享受所有后续功能更新</p>
                </div>
                
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">社区支持</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">加入活跃的开发者社区，获得技术支持</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Payment Modal */}
      <Dialog open={!!qrCodeUrl} onOpenChange={(open) => !open && closeQrCodeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {currentPlan && (
                <span>
                  {currentPlan.currency === 'CNY' ? '¥' : '$'}{currentPlan.amount} - 
                  {currentPlan.i18n && 
                   currentPlan.i18n[currentLocale] && 
                   currentPlan.i18n[currentLocale].name || currentPlan.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6">
            <Steps steps={steps} currentStep={currentStep} />
            {qrCodeUrl && (
              <div className="flex flex-col items-center space-y-4">
                <img 
                  src={qrCodeUrl} 
                  alt="WeChat Pay QR Code" 
                  className="w-64 h-64"
                />
                <p className="text-sm text-gray-500">
                  {t.payment.scanQrCode}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 