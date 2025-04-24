'use client';

import { SocialButton, type SocialProvider } from "@/components/ui/social-button";
import { cn } from "@/lib/utils";
import { authClientReact } from '@libs/auth/authClient'

interface SocialAuthProps extends React.HTMLAttributes<HTMLDivElement> {
  providers?: SocialProvider[];
}

const defaultProviders: SocialProvider[] = ['google', 'github', 'wechat', 'phone'];

export function SocialAuth({
  className,
  providers = defaultProviders,
  ...props
}: SocialAuthProps) {
  const handleProviderClick = async (provider: SocialProvider) => {
    switch (provider) {
      case 'wechat':
        window.location.href = '/wechat';
        break;
      case 'phone':
        window.location.href = '/cellphone';
        break;
      default:
        // 其他提供商使用默认的social登录流程
        authClientReact.signIn.social({
          provider,
        });
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {providers.map((provider) => (
        <SocialButton 
          key={provider} 
          provider={provider} 
          onClick={() => handleProviderClick(provider)}
        />
      ))}
    </div>
  );
} 