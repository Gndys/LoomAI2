'use client';

import { SocialButton } from "@/components/ui/social-button";
import { cn } from "@/lib/utils";

interface SocialAuthProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SocialAuth({
  className,
  ...props
}: SocialAuthProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <SocialButton provider="google" />
      <SocialButton provider="github" />
    </div>
  );
} 