import Link from 'next/link'
import {
  Check,
  ImageIcon,
  Sparkles,
  Wand2,
  SlidersHorizontal,
  Layers,
} from 'lucide-react'
import { FeaturePageShell, FeatureCard } from '@/components/feature-page-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

const promptChips = ['Auto', '无风格', '无色彩', '冷色灯光', '高对比', '细节加强']

const testSuites = [
  {
    title: '电商平铺图',
    description: '验证纯背景与材质真实度。',
    tags: ['白底', '织物细节', '规格一致'],
  },
  {
    title: '工艺线稿',
    description: '评估线条清晰度与结构信息。',
    tags: ['结构线', '缝份', '标注清晰'],
  },
  {
    title: '营销场景图',
    description: '测试光影氛围与风格稳定性。',
    tags: ['氛围光', '模特', '风格一致'],
  },
]

const metrics = [
  '细节还原：面料纹理、纽扣与缝线清晰',
  '风格一致：参数切换后视觉风格稳定',
  '构图可控：预设比例与主体位置稳定',
  '生成速度：30 秒内完成单张',
]

const panelClass =
  'border-border/60 bg-card/40 shadow-[0_30px_80px_-60px_hsl(var(--primary)/0.25)] backdrop-blur-xl'

export default function AIGenerateTestPage({ params }: { params: { lang: string } }) {
  const { lang } = params

  return (
    <div className="min-h-screen bg-background text-foreground">
      <FeaturePageShell
        title="AI 图片生成测试"
        description="用于验证提示词输入、参数胶囊与结果展示的体验效果。"
        badge={{ icon: <Sparkles className="size-3.5" />, label: '测试页面' }}
        className="max-w-6xl"
        titleClassName="text-3xl font-semibold tracking-tight sm:text-4xl"
        descriptionClassName="text-sm sm:text-base text-muted-foreground"
        badgeClassName="border-border/60 bg-background/70 text-muted-foreground"
      >
        <div className="space-y-10">
          <FeatureCard className={panelClass}>
            <CardContent className="pt-6 space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1">
                  <ImageIcon className="h-3.5 w-3.5" />
                  模型：Loom Pro
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  输出比例：3:4
                </span>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row">
                <div
                  className="relative shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 via-muted/10 to-transparent"
                  style={{ aspectRatio: '1 / 1', width: '180px', maxWidth: '220px' }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-muted-foreground">
                    <span>参考图</span>
                    <span className="mt-1">拖拽或上传</span>
                  </div>
                </div>

                <div className="flex-1 rounded-2xl border border-border/60 bg-background/60">
                  <Textarea
                    placeholder="例如：米白色羊毛短款外套，正肩，金属扣，柔和棚拍光"
                    className="min-h-[140px] resize-none border-0 bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <div className="border-t border-border/60 px-3 py-2">
                    <div className="text-[11px] text-muted-foreground">Remove (negative prompt)</div>
                    <Textarea
                      placeholder="避免：过度磨皮、背景杂乱、色偏"
                      className="mt-2 min-h-[70px] resize-none border-0 bg-transparent px-0 py-0 text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {promptChips.map((item) => (
                  <Badge key={item} variant="outline" className="rounded-full">
                    {item}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button className="rounded-full">生成测试图</Button>
                <Button variant="outline" className="rounded-full">
                  批量生成
                </Button>
                <Button variant="ghost" className="rounded-full" asChild>
                  <Link href={`/${lang}/ai-generate`}>打开正式版</Link>
                </Button>
              </div>
            </CardContent>
          </FeatureCard>

          <section className="grid gap-4 md:grid-cols-3">
            {testSuites.map((item) => (
              <Card key={item.title} className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base font-semibold">结果预览面板</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  用于对比不同参数下的输出差异。
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {['结果 A', '结果 B', '结果 C', '结果 D'].map((label) => (
                  <div
                    key={label}
                    className="flex aspect-[4/5] items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 text-xs text-muted-foreground"
                  >
                    {label}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base font-semibold">观察指标</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  记录测试中的关键维度。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
                <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Wand2 className="h-4 w-4" />
                    本轮验证重点
                  </div>
                  <p className="mt-2">
                    提示词与参数胶囊的交互流畅度，以及负面提示词对结果质量的影响。
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {[
              { title: '参数快速切换', icon: SlidersHorizontal, note: '评估切换时的反馈与选择状态。' },
              { title: '风格一致性', icon: Layers, note: '比较不同模型输出风格稳定性。' },
              { title: '生成质量追踪', icon: Sparkles, note: '记录每次生成的亮点与问题。' },
            ].map((item) => (
              <Card key={item.title} className="border-border/60">
                <CardHeader className="pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {item.note}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </section>
        </div>
      </FeaturePageShell>
    </div>
  )
}
