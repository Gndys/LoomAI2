'use client';

import { Turnstile as ReactTurnstile } from "@marsidev/react-turnstile";
import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "@/hooks/use-translation";
import { config } from "@config";

interface TurnstileProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

export function Turnstile({ 
  onSuccess, 
  onError, 
  onExpire, 
  className 
}: TurnstileProps) {
  const { theme } = useTheme();
  const { locale } = useTranslation();

  // 如果验证码未启用，不渲染组件
  if (!config.captcha.enabled) {
    return null;
  }

  return (
    <div className={`w-full ${className || ''}`}>
      <ReactTurnstile
        siteKey={config.captcha.cloudflare.siteKey!}
        onSuccess={onSuccess}
        onError={() => {
          onError?.();
        }}
        onExpire={() => {
          onExpire?.();
        }}
        options={{
          theme: theme === 'dark' ? 'dark' : 'light',
          language: locale === 'zh-CN' ? 'zh-cn' : 'en',
          size: 'flexible'
        }}
      />
    </div>
  );
} 