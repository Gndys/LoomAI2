'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
} from 'react'
import { ArrowRight, CheckCircle2, Download, Loader2, Sparkles, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { config } from '@config'
import { FeatureCard, FeaturePageShell } from '@/components/feature-page-shell'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type GenerationMode = 'single' | 'multi'
type SketchView = 'front' | 'side' | 'back'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const PROVIDER_LABELS: Record<string, string> = {
  evolink: 'Evolink',
}
const VIEW_OPTIONS: { value: SketchView; label: string }[] = [
  { value: 'front', label: '正视图' },
  { value: 'side', label: '侧视图' },
  { value: 'back', label: '背视图' },
]
const VIEW_LABEL_MAP: Record<SketchView, string> = {
  front: '正视图',
  side: '侧视图',
  back: '背视图',
}

const MODE_BUTTONS: { value: GenerationMode; title: string; description: string }[] = [
  {
    value: 'single',
    title: '单视图',
    description: '每次仅选择一个视图生成',
  },
  {
    value: 'multi',
    title: '多视图',
    description: '可同时选择多个视图生成',
  },
]

const HOW_IT_WORKS = [
  {
    title: '上传你的服装图',
    description: '支持 JPG、PNG、WEBP。建议上传正面清晰、无遮挡的原图或平铺图。',
  },
  {
    title: '选择模式与参数',
    description: '可选单视图或多视图，并设置视图与尺寸。',
  },
  {
    title: '生成并下载',
    description: '点击生成后系统自动出图，支持单张结果下载。',
  },
]

const FAQ_ITEMS = [
  {
    q: '支持哪些文件格式？',
    a: '当前支持 JPG、PNG、WEBP 图片。建议上传清晰度较高的服装图。',
  },
  {
    q: '上传有大小限制吗？',
    a: '有，单张图片最大 10MB。超过大小会提示重新上传。',
  },
  {
    q: '单视图和多视图的区别是什么？',
    a: '单视图模式下每次只生成一个视图；多视图模式下可一次选择多个视图。',
  },
  {
    q: '提示词会暴露给用户吗？',
    a: '不会。提示词模板仅在服务端按你选择的模式和视图自动组装。',
  },
]

const SAMPLE_PRESETS = [
  { id: 'sample-1', title: '基础 T 恤' },
  { id: 'sample-2', title: '连帽卫衣' },
  { id: 'sample-3', title: '工装夹克' },
]

function createSampleImageDataUri(label: string, accent: string) {
  const safeLabel = label.slice(0, 10)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f8fafc" />
          <stop offset="100%" stop-color="#e2e8f0" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" rx="36" fill="url(#bg)" />
      <rect x="54" y="54" width="532" height="372" rx="26" fill="none" stroke="#cbd5e1" stroke-width="3" />
      <path d="M212 150 L266 118 L374 118 L428 150 L402 220 L238 220 Z" fill="none" stroke="${accent}" stroke-width="6" />
      <path d="M238 220 L238 338 L402 338 L402 220" fill="none" stroke="#111827" stroke-width="5" />
      <path d="M290 180 L350 180" fill="none" stroke="#111827" stroke-width="4" />
      <path d="M320 220 L320 338" fill="none" stroke="#111827" stroke-width="3" stroke-dasharray="8 8" />
      <text x="320" y="398" text-anchor="middle" font-size="30" fill="#334155" font-family="Arial, Helvetica, sans-serif">${safeLabel}</text>
    </svg>
  `.trim()
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function downloadImage(url: string, fileName: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
}

export default function ClothesOriginalSketchPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [model, setModel] = useState<string>(config.aiImage.defaultModels.evolink)
  const [size, setSize] = useState<string>(config.aiImage.defaults.size ?? 'auto')
  const [mode, setMode] = useState<GenerationMode>('multi')
  const [views, setViews] = useState<SketchView[]>(['front', 'side', 'back'])
  const [isDragActive, setIsDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progressText, setProgressText] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [resultViewLabel, setResultViewLabel] = useState<string>('')

  const modelOptions = useMemo(() => {
    const providers = Object.entries(config.aiImage.availableModels) as Array<[string, readonly string[]]>
    return providers.flatMap(([provider, models]) => {
      const providerLabel = PROVIDER_LABELS[provider] ?? provider
      return models.map((modelName) => ({
        value: modelName,
        label: `${providerLabel} · ${modelName}`,
      }))
    })
  }, [])

  const sizeOptions = useMemo(() => {
    const base = config.aiImage.evolinkSizes
    if (model === 'z-image-turbo') {
      return base.filter((item) => item.value !== 'auto')
    }
    return base
  }, [model])

  const sampleCards = useMemo(
    () => [
      {
        ...SAMPLE_PRESETS[0],
        imageUrl: createSampleImageDataUri('T恤示例', '#2563eb'),
      },
      {
        ...SAMPLE_PRESETS[1],
        imageUrl: createSampleImageDataUri('卫衣示例', '#7c3aed'),
      },
      {
        ...SAMPLE_PRESETS[2],
        imageUrl: createSampleImageDataUri('夹克示例', '#ea580c'),
      },
    ],
    []
  )

  const canGenerate = Boolean(sourceFile) && !isUploading && !isGenerating

  useEffect(() => {
    const allowed = new Set<string>(sizeOptions.map((item) => item.value))
    if (!allowed.has(size)) {
      setSize(sizeOptions[0]?.value ?? '1:1')
    }
  }, [size, sizeOptions])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const clearImageState = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSourceFile(null)
    setPreviewUrl(null)
    setUploadedImageUrl(null)
    setResults([])
    setResultViewLabel('')
    setProgressText('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件（PNG/JPG/WebP）')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('图片不能超过 10MB')
      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setSourceFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setUploadedImageUrl(null)
    setResults([])
    setResultViewLabel('')
    setProgressText('')
  }

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    handleFileSelect(file)
  }

  const handleDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragActive(false)
    const file = event.dataTransfer.files?.[0]
    if (!file) return
    handleFileSelect(file)
  }

  const handleDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!isDragActive) {
      setIsDragActive(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragActive(false)
  }

  const handleSampleUse = async (sampleId: string) => {
    const sample = sampleCards.find((item) => item.id === sampleId)
    if (!sample) return

    try {
      const response = await fetch(sample.imageUrl)
      const blob = await response.blob()
      const file = new File([blob], `${sample.id}.png`, { type: 'image/png' })
      handleFileSelect(file)
      toast.success(`已载入示例：${sample.title}`)
    } catch {
      toast.error('示例图加载失败，请稍后重试')
    }
  }

  const handleModeChange = (value: string) => {
    const nextMode = value as GenerationMode
    setMode(nextMode)
    if (nextMode === 'single') {
      setViews([views[0] ?? 'front'])
      return
    }
    if (nextMode === 'multi' && views.length === 0) {
      setViews(['front', 'side', 'back'])
    }
  }

  const setPresetViews = (nextViews: SketchView[]) => {
    const deduped = Array.from(new Set(nextViews))
    if (deduped.length === 0) return
    setViews(deduped)
  }

  const toggleView = (view: SketchView) => {
    if (mode === 'single') {
      setViews([view])
      return
    }

    setViews((prev) => {
      const has = prev.includes(view)
      if (has) {
        if (prev.length === 1) {
          toast.info('至少保留一个视图')
          return prev
        }
        return prev.filter((item) => item !== view)
      }
      return [...prev, view]
    })
  }

  const uploadSourceImage = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data?.success || typeof data?.data?.url !== 'string') {
      throw new Error(data?.message || data?.error || '上传失败，请稍后重试')
    }

    return data.data.url as string
  }

  const generateSingleSketch = async (
    sourceUrl: string,
    requestMode: GenerationMode,
    requestViews: SketchView[]
  ) => {
    const response = await fetch('/api/clothes-original-sketch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: sourceUrl,
        model,
        size,
        mode: requestMode,
        views: requestViews,
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.message || data?.error || '生成失败，请稍后重试')
    }

    const imageUrl = data?.data?.imageUrl
    if (typeof imageUrl !== 'string' || imageUrl.length === 0) {
      throw new Error('未获取到生成结果，请重试')
    }

    return imageUrl
  }

  const handleGenerate = async () => {
    if (!sourceFile) {
      toast.error('请先上传一张参考图')
      return
    }

    if (views.length === 0) {
      toast.error('请至少选择一个视图')
      return
    }

    setIsGenerating(true)
    setProgressText('准备中...')
    setResults([])
    setResultViewLabel('')

    try {
      let sourceUrl = uploadedImageUrl
      if (!sourceUrl) {
        setIsUploading(true)
        sourceUrl = await uploadSourceImage(sourceFile)
        setUploadedImageUrl(sourceUrl)
        toast.success('参考图上传成功')
      }

      const requestViews =
        mode === 'single'
          ? ([views[0] ?? 'front'] as SketchView[])
          : views

      const imageUrl = await generateSingleSketch(sourceUrl, mode, requestViews)
      const label =
        mode === 'single'
          ? VIEW_LABEL_MAP[requestViews[0]]
          : requestViews.map((item) => VIEW_LABEL_MAP[item]).join(' + ')

      setResults([imageUrl])
      setResultViewLabel(label)
      setProgressText('完成：已生成 1 张线稿')
      toast.success('线稿生成完成')
    } catch (error) {
      console.error('Generate sketch failed:', error)
      const message = error instanceof Error ? error.message : '生成失败'
      toast.error(message)
      setProgressText('生成失败，请重试')
    } finally {
      setIsUploading(false)
      setIsGenerating(false)
    }
  }

  const panelClass =
    'border-border/60 bg-card/40 shadow-[0_30px_80px_-60px_hsl(var(--primary)/0.25)] backdrop-blur-xl'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <FeaturePageShell
        title="使用 AI 生成服装线稿"
        description="上传图片后可选单视图或多视图，并设置视图与尺寸。"
        badge={{ icon: <Sparkles className="size-3.5" />, label: 'Line Sketch Views' }}
        className="max-w-6xl"
        badgeClassName="border-border/60 bg-background/70 text-muted-foreground"
      >
        <div className="space-y-8">
          <FeatureCard className={panelClass}>
            <CardContent className="pt-8">
              <div className="mx-auto max-w-4xl space-y-6">
                {!previewUrl ? (
                  <>
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`rounded-3xl border border-dashed p-10 text-center transition-colors ${
                        isDragActive
                          ? 'border-primary/60 bg-primary/5'
                          : 'border-border/70 bg-muted/20 hover:border-foreground/30'
                      }`}
                    >
                      <div className="mx-auto mb-4 inline-flex rounded-full border border-border/70 bg-background/70 p-4">
                        <Upload className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <p className="text-lg font-medium text-foreground">上传图片</p>
                      <p className="mt-1 text-sm text-muted-foreground">或将照片拖放到此处</p>
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-5 h-10 rounded-full px-6 text-sm"
                      >
                        选择图片
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <p className="text-center text-sm text-muted-foreground">没有照片？试试这些示例</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {sampleCards.map((sample) => (
                          <button
                            key={sample.id}
                            type="button"
                            onClick={() => handleSampleUse(sample.id)}
                            className="group overflow-hidden rounded-2xl border border-border/60 bg-background/70 text-left"
                          >
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <img
                                src={sample.imageUrl}
                                alt={sample.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                              />
                            </div>
                            <div className="px-3 py-2 text-xs text-foreground/80">{sample.title}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-5">
                    <div className="overflow-hidden rounded-3xl border border-border/60 bg-background/70">
                      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr]">
                        <div className="relative border-b border-border/60 bg-muted/20 lg:border-b-0 lg:border-r">
                          <div className="relative h-[320px] sm:h-[380px] lg:h-[440px]">
                            <img src={previewUrl} alt="参考图" className="h-full w-full object-contain p-4" />
                          </div>
                          <button
                            type="button"
                            onClick={clearImageState}
                            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/85 text-muted-foreground hover:text-foreground"
                            aria-label="清除上传"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-4 p-5">
                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground">生成模式</div>
                            <div className="grid grid-cols-2 gap-2">
                              {MODE_BUTTONS.map((item) => {
                                const active = mode === item.value
                                return (
                                  <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => handleModeChange(item.value)}
                                    className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                                      active
                                        ? 'border-primary/45 bg-primary/10 text-primary'
                                        : 'border-border/60 bg-background/70 text-foreground/85 hover:bg-muted/40'
                                    }`}
                                  >
                                    <div className="text-xs font-medium">{item.title}</div>
                                    <div className="mt-0.5 text-[10px] opacity-80">{item.description}</div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {mode === 'single' ? (
                            <div className="space-y-1.5 rounded-xl border border-border/60 bg-background/60 p-3">
                              <div className="text-xs text-muted-foreground">单视图 · 视图选项（单选）</div>
                              <div className="flex flex-wrap gap-2">
                                {VIEW_OPTIONS.map((item) => {
                                  const active = views.includes(item.value)
                                  return (
                                    <button
                                      key={item.value}
                                      type="button"
                                      onClick={() => toggleView(item.value)}
                                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                                        active
                                          ? 'border-primary/45 bg-primary/10 text-primary'
                                          : 'border-border/60 bg-background/70 text-foreground/80 hover:bg-muted/40'
                                      }`}
                                    >
                                      {item.label}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2 rounded-xl border border-border/60 bg-background/60 p-3">
                              <div className="text-xs text-muted-foreground">多视图 · 视图选项（可多选）</div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPresetViews(['front', 'back'])}
                                  className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs text-foreground/80 hover:bg-muted/40"
                                >
                                  正背双视图
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPresetViews(['front', 'side', 'back'])}
                                  className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs text-foreground/80 hover:bg-muted/40"
                                >
                                  全视图
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {VIEW_OPTIONS.map((item) => {
                                  const active = views.includes(item.value)
                                  return (
                                    <button
                                      key={item.value}
                                      type="button"
                                      onClick={() => toggleView(item.value)}
                                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                                        active
                                          ? 'border-primary/45 bg-primary/10 text-primary'
                                          : 'border-border/60 bg-background/70 text-foreground/80 hover:bg-muted/40'
                                      }`}
                                    >
                                      {item.label}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <div className="text-xs text-muted-foreground">模型</div>
                            <Select value={model} onValueChange={setModel}>
                              <SelectTrigger className="h-9 rounded-full border-border/60 bg-background/70 text-xs">
                                <SelectValue placeholder="选择模型" />
                              </SelectTrigger>
                              <SelectContent className="border-border/60 bg-background text-foreground">
                                {modelOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <div className="text-xs text-muted-foreground">生成尺寸</div>
                            <Select value={size} onValueChange={setSize}>
                              <SelectTrigger className="h-9 rounded-full border-border/60 bg-background/70 text-xs">
                                <SelectValue placeholder="尺寸" />
                              </SelectTrigger>
                              <SelectContent className="border-border/60 bg-background text-foreground">
                                {sizeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 pt-1">
                            <Button
                              type="button"
                              onClick={handleGenerate}
                              disabled={!canGenerate}
                              className="h-10 w-full rounded-full text-sm font-medium text-background disabled:opacity-50"
                            >
                              {isGenerating ? '生成中...' : '生成线稿'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="h-9 w-full rounded-full border-border/50 bg-background/60 text-xs"
                            >
                              更换图片
                            </Button>
                          </div>

                          {(isUploading || progressText) && (
                            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
                              {isUploading ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  正在上传参考图...
                                </span>
                              ) : (
                                progressText
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  id="line-sketch-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <p className="text-center text-xs text-muted-foreground">
                  上传图片即表示您同意我们的服务条款和隐私政策。
                </p>
              </div>
            </CardContent>
          </FeatureCard>

          {(isGenerating || results.length > 0) && (
            <FeatureCard className={panelClass}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">生成结果</h3>
                    <p className="text-xs text-muted-foreground">已生成单张结果，可直接下载。</p>
                  </div>
                </div>

                {results.length === 0 ? (
                  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-border/60 bg-muted/20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-3 text-sm text-foreground">正在生成线稿，请稍候...</p>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-border/60 bg-[radial-gradient(120%_120%_at_10%_10%,hsl(var(--primary)/0.08),hsl(var(--background)))] p-5 text-foreground shadow-[0_30px_80px_-60px_hsl(var(--primary)/0.25)]">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                      <div className="rounded-3xl border border-border/60 bg-background/70 p-4 shadow-sm">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground">
                          原始
                        </div>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
                          {previewUrl ? (
                            <img src={previewUrl} alt="参考图" className="h-full w-full object-contain" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                              未选择参考图
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="hidden lg:flex">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground shadow-sm">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="rounded-3xl border border-border/60 bg-background/70 p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            已编辑 · {resultViewLabel || '线稿'}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => downloadImage(results[0], 'line-sketch-view.png')}
                            className="h-8 rounded-full border-border/60 bg-background/70 text-xs"
                          >
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            下载结果
                          </Button>
                        </div>

                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
                          <img
                            src={results[0]}
                            alt={resultViewLabel || '线稿'}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </FeatureCard>
          )}

          <FeatureCard className={panelClass}>
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">工作原理</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    使用线稿三视图功能非常简单，按这 3 步即可完成出图。
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {HOW_IT_WORKS.map((item, index) => (
                    <div key={item.title} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                      <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </FeatureCard>

          <FeatureCard className={panelClass}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">常见问题</h3>
                  <p className="mt-1 text-sm text-muted-foreground">这里整理了最常见的使用问题。</p>
                </div>

                <div className="space-y-2">
                  {FAQ_ITEMS.map((item) => (
                    <details
                      key={item.q}
                      className="group rounded-xl border border-border/60 bg-background/60 px-4 py-3"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground">
                        <span>{item.q}</span>
                        <CheckCircle2 className="h-4 w-4 text-primary/70 transition-transform group-open:rotate-90" />
                      </summary>
                      <p className="pt-2 text-xs leading-relaxed text-muted-foreground">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </CardContent>
          </FeatureCard>
        </div>
      </FeaturePageShell>
    </div>
  )
}
