import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { FileUploadDropzone } from '@/components/ui/file-upload';

type FeatureBadge = {
  label: string;
  icon?: React.ReactNode;
};

type FeaturePageShellProps = {
  title: string;
  description?: string;
  badge?: FeatureBadge | null;
  headerAlign?: 'center' | 'left';
  titleClassName?: string;
  descriptionClassName?: string;
  badgeClassName?: string;
  className?: string;
  children: React.ReactNode;
};

const FEATURE_CARD_CLASSNAME =
  'border-border/60 bg-background/80 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.18)] backdrop-blur animate-in fade-in-0 slide-in-from-bottom-4 duration-500';

const FEATURE_DROPZONE_CLASSNAME =
  'group min-h-[180px] rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5 transition-colors hover:border-foreground/30 hover:bg-muted/30';

const FEATURE_BADGE_CLASSNAME =
  'inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1 text-xs font-medium text-muted-foreground shadow-sm';

export function FeaturePageShell({
  title,
  description,
  badge,
  headerAlign = 'center',
  titleClassName,
  descriptionClassName,
  badgeClassName,
  className,
  children,
}: FeaturePageShellProps) {
  const badgeLabel = badge === null ? null : badge?.label ?? title;
  const headerClassName = headerAlign === 'left' ? 'text-left' : 'text-center';

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="absolute -top-24 right-[-120px] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 left-[-120px] h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="container relative py-12">
        <div className={cn('mx-auto space-y-8 max-w-6xl', className)}>
          <div className={cn('space-y-3', headerClassName)}>
            {badgeLabel && (
              <span className={cn(FEATURE_BADGE_CLASSNAME, badgeClassName)}>
                {badge?.icon}
                {badgeLabel}
              </span>
            )}
            <h1 className={cn('text-3xl font-semibold tracking-tight sm:text-4xl', titleClassName)}>
              {title}
            </h1>
            {description && (
              <p className={cn('text-muted-foreground text-sm sm:text-base', descriptionClassName)}>
                {description}
              </p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export const FeatureCard = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Card>
>(({ className, ...props }, ref) => (
  <Card ref={ref} className={cn(FEATURE_CARD_CLASSNAME, className)} {...props} />
));

FeatureCard.displayName = 'FeatureCard';

export function FeatureDropzone({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof FileUploadDropzone>) {
  return (
    <FileUploadDropzone
      className={cn(FEATURE_DROPZONE_CLASSNAME, className)}
      {...props}
    />
  );
}
