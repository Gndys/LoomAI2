# Block templates (Raphael style)

以下模板用于快速拼接功能页区块。复制到页面文件或局部组件目录中使用。

## Hero block

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroBlock({
  title,
  highlight,
  subtitle,
  primaryCta,
  secondaryCta,
  locale,
}: {
  title: string
  highlight?: string
  subtitle: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  locale: string
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
      <div className="absolute -top-16 right-8 h-64 w-64 rounded-full bg-chart-1/20 blur-3xl" />
      <div className="absolute -bottom-16 left-8 h-64 w-64 rounded-full bg-chart-3/20 blur-3xl" />

      <div className="container relative px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            {title}
            {highlight ? <span className="text-gradient-chart-warm">{highlight}</span> : null}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">{subtitle}</p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-8 py-4 text-lg">
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
            {secondaryCta ? (
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 py-4 text-lg">
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            ) : null}
          </div>

          <div className="mt-6 text-sm text-muted-foreground">适合首屏直接引导上传与体验</div>
        </div>
      </div>
    </section>
  )
}
```

## Steps block

```tsx
export function StepsBlock({
  title,
  subtitle,
  steps,
}: {
  title: string
  subtitle?: string
  steps: Array<{ title: string; description: string }>
}) {
  return (
    <section className="bg-muted/50 py-16 md:py-20">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
          {subtitle ? <p className="mt-3 text-muted-foreground">{subtitle}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-2/15 text-chart-2">
                  <span className="text-base font-bold">{index + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

## FAQ block

```tsx
export function FaqBlock({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle?: string
  items: Array<{ question: string; answer: string }>
}) {
  return (
    <section className="py-16 md:py-20">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
          {subtitle ? <p className="mt-3 text-muted-foreground">{subtitle}</p> : null}
        </div>

        <div className="mx-auto grid max-w-3xl gap-3">
          {items.map((item) => (
            <div key={item.question} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-base font-semibold text-foreground">{item.question}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

## Features block

```tsx
import { Sparkles } from 'lucide-react'

export function FeaturesBlock({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle?: string
  items: Array<{ title: string; description: string; Icon?: React.ComponentType<{ className?: string }> }>
}) {
  return (
    <section className="py-16 md:py-20">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
          {subtitle ? <p className="mt-3 text-muted-foreground">{subtitle}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const Icon = item.Icon ?? Sparkles
            return (
              <div key={`${item.title}-${index}`} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/10 text-chart-1">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

## Examples block (before/after)

```tsx
export function ExamplesBlock({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle?: string
  items: Array<{ label: string; before: string; after: string }>
}) {
  return (
    <section className="bg-muted/50 py-16 md:py-20">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
          {subtitle ? <p className="mt-3 text-muted-foreground">{subtitle}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                  <img src={item.before} alt="Before" className="h-40 w-full object-cover" />
                  <p className="border-t border-border/50 px-2 py-1 text-center text-xs text-muted-foreground">Before</p>
                </div>
                <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
                  <img src={item.after} alt="After" className="h-40 w-full object-cover" />
                  <p className="border-t border-border/50 px-2 py-1 text-center text-xs text-muted-foreground">After</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

## Final CTA block

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function FinalCtaBlock({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
}: {
  title: string
  subtitle?: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}) {
  return (
    <section className="py-16 md:py-20">
      <div className="container px-4 md:px-6">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm md:p-12">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
          {subtitle ? <p className="mt-4 text-muted-foreground">{subtitle}</p> : null}
          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-8 py-4 text-lg">
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
            {secondaryCta ? (
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 py-4 text-lg">
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
```
