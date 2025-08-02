'use client';

import { SocialButton, type SocialProvider } from "@/components/ui/social-button";
import { cn } from "@/lib/utils";
import { authClientReact } from '@libs/auth/authClient';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';

interface SocialAuthProps extends React.HTMLAttributes<HTMLDivElement> {
  providers?: SocialProvider[];
}

const defaultProviders: SocialProvider[] = ['google', 'github', 'wechat', 'phone'];

export function SocialAuth({
  className,
  providers = defaultProviders,
  ...props
}: SocialAuthProps) {
  const router = useRouter();
  const { locale: currentLocale } = useTranslation();

  const handleProviderClick = async (provider: SocialProvider) => {
    switch (provider) {
      case 'wechat':
        router.push(`/${currentLocale}/wechat`);
        break;
      case 'phone':
        router.push(`/${currentLocale}/cellphone`);
        break;
      default:
        // Use default social login flow for other providers
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