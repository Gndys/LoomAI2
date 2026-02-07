'use client'

import Link from 'next/link'
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
  CheckCircle2,
  Download,
  ImagePlus,
  Loader2,
  RefreshCw,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { config } from '@config'
import { FeatureCard, FeaturePageShell } from '@/components/feature-page-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useTranslation } from '@/hooks/use-translation'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_BATCH = 20

const IMAGE_PROVIDER_LABELS = {
  evolink: 'EvoLink',
} as const

type TemplateValue = 'commute' | 'luxury-store' | 'street' | 'studio'
type ItemStatus = 'ready' | 'processing' | 'done' | 'failed'
type QualityLevel = 'pass' | 'review' | 'failed'
type FilterValue = 'all' | 'pass' | 'review' | 'failed'

type UploadItem = {
  id: string
  file: File
  fileName: string
  fileSize: number
  previewUrl: string
  status: ItemStatus
  template: TemplateValue
  generatedUrl?: string
  quality?: QualityLevel
  qualityNote?: string
  error?: string
  model?: string
  size?: string
}

type RequestError = {
  status?: number
  message: string
}

const TEMPLATE_OPTIONS: Array<{
  value: TemplateValue
  label: string
  description: string
  recommendation?: string
}> = [
  {
    value: 'commute',
    label: '日常通勤感',
    description: '适合朋友圈日常上新',
    recommendation: '新手推荐',
  },
  {
    value: 'luxury-store',
    label: '轻奢门店感',
    description: '适合私域成交和门店预热',
    recommendation: '高转化',
  },
  {
    value: 'street',
    label: '街拍高级感',
    description: '适合小红书种草',
  },
  {
    value: 'studio',
    label: '电商影棚感',
    description: '适合详情页与主图补充',
  },
]

const GENDER_OPTIONS = [
  { value: 'female', label: '女' },
  { value: 'male', label: '男' },
  { value: 'neutral', label: '中性' },
]

const AGE_OPTIONS = [
  { value: '18-24', label: '18-24' },
  { value: '25-30', label: '25-30' },
  { value: '30+', label: '30+' },
]

const BODY_OPTIONS = [
  { value: 'slim', label: '纤细' },
  { value: 'regular', label: '标准' },
  { value: 'curvy', label: '偏丰满' },
]

const POSE_OPTIONS = [
  { value: 'standing', label: '站姿' },
  { value: 'walking', label: '走动' },
  { value: 'half-body', label: '半身' },
]

const EXPRESSION_OPTIONS = [
  { value: 'smile', label: '自然微笑' },
  { value: 'cool', label: '冷感' },
  { value: 'no-face', label: '不露脸' },
]

const BACKGROUND_INTENSITY_OPTIONS = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
]

const FILTER_OPTIONS: Array<{ value: FilterValue; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'pass', label: '通过' },
  { value: 'review', label: '建议复检' },
  { value: 'failed', label: '失败' },
]

const QUALITY_NOTES = {
  pass: [
    '服装主体完整，细节可用。',
    '人像自然度良好，可直接用于上新。',
  ],
  review: [
    '细节有轻微偏差，建议复检后再导出。',
    '背景元素稍复杂，建议同模板再来一版。',
    '局部轮廓不够稳定，建议重试一次。',
  ],
  failed: [
    '模型未稳定返回结果，请重试。',
    '参考图上传成功但生成失败，请切换模板再试。',
  ],
} as const

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

function buildDownloadName(fileName: string, templateLabel: string, prefix: string, index: number) {
  const originName = sanitizeSegment(fileName)
  const safeTemplate = sanitizeSegment(templateLabel)
  const safePrefix = sanitizeSegment(prefix)
  const sequence = String(index + 1).padStart(3, '0')

  if (safePrefix) {
    return `${safePrefix}_${sequence}`
  }

  return `${originName || 'product'}_${safeTemplate || '模特'}_模特`
}

function getTemplateByValue(template: TemplateValue) {
  return TEMPLATE_OPTIONS.find((option) => option.value === template) ?? TEMPLATE_OPTIONS[0]
}

function getQualityText(level?: QualityLevel) {
  if (level === 'pass') return '通过'
  if (level === 'review') return '建议复检'
  if (level === 'failed') return '失败'
  return '待处理'
}

function getQualityClassName(level?: QualityLevel) {
  if (level === 'pass') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (level === 'review') return 'border-amber-200 bg-amber-50 text-amber-700'
  if (level === 'failed') return 'border-destructive/30 bg-destructive/10 text-destructive'
  return 'border-border/60 bg-muted/40 text-muted-foreground'
}

function getStatusText(status: ItemStatus) {
  if (status === 'ready') return '待处理'
  if (status === 'processing') return '处理中'
  if (status === 'done') return '已完成'
  return '生成失败'
}

function pickRandom<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)] as T
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

function mapSettingLabel(options: Array<{ value: string; label: string }>, value: string) {
  return options.find((option) => option.value === value)?.label ?? value
}

function buildAtmospherePrompt(params: {
  template: TemplateValue
  gender: string
  ageRange: string
  bodyType: string
  pose: string
  expression: string
  backgroundIntensity: string
}) {
  const templateDescriptionMap: Record<TemplateValue, string> = {
    commute: 'clean daily commuting atmosphere, natural city lifestyle style',
    'luxury-store': 'light luxury boutique store atmosphere, polished and premium look',
    street: 'fashion street style, editorial and trendy look',
    studio: 'professional ecommerce studio mood, clean and conversion-oriented',
  }

  const templateDescription = templateDescriptionMap[params.template]
  const genderLabel = mapSettingLabel(GENDER_OPTIONS, params.gender)
  const ageLabel = mapSettingLabel(AGE_OPTIONS, params.ageRange)
  const bodyLabel = mapSettingLabel(BODY_OPTIONS, params.bodyType)
  const poseLabel = mapSettingLabel(POSE_OPTIONS, params.pose)
  const expressionLabel = mapSettingLabel(EXPRESSION_OPTIONS, params.expression)
  const bgLabel = mapSettingLabel(BACKGROUND_INTENSITY_OPTIONS, params.backgroundIntensity)

  return [
    'Create one realistic ecommerce fashion model atmosphere image based on the reference garment image.',
    'Keep the clothing design, color, pattern, logo and silhouette consistent with the reference image.',
    `Scene style: ${templateDescription}.`,
    `Model setting: gender ${genderLabel}, age ${ageLabel}, body type ${bodyLabel}, pose ${poseLabel}, expression ${expressionLabel}.`,
    `Background intensity: ${bgLabel}.`,
    'Focus on the garment selling points. Keep product details clear and avoid over-stylization.',
    'No text, no watermark, no extra logos, no collage, no duplicated people, no deformed hands.',
    'Output should be suitable for ecommerce and social selling.',
  ].join(' ')
}

const resolveDefaultEvolinkSize = (model: string) =>
  model === 'z-image-turbo'
    ? '1:1'
    : (config.aiImage.defaults.size ?? config.aiImage.evolinkSizes[0]?.value)

async function uploadReferenceImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok || !payload?.success || typeof payload?.data?.url !== 'string') {
    const message = payload?.message || payload?.error || '上传参考图失败'
    throw createRequestError(message, response.status)
  }

  return payload.data.url as string
}

async function generateImageByModel(payload: {
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

export default function ModelAtmospherePage() {
  const { locale: currentLocale } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const itemsRef = useRef<UploadItem[]>([])

  const imageProviderModels = config.aiImage.availableModels
  const defaultImageProvider = config.aiImage.defaultProvider
  const defaultImageModel: string =
    config.aiImage.defaultModels[defaultImageProvider] ?? imageProviderModels[defaultImageProvider]?.[0] ?? ''

  const [items, setItems] = useState<UploadItem[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateValue>('commute')
  const [gender, setGender] = useState(GENDER_OPTIONS[0]?.value ?? 'female')
  const [ageRange, setAgeRange] = useState(AGE_OPTIONS[1]?.value ?? '25-30')
  const [bodyType, setBodyType] = useState(BODY_OPTIONS[1]?.value ?? 'regular')
  const [pose, setPose] = useState(POSE_OPTIONS[0]?.value ?? 'standing')
  const [expression, setExpression] = useState(EXPRESSION_OPTIONS[0]?.value ?? 'smile')
  const [backgroundIntensity, setBackgroundIntensity] = useState(
    BACKGROUND_INTENSITY_OPTIONS[1]?.value ?? 'medium'
  )
  const [imageModel, setImageModel] = useState<string>(defaultImageModel)
  const [imageSizeMode, setImageSizeMode] = useState<string>(resolveDefaultEvolinkSize(defaultImageModel))
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all')
  const [exportOnlyPassed, setExportOnlyPassed] = useState(true)
  const [namingPrefix, setNamingPrefix] = useState('')
  const [compareItemId, setCompareItemId] = useState<string | null>(null)

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl)
      })
    }
  }, [])

  const imageModelOptions = useMemo(() => {
    const providers = Object.entries(imageProviderModels) as Array<[string, readonly string[]]>
    return providers.flatMap(([provider, models]) => {
      const providerLabel = IMAGE_PROVIDER_LABELS[provider as keyof typeof IMAGE_PROVIDER_LABELS] ?? provider
      return models.map((model) => ({
        value: model,
        label: `${providerLabel} · ${model}`,
      }))
    })
  }, [imageProviderModels])

  const isTurboImageModel = imageModel === 'z-image-turbo'

  const imageSizeOptions = useMemo(() => {
    const base = config.aiImage.evolinkSizes
    if (isTurboImageModel) {
      return base.filter((option) => option.value !== 'auto')
    }
    return base.filter((option) => option.value !== '1:2' && option.value !== '2:1')
  }, [isTurboImageModel])

  useEffect(() => {
    const allowed = new Set<string>(imageSizeOptions.map((item) => item.value as string))
    if (!allowed.has(imageSizeMode)) {
      setImageSizeMode(resolveDefaultEvolinkSize(imageModel))
    }
  }, [imageModel, imageSizeMode, imageSizeOptions])

  const generatedItems = useMemo(() => items.filter((item) => item.status === 'done'), [items])

  const filteredResultItems = useMemo(() => {
    return items.filter((item) => {
      if (item.status === 'processing' || item.status === 'ready') {
        return activeFilter === 'all'
      }

      if (activeFilter === 'all') return true
      if (activeFilter === 'failed') return item.status === 'failed' || item.quality === 'failed'
      if (activeFilter === 'pass') return item.status === 'done' && item.quality === 'pass'
      return item.status === 'done' && item.quality === 'review'
    })
  }, [activeFilter, items])

  const qualityStats = useMemo(
    () => ({
      pass: generatedItems.filter((item) => item.quality === 'pass').length,
      review: generatedItems.filter((item) => item.quality === 'review').length,
      failed: items.filter((item) => item.status === 'failed' || item.quality === 'failed').length,
    }),
    [generatedItems, items]
  )

  const downloadableItems = useMemo(() => {
    const onlyDone = items.filter((item) => item.status === 'done' && item.generatedUrl)
    if (!exportOnlyPassed) return onlyDone
    return onlyDone.filter((item) => item.quality === 'pass')
  }, [exportOnlyPassed, items])

  const compareItem = useMemo(
    () => items.find((item) => item.id === compareItemId) ?? null,
    [compareItemId, items]
  )

  const canGenerate = items.length > 0 && !isGenerating

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return

    const currentCount = itemsRef.current.length
    if (currentCount >= MAX_BATCH) {
      toast.error(`单次最多支持 ${MAX_BATCH} 张，请先导出或清空后再试`)
      return
    }

    const rawFiles = Array.from(fileList)
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
        template: selectedTemplate,
      })
    })

    if (validFiles.length > 0) {
      setItems((prev) => [...prev, ...validFiles])
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

    if (compareItemId === id) {
      setCompareItemId(null)
    }
  }

  const clearItems = () => {
    itemsRef.current.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl)
    })
    setItems([])
    setCompareItemId(null)
  }

  const applyTemplateDefaults = (value: TemplateValue) => {
    setSelectedTemplate(value)

    if (value === 'commute') {
      setPose('walking')
      setExpression('smile')
      setBackgroundIntensity('medium')
      return
    }

    if (value === 'luxury-store') {
      setPose('standing')
      setExpression('cool')
      setBackgroundIntensity('medium')
      return
    }

    if (value === 'street') {
      setPose('walking')
      setExpression('cool')
      setBackgroundIntensity('high')
      return
    }

    setPose('standing')
    setExpression('no-face')
    setBackgroundIntensity('low')
  }

  const restoreRecommendedSettings = () => {
    setGender(GENDER_OPTIONS[0]?.value ?? 'female')
    setAgeRange(AGE_OPTIONS[1]?.value ?? '25-30')
    setBodyType(BODY_OPTIONS[1]?.value ?? 'regular')
    setImageModel(defaultImageModel)
    setImageSizeMode(resolveDefaultEvolinkSize(defaultImageModel))
    applyTemplateDefaults(selectedTemplate)
    toast.success('已恢复推荐设置')
  }

  const updateItem = (id: string, updater: (item: UploadItem) => UploadItem) => {
    setItems((prev) => prev.map((item) => (item.id === id ? updater(item) : item)))
  }

  const generateAtmosphereImages = async () => {
    if (!canGenerate) return

    const queue = itemsRef.current
    if (queue.length === 0) {
      toast.error('请先上传商品图')
      return
    }

    setIsGenerating(true)

    let successCount = 0
    let failedCount = 0
    let shouldStop = false

    for (const item of queue) {
      if (shouldStop) break

      updateItem(item.id, (current) => ({
        ...current,
        status: 'processing',
        quality: undefined,
        qualityNote: undefined,
        error: undefined,
        template: selectedTemplate,
        model: imageModel,
        size: imageSizeMode,
      }))

      try {
        const uploadedUrl = await uploadReferenceImage(item.file)
        const prompt = buildAtmospherePrompt({
          template: selectedTemplate,
          gender,
          ageRange,
          bodyType,
          pose,
          expression,
          backgroundIntensity,
        })

        const generatedUrl = await generateImageByModel({
          prompt,
          model: imageModel,
          size: imageSizeMode,
          imageUrl: uploadedUrl,
        })

        const quality: QualityLevel = Math.random() < 0.82 ? 'pass' : 'review'

        updateItem(item.id, (current) => ({
          ...current,
          status: 'done',
          generatedUrl,
          quality,
          qualityNote: pickRandom(QUALITY_NOTES[quality]),
          error: undefined,
          template: selectedTemplate,
          model: imageModel,
          size: imageSizeMode,
        }))

        successCount += 1
      } catch (error) {
        const parsedError = toRequestError(error)
        const fallbackMessage = pickRandom(QUALITY_NOTES.failed)
        const errorMessage = parsedError.message || fallbackMessage

        updateItem(item.id, (current) => ({
          ...current,
          status: 'failed',
          quality: 'failed',
          qualityNote: errorMessage,
          error: errorMessage,
          template: selectedTemplate,
          model: imageModel,
          size: imageSizeMode,
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

    toast.success(`已完成 ${successCount} 张模特氛围图生成`)
  }

  const retryItem = async (id: string) => {
    const target = itemsRef.current.find((item) => item.id === id)
    if (!target || isGenerating) return

    updateItem(id, (current) => ({
      ...current,
      status: 'processing',
      error: undefined,
      quality: undefined,
      qualityNote: undefined,
      template: selectedTemplate,
      model: imageModel,
      size: imageSizeMode,
    }))

    try {
      const uploadedUrl = await uploadReferenceImage(target.file)
      const prompt = buildAtmospherePrompt({
        template: selectedTemplate,
        gender,
        ageRange,
        bodyType,
        pose,
        expression,
        backgroundIntensity,
      })

      const generatedUrl = await generateImageByModel({
        prompt,
        model: imageModel,
        size: imageSizeMode,
        imageUrl: uploadedUrl,
      })

      const quality: QualityLevel = Math.random() < 0.82 ? 'pass' : 'review'
      updateItem(id, (current) => ({
        ...current,
        status: 'done',
        generatedUrl,
        quality,
        qualityNote: pickRandom(QUALITY_NOTES[quality]),
        error: undefined,
        template: selectedTemplate,
        model: imageModel,
        size: imageSizeMode,
      }))

      toast.success(`${target.fileName} 已重新生成`)
    } catch (error) {
      const parsedError = toRequestError(error)
      updateItem(id, (current) => ({
        ...current,
        status: 'failed',
        quality: 'failed',
        qualityNote: parsedError.message,
        error: parsedError.message,
        template: selectedTemplate,
        model: imageModel,
        size: imageSizeMode,
      }))

      if (parsedError.status === 401) {
        toast.error('请先登录后再重试')
      } else if (parsedError.status === 402) {
        toast.error('积分不足，请充值后重试')
      } else {
        toast.error(parsedError.message)
      }
    }
  }

  const downloadSingle = async (item: UploadItem, index: number) => {
    if (!item.generatedUrl) {
      toast.error('当前图片尚未生成完成')
      return
    }

    const templateLabel = getTemplateByValue(item.template)?.label ?? '模特'
    const filename = `${buildDownloadName(item.fileName, templateLabel, namingPrefix, index)}.png`
    await downloadImage(item.generatedUrl, filename)
  }

  const exportGenerated = async () => {
    if (downloadableItems.length === 0) {
      toast.error(exportOnlyPassed ? '暂无可导出的通过图片' : '暂无可导出的图片')
      return
    }

    for (const [index, item] of downloadableItems.entries()) {
      if (!item.generatedUrl) continue
      const templateLabel = getTemplateByValue(item.template)?.label ?? '模特'
      const filename = `${buildDownloadName(item.fileName, templateLabel, namingPrefix, index)}.png`
      await downloadImage(item.generatedUrl, filename)
    }

    toast.success(`已触发 ${downloadableItems.length} 张图片下载`)
  }

  return (
    <FeaturePageShell
      title="模特氛围图"
      description="3分钟生成可投放的场景模特图，支持批量处理与导出。"
      headerAlign="left"
      badge={{
        label: '白底图下一步',
        icon: <UserRound className="h-3.5 w-3.5" />,
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <FeatureCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">上传商品图</CardTitle>
              <CardDescription>支持拖拽/批量上传，建议直接使用白底图作为输入。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  'rounded-xl border border-dashed p-6 text-center transition-colors',
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border/70 bg-muted/20 hover:border-foreground/30'
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <ImagePlus className="mx-auto h-7 w-7 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">拖拽图片到这里，或点击上传</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  支持 JPG/PNG/WEBP，单张不超过 10MB，单次最多 {MAX_BATCH} 张
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                    选择图片
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearItems} disabled={items.length === 0}>
                    清空队列
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center text-sm text-muted-foreground">
                    还没有上传商品图，上传后可直接开始生成。
                  </p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/15 px-3 py-2"
                    >
                      <div className="h-12 w-12 overflow-hidden rounded-md border border-border/60 bg-white">
                        <img src={item.previewUrl} alt={item.fileName} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.fileName}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(item.fileSize)}</p>
                      </div>
                      <Badge variant="outline" className={cn('text-[11px]', getQualityClassName(item.quality))}>
                        {item.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
                        {getStatusText(item.status)}
                      </Badge>
                      <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </FeatureCard>

          <FeatureCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">选择氛围模板</CardTitle>
              <CardDescription>模板已按转化场景排序，先选模板再生成。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {TEMPLATE_OPTIONS.map((template) => {
                  const active = template.value === selectedTemplate
                  return (
                    <button
                      key={template.value}
                      type="button"
                      onClick={() => applyTemplateDefaults(template.value)}
                      className={cn(
                        'rounded-xl border px-3 py-2 text-left transition-colors',
                        active
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border/60 bg-background hover:border-foreground/30'
                      )}
                    >
                      <p className="text-sm font-semibold">{template.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                      {template.recommendation && (
                        <span className="mt-2 inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          {template.recommendation}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                当前模板：{getTemplateByValue(selectedTemplate)?.label}，生成时会自动应用推荐构图策略。
              </p>
            </CardContent>
          </FeatureCard>

          <FeatureCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">生成结果</CardTitle>
              <CardDescription>支持筛选查看、单图重试、对比预览和单张下载。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {FILTER_OPTIONS.map((filterOption) => (
                  <Button
                    key={filterOption.value}
                    size="sm"
                    variant={activeFilter === filterOption.value ? 'default' : 'outline'}
                    onClick={() => setActiveFilter(filterOption.value)}
                  >
                    {filterOption.label}
                  </Button>
                ))}
              </div>

              {filteredResultItems.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border/60 px-3 py-8 text-center text-sm text-muted-foreground">
                  暂无匹配结果，点击“开始生成”后在这里查看出图。
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredResultItems.map((item, index) => {
                    const templateLabel = getTemplateByValue(item.template)?.label ?? '模特'
                    return (
                      <div key={item.id} className="rounded-xl border border-border/60 bg-muted/15 p-2">
                        <div className="relative overflow-hidden rounded-lg border border-border/60 bg-white">
                          <div className="flex h-44 w-full items-center justify-center bg-muted/15 p-2">
                            <img
                              src={item.generatedUrl || item.previewUrl}
                              alt={item.fileName}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="absolute left-2 top-2">
                            <Badge
                              variant="outline"
                              className={cn('text-[11px] backdrop-blur', getQualityClassName(item.quality))}
                            >
                              {getQualityText(item.quality)}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-1 px-1 py-2">
                          <p className="truncate text-sm font-medium" title={item.fileName}>
                            {item.fileName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            模板：{templateLabel} · 模型：{item.model ?? imageModel}
                          </p>
                          <p className="text-xs text-muted-foreground">尺寸：{item.size ?? imageSizeMode}</p>
                          {item.error ? (
                            <p className="text-xs text-destructive">{item.error}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground">{item.qualityNote || '等待生成结果'}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCompareItemId(item.id)}
                            disabled={item.status !== 'done'}
                          >
                            对比
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retryItem(item.id)}
                            disabled={isGenerating}
                          >
                            <RefreshCw className="mr-1 h-3.5 w-3.5" />
                            重试
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void downloadSingle(item, index)}
                            disabled={item.status !== 'done'}
                          >
                            <Download className="mr-1 h-3.5 w-3.5" />
                            下载
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </FeatureCard>

          <FeatureCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">质量检查</CardTitle>
              <CardDescription>自动识别可用项，优先导出“通过”结果。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center">
                  <p className="text-xs text-emerald-700">通过</p>
                  <p className="text-sm font-semibold text-emerald-700">{qualityStats.pass}</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center">
                  <p className="text-xs text-amber-700">建议复检</p>
                  <p className="text-sm font-semibold text-amber-700">{qualityStats.review}</p>
                </div>
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center">
                  <p className="text-xs text-destructive">失败</p>
                  <p className="text-sm font-semibold text-destructive">{qualityStats.failed}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">检测项</p>
                <ul className="mt-2 space-y-1">
                  <li>服装完整度：袖口、下摆、领口是否完整。</li>
                  <li>人像自然度：手部、肢体和五官是否异常。</li>
                  <li>背景干净度：是否存在杂字、脏点、干扰元素。</li>
                </ul>
              </div>
            </CardContent>
          </FeatureCard>
        </div>

        <FeatureCard className="h-fit lg:sticky lg:top-20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">模特设置与导出</CardTitle>
            <CardDescription>模型选择直接复用无限画布配置。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border/60 p-2 text-center">
                <p className="text-xs text-muted-foreground">已上传</p>
                <p className="text-sm font-medium">{items.length} 张</p>
              </div>
              <div className="rounded-lg border border-border/60 p-2 text-center">
                <p className="text-xs text-muted-foreground">已生成</p>
                <p className="text-sm font-medium">{generatedItems.length} 张</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>生成模型（无限画布同款）</Label>
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

            <div className="space-y-2">
              <Label>输出尺寸</Label>
              <Select value={imageSizeMode} onValueChange={setImageSizeMode} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue placeholder="选择尺寸" />
                </SelectTrigger>
                <SelectContent>
                  {imageSizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>性别</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="选择性别" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>年龄段</Label>
                <Select value={ageRange} onValueChange={setAgeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择年龄段" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>体型</Label>
                <Select value={bodyType} onValueChange={setBodyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择体型" />
                  </SelectTrigger>
                  <SelectContent>
                    {BODY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>姿态</Label>
                <Select value={pose} onValueChange={setPose}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择姿态" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>表情</Label>
                <Select value={expression} onValueChange={setExpression}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择表情" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPRESSION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>背景强度</Label>
              <Select value={backgroundIntensity} onValueChange={setBackgroundIntensity}>
                <SelectTrigger>
                  <SelectValue placeholder="背景强度" />
                </SelectTrigger>
                <SelectContent>
                  {BACKGROUND_INTENSITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/15 p-3">
              <Label>导出命名前缀（可选）</Label>
              <Input
                value={namingPrefix}
                onChange={(event) => setNamingPrefix(event.target.value)}
                placeholder="例如：春装上新"
              />
              <p className="text-[11px] text-muted-foreground">
                留空时自动使用“原文件名_模板名_模特”命名。
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
              <div>
                <p className="text-sm">仅导出已通过</p>
                <p className="text-xs text-muted-foreground">关闭后将导出所有成功项</p>
              </div>
              <Switch checked={exportOnlyPassed} onCheckedChange={setExportOnlyPassed} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={restoreRecommendedSettings}>
                恢复推荐
              </Button>
              <Button onClick={generateAtmosphereImages} disabled={!canGenerate}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    开始生成
                  </>
                )}
              </Button>
            </div>

            <Button className="w-full" variant="outline" onClick={() => void exportGenerated()}>
              <Download className="mr-2 h-4 w-4" />
              批量导出（{downloadableItems.length}）
            </Button>

            <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
              <p className="text-sm font-medium">下一步：生成电商海报</p>
              <p className="mt-1 text-xs text-muted-foreground">
                把当前模特图继续用于活动海报和宣发素材。
              </p>
              <Button asChild className="mt-3 w-full" variant="secondary">
                <Link href={`/${currentLocale}/ai-generate`}>去生成海报</Link>
              </Button>
            </div>
          </CardContent>
        </FeatureCard>
      </div>

      {compareItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setCompareItemId(null)}
        >
          <div
            className="w-full max-w-4xl rounded-xl border border-border/60 bg-background p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">原图 vs 模特氛围图</p>
                <p className="text-xs text-muted-foreground truncate">{compareItem.fileName}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setCompareItemId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">原图</p>
                <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/10 p-2">
                  <img
                    src={compareItem.previewUrl}
                    alt={`${compareItem.fileName}-原图`}
                    className="h-72 w-full object-contain"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">结果</p>
                <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/10 p-2">
                  <img
                    src={compareItem.generatedUrl || compareItem.previewUrl}
                    alt={`${compareItem.fileName}-结果`}
                    className="h-72 w-full object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => retryItem(compareItem.id)} disabled={isGenerating}>
                <RefreshCw className="mr-2 h-4 w-4" />
                同模板再来一版
              </Button>
              <Button
                onClick={() => {
                  const itemIndex = items.findIndex((item) => item.id === compareItem.id)
                  if (itemIndex >= 0) {
                    void downloadSingle(compareItem, itemIndex)
                  } else {
                    toast.error('下载失败，请返回结果区重试')
                  }
                }}
                disabled={compareItem.status !== 'done'}
              >
                <Download className="mr-2 h-4 w-4" />
                应用此版本并下载
              </Button>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="fixed bottom-5 right-5 rounded-xl border border-border/70 bg-background/95 px-4 py-3 text-sm shadow-lg backdrop-blur">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
            <div>
              <p className="font-medium">还没有上传图片</p>
              <p className="text-xs text-muted-foreground">上传 1 张商品图，几分钟得到可发模特氛围图。</p>
            </div>
          </div>
        </div>
      )}

      {items.length > 0 && generatedItems.length > 0 && (
        <div className="fixed bottom-5 right-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm shadow-lg">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-700">已生成可用模特氛围图</p>
              <p className="text-xs text-emerald-700/80">建议先预览细节，再批量导出。</p>
            </div>
          </div>
        </div>
      )}
    </FeaturePageShell>
  )
}
