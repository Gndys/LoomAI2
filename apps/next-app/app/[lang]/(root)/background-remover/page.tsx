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
  ArrowRight,
  CheckCircle2,
  Download,
  ImagePlus,
  Loader2,
  Scissors,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { FeatureCard, FeaturePageShell } from '@/components/feature-page-shell'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/use-translation'

const MAX_FILE_SIZE = 10 * 1024 * 1024

type RemoveBackgroundResult = {
  url: string
  key?: string
  provider?: string
  expiresAt?: string
}

const SAMPLE_PRESETS = [
  { id: 'sample-portrait', label: 'Portrait', accent: '#2563eb' },
  { id: 'sample-product', label: 'Product', accent: '#7c3aed' },
  { id: 'sample-fashion', label: 'Fashion', accent: '#059669' },
]

function createSampleImageDataUri(label: string, accent: string) {
  const safeLabel = label.slice(0, 12)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f8fafc" />
          <stop offset="100%" stop-color="#e2e8f0" />
        </linearGradient>
      </defs>
      <rect width="960" height="720" fill="url(#bg)" />
      <rect x="62" y="62" width="836" height="596" rx="34" fill="none" stroke="#cbd5e1" stroke-width="3" />
      <circle cx="480" cy="276" r="94" fill="none" stroke="${accent}" stroke-width="9" />
      <rect x="350" y="372" width="260" height="170" rx="76" fill="none" stroke="#0f172a" stroke-width="8" />
      <path d="M350 438 L290 530" stroke="#0f172a" stroke-width="8" stroke-linecap="round" />
      <path d="M610 438 L670 530" stroke="#0f172a" stroke-width="8" stroke-linecap="round" />
      <text x="480" y="620" text-anchor="middle" font-size="44" fill="#334155" font-family="Arial, Helvetica, sans-serif">${safeLabel}</text>
    </svg>
  `.trim()
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function sanitizeBaseName(name?: string | null) {
  if (!name) return 'cutout'
  const base = name.replace(/\.[^/.]+$/, '')
  const sanitized = base.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return sanitized || 'cutout'
}

function downloadImage(url: string, fileName: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  link.click()
}

export default function BackgroundRemoverPage() {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [result, setResult] = useState<RemoveBackgroundResult | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [progressText, setProgressText] = useState('')

  const isWorking = isUploading || isRemoving

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const checkerboardStyle = useMemo(
    () => ({
      backgroundColor: 'hsl(var(--muted))',
      backgroundImage:
        'linear-gradient(45deg, hsl(var(--border) / 0.45) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--border) / 0.45) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--border) / 0.45) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--border) / 0.45) 75%)',
      backgroundSize: '18px 18px',
      backgroundPosition: '0 0, 0 9px, 9px -9px, -9px 0',
    }),
    []
  )

  const buildRemoveFilename = () => {
    return `${sanitizeBaseName(sourceFile?.name)}-no-bg`
  }

  const onFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t.backgroundRemover.errors.imageOnly)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(t.backgroundRemover.errors.fileTooLarge)
      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setSourceFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setUploadedImageUrl(null)
    setResult(null)
    setProgressText('')
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    onFileSelect(file)
  }

  const onDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragActive(false)
    const file = event.dataTransfer.files?.[0]
    if (!file) return
    onFileSelect(file)
  }

  const onDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!isDragActive) {
      setIsDragActive(true)
    }
  }

  const onDragLeave = () => {
    setIsDragActive(false)
  }

  const clearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSourceFile(null)
    setPreviewUrl(null)
    setUploadedImageUrl(null)
    setResult(null)
    setProgressText('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const useSample = async (sampleId: string) => {
    const sample = SAMPLE_PRESETS.find((item) => item.id === sampleId)
    if (!sample) return

    try {
      const response = await fetch(createSampleImageDataUri(sample.label, sample.accent))
      const blob = await response.blob()
      const file = new File([blob], `${sample.id}.png`, { type: 'image/png' })
      onFileSelect(file)
      toast.success(`${t.backgroundRemover.upload.sampleApplied}: ${sample.label}`)
    } catch {
      toast.error(t.backgroundRemover.errors.sampleLoadFailed)
    }
  }

  const uploadSourceImage = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const payload = await response.json().catch(() => ({}))
    if (response.status === 401) {
      throw new Error(t.backgroundRemover.errors.unauthorized)
    }
    if (!response.ok || !payload?.success || typeof payload?.data?.url !== 'string') {
      throw new Error(payload?.message || payload?.error || t.backgroundRemover.errors.uploadFailed)
    }

    return payload.data.url as string
  }

  const pollRemoveResult = async (jobId: string, filename: string) => {
    const maxAttempts = 20
    const delayMs = 1500

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const query = new URLSearchParams({ jobId, filename })
      const response = await fetch(`/api/image-seg?${query.toString()}`)
      const payload = await response.json().catch(() => ({}))

      if (response.status === 401) {
        throw new Error(t.backgroundRemover.errors.unauthorized)
      }

      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || t.backgroundRemover.errors.removeFailed)
      }

      const status = payload?.data?.status
      if (status === 'PROCESS_SUCCESS') {
        const imageUrl = payload?.data?.imageUrl
        if (typeof imageUrl !== 'string' || !imageUrl) {
          throw new Error(t.backgroundRemover.errors.removeFailed)
        }
        return {
          url: imageUrl,
          key: payload?.data?.key,
          provider: payload?.data?.provider,
          expiresAt: payload?.data?.expiresAt,
        } as RemoveBackgroundResult
      }

      if (status === 'PROCESS_FAILED') {
        throw new Error(payload?.data?.errorMessage || t.backgroundRemover.errors.removeFailed)
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }

    throw new Error(t.backgroundRemover.errors.timeout)
  }

  const removeBackground = async (imageUrl: string, filename: string) => {
    const response = await fetch('/api/image-seg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        filename,
      }),
    })

    const payload = await response.json().catch(() => ({}))
    if (response.status === 401) {
      throw new Error(t.backgroundRemover.errors.unauthorized)
    }
    if (!response.ok) {
      throw new Error(payload?.message || payload?.error || t.backgroundRemover.errors.removeFailed)
    }

    if (payload?.data?.status === 'PROCESS_SUCCESS' && payload?.data?.imageUrl) {
      return {
        url: payload.data.imageUrl,
        key: payload?.data?.key,
        provider: payload?.data?.provider,
        expiresAt: payload?.data?.expiresAt,
      } as RemoveBackgroundResult
    }

    const jobId = payload?.data?.jobId
    if (!jobId || typeof jobId !== 'string') {
      throw new Error(t.backgroundRemover.errors.removeFailed)
    }

    return pollRemoveResult(jobId, filename)
  }

  const handleRemove = async () => {
    if (!sourceFile) {
      toast.error(t.backgroundRemover.errors.selectImage)
      return
    }

    setResult(null)
    setProgressText('')

    try {
      let sourceUrl = uploadedImageUrl
      if (!sourceUrl) {
        setIsUploading(true)
        setProgressText(t.backgroundRemover.status.uploading)
        sourceUrl = await uploadSourceImage(sourceFile)
        setUploadedImageUrl(sourceUrl)
      }

      setIsRemoving(true)
      setProgressText(t.backgroundRemover.status.removing)
      const outputFilename = buildRemoveFilename()
      const removeResult = await removeBackground(sourceUrl, outputFilename)

      setResult(removeResult)
      setProgressText(t.backgroundRemover.status.done)
      toast.success(t.backgroundRemover.toasts.success)
    } catch (error) {
      const message = error instanceof Error ? error.message : t.backgroundRemover.errors.removeFailed
      toast.error(message)
      setProgressText('')
    } finally {
      setIsUploading(false)
      setIsRemoving(false)
    }
  }

  const handleDownload = () => {
    if (!result?.url) return
    const fileName = `${buildRemoveFilename()}.png`
    downloadImage(result.url, fileName)
  }

  const howItWorks = t.backgroundRemover.howItWorks.steps as Array<{
    title: string
    description: string
  }>

  const faqItems = t.backgroundRemover.faq.items as Array<{
    q: string
    a: string
  }>

  const panelClass =
    'border-border/60 bg-card/40 shadow-[0_30px_80px_-60px_hsl(var(--primary)/0.25)] backdrop-blur-xl'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <FeaturePageShell
        title={t.backgroundRemover.title}
        description={t.backgroundRemover.description}
        badge={{ icon: <Scissors className="size-3.5" />, label: t.backgroundRemover.badge }}
        className="max-w-6xl"
        badgeClassName="border-border/60 bg-background/70 text-muted-foreground"
      >
        <div className="space-y-8">
          <FeatureCard className={panelClass}>
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold">{t.backgroundRemover.upload.title}</h2>
                    <p className="text-sm text-muted-foreground">{t.backgroundRemover.upload.description}</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={onInputChange}
                  />

                  {!previewUrl ? (
                    <div
                      onDrop={onDrop}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center transition-colors ${
                        isDragActive
                          ? 'border-primary bg-primary/10'
                          : 'border-border/70 bg-muted/20 hover:border-foreground/30 hover:bg-muted/30'
                      }`}
                    >
                      <div className="mb-4 rounded-full border border-border/60 bg-background/80 p-3">
                        <Upload className="size-6 text-muted-foreground" />
                      </div>
                      <p className="text-base font-medium">{t.backgroundRemover.upload.dropTitle}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{t.backgroundRemover.upload.dropHint}</p>
                      <p className="mt-3 text-xs text-muted-foreground">{t.backgroundRemover.upload.fileHint}</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
                      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                        <p className="line-clamp-1 text-sm font-medium">{sourceFile?.name}</p>
                        <Button variant="ghost" size="icon" onClick={clearFile}>
                          <X className="size-4" />
                        </Button>
                      </div>
                      <div className="relative aspect-[4/3] w-full bg-black/5">
                        <img
                          src={previewUrl}
                          alt="source"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{t.backgroundRemover.upload.samplesTitle}</p>
                      <span className="text-xs text-muted-foreground">{t.backgroundRemover.upload.samplesHint}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {SAMPLE_PRESETS.map((sample) => (
                        <Button
                          key={sample.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="justify-center"
                          onClick={() => useSample(sample.id)}
                        >
                          {sample.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <ImagePlus className="mr-2 size-4" />
                      {sourceFile ? t.backgroundRemover.upload.replace : t.backgroundRemover.upload.select}
                    </Button>
                    <Button type="button" disabled={!sourceFile || isWorking} onClick={handleRemove}>
                      {isWorking ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Scissors className="mr-2 size-4" />}
                      {isWorking ? t.backgroundRemover.actions.processing : t.backgroundRemover.actions.remove}
                    </Button>
                    {sourceFile && (
                      <Button type="button" variant="ghost" onClick={clearFile}>
                        {t.backgroundRemover.upload.clear}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold">{t.backgroundRemover.result.title}</h2>
                    <p className="text-sm text-muted-foreground">{t.backgroundRemover.result.description}</p>
                  </div>

                  {isWorking && (
                    <div className="flex items-center rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      {progressText || t.backgroundRemover.actions.processing}
                    </div>
                  )}

                  {previewUrl || result?.url ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="overflow-hidden rounded-xl border border-border/70">
                        <div className="border-b border-border/70 bg-muted/25 px-3 py-2 text-xs font-medium text-muted-foreground">
                          {t.backgroundRemover.result.before}
                        </div>
                        <div className="relative aspect-[4/3] bg-black/5">
                          {previewUrl ? (
                            <img src={previewUrl} alt="before" className="h-full w-full object-contain" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">-
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-border/70">
                        <div className="border-b border-border/70 bg-muted/25 px-3 py-2 text-xs font-medium text-muted-foreground">
                          {t.backgroundRemover.result.after}
                        </div>
                        <div className="relative aspect-[4/3]" style={checkerboardStyle}>
                          {result?.url ? (
                            <img src={result.url} alt="after" className="h-full w-full object-contain" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                              {t.backgroundRemover.result.waiting}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 text-center">
                      <Scissors className="mb-3 size-8 text-muted-foreground" />
                      <p className="text-sm font-medium">{t.backgroundRemover.result.emptyTitle}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{t.backgroundRemover.result.emptyDescription}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="button" disabled={!result?.url} onClick={handleDownload}>
                      <Download className="mr-2 size-4" />
                      {t.backgroundRemover.result.download}
                    </Button>
                    {result?.url && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle2 className="size-3.5 text-primary" />
                        {t.backgroundRemover.result.ready}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </FeatureCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <FeatureCard className={panelClass}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold">{t.backgroundRemover.howItWorks.title}</h3>
                  <div className="space-y-3">
                    {howItWorks.map((item, index) => (
                      <div key={item.title} className="rounded-xl border border-border/60 bg-background/70 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                          <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] text-primary">
                            {index + 1}
                          </span>
                          <span>{item.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </FeatureCard>

            <FeatureCard className={panelClass}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold">{t.backgroundRemover.faq.title}</h3>
                  <div className="space-y-3">
                    {faqItems.map((item) => (
                      <div key={item.q} className="rounded-xl border border-border/60 bg-background/70 p-4">
                        <p className="text-sm font-medium">{item.q}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                      </div>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <ArrowRight className="size-3.5" />
                    <span>{t.backgroundRemover.faq.note}</span>
                  </div>
                </div>
              </CardContent>
            </FeatureCard>
          </div>
        </div>
      </FeaturePageShell>
    </div>
  )
}
