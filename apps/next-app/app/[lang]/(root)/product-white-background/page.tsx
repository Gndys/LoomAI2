'use client'

// TODO: i18n

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
} from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  ImagePlus,
  Loader2,
  WandSparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { FeaturePageShell } from '@/components/feature-page-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { config } from '@config'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_BATCH = 30

type ItemStatus = 'ready' | 'processing' | 'done' | 'failed'
type NamingMode = 'origin-suffix' | 'prefix-index' | 'date-index'
type QualityLevel = 'pass' | 'review' | 'failed'
type FilterValue = 'all' | 'pass' | 'review' | 'failed'

type UploadItem = {
  id: string
  file: File
  fileName: string
  fileSize: number
  previewUrl: string
  status: ItemStatus
  quality?: QualityLevel
  error?: string
  generatedUrl?: string
  uploadedUrl?: string
  model?: string
  size?: string
}

type SampleItem = {
  label: string
  seed: string
}

type ShowcaseItem = {
  title: string
  description: string
  seed: string
}

const CATEGORY_OPTIONS = [
  { value: 'top', label: '上衣' },
  { value: 'pants', label: '裤装' },
  { value: 'dress', label: '裙装' },
  { value: 'outerwear', label: '外套' },
  { value: 'shoes-bag', label: '鞋包' },
  { value: 'accessory', label: '配饰' },
]

const SHADOW_OPTIONS = [
  { value: 'none', label: '无阴影' },
  { value: 'soft', label: '软阴影（推荐）' },
  { value: 'standard', label: '标准阴影' },
]

const PADDING_OPTIONS = [
  { value: '5', label: '5%' },
  { value: '8', label: '8%（推荐）' },
  { value: '10', label: '10%' },
]

const SIZE_PRESETS = [
  { value: 'taobao-1-1-800', label: '淘宝 1:1 · 800x800' },
  { value: 'douyin-1-1-1000', label: '抖店 1:1 · 1000x1000' },
  { value: 'pdd-1-1-1000', label: '拼多多 1:1 · 1000x1000' },
  { value: '1688-1-1-1500', label: '1688 1:1 · 1500x1500' },
]

const MODEL_PROVIDER_LABELS: Record<string, string> = {
  evolink: 'EvoLink',
}

const QUALITY_LABELS: Record<QualityLevel, string> = {
  pass: '通过',
  review: '建议复检',
  failed: '失败',
}

const FILTER_OPTIONS: Array<{ value: FilterValue; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'pass', label: '已通过' },
  { value: 'review', label: '建议复检' },
  { value: 'failed', label: '失败' },
]

const STEP_ITEMS = [
  {
    title: '上传商品图',
    description: '支持 JPG/PNG/WEBP，批量上传更省时。',
  },
  {
    title: 'AI 自动生成',
    description: '按推荐参数快速生成白底图，可复检再生成。',
  },
  {
    title: '预览与导出',
    description: '先筛通过的图片，再批量导出上架。',
  },
]

const FAQ_ITEMS = [
  {
    question: '支持哪些图片格式？',
    answer: '支持 JPG、PNG、WEBP，单张不超过 10MB。',
  },
  {
    question: '生成需要多久？',
    answer: '一般 10-30 秒即可完成，批量任务会依次处理。',
  },
  {
    question: '可以先导出已通过的吗？',
    answer: '可以，打开“仅导出已通过”开关即可。',
  },
  {
    question: '生成失败怎么办？',
    answer: '失败项可单独重试，不影响已完成图片。',
  },
]

const SHOWCASE_BASE = [
  {
    title: '服装上新更高效',
    description: '快速把商品图转成上架可用的白底主图。',
  },
  {
    title: '主图一致性更稳',
    description: '统一比例与留白，保持店铺视觉整洁。',
  },
  {
    title: '批量出图更省人力',
    description: '不用反复修图，直接批量导出。',
  },
  {
    title: '细节保真更放心',
    description: '保留材质与色彩层次，质检更容易通过。',
  },
]

const SAMPLE_LABELS = ['女装上新', '男装基础款', '裙装上架', '配饰单品']

const CATEGORY_PROMPT_LABELS: Record<string, string> = {
  top: 'tops',
  pants: 'pants',
  dress: 'dress',
  outerwear: 'outerwear',
  'shoes-bag': 'shoes or bags',
  accessory: 'accessories',
}

const SHADOW_PROMPT_LABELS: Record<string, string> = {
  none: 'no shadow',
  soft: 'soft natural shadow',
  standard: 'standard studio shadow',
}

const SIZE_PRESET_IMAGE_SIZE: Record<string, string> = {
  'taobao-1-1-800': '1:1',
  'douyin-1-1-1000': '1:1',
  'pdd-1-1-1000': '1:1',
  '1688-1-1-1500': '1:1',
}

type RequestError = {
  message: string
  status?: number
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function sanitizeSegment(text: string) {
  return text
    .trim()
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9-_\u4e00-\u9fa5]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function getDateStamp() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}${mm}${dd}`
}

function buildDownloadName(fileName: string, mode: NamingMode, prefix: string, index: number) {
  const originName = sanitizeSegment(fileName)
  const safePrefix = sanitizeSegment(prefix)
  const seq = String(index + 1).padStart(3, '0')

  if (mode === 'origin-suffix') {
    return `${originName || 'product'}_白底`
  }

  if (mode === 'prefix-index') {
    return `${safePrefix || '白底图'}_${seq}`
  }

  return `${safePrefix || '白底图'}_${getDateStamp()}_${seq}`
}

function getQualityBadgeClass(level?: QualityLevel) {
  if (level === 'pass') return 'bg-emerald-500/10 text-emerald-600'
  if (level === 'review') return 'bg-amber-500/10 text-amber-700'
  if (level === 'failed') return 'bg-destructive/10 text-destructive'
  return 'bg-muted text-muted-foreground'
}

function buildPicsumUrl(seed: string, width: number, height: number) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}

function toRequestError(error: unknown): RequestError {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = String((error as { message?: unknown }).message ?? '请求失败')
    const status = 'status' in error ? Number((error as { status?: unknown }).status) : undefined
    return { message, status }
  }

  if (error instanceof Error) {
    return { message: error.message }
  }

  return { message: '请求失败' }
}

function createRequestError(message: string, status?: number) {
  return { message, status }
}

function resolveSizeFromPreset(value: string) {
  return SIZE_PRESET_IMAGE_SIZE[value] ?? 'auto'
}

function mapSettingLabel(options: Array<{ value: string; label: string }>, value: string) {
  return options.find((option) => option.value === value)?.label ?? value
}

function buildWhiteBackgroundPrompt(params: {
  category: string
  shadow: string
  padding: string
  protectColor: boolean
}) {
  const categoryLabel =
    CATEGORY_PROMPT_LABELS[params.category] ?? mapSettingLabel(CATEGORY_OPTIONS, params.category)
  const shadowLabel =
    SHADOW_PROMPT_LABELS[params.shadow] ?? mapSettingLabel(SHADOW_OPTIONS, params.shadow)
  const paddingValue = `${params.padding}%`
  const colorNote = params.protectColor
    ? 'Preserve original colors, textures, and materials.'
    : 'Allow subtle color normalization for a clean white background.'

  return [
    'Create a clean ecommerce product image on a pure white (#FFFFFF) background.',
    `Category: ${categoryLabel}.`,
    'Keep the product details, shape, and proportions identical to the reference image.',
    `Shadow style: ${shadowLabel}.`,
    `Leave about ${paddingValue} whitespace around the product, centered composition.`,
    colorNote,
    'No text, no watermark, no extra props, no model or hands.',
  ].join(' ')
}

async function uploadReferenceImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload?.success || typeof payload?.data?.url !== 'string') {
    const message = payload?.message || payload?.error || '上传失败'
    throw createRequestError(message, response.status)
  }

  return payload.data.url as string
}

async function generateWhiteBackgroundImage(payload: {
  prompt: string
  model: string
  size: string
  imageUrl: string
}) {
  const response = await fetch('/api/image-generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: payload.prompt,
      model: payload.model,
      size: payload.size,
      image_urls: [payload.imageUrl],
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data?.message || data?.error || '生成失败'
    throw createRequestError(message, response.status)
  }

  const imageUrl = data?.data?.imageUrl
  if (!imageUrl || typeof imageUrl !== 'string') {
    throw createRequestError('生成成功但未返回图片地址', response.status)
  }

  return imageUrl
}

async function downloadImage(url: string, filename: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('下载失败')
    }
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    link.click()
    URL.revokeObjectURL(blobUrl)
  } catch {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.click()
  }
}

export default function ProductWhiteBackgroundPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const itemsRef = useRef<UploadItem[]>([])
  const timeoutRef = useRef<number[]>([])
  const uploadSectionRef = useRef<HTMLDivElement | null>(null)

  const params = useParams()
  const currentLocale = typeof params?.lang === 'string' ? params.lang : 'zh-CN'

  const [items, setItems] = useState<UploadItem[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]?.value ?? 'top')
  const [shadow, setShadow] = useState(SHADOW_OPTIONS[1]?.value ?? 'soft')
  const [padding, setPadding] = useState(PADDING_OPTIONS[1]?.value ?? '8')
  const [sizePreset, setSizePreset] = useState(SIZE_PRESETS[1]?.value ?? 'douyin-1-1-1000')
  const imageProviderModels = config.aiImage.availableModels
  const defaultImageProvider = config.aiImage.defaultProvider
  const defaultImageModel =
    config.aiImage.defaultModels[defaultImageProvider] ?? imageProviderModels[defaultImageProvider]?.[0] ?? ''
  const [imageModel, setImageModel] = useState<string>(defaultImageModel)
  const [protectColor, setProtectColor] = useState(true)
  const [namingMode, setNamingMode] = useState<NamingMode>('origin-suffix')
  const [filePrefix, setFilePrefix] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all')
  const [exportOnlyPass, setExportOnlyPass] = useState(true)
  const [resultView, setResultView] = useState<1 | 2 | 3>(2)
  const [compareItem, setCompareItem] = useState<UploadItem | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl)
      })
      timeoutRef.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const hasUploads = items.length > 0
  const activeItem = items[0]

  const processedItems = useMemo(
    () => items.filter((item) => item.status !== 'ready' && item.status !== 'processing'),
    [items]
  )

  const generatedItems = useMemo(
    () => items.filter((item) => item.status === 'done' && item.generatedUrl),
    [items]
  )

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return processedItems
    return processedItems.filter((item) => item.quality === activeFilter)
  }, [processedItems, activeFilter])

  const counts = useMemo(() => {
    return {
      uploaded: items.length,
      generated: generatedItems.length,
      pass: processedItems.filter((item) => item.quality === 'pass').length,
      review: processedItems.filter((item) => item.quality === 'review').length,
      failed: processedItems.filter((item) => item.quality === 'failed').length,
    }
  }, [items.length, generatedItems.length, processedItems])

  const sampleSeeds = useMemo(
    () => Array.from({ length: SAMPLE_LABELS.length }, () => Math.random().toString(36).slice(2, 8)),
    []
  )

  const sampleItems = useMemo<SampleItem[]>(
    () => SAMPLE_LABELS.map((label, index) => ({ label, seed: sampleSeeds[index] })),
    [sampleSeeds]
  )

  const showcaseSeeds = useMemo(
    () => Array.from({ length: SHOWCASE_BASE.length }, () => Math.random().toString(36).slice(2, 8)),
    []
  )

  const showcaseItems = useMemo<ShowcaseItem[]>(
    () =>
      SHOWCASE_BASE.map((item, index) => ({
        ...item,
        seed: showcaseSeeds[index],
      })),
    [showcaseSeeds]
  )

  const imageModelOptions = useMemo(() => {
    const providers = Object.entries(imageProviderModels) as Array<[string, readonly string[]]>
    return providers.flatMap(([provider, models]) => {
      const providerLabel = MODEL_PROVIDER_LABELS[provider] ?? provider
      return models.map((model) => ({
        value: model,
        label: `${providerLabel} · ${model}`,
      }))
    })
  }, [imageProviderModels])

  const canGenerate = items.length > 0 && !isGenerating

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return

    const currentCount = items.length
    const rawFiles = Array.from(fileList)

    if (currentCount >= MAX_BATCH) {
      toast.error(`单次最多支持 ${MAX_BATCH} 张，请先导出或清空后再试`)
      return
    }

    const acceptedFiles = rawFiles.slice(0, Math.max(MAX_BATCH - currentCount, 0))
    const validFiles: UploadItem[] = []

    acceptedFiles.forEach((file, index) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} 不是图片文件`)
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} 超过 10MB，请压缩后重试`)
        return
      }

      validFiles.push({
        id: `${Date.now()}-${index}-${file.name}`,
        file,
        fileName: file.name,
        fileSize: file.size,
        previewUrl: URL.createObjectURL(file),
        status: 'ready',
      })
    })

    if (validFiles.length > 0) {
      setItems((prev) => [...prev, ...validFiles])
      if (!isEditorOpen) {
        setIsEditorOpen(true)
      }
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragActive(false)
    addFiles(event.dataTransfer.files)
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

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return prev.filter((item) => item.id !== id)
    })
  }

  const clearAll = () => {
    setItems((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      return []
    })
    setIsEditorOpen(false)
    setCompareItem(null)
  }

  const handleSampleUse = async (seed: string, label: string) => {
    const url = buildPicsumUrl(seed, 720, 900)
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch sample image')
      }
      const blob = await response.blob()
      const file = new File([blob], `${label}-${seed}.jpg`, { type: blob.type || 'image/jpeg' })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      addFiles(dataTransfer.files)
      toast.success(`已加载示例：${label}`)
    } catch (error) {
      console.error('Failed to load sample image', error)
      toast.error('示例图加载失败，请稍后再试')
    }
  }

  const updateItem = (id: string, updater: (item: UploadItem) => UploadItem) => {
    setItems((prev) => prev.map((item) => (item.id === id ? updater(item) : item)))
  }

  const generateWhiteBackgrounds = async () => {
    if (!canGenerate) return

    const queue = itemsRef.current.filter((item) => item.status === 'ready' || item.status === 'failed')
    if (queue.length === 0) {
      toast.error('当前没有待生成的图片')
      return
    }

    setIsGenerating(true)
    let successCount = 0
    let failedCount = 0
    let shouldStop = false

    for (const item of queue) {
      if (shouldStop) break

      const sizeValue = resolveSizeFromPreset(sizePreset)
      const prompt = buildWhiteBackgroundPrompt({
        category,
        shadow,
        padding,
        protectColor,
      })

      updateItem(item.id, (current) => ({
        ...current,
        status: 'processing',
        quality: undefined,
        error: undefined,
        model: imageModel,
        size: sizeValue,
      }))

      try {
        const uploadedUrl = item.uploadedUrl ?? (await uploadReferenceImage(item.file))
        updateItem(item.id, (current) => ({
          ...current,
          uploadedUrl,
        }))

        const generatedUrl = await generateWhiteBackgroundImage({
          prompt,
          model: imageModel,
          size: sizeValue,
          imageUrl: uploadedUrl,
        })

        updateItem(item.id, (current) => ({
          ...current,
          status: 'done',
          quality: 'pass',
          error: undefined,
          generatedUrl,
          model: imageModel,
          size: sizeValue,
        }))

        successCount += 1
      } catch (error) {
        const parsedError = toRequestError(error)
        const errorMessage = parsedError.message || '生成失败'

        updateItem(item.id, (current) => ({
          ...current,
          status: 'failed',
          quality: 'failed',
          error: errorMessage,
          model: imageModel,
          size: sizeValue,
        }))

        failedCount += 1

        if (parsedError.status === 401) {
          toast.error('请先登录后再生成')
          shouldStop = true
        } else if (parsedError.status === 402) {
          toast.error('积分不足，已暂停后续生成')
          shouldStop = true
        }
      }
    }

    setIsGenerating(false)

    if (successCount === 0 && failedCount > 0) {
      toast.error('本轮生成失败，请检查设置或积分后重试')
      return
    }

    if (failedCount > 0) {
      toast.warning(`生成完成：成功 ${successCount} 张，失败 ${failedCount} 张，可重试失败项`)
      return
    }

    toast.success(`已完成 ${successCount} 张白底图生成`)
  }

  const retryItem = async (id: string) => {
    const target = itemsRef.current.find((item) => item.id === id)
    if (!target || isGenerating) return

    const sizeValue = resolveSizeFromPreset(sizePreset)
    const prompt = buildWhiteBackgroundPrompt({
      category,
      shadow,
      padding,
      protectColor,
    })

    updateItem(id, (current) => ({
      ...current,
      status: 'processing',
      quality: undefined,
      error: undefined,
      model: imageModel,
      size: sizeValue,
    }))

    try {
      const uploadedUrl = target.uploadedUrl ?? (await uploadReferenceImage(target.file))
      updateItem(id, (current) => ({
        ...current,
        uploadedUrl,
      }))

      const generatedUrl = await generateWhiteBackgroundImage({
        prompt,
        model: imageModel,
        size: sizeValue,
        imageUrl: uploadedUrl,
      })

      updateItem(id, (current) => ({
        ...current,
        status: 'done',
        quality: 'pass',
        error: undefined,
        generatedUrl,
        model: imageModel,
        size: sizeValue,
      }))

      toast.success(`${target.fileName} 已重新生成`)
    } catch (error) {
      const parsedError = toRequestError(error)
      const message = parsedError.message || '生成失败'
      updateItem(id, (current) => ({
        ...current,
        status: 'failed',
        quality: 'failed',
        error: message,
        model: imageModel,
        size: sizeValue,
      }))

      if (parsedError.status === 401) {
        toast.error('请先登录后再重试')
      } else if (parsedError.status === 402) {
        toast.error('积分不足，请充值后重试')
      } else {
        toast.error(message)
      }
    }
  }

  const downloadSingle = async (item: UploadItem, index: number) => {
    if (!item.generatedUrl) {
      toast.error('当前图片尚未生成完成')
      return
    }

    const filename = `${buildDownloadName(item.fileName, namingMode, filePrefix, index)}.png`
    await downloadImage(item.generatedUrl, filename)
  }

  const exportGenerated = async () => {
    const candidates = generatedItems.filter((item) =>
      exportOnlyPass ? item.quality === 'pass' : true
    )

    if (candidates.length === 0) {
      toast.error('当前没有可导出的图片')
      return
    }

    for (const [index, item] of candidates.entries()) {
      if (!item.generatedUrl) continue
      const filename = `${buildDownloadName(item.fileName, namingMode, filePrefix, index)}.png`
      await downloadImage(item.generatedUrl, filename)
    }

    toast.success(`已触发 ${candidates.length} 张图片下载`)
  }

  const qualityTip = useMemo(() => {
    if (counts.failed > 0) return '检测到失败项，建议重试后再导出。'
    if (counts.review > 0) return '部分图片建议复检，确认后再导出。'
    if (processedItems.length > 0) return '质量检测通过，可直接导出。'
    return '上传后将展示质量检测建议。'
  }, [counts.failed, counts.review, processedItems.length])

  if (isEditorOpen) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur">
          <div className="container flex flex-wrap items-center justify-between gap-3 py-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => {
                setIsEditorOpen(false)
                setCompareItem(null)
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </button>
            <div className="text-sm font-semibold text-foreground">白底产品图编辑器</div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>已上传 {counts.uploaded}</span>
              <span>已生成 {counts.generated}</span>
            </div>
          </div>
        </div>

        <div className="container py-6">
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-3xl bg-muted/10 p-5">
              <div className="space-y-8">
                <section className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">生成设置</h3>
                    <p className="mt-1 text-sm text-muted-foreground">调整白底参数后直接生成。</p>
                  </div>
                  <div className="grid gap-3">
                    <div className="space-y-2">
                      <Label>商品类目</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择类目" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>阴影</Label>
                      <Select value={shadow} onValueChange={setShadow}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择阴影" />
                        </SelectTrigger>
                        <SelectContent>
                          {SHADOW_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>留白</Label>
                      <Select value={padding} onValueChange={setPadding}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择留白" />
                        </SelectTrigger>
                        <SelectContent>
                          {PADDING_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>尺寸</Label>
                      <Select value={sizePreset} onValueChange={setSizePreset}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择尺寸" />
                        </SelectTrigger>
                        <SelectContent>
                          {SIZE_PRESETS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>模型</Label>
                      <Select value={imageModel} onValueChange={setImageModel} disabled={isGenerating}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择模型" />
                        </SelectTrigger>
                        <SelectContent>
                          {imageModelOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between rounded-full bg-background/60 px-3 py-2">
                      <p className="text-sm">色彩保护</p>
                      <Switch checked={protectColor} onCheckedChange={setProtectColor} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button onClick={generateWhiteBackgrounds} disabled={!canGenerate}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          正在生成...
                        </>
                      ) : (
                        <>
                          <WandSparkles className="mr-2 h-4 w-4" />
                          开始生成
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <ImagePlus className="mr-2 h-4 w-4" />
                      继续上传
                    </Button>
                    <Button variant="ghost" onClick={clearAll}>
                      清空上传
                    </Button>
                  </div>
                </section>

                <div className="h-px bg-muted/40" />

                <section className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">导出设置</h3>
                    <p className="mt-1 text-sm text-muted-foreground">命名规则与导出控制。</p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>命名规则</Label>
                      <Select value={namingMode} onValueChange={(value) => setNamingMode(value as NamingMode)}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择命名方式" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="origin-suffix">原文件名_白底（推荐）</SelectItem>
                          <SelectItem value="prefix-index">自定义前缀_序号</SelectItem>
                          <SelectItem value="date-index">前缀_日期_序号</SelectItem>
                        </SelectContent>
                      </Select>

                      {namingMode !== 'origin-suffix' && (
                        <Input
                          value={filePrefix}
                          onChange={(event) => setFilePrefix(event.target.value)}
                          placeholder="输入文件前缀，例如：SKU2026"
                        />
                      )}
                      <p className="text-[11px] text-muted-foreground">导出时自动编号，无需手动填写规则。</p>
                    </div>

                    <div className="flex items-center justify-between rounded-full bg-background/60 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">仅导出已通过</p>
                        <p className="text-xs text-muted-foreground">建议先筛出可上架图</p>
                      </div>
                      <Switch checked={exportOnlyPass} onCheckedChange={setExportOnlyPass} />
                    </div>

                    <Button variant="outline" onClick={exportGenerated}>
                      <Download className="mr-2 h-4 w-4" />
                      批量导出
                    </Button>
                  </div>
                </section>
              </div>
            </aside>

            <div className="space-y-6">
              <div className="rounded-3xl bg-neutral-900/80 p-6">
                <div
                  className="relative h-[420px] overflow-hidden rounded-2xl"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5" />
                  <div className="relative z-10 flex h-full items-center justify-center">
                    {activeItem ? (
                      <img
                        src={activeItem.generatedUrl ?? activeItem.previewUrl}
                        alt={activeItem.fileName}
                        className="max-h-[360px] w-auto rounded-2xl bg-white p-4 shadow-xl"
                      />
                    ) : (
                      <div className="text-sm text-white/70">上传图片后开始编辑</div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-white/70">
                  <span>{activeItem ? activeItem.fileName : '未选择图片'}</span>
                  <span>{activeItem ? formatBytes(activeItem.fileSize) : ''}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    {FILTER_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant={activeFilter === option.value ? 'default' : 'ghost'}
                        onClick={() => setActiveFilter(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/70 p-1">
                      <Button
                        size="sm"
                        variant={resultView === 1 ? 'default' : 'ghost'}
                        className="h-7 rounded-full px-2 text-[11px]"
                        onClick={() => setResultView(1)}
                      >
                        1列
                      </Button>
                      <Button
                        size="sm"
                        variant={resultView === 2 ? 'default' : 'ghost'}
                        className="h-7 rounded-full px-2 text-[11px]"
                        onClick={() => setResultView(2)}
                      >
                        2列
                      </Button>
                      <Button
                        size="sm"
                        variant={resultView === 3 ? 'default' : 'ghost'}
                        className="h-7 rounded-full px-2 text-[11px]"
                        onClick={() => setResultView(3)}
                      >
                        3列
                      </Button>
                    </div>
                    <span>已上传 {counts.uploaded}</span>
                    <span>已生成 {counts.generated}</span>
                  </div>
                </div>

                {processedItems.length === 0 ? (
                  <div className="rounded-2xl bg-muted/10 p-8 text-center text-sm text-muted-foreground">
                    {isGenerating ? '正在生成中，预计还需 30 秒。' : '点击“开始生成”后将在这里展示结果。'}
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="rounded-2xl bg-muted/10 p-8 text-center text-sm text-muted-foreground">
                    当前筛选条件下没有结果。
                  </div>
                ) : (
                  <div
                    className={cn(
                      'grid gap-6',
                      resultView === 1 && 'grid-cols-1',
                      resultView === 2 && 'sm:grid-cols-2',
                      resultView === 3 && 'sm:grid-cols-2 lg:grid-cols-3'
                    )}
                  >
                    {filteredItems.map((item, index) => (
                      <div key={item.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-xs font-medium text-muted-foreground">{item.fileName}</p>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
                              getQualityBadgeClass(item.quality)
                            )}
                          >
                            {item.quality ? QUALITY_LABELS[item.quality] : '待处理'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="overflow-hidden rounded-xl bg-background/80">
                            <img
                              src={item.previewUrl}
                              alt={`${item.fileName} 原图`}
                              className="h-32 w-full object-cover"
                            />
                            <p className="px-2 py-1 text-center text-xs text-muted-foreground">原图</p>
                          </div>
                          <div className="overflow-hidden rounded-xl bg-white">
                            <div className="flex h-32 w-full items-center justify-center bg-white/80 p-2">
                              <img
                                src={item.generatedUrl ?? item.previewUrl}
                                alt={`${item.fileName} 白底图`}
                                className={cn(
                                  'max-h-full w-full object-contain',
                                  shadow === 'none'
                                    ? ''
                                    : shadow === 'soft'
                                      ? 'drop-shadow-sm'
                                      : 'drop-shadow-md'
                                )}
                              />
                            </div>
                            <p className="px-2 py-1 text-center text-xs text-muted-foreground">白底图</p>
                          </div>
                        </div>

                        {item.status === 'failed' && item.error && (
                          <div className="flex items-start gap-2 rounded-xl bg-destructive/5 px-3 py-2 text-xs text-destructive">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5" />
                            <span>{item.error}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setCompareItem(item)}>
                            对比查看
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => retryItem(item.id)}
                            disabled={item.status === 'processing'}
                          >
                            再生成
                          </Button>
                          <Button size="sm" onClick={() => downloadSingle(item, index)} disabled={item.status !== 'done'}>
                            <Download className="mr-1.5 h-4 w-4" />
                            下载
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">质量检查</div>
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  {['边缘质量', '背景纯度', '尺寸合规'].map((label) => (
                    <div key={label} className="flex items-center justify-between rounded-xl bg-muted/10 px-3 py-2">
                      <span className="text-foreground">{label}</span>
                      <span className="text-muted-foreground">检测中</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-muted/10 px-3 py-2 text-sm text-muted-foreground">
                  {qualityTip}
                </div>
              </section>
            </div>
          </div>
        </div>

        <Dialog open={!!compareItem} onOpenChange={(open) => !open && setCompareItem(null)}>
          {compareItem && (
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>原图 vs 白底图</DialogTitle>
                <DialogDescription>{compareItem.fileName}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="overflow-hidden rounded-lg bg-muted/20">
                  <img src={compareItem.previewUrl} alt="原图" className="h-60 w-full object-cover" />
                  <p className="px-2 py-1 text-center text-xs text-muted-foreground">原图</p>
                </div>
                <div className="overflow-hidden rounded-lg bg-white">
                  <div className="flex h-60 w-full items-center justify-center bg-white p-2">
                    <img
                      src={compareItem.generatedUrl ?? compareItem.previewUrl}
                      alt="白底图"
                      className={cn(
                        'max-h-full w-full object-contain',
                        shadow === 'none' ? '' : shadow === 'soft' ? 'drop-shadow-sm' : 'drop-shadow-md'
                      )}
                    />
                  </div>
                  <p className="px-2 py-1 text-center text-xs text-muted-foreground">白底图</p>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    )
  }

  return (
    <FeaturePageShell
      title="5分钟批量生成可上架白底产品图"
      description="专为服装电商优化，支持平台尺寸与批量导出。"
      badge={null}
      headerAlign="center"
      titleClassName="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.1]"
      descriptionClassName="text-sm md:text-base text-muted-foreground leading-relaxed"
      className="max-w-6xl"
    >
      <div className="space-y-24">
        <section className="flex flex-col items-center gap-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              新用户首周免费 30 张
            </Badge>
            <Badge variant="secondary" className="bg-muted/40 text-muted-foreground">
              服装电商白底标准化
            </Badge>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>30 秒理解价值</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>3 步完成首图</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>支持批量导出</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="rounded-full px-8" onClick={() => scrollTo(uploadSectionRef)}>
              立即上传商品图
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" onClick={() => scrollTo(uploadSectionRef)}>
              试试示例图
            </Button>
            {hasUploads && (
              <Button size="lg" variant="ghost" className="rounded-full px-6" onClick={() => setIsEditorOpen(true)}>
                进入编辑器
              </Button>
            )}
          </div>
        </section>

        <section ref={uploadSectionRef} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">上传商品图</h2>
              <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                上传后自动进入编辑器。
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleInputChange}
            />

            <div
              className={cn(
                'rounded-2xl bg-muted/20 p-6 shadow-inner transition-colors',
                isDragActive ? 'bg-primary/10' : 'hover:bg-muted/30'
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <ImagePlus className="h-7 w-7 text-muted-foreground" />
                <p className="text-sm font-medium">拖拽图片到这里，或点击上传</p>
                <p className="text-xs text-muted-foreground">支持 JPG/PNG/WEBP，单张不超过 10MB</p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                    选择图片
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearAll} disabled={items.length === 0}>
                    清空列表
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">试试这些</h3>
              <p className="mt-1 text-sm text-muted-foreground">无需准备素材，直接加载示例。</p>
            </div>
            <div className="grid gap-3">
              {sampleItems.map((sample) => (
                <button
                  key={sample.seed}
                  type="button"
                  className="group flex items-center gap-3 rounded-2xl bg-muted/20 p-3 text-left transition hover:bg-muted/30"
                  onClick={() => handleSampleUse(sample.seed, sample.label)}
                >
                  <img
                    src={buildPicsumUrl(sample.seed, 160, 120)}
                    alt={sample.label}
                    className="h-16 w-20 rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{sample.label}</p>
                    <p className="text-xs text-muted-foreground">点击加载示例图</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-12 py-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground">功能展示</h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
              简单三步，稳定输出上架素材。
            </p>
          </div>
          <div className="space-y-16">
            {showcaseItems.map((item, index) => (
              <div
                key={item.title}
                className={cn(
                  'grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_520px]',
                  index % 2 === 1 && 'lg:grid-cols-[520px_minmax(0,1fr)]'
                )}
              >
                <div className={cn(index % 2 === 1 && 'lg:order-2')}>
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className={cn('overflow-hidden rounded-3xl', index % 2 === 1 && 'lg:order-1')}>
                  <img
                    src={buildPicsumUrl(item.seed, 900, 640)}
                    alt={item.title}
                    className="h-64 w-full object-cover md:h-72 lg:h-80"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8 py-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground">三步完成，快速落地</h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
              上传一次，AI 自动处理，全程可预览可导出。
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STEP_ITEMS.map((step, index) => (
              <div key={step.title} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="text-base font-semibold">{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8 py-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground">常见问题</h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
              快速了解使用细节。
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-primary/60" />
                <div>
                  <p className="text-base font-semibold text-foreground">{item.question}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-2">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-muted/40 via-background to-muted/10 p-8 text-center md:p-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(15,23,42,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.08) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            <div className="pointer-events-none absolute -top-20 right-10 h-40 w-40 rounded-full bg-chart-1/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-10 h-44 w-44 rounded-full bg-chart-3/20 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground">先出一批图，再决定是否付费</h2>
              <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                首周免费 30 张，满意后再升级。
              </p>
              <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg" className="rounded-full px-8" onClick={() => scrollTo(uploadSectionRef)}>
                  上传第一张
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                  <Link href={`/${currentLocale}/pricing`}>查看定价</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

    </FeaturePageShell>
  )
}
