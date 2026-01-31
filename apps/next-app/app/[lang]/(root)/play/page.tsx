import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Layers,
  Palette,
  Ruler,
  Scan,
  Shirt,
  Sparkles,
  Zap,
} from 'lucide-react'
import { FeaturePageShell, FeatureCard } from '@/components/feature-page-shell'
import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

const heroBadges = ['30 秒平铺图', '线稿转 CAD', '面料与改色建议']

const quickParams = ['Auto', '无风格', '无色彩', '无光照', '无构图']

const workflowSteps = [
  {
    title: '上传照片或线稿',
    description: '支持 PNG/JPG，自动去背景与角度校正。',
  },
  {
    title: 'AI 结构拆解',
    description: '识别版型部件、线条与关键工艺点。',
  },
  {
    title: '导出可生产文件',
    description: 'DXF / SVG / PDF 多格式输出。',
  },
]

const styleCards = [
  '平铺图',
  '工艺线稿',
  '面料纹理',
  '成衣展示',
  '街拍场景',
  '剪裁细节',
  '极简通勤',
  '复古剪裁',
  '运动机能',
  '高级定制',
]

const promptChips = [
  '把街拍图拆成版型结构',
  '生成西装外套的平铺图',
  '输出袖口缝份线与对位记号',
  '这件外套用什么面料更高级',
  '给连衣裙做三组改色方案',
  '把线稿变成 CAD 制版图',
]

const bentoItems = [
  {
    title: '智能平铺图',
    description: '自动去背景、校正角度、统一光影，让平铺图符合电商标准。',
    className: 'col-span-1 md:col-span-2',
    icon: Shirt,
  },
  {
    title: '线稿转 CAD',
    description: '识别版型部件、添加缝份与对位记号，快速输出 DXF。',
    className: 'col-span-1',
    icon: Ruler,
  },
  {
    title: '结构与工艺拆解',
    description: '识别领型、袖型、结构线与关键工艺点，形成结构化说明。',
    className: 'col-span-1',
    icon: Layers,
  },
  {
    title: '面料与改色建议',
    description: '推测材质成分，输出改色方案与质感参考。',
    className: 'col-span-1 md:col-span-2',
    icon: Palette,
  },
]

const insights = [
  {
    title: '专业术语理解',
    description: '支持领型、袖型、门襟、腰线等服装术语，输出更准确。',
    icon: Sparkles,
  },
  {
    title: '高精度结构',
    description: '自动补齐缝份线与对位记号，减少返工。',
    icon: Scan,
  },
  {
    title: '快速比稿',
    description: '多风格快速生成，适配高频改稿场景。',
    icon: Zap,
  },
]

const faqs = [
  {
    question: 'LoomAI 能做哪些服装任务？',
    answer: '支持平铺图、线稿转 CAD、面料分析、改色建议与结构拆解。',
  },
  {
    question: '生成的 CAD 可以直接生产吗？',
    answer: '建议在制版软件中复核与微调，确保尺寸与工艺符合工厂标准。',
  },
  {
    question: '如何让输出更准确？',
    answer: '尽量使用清晰的服装术语，并提供参考图作为辅助。',
  },
]

const panelClass =
  'border-border/60 bg-card/40 shadow-[0_30px_80px_-60px_hsl(var(--primary)/0.25)] backdrop-blur-xl'

export default function PlayPage({ params }: { params: { lang: string } }) {
  const { lang } = params

  return (
    <div className="min-h-screen bg-background text-foreground">
      <FeaturePageShell
        title="Play · 服装设计落地页"
        description="使用模板组件重组的落地页版本，用于验证风格与结构。"
        badge={{ icon: <Sparkles className="size-3.5" />, label: '测试页面' }}
        className="max-w-6xl"
        titleClassName="text-3xl font-semibold tracking-tight sm:text-4xl text-foreground"
        descriptionClassName="text-sm sm:text-base text-muted-foreground"
        badgeClassName="border-border/60 bg-background/70 text-muted-foreground"
      >
        <div className="space-y-16">
          <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-primary">LoomAI 设计工作台</p>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  用 AI 加速服装设计与制版流程
                </h1>
                <p className="text-base text-muted-foreground sm:text-lg">
                  从照片、线稿到 CAD 输出，让设计师更快完成平铺图、线稿与改色方案。
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {heroBadges.map((item) => (
                  <Badge key={item} variant="secondary" className="rounded-full">
                    {item}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href={`/${lang}/upload`}>立即开始</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href={`/${lang}/pricing`}>查看价格</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  支持批量处理与模板化参数
                </span>
                <span className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  DXF / SVG / PDF 多格式输出
                </span>
              </div>
            </div>

            <FeatureCard className={panelClass}>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">快速生成面板</h3>
                  <p className="text-xs text-muted-foreground">输入描述或上传参考图即可开始。</p>
                </div>
                <Textarea
                  placeholder="例如：无领短款牛仔外套，正肩，金属纽扣，水洗蓝..."
                  className="min-h-[140px]"
                />
                <div className="flex flex-wrap gap-2">
                  {quickParams.map((item) => (
                    <Badge key={item} variant="outline" className="rounded-full">
                      {item}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button className="flex-1">生成</Button>
                  <Button variant="outline" className="flex-1">
                    上传参考图
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 text-xs text-muted-foreground">
                    结果预览
                  </div>
                  <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 text-xs text-muted-foreground">
                    结构拆解
                  </div>
                </div>
              </CardContent>
            </FeatureCard>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <Card key={step.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">0{index + 1}</CardTitle>
                  <CardDescription className="text-base font-semibold text-foreground">
                    {step.title}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {step.description}
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">核心能力</h2>
              <p className="text-sm text-muted-foreground">用模板组件展示关键能力。</p>
            </div>
            <BentoGrid className="auto-rows-[16rem] grid-cols-1 md:grid-cols-3">
              {bentoItems.map((item, index) => (
                <BentoCard
                  key={item.title}
                  name={item.title}
                  description={item.description}
                  Icon={item.icon}
                  className={item.className}
                  background={
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                  }
                  href={`/${lang}/upload`}
                  cta="立即体验"
                />
              ))}
            </BentoGrid>
          </section>

          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">尝试一种风格</h2>
              <p className="text-sm text-muted-foreground">选择常见输出类型与设计风格。</p>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {styleCards.map((style) => (
                <Card key={style} className="min-w-[180px]">
                  <CardContent className="space-y-3">
                    <div className="h-24 rounded-lg border border-dashed border-border/60 bg-muted/20" />
                    <div className="text-sm font-medium text-foreground">{style}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">灵感与提示词</h2>
                <p className="text-sm text-muted-foreground">一句话触发专业输出。</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {promptChips.map((item) => (
                  <Badge key={item} variant="outline" className="rounded-full">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">效果展示</CardTitle>
                <CardDescription>占位图用于后续接入真实案例。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="aspect-[4/3] rounded-xl border border-dashed border-border/60 bg-muted/20" />
                <div className="aspect-[4/3] rounded-xl border border-dashed border-border/60 bg-muted/20" />
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {insights.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">常见问题</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {faqs.map((item) => (
                <Card key={item.question}>
                  <CardHeader>
                    <CardTitle className="text-sm">{item.question}</CardTitle>
                    <CardDescription>{item.answer}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <CardTitle className="text-lg">准备好试试 LoomAI 了吗？</CardTitle>
                  <CardDescription>上传一张图，体验专业平铺图与线稿输出。</CardDescription>
                </div>
                <Button asChild size="lg">
                  <Link href={`/${lang}/upload`}>
                    立即体验
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </FeaturePageShell>
    </div>
  )
}
