'use client'

import { useState } from 'react'
import {
  ChevronDown,
  Sparkles,
  Shirt,
  Palette,
  Layers,
  Eye,
  SlidersHorizontal,
  Wand2,
  Trash2,
  LayoutPanelLeft,
  PanelsTopLeft,
  Dock,
  X,
  Check,
} from 'lucide-react'
import { FeaturePageShell, FeatureCard } from '@/components/feature-page-shell'
import { CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Option = { value: string; label: string }

const clothingTypeOptions: Option[] = [
  { value: 'casual', label: '休闲装' },
  { value: 'formal', label: '正装' },
  { value: 'sports', label: '运动装' },
  { value: 'street', label: '街头风' },
  { value: 'vintage', label: '复古风' },
  { value: 'minimal', label: '极简风' },
  { value: 'punk', label: '朋克' },
  { value: 'couture', label: '高定' },
]

const colorOptions: Option[] = [
  { value: 'morandi', label: '莫兰迪色系' },
  { value: 'earth', label: '大地色系' },
  { value: 'mono', label: '黑白灰' },
  { value: 'contrast', label: '撞色搭配' },
  { value: 'gradient', label: '渐变色' },
  { value: 'seasonal', label: '季节色彩' },
  { value: 'custom', label: '自定义色板' },
]

const fabricOptions: Option[] = [
  { value: 'cotton', label: '棉质' },
  { value: 'silk', label: '丝绸' },
  { value: 'denim', label: '牛仔' },
  { value: 'leather', label: '皮革' },
  { value: 'knit', label: '针织' },
  { value: 'chiffon', label: '雪纺' },
  { value: 'linen', label: '麻料' },
  { value: 'tech', label: '功能面料' },
]

const viewOptions: Option[] = [
  { value: 'flat_lay', label: '平铺图' },
  { value: 'front', label: '正面视图' },
  { value: 'back', label: '背面视图' },
  { value: 'side', label: '侧面视图' },
  { value: 'detail', label: '细节特写' },
  { value: 'on_model', label: '上身效果' },
  { value: 'hanging', label: '悬挂展示' },
  { value: 'turntable', label: '360° 旋转' },
]

const modelOptions: Option[] = [
  { value: 'raphael_basic', label: 'Raphael Basic' },
  { value: 'raphael_pro', label: 'Raphael Pro' },
  { value: 'loom_pro', label: 'Loom Pro' },
]

const lightingOptions: Option[] = [
  { value: 'none', label: 'None' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'dimly_lit', label: 'Dimly Lit' },
  { value: 'studio', label: 'Studio' },
  { value: 'low_light', label: 'Low Light' },
  { value: 'golden_hour', label: 'Golden Hour' },
  { value: 'backlight', label: 'Backlight' },
  { value: 'volumetric', label: 'Volumetric' },
  { value: 'crepuscular', label: 'Crepuscular Rays' },
  { value: 'sunlight', label: 'Sunlight' },
  { value: 'rim', label: 'Rim Lighting' },
]

const fitOptions: Option[] = [
  { value: 'slim', label: '修身' },
  { value: 'loose', label: '宽松' },
  { value: 'regular', label: '直筒' },
  { value: 'oversized', label: '廓形' },
  { value: 'a_line', label: 'A 字型' },
  { value: 'h_line', label: 'H 字型' },
  { value: 'x_line', label: 'X 字型' },
]

const elementOptions: Option[] = [
  { value: 'print', label: '印花图案' },
  { value: 'embroidery', label: '刺绣' },
  { value: 'patchwork', label: '拼接' },
  { value: 'pleats', label: '褶皱' },
  { value: 'pockets', label: '口袋设计' },
  { value: 'collar', label: '领型' },
  { value: 'sleeve', label: '袖型' },
]

const genderOptions: Option[] = [
  { value: 'female', label: '女装' },
  { value: 'male', label: '男装' },
  { value: 'kids', label: '童装' },
  { value: 'unisex', label: '中性' },
]

const ageOptions: Option[] = [
  { value: '18-25', label: '18-25 岁' },
  { value: '26-35', label: '26-35 岁' },
  { value: '36-45', label: '36-45 岁' },
]

const sceneOptions: Option[] = [
  { value: 'commute', label: '通勤' },
  { value: 'date', label: '约会' },
  { value: 'sport', label: '运动' },
  { value: 'home', label: '居家' },
]

const seasonOptions: Option[] = [
  { value: 'spring_summer', label: '春夏' },
  { value: 'autumn_winter', label: '秋冬' },
]

const samplePrompts = [
  '平铺图，干净背景，柔和光线，突出面料质感',
  '技术线稿，正背面视图，结构线清晰，比例准确',
  '宣传图，街头场景，模特上身效果，强调版型廓形',
]

const chipClass =
  'inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-foreground/90 hover:bg-muted/40 transition'

const chipClassGhost =
  'inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/20 px-3 py-1 text-xs text-foreground/90 hover:bg-muted/40 transition'

const panelClass =
  'border-border/60 bg-card/50 shadow-[0_30px_80px_-60px_hsl(var(--primary)/0.25)] backdrop-blur-xl'

const getLabel = (options: Option[], value: string, fallback = '') =>
  options.find((option) => option.value === value)?.label ?? fallback

const getMultiLabel = (options: Option[], values: string[]) => {
  if (values.length === 0) return ''
  const labels = values
    .map((value) => getLabel(options, value, ''))
    .filter(Boolean)
  if (labels.length <= 2) return labels.join('、')
  return `${labels[0]}、${labels[1]}…`
}

const labelOrNone = (prefix: string, valueLabel: string) =>
  valueLabel ? valueLabel : `${prefix}无`

const toggleMultiValue = (
  current: string[],
  value: string,
  setValues: (next: string[]) => void
) => {
  if (current.includes(value)) {
    setValues(current.filter((item) => item !== value))
  } else {
    setValues([...current, value])
  }
}

function useFashionParams(defaultPrompt: string) {
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [negativePrompt, setNegativePrompt] = useState('')
  const [showNegative, setShowNegative] = useState(false)

  const [category, setCategory] = useState('')
  const [colorScheme, setColorScheme] = useState('')
  const [view, setView] = useState('')
  const [fit, setFit] = useState('')
  const [targetGender, setTargetGender] = useState('')
  const [targetAge, setTargetAge] = useState('')
  const [targetScene, setTargetScene] = useState('')
  const [targetSeason, setTargetSeason] = useState('')
  const [fabrics, setFabrics] = useState<string[]>([])
  const [elements, setElements] = useState<string[]>([])

  const handleRandomPrompt = () => {
    const next = samplePrompts[Math.floor(Math.random() * samplePrompts.length)]
    setPrompt(next)
  }

  const handleClear = () => {
    setPrompt('')
    setNegativePrompt('')
    setElements([])
    setFabrics([])
  }

  const targetSummary = [
    getLabel(genderOptions, targetGender, ''),
    getLabel(ageOptions, targetAge, ''),
    getLabel(sceneOptions, targetScene, ''),
    getLabel(seasonOptions, targetSeason, ''),
  ]
    .filter(Boolean)
    .join(' / ')

  return {
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    showNegative,
    setShowNegative,
    category,
    setCategory,
    colorScheme,
    setColorScheme,
    view,
    setView,
    fit,
    setFit,
    targetGender,
    setTargetGender,
    targetAge,
    setTargetAge,
    targetScene,
    setTargetScene,
    targetSeason,
    setTargetSeason,
    fabrics,
    setFabrics,
    elements,
    setElements,
    handleRandomPrompt,
    handleClear,
    targetSummary,
  }
}

type ChipButtonProps = {
  icon?: typeof Shirt
  text: string
  className?: string
}

function ChipButton({ icon: Icon, text, className }: ChipButtonProps) {
  return (
    <span className={className ?? chipClass}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {text}
      <ChevronDown className="h-3 w-3 opacity-70" />
    </span>
  )
}

type MinimalChipProps = {
  text: string
}

function MinimalChip({ text }: MinimalChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-foreground/90 hover:bg-muted/40 transition">
      {text}
      <ChevronDown className="h-3 w-3 opacity-70" />
    </span>
  )
}

function OptionRow({
  params,
  density = 'default',
}: {
  params: ReturnType<typeof useFashionParams>
  density?: 'default' | 'compact'
}) {
  const chip = density === 'compact' ? chipClassGhost : chipClass

  return (
    <div className="flex flex-wrap gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">
            <ChipButton
              icon={Shirt}
              text={labelOrNone('类型', getLabel(clothingTypeOptions, params.category, ''))}
              className={chip}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuRadioGroup value={params.category} onValueChange={params.setCategory}>
            {clothingTypeOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">
            <ChipButton
              icon={Palette}
              text={labelOrNone('配色', getLabel(colorOptions, params.colorScheme, ''))}
              className={chip}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuRadioGroup value={params.colorScheme} onValueChange={params.setColorScheme}>
            {colorOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">
            <ChipButton
              icon={Layers}
              text={labelOrNone('面料', getMultiLabel(fabricOptions, params.fabrics))}
              className={chip}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {fabricOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={params.fabrics.includes(option.value)}
              onCheckedChange={() => toggleMultiValue(params.fabrics, option.value, params.setFabrics)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">
            <ChipButton
              icon={Eye}
              text={labelOrNone('视角', getLabel(viewOptions, params.view, ''))}
              className={chip}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuRadioGroup value={params.view} onValueChange={params.setView}>
            {viewOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function AdvancedMenu({ params }: { params: ReturnType<typeof useFashionParams> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-foreground/80 hover:text-foreground transition"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          高级
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">版型</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={params.fit} onValueChange={params.setFit}>
          {fitOptions.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">元素</DropdownMenuLabel>
        {elementOptions.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={params.elements.includes(option.value)}
            onCheckedChange={() => toggleMultiValue(params.elements, option.value, params.setElements)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">人群</DropdownMenuLabel>
        <DropdownMenuLabel className="text-xs text-muted-foreground/70">性别</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={params.targetGender} onValueChange={params.setTargetGender}>
          {genderOptions.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuLabel className="text-xs text-muted-foreground/70">年龄</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={params.targetAge} onValueChange={params.setTargetAge}>
          {ageOptions.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuLabel className="text-xs text-muted-foreground/70">场景</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={params.targetScene} onValueChange={params.setTargetScene}>
          {sceneOptions.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuLabel className="text-xs text-muted-foreground/70">季节</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={params.targetSeason} onValueChange={params.setTargetSeason}>
          {seasonOptions.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function VariantHeader({
  icon: Icon,
  title,
  description,
  tag,
}: {
  icon: typeof Sparkles
  title: string
  description: string
  tag: string
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
        {tag}
      </span>
    </div>
  )
}

function VariantA() {
  const params = useFashionParams(samplePrompts[0])

  return (
    <FeatureCard className={panelClass}>
      <CardContent className="pt-6 space-y-6">
        <VariantHeader
          icon={LayoutPanelLeft}
          title="版本 A：提示词下方一排参数"
          description="靠近提示词，选择即触发下拉。布局稳定，信息密度适中。"
          tag="Prompt Bar"
        />
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-foreground">参考图</div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border/60 bg-gradient-to-br from-muted/40 via-muted/10 to-transparent">
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                上传参考图
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
            >
              更换图片
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground">描述提示</p>
              <p className="text-xs text-muted-foreground">
                选择下方服装参数后，提示词会更贴近设计需求。
              </p>
            </div>
            <Textarea
              value={params.prompt}
              onChange={(e) => params.setPrompt(e.target.value)}
              placeholder="描述你想生成的服装效果..."
              className="min-h-[120px] resize-none bg-background border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
            />
            <OptionRow params={params} />

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <AdvancedMenu params={params} />
              <button
                type="button"
                onClick={() => params.setShowNegative((prev) => !prev)}
                className="inline-flex items-center gap-1 text-xs text-foreground/80 hover:text-foreground transition"
              >
                {params.showNegative ? '隐藏负面提示词' : '+ 负面提示词'}
              </button>
            </div>

            {params.showNegative && (
              <Textarea
                value={params.negativePrompt}
                onChange={(e) => params.setNegativePrompt(e.target.value)}
                placeholder="排除元素，比如：人物、文字、水印..."
                className="min-h-[80px] resize-none bg-background border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={params.handleRandomPrompt}
                  className="border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
                >
                  <Wand2 className="mr-1.5 h-4 w-4" />
                  随机
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={params.handleClear}
                  className="border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  清除
                </Button>
              </div>
              <Button className="h-11 rounded-full px-8 text-base">生成平铺图</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </FeatureCard>
  )
}

function VariantB() {
  const params = useFashionParams(samplePrompts[1])

  return (
    <FeatureCard className={panelClass}>
      <CardContent className="pt-6 space-y-6">
        <VariantHeader
          icon={PanelsTopLeft}
          title="版本 B：工具条式参数"
          description="提示词块 + 参数工具条，强调清爽的两层结构。"
          tag="Toolbar"
        />
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-muted/30 via-transparent to-transparent p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>描述提示</span>
                <span>服装专用</span>
              </div>
              <Textarea
                value={params.prompt}
                onChange={(e) => params.setPrompt(e.target.value)}
                placeholder="描述你想生成的服装效果..."
                className="min-h-[120px] resize-none bg-background border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
              />
              <div className="flex flex-wrap gap-2 rounded-full border border-border/60 bg-background/70 p-2">
                <OptionRow params={params} density="compact" />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <AdvancedMenu params={params} />
                <button
                  type="button"
                  onClick={() => params.setShowNegative((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-xs text-foreground/80 hover:text-foreground transition"
                >
                  {params.showNegative ? '隐藏负面提示词' : '+ 负面提示词'}
                </button>
              </div>
            </div>

            {params.showNegative && (
              <Textarea
                value={params.negativePrompt}
                onChange={(e) => params.setNegativePrompt(e.target.value)}
                placeholder="排除元素，比如：人物、文字、水印..."
                className="min-h-[80px] resize-none bg-background border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
              />
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={params.handleRandomPrompt}
                  className="border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
                >
                  <Wand2 className="mr-1.5 h-4 w-4" />
                  随机
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={params.handleClear}
                  className="border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  清除
                </Button>
              </div>
              <Button className="h-11 rounded-full px-8 text-base">生成技术线稿</Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-foreground">生成预览</div>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border/60 bg-gradient-to-br from-muted/30 via-muted/10 to-transparent">
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                预览画布
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-2 text-xs text-muted-foreground">
              目标人群：{params.targetSummary || '未设置'}
            </div>
          </div>
        </div>
      </CardContent>
    </FeatureCard>
  )
}

function VariantC() {
  const params = useFashionParams(samplePrompts[2])

  return (
    <FeatureCard className={panelClass}>
      <CardContent className="pt-6 space-y-6">
        <VariantHeader
          icon={Dock}
          title="版本 C：底部控制条"
          description="将参数与操作集中到下方控制条，主视图更干净。"
          tag="Docked Bar"
        />
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-foreground">参考图</div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border/60 bg-gradient-to-br from-muted/40 via-muted/10 to-transparent">
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                上传参考图
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
            >
              更换图片
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>提示词编辑</span>
              <span>快速生成</span>
            </div>
            <Textarea
              value={params.prompt}
              onChange={(e) => params.setPrompt(e.target.value)}
              placeholder="描述你想生成的服装效果..."
              className="min-h-[120px] resize-none bg-background border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
            />

            {params.showNegative && (
              <Textarea
                value={params.negativePrompt}
                onChange={(e) => params.setNegativePrompt(e.target.value)}
                placeholder="排除元素，比如：人物、文字、水印..."
                className="min-h-[80px] resize-none bg-background border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
              />
            )}

            <div className="rounded-2xl border border-border/60 bg-background/80 p-3 space-y-3">
              <OptionRow params={params} density="compact" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => params.setShowNegative((prev) => !prev)}
                    className="border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
                  >
                    {params.showNegative ? '隐藏负面提示词' : '+ 负面提示词'}
                  </Button>
                  <AdvancedMenu params={params} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={params.handleRandomPrompt}
                    className="border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
                  >
                    <Wand2 className="mr-1.5 h-4 w-4" />
                    随机
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={params.handleClear}
                    className="border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    清除
                  </Button>
                  <Button className="h-10 rounded-full px-6 text-sm">生成宣传图</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </FeatureCard>
  )
}

function VariantD() {
  const params = useFashionParams(samplePrompts[0])

  return (
    <FeatureCard className={panelClass}>
      <CardContent className="pt-6 space-y-6">
        <VariantHeader
          icon={LayoutPanelLeft}
          title="版本 D：极简工具条"
          description="只有提示词 + 一排参数 + 右下操作，最大限度降低干扰。"
          tag="Minimal"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <div className="space-y-3">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border/60 bg-gradient-to-br from-muted/40 via-muted/10 to-transparent">
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                上传参考图
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
            >
              更换图片
            </Button>
          </div>

          <div className="space-y-4">
            <Textarea
              value={params.prompt}
              onChange={(e) => params.setPrompt(e.target.value)}
              placeholder="您想看到什么？"
              className="min-h-[140px] resize-none bg-background border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
            />

            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button">
                    <MinimalChip
                      text={labelOrNone('类型', getLabel(clothingTypeOptions, params.category, ''))}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuRadioGroup value={params.category} onValueChange={params.setCategory}>
                    {clothingTypeOptions.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value}>
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button">
                    <MinimalChip
                      text={labelOrNone('配色', getLabel(colorOptions, params.colorScheme, ''))}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuRadioGroup value={params.colorScheme} onValueChange={params.setColorScheme}>
                    {colorOptions.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value}>
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button">
                    <MinimalChip
                      text={labelOrNone('面料', getMultiLabel(fabricOptions, params.fabrics))}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {fabricOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={params.fabrics.includes(option.value)}
                      onCheckedChange={() => toggleMultiValue(params.fabrics, option.value, params.setFabrics)}
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button">
                    <MinimalChip
                      text={labelOrNone('视角', getLabel(viewOptions, params.view, ''))}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuRadioGroup value={params.view} onValueChange={params.setView}>
                    {viewOptions.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value}>
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <AdvancedMenu params={params} />

              <button
                type="button"
                onClick={() => params.setShowNegative((prev) => !prev)}
                className="inline-flex items-center gap-1 text-xs text-foreground/80 hover:text-foreground transition"
              >
                {params.showNegative ? '隐藏负面' : '负面'}
              </button>
            </div>

            {params.showNegative && (
              <Textarea
                value={params.negativePrompt}
                onChange={(e) => params.setNegativePrompt(e.target.value)}
                placeholder="排除元素..."
                className="min-h-[80px] resize-none bg-background border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
              />
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={params.handleClear}
                className="border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
              >
                清除
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={params.handleRandomPrompt}
                className="border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
              >
                随机
              </Button>
              <Button className="h-10 rounded-full px-6 text-sm">在画布中生成</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </FeatureCard>
  )
}

function VariantE() {
  const params = useFashionParams(samplePrompts[0])
  const [lighting, setLighting] = useState('none')
  const [activeMenu, setActiveMenu] = useState<'lighting' | null>('lighting')
  const previewAspect =
    params.view === 'detail' ? '1 / 1' : params.view === 'flat_lay' ? '4 / 3' : '3 / 4'
  const lightingLabel =
    lighting === 'none' ? 'No Lighting' : getLabel(lightingOptions, lighting, 'No Lighting')
  const pillClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
      active
        ? 'border-transparent bg-foreground text-background'
        : 'border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40'
    }`

  return (
    <FeatureCard className={panelClass}>
      <CardContent className="pt-6 space-y-6">
        <VariantHeader
          icon={LayoutPanelLeft}
          title="版本 E：胶囊选项 + 内联面板"
          description="参考 AI Image Generator：选项菜单内联展开，图片嵌入提示词区域。"
          tag="Inline Menu"
        />

        <div className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.2)]">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>描述提示词</span>
            <button
              type="button"
              className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] text-foreground/80 hover:text-foreground"
            >
              添加图片
            </button>
          </div>

          <div className="mt-3 flex flex-col lg:flex-row gap-4">
            <div
              className="relative shrink-0 rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 via-muted/10 to-transparent"
              style={{ aspectRatio: previewAspect, width: '160px', maxWidth: '200px' }}
            >
              <button
                type="button"
                className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground hover:text-foreground"
                aria-label="清除图片"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                已上传参考图
              </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-2xl border border-border/60 bg-background/60">
              <Textarea
                value={params.prompt}
                onChange={(e) => params.setPrompt(e.target.value)}
                placeholder="What do you want to see?"
                className="min-h-[110px] resize-none border-0 bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {params.showNegative && (
                <>
                  <div className="h-px bg-border/60" />
                  <div className="px-3 py-2">
                    <div className="text-[11px] text-muted-foreground">Remove (negative prompt)</div>
                    <Textarea
                      value={params.negativePrompt}
                      onChange={(e) => params.setNegativePrompt(e.target.value)}
                      placeholder="What do you want to avoid?"
                      className="mt-2 min-h-[70px] resize-none border-0 bg-transparent px-0 py-0 text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={pillClass(false)}>
                1:1
              </button>
              <button type="button" className={pillClass(false)}>
                No Style
              </button>
              <button type="button" className={pillClass(false)}>
                No Color
              </button>
              <button
                type="button"
                onClick={() => setActiveMenu((current) => (current === 'lighting' ? null : 'lighting'))}
                className={pillClass(activeMenu === 'lighting')}
              >
                {lightingLabel}
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>
              <button type="button" className={pillClass(false)}>
                No Composition
              </button>
              <button
                type="button"
                onClick={() => params.setShowNegative((prev) => !prev)}
                className="inline-flex items-center gap-1 text-xs text-foreground/80 hover:text-foreground transition"
              >
                {params.showNegative ? '隐藏负面' : '负面'}
              </button>
            </div>

            {activeMenu === 'lighting' && (
              <div className="rounded-xl border border-border/60 bg-background/80 p-3 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.25)]">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {lightingOptions.map((option) => {
                    const selected = lighting === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setLighting(option.value)}
                        className={pillClass(selected)}
                      >
                        {selected && <Check className="h-3 w-3" />}
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {params.showNegative && (
              <Textarea
                value={params.negativePrompt}
                onChange={(e) => params.setNegativePrompt(e.target.value)}
                placeholder="排除元素..."
                className="min-h-[70px] resize-none bg-background border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
              />
            )}
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={params.handleClear}
              className="h-9 rounded-full border-border/50 bg-background/60 px-4 text-xs text-foreground/85 shadow-sm hover:bg-muted/40 hover:text-foreground"
            >
              清除
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={params.handleRandomPrompt}
              className="h-9 rounded-full border-border/50 bg-background/60 px-4 text-xs text-foreground/85 shadow-sm hover:bg-muted/40 hover:text-foreground"
            >
              随机
            </Button>
            <Button className="h-9 rounded-full px-5 text-xs font-medium text-background shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)] bg-foreground hover:opacity-90">
              在画布中生成
            </Button>
          </div>
        </div>
      </CardContent>
    </FeatureCard>
  )
}

function VariantF() {
  const params = useFashionParams(samplePrompts[0])
  const [activeMenu, setActiveMenu] = useState<
    'type' | 'color' | 'fabric' | 'view' | 'advanced' | null
  >(null)
  const previewAspect =
    params.view === 'detail' ? '1 / 1' : params.view === 'flat_lay' ? '4 / 3' : '3 / 4'

  const toggleMenu = (menu: typeof activeMenu) => {
    setActiveMenu((current) => (current === menu ? null : menu))
  }

  const pillClass = (selected: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
      selected
        ? 'border-transparent bg-foreground text-background'
        : 'border-border/60 bg-background/60 text-foreground/90 hover:bg-muted/40'
    }`

  const panelClassName =
    'rounded-xl border border-border/60 bg-background/70 p-3 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.2)]'

  return (
    <FeatureCard className={panelClass}>
      <CardContent className="pt-6 space-y-6">
        <VariantHeader
          icon={Dock}
          title="版本 F：内联选项面板"
          description="用可展开面板替代下拉，选项一目了然，减少点选成本。"
          tag="Inline Panel"
        />

        <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div
              className="relative shrink-0 rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 via-muted/10 to-transparent"
              style={{ aspectRatio: previewAspect, width: '180px', maxWidth: '220px' }}
            >
              <button
                type="button"
                className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground hover:text-foreground"
                aria-label="清除图片"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                上传参考图
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <Textarea
                value={params.prompt}
                onChange={(e) => params.setPrompt(e.target.value)}
                placeholder="您想看到什么？"
                className="min-h-[140px] resize-none bg-background border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleMenu('type')}
                  className={pillClass(activeMenu === 'type')}
                >
                  {labelOrNone('类型', getLabel(clothingTypeOptions, params.category, ''))}
                </button>
                <button
                  type="button"
                  onClick={() => toggleMenu('color')}
                  className={pillClass(activeMenu === 'color')}
                >
                  {labelOrNone('配色', getLabel(colorOptions, params.colorScheme, ''))}
                </button>
                <button
                  type="button"
                  onClick={() => toggleMenu('fabric')}
                  className={pillClass(activeMenu === 'fabric')}
                >
                  {labelOrNone('面料', getMultiLabel(fabricOptions, params.fabrics))}
                </button>
                <button
                  type="button"
                  onClick={() => toggleMenu('view')}
                  className={pillClass(activeMenu === 'view')}
                >
                  {labelOrNone('视角', getLabel(viewOptions, params.view, ''))}
                </button>
                <button
                  type="button"
                  onClick={() => toggleMenu('advanced')}
                  className={pillClass(activeMenu === 'advanced')}
                >
                  高级
                </button>
                <button
                  type="button"
                  onClick={() => params.setShowNegative((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-xs text-foreground/80 hover:text-foreground transition"
                >
                  {params.showNegative ? '隐藏负面' : '负面'}
                </button>
              </div>

              {activeMenu === 'type' && (
                <div className={panelClassName}>
                  <div className="flex flex-wrap gap-2">
                    {clothingTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => params.setCategory(option.value)}
                        className={pillClass(params.category === option.value)}
                      >
                        {params.category === option.value && <Check className="h-3 w-3" />}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeMenu === 'color' && (
                <div className={panelClassName}>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => params.setColorScheme(option.value)}
                        className={pillClass(params.colorScheme === option.value)}
                      >
                        {params.colorScheme === option.value && <Check className="h-3 w-3" />}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeMenu === 'fabric' && (
                <div className={panelClassName}>
                  <div className="flex flex-wrap gap-2">
                    {fabricOptions.map((option) => {
                      const selected = params.fabrics.includes(option.value)
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            toggleMultiValue(params.fabrics, option.value, params.setFabrics)
                          }
                          className={pillClass(selected)}
                        >
                          {selected && <Check className="h-3 w-3" />}
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeMenu === 'view' && (
                <div className={panelClassName}>
                  <div className="flex flex-wrap gap-2">
                    {viewOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => params.setView(option.value)}
                        className={pillClass(params.view === option.value)}
                      >
                        {params.view === option.value && <Check className="h-3 w-3" />}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeMenu === 'advanced' && (
                <div className={panelClassName}>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">版型</div>
                      <div className="flex flex-wrap gap-2">
                        {fitOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => params.setFit(option.value)}
                            className={pillClass(params.fit === option.value)}
                          >
                            {params.fit === option.value && <Check className="h-3 w-3" />}
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-2">元素</div>
                      <div className="flex flex-wrap gap-2">
                        {elementOptions.map((option) => {
                          const selected = params.elements.includes(option.value)
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                toggleMultiValue(params.elements, option.value, params.setElements)
                              }
                              className={pillClass(selected)}
                            >
                              {selected && <Check className="h-3 w-3" />}
                              {option.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-2">人群</div>
                      <div className="flex flex-wrap gap-2">
                        {genderOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => params.setTargetGender(option.value)}
                            className={pillClass(params.targetGender === option.value)}
                          >
                            {params.targetGender === option.value && <Check className="h-3 w-3" />}
                            {option.label}
                          </button>
                        ))}
                        {ageOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => params.setTargetAge(option.value)}
                            className={pillClass(params.targetAge === option.value)}
                          >
                            {params.targetAge === option.value && <Check className="h-3 w-3" />}
                            {option.label}
                          </button>
                        ))}
                        {sceneOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => params.setTargetScene(option.value)}
                            className={pillClass(params.targetScene === option.value)}
                          >
                            {params.targetScene === option.value && <Check className="h-3 w-3" />}
                            {option.label}
                          </button>
                        ))}
                        {seasonOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => params.setTargetSeason(option.value)}
                            className={pillClass(params.targetSeason === option.value)}
                          >
                            {params.targetSeason === option.value && <Check className="h-3 w-3" />}
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {params.showNegative && (
                <Textarea
                  value={params.negativePrompt}
                  onChange={(e) => params.setNegativePrompt(e.target.value)}
                  placeholder="排除元素..."
                  className="min-h-[70px] resize-none bg-background border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
                />
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={params.handleClear}
              className="h-9 rounded-full border-border/50 bg-background/60 px-4 text-xs text-foreground/85 shadow-sm hover:bg-muted/40 hover:text-foreground"
            >
              清除
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={params.handleRandomPrompt}
              className="h-9 rounded-full border-border/50 bg-background/60 px-4 text-xs text-foreground/85 shadow-sm hover:bg-muted/40 hover:text-foreground"
            >
              随机
            </Button>
            <Button className="h-9 rounded-full px-5 text-xs font-medium text-background shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)] bg-foreground hover:opacity-90">
              在画布中生成
            </Button>
          </div>
        </div>
      </CardContent>
    </FeatureCard>
  )
}

function VariantG() {
  const params = useFashionParams(samplePrompts[0])
  const [lighting, setLighting] = useState('none')
  const [activeMenu, setActiveMenu] = useState<'lighting' | null>('lighting')
  const [model, setModel] = useState(modelOptions[1].value)
  const previewAspect =
    params.view === 'detail' ? '1 / 1' : params.view === 'flat_lay' ? '4 / 3' : '3 / 4'
  const lightingLabel =
    lighting === 'none' ? 'No Lighting' : getLabel(lightingOptions, lighting, 'No Lighting')
  const pillClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
      active
        ? 'border-transparent bg-foreground text-background'
        : 'border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40'
    }`

  return (
    <FeatureCard className={panelClass}>
      <CardContent className="pt-6 space-y-6">
        <VariantHeader
          icon={PanelsTopLeft}
          title="版本 G：底部辅助条"
          description="负面提示词与模型选择下移到底部，减少主操作干扰。"
          tag="Bottom Row"
        />

        <div className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.2)]">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>描述提示词</span>
            <button
              type="button"
              className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] text-foreground/80 hover:text-foreground"
            >
              添加图片
            </button>
          </div>

          <div className="mt-3 flex flex-col lg:flex-row gap-4">
            <div
              className="relative shrink-0 rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 via-muted/10 to-transparent"
              style={{ aspectRatio: previewAspect, width: '160px', maxWidth: '200px' }}
            >
              <button
                type="button"
                className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground hover:text-foreground"
                aria-label="清除图片"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                已上传参考图
              </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-2xl border border-border/60 bg-background/60">
              <Textarea
                value={params.prompt}
                onChange={(e) => params.setPrompt(e.target.value)}
                placeholder="What do you want to see?"
                className="min-h-[110px] resize-none border-0 bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {params.showNegative && (
                <>
                  <div className="h-px bg-border/60" />
                  <div className="px-3 py-2">
                    <div className="text-[11px] text-muted-foreground">Remove (negative prompt)</div>
                    <Textarea
                      value={params.negativePrompt}
                      onChange={(e) => params.setNegativePrompt(e.target.value)}
                      placeholder="What do you want to avoid?"
                      className="mt-2 min-h-[70px] resize-none border-0 bg-transparent px-0 py-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={pillClass(false)}>
                1:1
              </button>
              <button type="button" className={pillClass(false)}>
                No Style
              </button>
              <button type="button" className={pillClass(false)}>
                No Color
              </button>
              <button
                type="button"
                onClick={() => setActiveMenu((current) => (current === 'lighting' ? null : 'lighting'))}
                className={pillClass(activeMenu === 'lighting')}
              >
                {lightingLabel}
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>
              <button type="button" className={pillClass(false)}>
                No Composition
              </button>
            </div>

            {activeMenu === 'lighting' && (
              <div className="rounded-xl border border-border/60 bg-background/80 p-3 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.25)]">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {lightingOptions.map((option) => {
                    const selected = lighting === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setLighting(option.value)}
                        className={pillClass(selected)}
                      >
                        {selected && <Check className="h-3 w-3" />}
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {params.showNegative && (
              <Textarea
                value={params.negativePrompt}
                onChange={(e) => params.setNegativePrompt(e.target.value)}
                placeholder="排除元素..."
                className="min-h-[70px] resize-none bg-background border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
              />
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => params.setShowNegative((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-foreground/85 hover:bg-muted/40 hover:text-foreground"
              >
                {params.showNegative ? '隐藏负面' : '负面提示词'}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className={pillClass(false)}>
                    模型：{getLabel(modelOptions, model, '')}
                    <ChevronDown className="h-3 w-3 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
                    {modelOptions.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value}>
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={params.handleClear}
                className="h-9 rounded-full border-border/50 bg-background/60 px-4 text-xs text-foreground/85 shadow-sm hover:bg-muted/40 hover:text-foreground"
              >
                清除
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={params.handleRandomPrompt}
                className="h-9 rounded-full border-border/50 bg-background/60 px-4 text-xs text-foreground/85 shadow-sm hover:bg-muted/40 hover:text-foreground"
              >
                随机
              </Button>
              <Button className="h-9 rounded-full px-5 text-xs font-medium text-background shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)] bg-foreground hover:opacity-90">
                在画布中生成
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </FeatureCard>
  )
}

function VariantH() {
  const params = useFashionParams(samplePrompts[0])
  const [lighting, setLighting] = useState('none')
  const [activeMenu, setActiveMenu] = useState<'lighting' | null>('lighting')
  const [model, setModel] = useState(modelOptions[1].value)
  const previewAspect =
    params.view === 'detail' ? '1 / 1' : params.view === 'flat_lay' ? '4 / 3' : '3 / 4'
  const lightingLabel =
    lighting === 'none' ? 'No Lighting' : getLabel(lightingOptions, lighting, 'No Lighting')
  const pillClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
      active
        ? 'border-transparent bg-foreground text-background'
        : 'border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40'
    }`
  const bottomActionClass =
    'inline-flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 py-1 text-xs text-foreground/80 hover:bg-muted/40 hover:text-foreground transition'

  return (
    <FeatureCard className={panelClass}>
      <CardContent className="pt-6 space-y-6">
        <VariantHeader
          icon={PanelsTopLeft}
          title="版本 H：统一底部按钮"
          description="模型选择与负面提示词同一胶囊样式，整行风格统一。"
          tag="Unified Row"
        />

        <div className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.2)]">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>描述提示词</span>
            <button
              type="button"
              className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] text-foreground/80 hover:text-foreground"
            >
              添加图片
            </button>
          </div>

          <div className="mt-3 flex flex-col lg:flex-row gap-4">
            <div
              className="relative shrink-0 rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 via-muted/10 to-transparent"
              style={{ aspectRatio: previewAspect, width: '160px', maxWidth: '200px' }}
            >
              <button
                type="button"
                className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground hover:text-foreground"
                aria-label="清除图片"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                已上传参考图
              </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-2xl border border-border/60 bg-background/60">
              <Textarea
                value={params.prompt}
                onChange={(e) => params.setPrompt(e.target.value)}
                placeholder="What do you want to see?"
                className="min-h-[110px] resize-none border-0 bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {params.showNegative && (
                <>
                  <div className="h-px bg-border/60" />
                  <div className="px-3 py-2">
                    <div className="text-[11px] text-muted-foreground">Remove (negative prompt)</div>
                    <Textarea
                      value={params.negativePrompt}
                      onChange={(e) => params.setNegativePrompt(e.target.value)}
                      placeholder="What do you want to avoid?"
                      className="mt-2 min-h-[70px] resize-none border-0 bg-transparent px-0 py-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={pillClass(false)}>
                1:1
              </button>
              <button type="button" className={pillClass(false)}>
                No Style
              </button>
              <button type="button" className={pillClass(false)}>
                No Color
              </button>
              <button
                type="button"
                onClick={() => setActiveMenu((current) => (current === 'lighting' ? null : 'lighting'))}
                className={pillClass(activeMenu === 'lighting')}
              >
                {lightingLabel}
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>
              <button type="button" className={pillClass(false)}>
                No Composition
              </button>
            </div>

            {activeMenu === 'lighting' && (
              <div className="rounded-xl border border-border/60 bg-background/80 p-3 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.25)]">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {lightingOptions.map((option) => {
                    const selected = lighting === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setLighting(option.value)}
                        className={pillClass(selected)}
                      >
                        {selected && <Check className="h-3 w-3" />}
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-xs text-foreground/80">
                <span>负面提示词</span>
                <Switch checked={params.showNegative} onCheckedChange={params.setShowNegative} />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className={bottomActionClass}>
                    模型：{getLabel(modelOptions, model, '')}
                    <ChevronDown className="h-3 w-3 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
                    {modelOptions.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value}>
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={params.handleClear}
                className="h-9 rounded-full border-border/50 bg-background/60 px-4 text-xs text-foreground/85 shadow-sm hover:bg-muted/40 hover:text-foreground"
              >
                清除
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={params.handleRandomPrompt}
                className="h-9 rounded-full border-border/50 bg-background/60 px-4 text-xs text-foreground/85 shadow-sm hover:bg-muted/40 hover:text-foreground"
              >
                随机
              </Button>
              <Button className="h-9 rounded-full px-5 text-xs font-medium text-background shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)] bg-foreground hover:opacity-90">
                在画布中生成
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </FeatureCard>
  )
}

function VariantI() {
  const params = useFashionParams(samplePrompts[0])
  const [lighting, setLighting] = useState('none')
  const [activeMenu, setActiveMenu] = useState<'lighting' | null>('lighting')
  const [model, setModel] = useState(modelOptions[1].value)
  const previewAspect =
    params.view === 'detail' ? '1 / 1' : params.view === 'flat_lay' ? '4 / 3' : '3 / 4'
  const lightingLabel =
    lighting === 'none' ? 'No Lighting' : getLabel(lightingOptions, lighting, 'No Lighting')
  const pillClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
      active
        ? 'border-transparent bg-foreground text-background'
        : 'border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40'
    }`
  const bottomActionClass =
    'inline-flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 py-1 text-xs text-foreground/80 hover:bg-muted/40 hover:text-foreground transition'

  return (
    <FeatureCard className={panelClass}>
      <CardContent className="pt-6 space-y-6">
        <VariantHeader
          icon={Dock}
          title="版本 I：无分割默认态"
          description="负面提示词关闭时完全无分割线，开启后才出现分区。"
          tag="Clean Default"
        />

        <div className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.2)]">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>描述提示词</span>
            <button
              type="button"
              className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] text-foreground/80 hover:text-foreground"
            >
              添加图片
            </button>
          </div>

          <div className="mt-3 flex flex-col lg:flex-row gap-4">
            <div
              className="relative shrink-0 rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 via-muted/10 to-transparent"
              style={{ aspectRatio: previewAspect, width: '160px', maxWidth: '200px' }}
            >
              <button
                type="button"
                className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground hover:text-foreground"
                aria-label="清除图片"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                已上传参考图
              </div>
            </div>

            <div className="flex-1 rounded-2xl border border-border/60 bg-background/60">
              <Textarea
                value={params.prompt}
                onChange={(e) => params.setPrompt(e.target.value)}
                placeholder="What do you want to see?"
                className="min-h-[140px] resize-none border-0 bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {params.showNegative && (
                <div className="border-t border-border/60 px-3 py-2">
                  <div className="text-[11px] text-muted-foreground">Remove (negative prompt)</div>
                  <Textarea
                    value={params.negativePrompt}
                    onChange={(e) => params.setNegativePrompt(e.target.value)}
                    placeholder="What do you want to avoid?"
                    className="mt-2 min-h-[70px] resize-none border-0 bg-transparent px-0 py-0 text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={pillClass(false)}>
                1:1
              </button>
              <button type="button" className={pillClass(false)}>
                No Style
              </button>
              <button type="button" className={pillClass(false)}>
                No Color
              </button>
              <button
                type="button"
                onClick={() => setActiveMenu((current) => (current === 'lighting' ? null : 'lighting'))}
                className={pillClass(activeMenu === 'lighting')}
              >
                {lightingLabel}
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>
              <button type="button" className={pillClass(false)}>
                No Composition
              </button>
            </div>

            {activeMenu === 'lighting' && (
              <div className="rounded-xl border border-border/60 bg-background/80 p-3 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.25)]">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {lightingOptions.map((option) => {
                    const selected = lighting === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setLighting(option.value)}
                        className={pillClass(selected)}
                      >
                        {selected && <Check className="h-3 w-3" />}
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-xs text-foreground/80">
                <span>负面提示词</span>
                <Switch checked={params.showNegative} onCheckedChange={params.setShowNegative} />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className={bottomActionClass}>
                    模型：{getLabel(modelOptions, model, '')}
                    <ChevronDown className="h-3 w-3 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
                    {modelOptions.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value}>
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={params.handleClear}
                className="h-9 rounded-full border-border/50 bg-background/60 px-4 text-xs text-foreground/85 shadow-sm hover:bg-muted/40 hover:text-foreground"
              >
                清除
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={params.handleRandomPrompt}
                className="h-9 rounded-full border-border/50 bg-background/60 px-4 text-xs text-foreground/85 shadow-sm hover:bg-muted/40 hover:text-foreground"
              >
                随机
              </Button>
              <Button className="h-9 rounded-full px-5 text-xs font-medium text-background shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)] bg-foreground hover:opacity-90">
                在画布中生成
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </FeatureCard>
  )
}

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <FeaturePageShell
        title="服装 AI 参数布局 · Playground"
        description="三种排布版本：提示词下方参数、工具条式参数、底部控制条。"
        badge={{ icon: <Sparkles className="size-3.5" />, label: '多版本对比' }}
        headerAlign="left"
        className="max-w-6xl"
        titleClassName="text-3xl font-semibold tracking-tight sm:text-4xl text-foreground"
        descriptionClassName="text-sm sm:text-base text-muted-foreground"
        badgeClassName="border-border/60 bg-background/70 text-muted-foreground"
      >
        <div className="space-y-10">
          <VariantA />
          <VariantB />
          <VariantC />
          <VariantD />
          <VariantE />
          <VariantF />
          <VariantG />
          <VariantH />
          <VariantI />
        </div>
      </FeaturePageShell>
    </div>
  )
}
