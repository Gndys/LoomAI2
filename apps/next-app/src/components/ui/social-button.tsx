import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import * as React from "react"

// 以组件方式导入SVG
import GoogleIcon from "@libs/ui/icons/google.svg"
import GithubIcon from "@libs/ui/icons/github.svg"
import AppleIcon from "@libs/ui/icons/apple.svg"

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: 'google' | 'github' | 'apple';
}

// 创建一个映射对象，将提供商名称映射到相应的图标组件
const providerIcons = {
  google: GoogleIcon,
  github: GithubIcon,
  apple: AppleIcon,
} as const;

const providerNames = {
  google: 'Continue with Google',
  github: 'Continue with GitHub',
  apple: 'Continue with Apple',
};

export function SocialButton({ provider, className, ...props }: SocialButtonProps) {
  // 从映射中获取对应的图标组件
  const Icon = providerIcons[provider];
  
  return (
    <Button
      variant="outline"
      className={cn(
        "w-full bg-background hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      <Icon className="mr-2 h-4 w-4" />
      {providerNames[provider]}
    </Button>
  );
}