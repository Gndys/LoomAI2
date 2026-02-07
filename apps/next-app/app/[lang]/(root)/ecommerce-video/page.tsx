'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
} from 'react'
import {
  CheckCircle2,
  Clipboard,
  Clock3,
  Download,
  Loader2,
  Sparkles,
  Upload,
  Video,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { FeatureCard, FeaturePageShell } from '@/components/feature-page-shell'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

const MAX_FILE_SIZE = 10 * 1024 * 1024

type TemplateValue = 'new-arrival' | 'texture-closeup' | 'promo-flash' | 'studio-showcase'
type VideoModel = 'sora-2' | 'sora-2-vip' | 'sora-2-pro'
type DurationValue = '10' | '15' | '25'
type TaskStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed'

const TEMPLATE_OPTIONS: Array<{
  value: TemplateValue
  label: string
  description: string
  shotPlan: string
  mood: string
}> = [
  {
    value: 'new-arrival',
    label: '上新快闪',
    description: '强调新品感和快速种草，适合朋友圈/社媒首发',
    shotPlan: 'Start with full product hero shot, then gentle push-in, then detail sweep, final hold frame.',
    mood: 'fresh, clean, fast-paced but stable',
  },
  {
    value: 'texture-closeup',
    label: '面料细节',
    description: '突出材质纹理、做工细节，适合高客单卖点说明',
    shotPlan: 'Macro close-up of fabric texture, seam detail pass, then return to full product framing.',
    mood: 'premium, tactile, craftsmanship-focused',
  },
  {
    value: 'promo-flash',
    label: '促销冲刺',
    description: '画面节奏更强，适合活动节点快速转化',
    shotPlan: 'Fast opening reveal, rotating product highlight, quick detail cut, strong ending hero frame.',
    mood: 'energetic, conversion-oriented, commercial',
  },
  {
    value: 'studio-showcase',
    label: '影棚展示',
    description: '电商稳妥模板，风格中性，失败率更低',
    shotPlan: 'Neutral studio background, stable pan around product silhouette, close-up then centered final shot.',
    mood: 'neutral, clean, reliable',
  },
]

const DURATION_OPTIONS = [
  { value: '10', label: '10 秒（推荐）' },
  { value: '15', label: '15 秒' },
] as const

const DURATION_OPTIONS_PRO = [
  ...DURATION_OPTIONS,
  { value: '25', label: '25 秒（仅 sora-2-pro）' },
] as const

const ASPECT_OPTIONS = [
  { value: '9:16', label: '9:16（竖版）' },
  { value: '16:9', label: '16:9（横版）' },
]

const STYLE_OPTIONS = [
  { value: 'soft', label: '柔和高级' },
  { value: 'neutral', label: '中性电商' },
  { value: 'strong', label: '强促销感' },
]

const MODEL_OPTIONS: Array<{
  value: VideoModel
  provider: string
  modelId: string
  description: string
}> = [
  {
    value: 'sora-2',
    provider: 'Evolink',
    modelId: 'sora-2',
    description: 'Evolink 渠道，稳定优先',
  },
  {
    value: 'sora-2-vip',
    provider: 'APIMart',
    modelId: 'sora-2-vip',
    description: 'APIMart 渠道，能力更强',
  },
  {
    value: 'sora-2-pro',
    provider: 'APIMart',
    modelId: 'sora-2-pro',
    description: 'APIMart 专业版，支持更长时长',
  },
]

function getModelDisplay(model: VideoModel) {
  const matched = MODEL_OPTIONS.find((option) => option.value === model)
  if (!matched) return model
  return `${matched.provider} + ${matched.modelId}`
}


type UploadedImage = {
  file: File
  previewUrl: string
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

function pickTemplate(value: TemplateValue) {
  return TEMPLATE_OPTIONS.find((option) => option.value === value) ?? TEMPLATE_OPTIONS[0]
}

function buildRhythmGuidance(model: VideoModel, duration: DurationValue) {
  if (model === 'sora-2-pro' && duration === '25') {
    return [
      'Timeline pacing for 25s: 0-4s hero establishing shot, 4-10s silhouette and fit movement, 10-18s fabric and stitching close-up details, 18-25s strong final hero hold with conversion-oriented ending mood.',
      'Keep transitions smooth and cinematic, avoid abrupt cuts and repeated frames.',
    ].join(' ')
  }

  if (duration === '15') {
    return [
      'Timeline pacing for 15s: 0-4s hero opening, 4-10s key detail sequence, 10-15s final conversion-oriented ending frame.',
      'Maintain stable rhythm with clean transitions.',
    ].join(' ')
  }

  return [
    'Timeline pacing for 10s: 0-3s product opening, 3-7s detail highlight, 7-10s final hero frame.',
    'Keep pace efficient and commercially focused.',
  ].join(' ')
}

function buildVideoPrompt(params: {
  model: VideoModel
  template: TemplateValue
  duration: DurationValue
  aspectRatio: '9:16' | '16:9'
  styleStrength: string
  productName: string
  sellingPoints: string
  cta: string
  customPrompt: string
  avoidRealHumanInput: boolean
}) {
  const template = pickTemplate(params.template)
  const orientation = params.aspectRatio === '9:16' ? 'vertical' : 'horizontal'
  const rhythmGuidance = buildRhythmGuidance(params.model, params.duration)

  const lines = [
    `Create a ${params.duration}-second ${orientation} ecommerce short video for clothing product ${params.productName || 'new arrival garment'}.`,
    `Generation model context: ${params.model}.`,
    'Use cinematic but realistic product video style for social commerce.',
    `Template style: ${template.label}. Mood: ${template.mood}.`,
    `Shot plan: ${template.shotPlan}`,
    rhythmGuidance,
    `Visual style strength: ${params.styleStrength}.`,
    `Selling points to emphasize: ${params.sellingPoints || 'fabric texture, silhouette, tailoring details, quality finish'}.`,
    `Call-to-action feeling: ${params.cta || 'new arrival, ready to buy now'}.`,
    'Keep garment design, color, pattern, logo and details consistent with the reference image.',
    'Stable lighting, clean background, smooth motion, no camera shake.',
    'No subtitles, no watermark, no extra logos, no collage, no artifact flicker.',
  ]

  if (params.avoidRealHumanInput) {
    lines.push('Do not use any real human figure in source input interpretation; keep product-centric visuals.')
  }

  if (params.customPrompt.trim()) {
    lines.push(`Additional requirements: ${params.customPrompt.trim()}.`)
  }

  return lines.join(' ')
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
    const message = payload?.message || payload?.error || '上传参考图失败'
    throw createRequestError(message, response.status)
  }

  return payload.data.url as string
}

async function createVideoTask(payload: {
  model: VideoModel
  prompt: string
  duration: DurationValue
  aspectRatio: '9:16' | '16:9'
  imageUrl?: string
  removeWatermark: boolean
}) {
  const response = await fetch('/api/video-generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: payload.model,
      prompt: payload.prompt,
      duration: Number(payload.duration),
      aspectRatio: payload.aspectRatio,
      imageUrl: payload.imageUrl,
      removeWatermark: payload.removeWatermark,
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data?.message || data?.error || '创建视频任务失败'
    throw createRequestError(message, response.status)
  }

  const taskId = data?.data?.id
  if (!taskId || typeof taskId !== 'string') {
    throw createRequestError('任务创建成功但未返回任务ID', response.status)
  }

  return {
    taskId,
    status: (data?.data?.status as TaskStatus) || 'pending',
    progress: typeof data?.data?.progress === 'number' ? data.data.progress : 0,
  }
}

async function getTaskDetail(taskId: string, model: VideoModel) {
  const response = await fetch(`/api/video-generate?taskId=${encodeURIComponent(taskId)}&model=${encodeURIComponent(model)}`, {
    method: 'GET',
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data?.message || data?.error || '查询任务失败'
    throw createRequestError(message, response.status)
  }

  return data?.data
}

function normalizeTaskStatus(value: unknown): TaskStatus {
  if (value === 'submitted') return 'pending'
  if (value === 'pending') return 'pending'
  if (value === 'processing') return 'processing'
  if (value === 'completed') return 'completed'
  if (value === 'failed') return 'failed'
  if (value === 'cancelled') return 'failed'
  return 'idle'
}

function getStatusText(status: TaskStatus) {
  if (status === 'idle') return '未开始'
  if (status === 'pending') return '排队中'
  if (status === 'processing') return '生成中'
  if (status === 'completed') return '已完成'
  return '失败'
}

function getStatusClassName(status: TaskStatus) {
  if (status === 'completed') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (status === 'processing' || status === 'pending') return 'border-sky-200 bg-sky-50 text-sky-700'
  if (status === 'failed') return 'border-destructive/30 bg-destructive/10 text-destructive'
  return 'border-border/60 bg-muted/30 text-muted-foreground'
}

function downloadVideo(url: string, fileName: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  link.click()
}

export default function EcommerceVideoPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const pollingIdRef = useRef(0)

  const [upload, setUpload] = useState<UploadedImage | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedModel, setSelectedModel] = useState<VideoModel>('sora-2-vip')
  const [template, setTemplate] = useState<TemplateValue>('studio-showcase')
  const [duration, setDuration] = useState<DurationValue>('10')
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16')
  const [styleStrength, setStyleStrength] = useState(STYLE_OPTIONS[1]?.value ?? 'neutral')
  const [useReferenceImage, setUseReferenceImage] = useState(true)
  const [removeWatermark, setRemoveWatermark] = useState(true)
  const [avoidRealHumanInput, setAvoidRealHumanInput] = useState(true)
  const [productName, setProductName] = useState('')
  const [sellingPoints, setSellingPoints] = useState('')
  const [cta, setCta] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')

  const [taskId, setTaskId] = useState('')
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableDurationOptions = useMemo(
    () => (selectedModel === 'sora-2-pro' ? DURATION_OPTIONS_PRO : DURATION_OPTIONS),
    [selectedModel],
  )

  useEffect(() => {
    if (selectedModel !== 'sora-2-pro' && duration === '25') {
      setDuration('10')
    }
  }, [selectedModel, duration])

  useEffect(() => {
    return () => {
      pollingIdRef.current += 1
      if (upload?.previewUrl) {
        URL.revokeObjectURL(upload.previewUrl)
      }
    }
  }, [upload])

  const promptPreview = useMemo(
    () =>
      buildVideoPrompt({
        model: selectedModel,
        template,
        duration,
        aspectRatio,
        styleStrength,
        productName,
        sellingPoints,
        cta,
        customPrompt,
        avoidRealHumanInput,
      }),
    [template, duration, aspectRatio, styleStrength, productName, sellingPoints, cta, customPrompt, avoidRealHumanInput],
  )

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]

    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件（JPG/PNG/WEBP）')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('图片超过 10MB，请压缩后重试')
      return
    }

    setUpload((prev) => {
      if (prev?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl)
      }
      return {
        file,
        previewUrl: URL.createObjectURL(file),
      }
    })
  }

  const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files)
    event.target.value = ''
  }

  const onDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragActive(false)
    handleFiles(event.dataTransfer.files)
  }

  const clearUpload = () => {
    setUpload((prev) => {
      if (prev?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl)
      }
      return null
    })
  }

  const pollTask = async (id: string, model: VideoModel) => {
    const currentPollingId = Date.now()
    pollingIdRef.current = currentPollingId

    const maxAttempts = 80
    for (let index = 0; index < maxAttempts; index += 1) {
      if (pollingIdRef.current !== currentPollingId) {
        return
      }

      const detail = await getTaskDetail(id, model)
      const nextStatus = normalizeTaskStatus(detail?.status)
      const nextProgress = typeof detail?.progress === 'number' ? detail.progress : 0
      const nextEstimated =
        typeof detail?.task_info?.estimated_time === 'number' ? detail.task_info.estimated_time : null

      setTaskStatus(nextStatus)
      setProgress(Math.max(0, Math.min(nextProgress, 100)))
      setEstimatedTime(nextEstimated)

      if (nextStatus === 'completed') {
        const result = Array.isArray(detail?.results) ? detail.results[0] : undefined
        if (typeof result === 'string' && result) {
          setVideoUrl(result)
          setProgress(100)
          setErrorMessage('')
          toast.success('视频生成完成，请及时下载保存（链接24小时内有效）')
          return
        }

        setTaskStatus('failed')
        setErrorMessage('任务完成但未返回视频地址，请重试')
        return
      }

      if (nextStatus === 'failed') {
        const failedReason =
          (typeof detail?.error?.message === 'string' && detail.error.message) ||
          '视频生成失败，可能触发了内容审核或素材限制'
        setErrorMessage(failedReason)
        return
      }

      await new Promise((resolve) => setTimeout(resolve, index < 10 ? 3000 : 5000))
    }

    setTaskStatus('failed')
    setErrorMessage('生成超时，请稍后重试')
  }

  const startGenerate = async () => {
    if (isSubmitting) return

    if (useReferenceImage && !upload?.file) {
      toast.error('请先上传商品图片')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setVideoUrl('')
    setTaskId('')
    setTaskStatus('pending')
    setProgress(0)
    setEstimatedTime(null)

    try {
      let imageUrl: string | undefined
      if (useReferenceImage && upload?.file) {
        imageUrl = await uploadReferenceImage(upload.file)
      }

      const result = await createVideoTask({
        model: selectedModel,
        prompt: promptPreview,
        duration,
        aspectRatio,
        imageUrl,
        removeWatermark,
      })

      setTaskId(result.taskId)
      setTaskStatus(normalizeTaskStatus(result.status))
      setProgress(result.progress)

      await pollTask(result.taskId, selectedModel)
    } catch (error) {
      const requestError = toRequestError(error)
      setTaskStatus('failed')
      setErrorMessage(requestError.message)
      toast.error(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptPreview)
      toast.success('提示词已复制')
    } catch {
      toast.error('复制失败，请手动复制')
    }
  }

  const canSubmit = !isSubmitting && (!useReferenceImage || Boolean(upload?.file))

  return (
    <FeaturePageShell
      title="简短电商视频"
      description="1张商品图 + 1个模板，快速生成可发朋友圈/电商场景的短视频素材。"
      badge={{
        label: 'Sora-2 Video Lite',
        icon: <Video className="h-3.5 w-3.5" />,
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <FeatureCard>
          <CardHeader>
            <CardTitle>输入与生成设置</CardTitle>
            <CardDescription>
              Sora-2 对输入素材审核较严格，建议优先上传纯商品图（非真人实拍图）。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>商品参考图</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  选择图片
                </Button>
              </div>

              <div
                className={`rounded-xl border border-dashed p-4 transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-border/70 bg-muted/20'
                }`}
                onDragEnter={(event) => {
                  event.preventDefault()
                  setIsDragActive(true)
                }}
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDragActive(true)
                }}
                onDragLeave={(event) => {
                  event.preventDefault()
                  setIsDragActive(false)
                }}
                onDrop={onDrop}
              >
                {upload ? (
                  <div className="flex items-start gap-3">
                    <img
                      src={upload.previewUrl}
                      alt={upload.file.name}
                      className="h-24 w-24 rounded-lg border border-border/60 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{upload.file.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatBytes(upload.file.size)}</p>
                      <div className="mt-3">
                        <Button type="button" variant="outline" size="sm" onClick={clearUpload}>
                          <X className="mr-2 h-4 w-4" />
                          移除图片
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm font-medium">拖拽商品图到这里，或点击上传</p>
                    <p className="mt-1 text-xs text-muted-foreground">支持 JPG/PNG/WEBP，单张不超过 10MB</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileInputChange} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>模型</Label>
                <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as VideoModel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.provider} + {option.modelId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {MODEL_OPTIONS.find((option) => option.value === selectedModel)?.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label>视频模板</Label>
                <Select value={template} onValueChange={(value) => setTemplate(value as TemplateValue)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{pickTemplate(template).description}</p>
              </div>

              <div className="space-y-2">
                <Label>时长</Label>
                <Select value={duration} onValueChange={(value) => setDuration(value as DurationValue)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDurationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedModel !== 'sora-2-pro' && (
                  <p className="text-xs text-muted-foreground">当前模型支持 10 / 15 秒</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>画幅比例</Label>
                <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as '9:16' | '16:9')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASPECT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>风格强度</Label>
                <Select value={styleStrength} onValueChange={setStyleStrength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>商品名（可选）</Label>
                <Input value={productName} onChange={(event) => setProductName(event.target.value)} placeholder="例如：法式衬衫连衣裙" />
              </div>
              <div className="space-y-2">
                <Label>结尾行动引导（可选）</Label>
                <Input value={cta} onChange={(event) => setCta(event.target.value)} placeholder="例如：新品限时上新，立即咨询" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>卖点关键词（可选）</Label>
              <Textarea
                value={sellingPoints}
                onChange={(event) => setSellingPoints(event.target.value)}
                placeholder="例如：抗皱面料、显瘦版型、走线精细、上身轻盈"
              />
            </div>

            <div className="space-y-2">
              <Label>额外要求（可选）</Label>
              <Textarea
                value={customPrompt}
                onChange={(event) => setCustomPrompt(event.target.value)}
                placeholder="例如：镜头节奏偏快、开头0.5秒做品牌感氛围"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">使用参考图</p>
                  <p className="text-xs text-muted-foreground">关闭后将走纯文生视频</p>
                </div>
                <Switch checked={useReferenceImage} onCheckedChange={setUseReferenceImage} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">去水印模式</p>
                  <p className="text-xs text-muted-foreground">开启时成本更高</p>
                </div>
                <Switch checked={removeWatermark} onCheckedChange={setRemoveWatermark} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 sm:col-span-2">
                <div>
                  <p className="text-sm font-medium">限制真人输入解释</p>
                  <p className="text-xs text-muted-foreground">降低真人相关素材导致失败的概率</p>
                </div>
                <Switch checked={avoidRealHumanInput} onCheckedChange={setAvoidRealHumanInput} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>提示词预览</Label>
                <Button type="button" size="sm" variant="outline" onClick={copyPrompt}>
                  <Clipboard className="mr-2 h-4 w-4" />
                  复制提示词
                </Button>
              </div>
              <Textarea value={promptPreview} readOnly className="min-h-[140px] text-xs" />
            </div>

            <Button type="button" className="w-full" onClick={startGenerate} disabled={!canSubmit}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              开始生成短视频
            </Button>
          </CardContent>
        </FeatureCard>

        <FeatureCard>
          <CardHeader>
            <CardTitle>任务状态与结果</CardTitle>
            <CardDescription>视频链接有效期 24 小时，请生成后及时下载保存。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">任务状态</span>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClassName(taskStatus)}`}
                >
                  {getStatusText(taskStatus)}
                </span>
              </div>

              {taskId ? (
                <div className="space-y-1 text-xs text-muted-foreground break-all">
                  <div>任务ID：{taskId}</div>
                  <div>模型：{getModelDisplay(selectedModel)}</div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">还没有任务，配置参数后点击生成。</div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>进度</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>

              {estimatedTime !== null && (taskStatus === 'pending' || taskStatus === 'processing') && (
                <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  预计剩余约 {estimatedTime} 秒
                </div>
              )}

              {errorMessage && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {errorMessage}
                </div>
              )}
            </div>

            {videoUrl ? (
              <div className="space-y-3">
                <video src={videoUrl} controls className="w-full rounded-xl border border-border/70 bg-black" />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => downloadVideo(videoUrl, `loomai-video-${Date.now()}.mp4`)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    下载视频
                  </Button>
                  <Button type="button" variant="outline" onClick={copyPrompt}>
                    <Clipboard className="mr-2 h-4 w-4" />
                    复制提示词
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 bg-muted/15 p-6 text-center">
                <p className="text-sm font-medium">暂无视频结果</p>
                <p className="mt-1 text-xs text-muted-foreground">生成成功后会在这里预览和下载。</p>
              </div>
            )}

            <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                提高成功率建议
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>1. 参考图优先使用纯商品图，避免真人实拍图。</li>
                <li>2. 提示词避免敏感、暴露、品牌侵权等内容。</li>
                <li>3. 先用“影棚展示 + 10秒”验证，稳定后再调风格。</li>
                <li>4. 生成后尽快下载，原始链接 24 小时失效。</li>
              </ul>
            </div>
          </CardContent>
        </FeatureCard>
      </div>
    </FeaturePageShell>
  )
}
