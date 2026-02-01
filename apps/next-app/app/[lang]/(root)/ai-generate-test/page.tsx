'use client'

import { useState } from 'react'
import { SlidersHorizontal, Sparkles } from 'lucide-react'
import { FeaturePageShell, FeatureCard } from '@/components/feature-page-shell'
import { CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

const panelClass =
  'border-border/60 bg-card/50 shadow-[0_30px_80px_-60px_hsl(var(--primary)/0.25)] backdrop-blur-xl'

const chipClass =
  'inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-foreground/85 hover:bg-muted/40 transition'

const baseChips = ['Auto', '无风格', '无配色', '无材质', '无视角']
const advancedChips = ['无版型', '无元素', '无人群', '无年龄', '无场景', '无季节']

function ChipRow() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {baseChips.map((item) => (
        <span key={item} className={chipClass}>
          {item}
        </span>
      ))}
    </div>
  )
}

function AdvancedPanel() {
  return (
    <div className="mt-3 rounded-2xl border border-border/60 bg-background/70 p-3">
      <div className="text-xs text-muted-foreground mb-2">高级设置</div>
      <div className="flex flex-wrap items-center gap-2">
        {advancedChips.map((item) => (
          <span key={item} className={chipClass}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function VariantHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  )
}

function VariantA() {
  const [open, setOpen] = useState(false)

  return (
    <FeatureCard className={panelClass}>
      <CardContent className="pt-6 space-y-4">
        <VariantHeader
          title="版本 A：胶囊开关"
          description="高级设置作为一颗胶囊，放在参数行末尾。"
        />
        <div className="flex flex-wrap items-center gap-2">
          <ChipRow />
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-foreground/80">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>高级设置</span>
            <Switch checked={open} onCheckedChange={setOpen} />
          </div>
        </div>
        {open && <AdvancedPanel />}
      </CardContent>
    </FeatureCard>
  )
}

function VariantB() {
  const [open, setOpen] = useState(false)

  return (
    <FeatureCard className={panelClass}>
      <CardContent className="pt-6 space-y-4">
        <VariantHeader
          title="版本 B：轻量文字 + 开关"
          description="保持行内轻盈，不额外包裹。"
        />
        <div className="flex flex-wrap items-center gap-3">
          <ChipRow />
          <div className="flex items-center gap-2 text-xs text-foreground/70">
            <span>高级设置</span>
            <Switch checked={open} onCheckedChange={setOpen} />
          </div>
        </div>
        {open && <AdvancedPanel />}
      </CardContent>
    </FeatureCard>
  )
}

function VariantC() {
  const [open, setOpen] = useState(false)

  return (
    <FeatureCard className={panelClass}>
      <CardContent className="pt-6 space-y-4">
        <VariantHeader
          title="版本 C：右侧控制条"
          description="参数左对齐，高级开关靠右。"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ChipRow />
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-foreground/80">
            <span>高级设置</span>
            <Switch checked={open} onCheckedChange={setOpen} />
          </div>
        </div>
        {open && <AdvancedPanel />}
      </CardContent>
    </FeatureCard>
  )
}

function VariantD() {
  const [open, setOpen] = useState(false)

  return (
    <FeatureCard className={panelClass}>
      <CardContent className="pt-6 space-y-4">
        <VariantHeader
          title="版本 D：紧凑小标签"
          description="更紧凑的开关盒子，降低视觉重量。"
        />
        <div className="flex flex-wrap items-center gap-3">
          <ChipRow />
          <div className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 py-1 text-xs text-foreground/75">
            <span>高级设置</span>
            <Switch checked={open} onCheckedChange={setOpen} />
          </div>
        </div>
        {open && <AdvancedPanel />}
      </CardContent>
    </FeatureCard>
  )
}

function VariantE() {
  const [open, setOpen] = useState(false)

  return (
    <FeatureCard className={panelClass}>
      <CardContent className="pt-6 space-y-4">
        <VariantHeader
          title="版本 E：图标按钮"
          description="只保留图标与开关，更像专业工具条。"
        />
        <div className="flex flex-wrap items-center gap-3">
          <ChipRow />
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-2 py-1 text-xs text-foreground/80">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <Switch checked={open} onCheckedChange={setOpen} />
          </div>
        </div>
        {open && <AdvancedPanel />}
      </CardContent>
    </FeatureCard>
  )
}

export default function AIGenerateTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <FeaturePageShell
        title="AI 图片生成测试 · 高级设置版本"
        description="已清空原页面内容，仅保留高级设置开关的多版本对比。"
        badge={{ icon: <Sparkles className="size-3.5" />, label: 'Advanced Toggle' }}
        className="max-w-5xl"
        titleClassName="text-3xl font-semibold tracking-tight sm:text-4xl"
        descriptionClassName="text-sm sm:text-base text-muted-foreground"
        badgeClassName="border-border/60 bg-background/70 text-muted-foreground"
      >
        <div className="space-y-8">
          <VariantA />
          <VariantB />
          <VariantC />
          <VariantD />
          <VariantE />
        </div>
      </FeaturePageShell>
    </div>
  )
}
