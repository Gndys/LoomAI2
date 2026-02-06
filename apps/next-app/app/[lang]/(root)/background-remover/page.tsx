'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
} from 'react'
import { CheckCircle2, Download, ImagePlus, Loader2, Scissors, Upload, X } from 'lucide-react'
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
        className="max-w-5xl"
        badgeClassName="border-border/60 bg-background/70 text-muted-foreground"
      >
        <FeatureCard className={panelClass}>
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
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
                    className={`flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center transition-colors ${
                      isDragActive
                        ? 'border-primary/60 bg-primary/5'
                        : 'border-border/70 bg-muted/20 hover:border-foreground/30'
                    }`}
                  >
                    <div className="mb-3 rounded-full border border-border/60 bg-background/80 p-3">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-base font-medium">{t.backgroundRemover.upload.dropTitle}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t.backgroundRemover.upload.dropHint}</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/70">
                    <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
                      <p className="line-clamp-1 text-sm font-medium">{sourceFile?.name}</p>
                      <Button variant="ghost" size="icon" onClick={clearFile}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="relative h-[280px] sm:h-[340px]">
                      <img src={previewUrl} alt={t.backgroundRemover.result.before} className="h-full w-full object-contain p-3" />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {sampleCards.map((sample) => (
                    <Button key={sample.id} type="button" variant="outline" size="sm" onClick={() => useSample(sample.id)}>
                      {sample.title}
                    </Button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus className="mr-2 size-4" />
                    {sourceFile ? t.backgroundRemover.upload.replace : t.backgroundRemover.upload.select}
                  </Button>
                  <Button type="button" disabled={!sourceFile || isWorking} onClick={handleRemove}>
                    {isWorking ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Scissors className="mr-2 size-4" />}
                    {isWorking
                      ? t.backgroundRemover.actions.processing
                      : result
                        ? t.backgroundRemover.actions.retry
                        : t.backgroundRemover.actions.remove}
                  </Button>
                  <Button type="button" disabled={!result?.url} onClick={handleDownload}>
                    <Download className="mr-2 size-4" />
                    {t.backgroundRemover.result.download}
                  </Button>
                </div>

                {progressText && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3 py-1 text-xs text-muted-foreground">
                    {isWorking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    <span>{progressText}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">{t.backgroundRemover.result.title}</p>
                <div className="relative min-h-[340px] overflow-hidden rounded-2xl border border-border/70" style={checkerboardStyle}>
                  {result?.url ? (
                    <img src={result.url} alt={t.backgroundRemover.result.after} className="h-full w-full object-contain p-3" />
                  ) : (
                    <div className="flex h-full min-h-[340px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
                      {previewUrl ? t.backgroundRemover.result.waiting : t.backgroundRemover.result.emptyDescription}
                    </div>
                  )}
                </div>
              </div>
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
      </FeaturePageShell>
    </div>
  )
}
