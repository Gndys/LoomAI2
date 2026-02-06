'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
} from 'react'
import { CheckCircle2, Download, Loader2, Sparkles, Upload, X } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'

const DEFAULT_PROMPT = `
将输入服装图转换为工艺线稿三视图。
要求：
- 输出干净的黑色线稿，白色背景。
- 无颜色、无阴影、无纹理、无填充。
- 优先包含正面、侧面、背面视图，比例准确。
- 保留轮廓线、分割线、缝线、褶皱与关键结构细节。
- 不要文字、logo、水印、边框。
`.trim()

const MAX_FILE_SIZE = 10 * 1024 * 1024
const OUTPUT_COUNT_OPTIONS = ['1', '2', '3', '4', '5', '6']
const PROVIDER_LABELS: Record<string, string> = {
  evolink: 'Evolink',
}

const HOW_IT_WORKS = [
  {
    title: '上传你的服装图',
    description: '支持 JPG、PNG、WEBP。建议上传正面清晰、无遮挡的原图或平铺图。',
  },
  {
    title: '设置模型与输出张数',
    description: '模型选项与无限画布保持一致，可按需求输出 1~6 张线稿结果。',
  },
  {
    title: '生成并下载',
    description: '点击生成后系统自动出图，支持单张下载与一键下载全部结果。',
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
    q: '为什么我设置了 3 张却风格相似？',
    a: '同一提示词和模型下结果可能趋同。建议在提示词中加入“角度/细节差异”描述。',
  },
  {
    q: '生成失败会怎样？',
    a: '页面会保留当前上传图与参数设置，你可以直接调整模型或提示词后重试。',
  },
]

const SAMPLE_PRESETS = [
  {
    id: 'sample-1',
    title: '基础 T 恤',
    prompt: `${DEFAULT_PROMPT}\n重点表现领口、肩线和袖口结构。`,
  },
  {
    id: 'sample-2',
    title: '连帽卫衣',
    prompt: `${DEFAULT_PROMPT}\n重点表现帽型、袋口和罗纹下摆。`,
  },
  {
    id: 'sample-3',
    title: '工装夹克',
    prompt: `${DEFAULT_PROMPT}\n重点表现拼接、口袋翻盖与车线层次。`,
  },
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
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [model, setModel] = useState<string>(config.aiImage.defaultModels.evolink)
  const [outputCount, setOutputCount] = useState('3')
  const [isDragActive, setIsDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progressText, setProgressText] = useState('')
  const [results, setResults] = useState<string[]>([])

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

  const canGenerate = Boolean(sourceFile) && prompt.trim().length > 0 && !isUploading && !isGenerating

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
      setPrompt(sample.prompt)
      toast.success(`已载入示例：${sample.title}`)
    } catch {
      toast.error('示例图加载失败，请稍后重试')
    }
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

  const generateSingleSketch = async (sourceUrl: string) => {
    const response = await fetch('/api/image-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
        model,
        size: 'auto',
        image_urls: [sourceUrl],
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

    if (!prompt.trim()) {
      toast.error('提示词不能为空')
      return
    }

    const total = Number.parseInt(outputCount, 10)
    if (!Number.isFinite(total) || total < 1) {
      toast.error('输出张数设置无效')
      return
    }

    setIsGenerating(true)
    setProgressText('准备中...')
    setResults([])

    try {
      let sourceUrl = uploadedImageUrl
      if (!sourceUrl) {
        setIsUploading(true)
        sourceUrl = await uploadSourceImage(sourceFile)
        setUploadedImageUrl(sourceUrl)
        toast.success('参考图上传成功')
      }

      const nextResults: string[] = []
      for (let index = 0; index < total; index += 1) {
        setProgressText(`正在生成 ${index + 1}/${total} 张线稿...`)
        const imageUrl = await generateSingleSketch(sourceUrl)
        nextResults.push(imageUrl)
        setResults([...nextResults])
      }

      setProgressText(`完成：已生成 ${nextResults.length} 张线稿`)
      toast.success(`线稿生成完成（${nextResults.length} 张）`)
    } catch (error) {
      console.error('Generate sketch failed:', error)
      const message = error instanceof Error ? error.message : '生成失败'
      toast.error(message)
      setProgressText('生成失败，请调整参数后重试')
    } finally {
      setIsUploading(false)
      setIsGenerating(false)
    }
  }

  const handleDownloadAll = () => {
    if (results.length === 0) return
    results.forEach((url, index) => {
      downloadImage(url, `line-sketch-view-${index + 1}.png`)
    })
  }

  const panelClass =
    'border-border/60 bg-card/40 shadow-[0_30px_80px_-60px_hsl(var(--primary)/0.25)] backdrop-blur-xl'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <FeaturePageShell
        title="使用 AI 生成线稿三视图"
        description="100% 自动，支持上传原图并按你设置的张数生成工艺线稿。"
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
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="space-y-3">
                      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
                        <img src={previewUrl} alt="参考图" className="h-full w-full object-contain" />
                        <button
                          type="button"
                          onClick={clearImageState}
                          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground hover:text-foreground"
                          aria-label="清除上传"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-9 w-full rounded-full border-border/50 bg-background/60 text-xs"
                      >
                        重新上传图片
                      </Button>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-border/60 bg-background/65 p-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                          <div className="text-xs text-muted-foreground">输出张数</div>
                          <Select value={outputCount} onValueChange={setOutputCount}>
                            <SelectTrigger className="h-9 rounded-full border-border/60 bg-background/70 text-xs">
                              <SelectValue placeholder="选择输出张数" />
                            </SelectTrigger>
                            <SelectContent className="border-border/60 bg-background text-foreground">
                              {OUTPUT_COUNT_OPTIONS.map((count) => (
                                <SelectItem key={count} value={count} className="focus:bg-muted/40">
                                  {count} 张
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-xs text-muted-foreground">提示词</div>
                        <Textarea
                          value={prompt}
                          onChange={(event) => setPrompt(event.target.value)}
                          className="min-h-[180px] resize-none rounded-2xl border-border/60 bg-background/70"
                          placeholder="输入线稿生成提示词"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          type="button"
                          onClick={handleGenerate}
                          disabled={!canGenerate}
                          className="h-9 rounded-full px-5 text-xs font-medium text-background disabled:opacity-50"
                        >
                          {isGenerating ? '生成中...' : '生成线稿'}
                        </Button>
                        {isUploading && (
                          <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            正在上传参考图...
                          </div>
                        )}
                      </div>

                      {progressText && <p className="text-xs text-muted-foreground">{progressText}</p>}
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
                    <p className="text-xs text-muted-foreground">支持逐张下载，也可一键下载全部。</p>
                  </div>
                  {results.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadAll}
                      className="h-9 rounded-full border-border/50 bg-background/60 px-4 text-xs"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      下载全部
                    </Button>
                  )}
                </div>

                {results.length === 0 ? (
                  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-border/60 bg-muted/20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-3 text-sm text-foreground">正在生成线稿，请稍候...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {results.map((url, index) => (
                      <div key={`${url}-${index}`} className="rounded-2xl border border-border/60 bg-background/60 p-3">
                        <div className="mb-2 text-xs text-muted-foreground">线稿 #{index + 1}</div>
                        <div className="relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                          <img src={url} alt={`线稿 ${index + 1}`} className="h-full w-full object-contain" />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => downloadImage(url, `line-sketch-view-${index + 1}.png`)}
                          className="mt-3 h-8 w-full rounded-full border-border/50 bg-background/60 text-xs"
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5" />
                          下载此图
                        </Button>
                      </div>
                    ))}
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
