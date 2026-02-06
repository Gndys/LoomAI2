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

type SampleLabelKey = 'portrait' | 'product' | 'fashion'

const SAMPLE_PRESETS: Array<{ id: string; labelKey: SampleLabelKey; accent: string }> = [
  { id: 'sample-portrait', labelKey: 'portrait', accent: '#2563eb' },
  { id: 'sample-product', labelKey: 'product', accent: '#7c3aed' },
  { id: 'sample-fashion', labelKey: 'fashion', accent: '#059669' },
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

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(2)} MB`
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
  const canRemove = Boolean(sourceFile) && !isWorking

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

  const sampleCards = useMemo(
    () =>
      SAMPLE_PRESETS.map((sample) => ({
        ...sample,
        title: t.backgroundRemover.upload.sampleLabels[sample.labelKey],
        imageUrl: createSampleImageDataUri(
          t.backgroundRemover.upload.sampleLabels[sample.labelKey],
          sample.accent
        ),
      })),
    [t]
  )

  const processSteps = [
    {
      key: 'upload',
      label: t.backgroundRemover.pipeline.upload,
      done: Boolean(uploadedImageUrl || result),
      active: isUploading,
    },
    {
      key: 'remove',
      label: t.backgroundRemover.pipeline.remove,
      done: Boolean(result),
      active: isRemoving,
    },
    {
      key: 'download',
      label: t.backgroundRemover.pipeline.download,
      done: Boolean(result),
      active: false,
    },
  ]

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
    const sample = sampleCards.find((item) => item.id === sampleId)
    if (!sample) return

    try {
      const response = await fetch(sample.imageUrl)
      const blob = await response.blob()
      const file = new File([blob], `${sample.id}.png`, { type: 'image/png' })
      onFileSelect(file)
      toast.success(`${t.backgroundRemover.upload.sampleApplied}: ${sample.title}`)
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
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  {!previewUrl ? (
                    <>
                      <div
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        className={`rounded-3xl border border-dashed p-10 text-center transition-colors ${
                          isDragActive
                            ? 'border-primary/60 bg-primary/5'
                            : 'border-border/70 bg-muted/20 hover:border-foreground/30'
                        }`}
                      >
                        <div className="mx-auto mb-4 inline-flex rounded-full border border-border/70 bg-background/70 p-4">
                          <Upload className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium text-foreground">{t.backgroundRemover.upload.dropTitle}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{t.backgroundRemover.upload.dropHint}</p>
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-5 h-10 rounded-full px-6 text-sm"
                        >
                          {t.backgroundRemover.upload.select}
                        </Button>
                        <p className="mt-3 text-xs text-muted-foreground">{t.backgroundRemover.upload.fileHint}</p>
                      </div>

                      <div className="space-y-3">
                        <p className="text-center text-sm text-muted-foreground">{t.backgroundRemover.upload.samplesHint}</p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {sampleCards.map((sample) => (
                            <button
                              key={sample.id}
                              type="button"
                              onClick={() => useSample(sample.id)}
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
                    <div className="overflow-hidden rounded-3xl border border-border/60 bg-background/70">
                      <div className="relative h-[340px] sm:h-[420px]">
                        <img src={previewUrl} alt={t.backgroundRemover.result.before} className="h-full w-full object-contain p-4" />
                        <button
                          type="button"
                          onClick={clearFile}
                          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/85 text-muted-foreground hover:text-foreground"
                          aria-label="Clear selected file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-3 left-3 rounded-full border border-border/60 bg-background/85 px-3 py-1 text-xs text-foreground/85">
                          {sourceFile?.name}
                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={onInputChange}
                  />
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="mb-3 text-sm font-medium">{t.backgroundRemover.upload.description}</p>
                    <div className="space-y-2">
                      {processSteps.map((step) => (
                        <div
                          key={step.key}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                            step.active
                              ? 'border-primary/40 bg-primary/10 text-primary'
                              : step.done
                                ? 'border-primary/20 bg-primary/5 text-foreground'
                                : 'border-border/60 bg-background/70 text-muted-foreground'
                          }`}
                        >
                          {step.active ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : step.done ? (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          ) : (
                            <ArrowRight className="h-4 w-4" />
                          )}
                          <span>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {sourceFile && (
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">{t.backgroundRemover.upload.fileLabel}</span>
                        <span className="max-w-[230px] truncate font-medium">{sourceFile.name}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">{t.backgroundRemover.upload.sizeLabel}</span>
                        <span className="font-medium">{formatFileSize(sourceFile.size)}</span>
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="mb-2 text-sm font-medium">{t.backgroundRemover.upload.tipsTitle}</p>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-primary" />
                        <span>{t.backgroundRemover.upload.fileHint}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-primary" />
                        <span>{t.backgroundRemover.faq.note}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <ImagePlus className="mr-2 size-4" />
                      {sourceFile ? t.backgroundRemover.upload.replace : t.backgroundRemover.upload.select}
                    </Button>
                    <Button type="button" disabled={!canRemove} onClick={handleRemove}>
                      {isWorking ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Scissors className="mr-2 size-4" />}
                      {isWorking
                        ? t.backgroundRemover.actions.processing
                        : result
                          ? t.backgroundRemover.actions.retry
                          : t.backgroundRemover.actions.remove}
                    </Button>
                    {sourceFile && (
                      <Button type="button" variant="ghost" onClick={clearFile}>
                        {t.backgroundRemover.upload.clear}
                      </Button>
                    )}
                  </div>

                  {progressText && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3 py-1 text-xs text-muted-foreground">
                      {isWorking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                      <span>{progressText}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </FeatureCard>

          <FeatureCard className={panelClass}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {isWorking ? (
                  <div className="rounded-3xl border border-border/60 bg-background/70 p-16 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-3 text-sm text-foreground">{progressText || t.backgroundRemover.actions.processing}</p>
                  </div>
                ) : previewUrl || result?.url ? (
                  <div className="rounded-3xl border border-border/60 bg-[radial-gradient(120%_120%_at_10%_10%,hsl(var(--primary)/0.08),hsl(var(--background)))] p-5 text-foreground shadow-[0_30px_80px_-60px_hsl(var(--primary)/0.25)]">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                      <div className="rounded-3xl border border-border/60 bg-background/70 p-4 shadow-sm">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground">
                          {t.backgroundRemover.result.originalTag}
                        </div>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
                          {previewUrl ? (
                            <img src={previewUrl} alt={t.backgroundRemover.result.before} className="h-full w-full object-contain" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">-
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
                            {t.backgroundRemover.result.cutoutTag}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            disabled={!result?.url}
                            className="h-8 rounded-full border-border/60 bg-background/70 text-xs"
                          >
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            {t.backgroundRemover.result.download}
                          </Button>
                        </div>

                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60" style={checkerboardStyle}>
                          {result?.url ? (
                            <img src={result.url} alt={t.backgroundRemover.result.after} className="h-full w-full object-contain" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                              {t.backgroundRemover.result.waiting}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-border/60 bg-muted/20 p-16 text-center">
                    <Scissors className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">{t.backgroundRemover.result.emptyTitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t.backgroundRemover.result.emptyDescription}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </FeatureCard>

          <FeatureCard className={panelClass}>
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{t.backgroundRemover.howItWorks.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.backgroundRemover.howItWorks.description}</p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {howItWorks.map((item, index) => (
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
                  <h3 className="text-xl font-semibold text-foreground">{t.backgroundRemover.faq.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.backgroundRemover.faq.description}</p>
                </div>

                <div className="space-y-2">
                  {faqItems.map((item) => (
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
