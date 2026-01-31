'use client'

import { useCallback, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'

interface ImageUploaderProps {
  onUpload: (imageData: string) => void
  uploadedImage: string | null
  variant?: 'default' | 'hero'
  hints?: string[]
}

export function ImageUploader({
  onUpload,
  uploadedImage,
  variant = 'default',
  hints = [],
}: ImageUploaderProps) {
  const { t } = useTranslation()
  const [isHintHover, setIsHintHover] = useState(false)
  const [hoveredHint, setHoveredHint] = useState<string | null>(null)
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFile(file)
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [])

  const handleFile = (file: File) => {
    // 检查文件大小（最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert(t.aiGenerate.upload.fileTooLarge)
      return
    }

    // 转换为 base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      onUpload(result)
    }
    reader.readAsDataURL(file)
  }

  const handleClear = () => {
    onUpload('')
  }

  const isHero = variant === 'hero'
  const previewClass = isHero
    ? 'relative aspect-[16/10] border border-border/60 rounded-2xl overflow-hidden bg-muted/20'
    : 'relative aspect-square border border-border/60 rounded-2xl overflow-hidden bg-muted/20'
  const dropzoneClass = cn(
    isHero
      ? 'relative aspect-[16/10] border border-dashed border-border/60 rounded-2xl overflow-hidden bg-gradient-to-b from-muted/40 via-muted/20 to-transparent hover:border-border/80 transition-colors cursor-pointer'
      : 'relative aspect-square border border-dashed border-border/60 rounded-2xl overflow-hidden bg-gradient-to-b from-muted/30 via-muted/10 to-transparent hover:border-border/80 transition-colors cursor-pointer',
    isHintHover && 'border-primary/50 ring-1 ring-primary/30'
  )

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-1 text-foreground">{t.aiGenerate.upload.title}</h3>
        <p className="text-xs text-muted-foreground">{t.aiGenerate.upload.description}</p>
      </div>
      
      {uploadedImage ? (
        // 已上传状态
        <div className={previewClass}>
          <Image
            src={uploadedImage}
            alt="Uploaded"
            fill
            className="object-contain"
          />
          <Button
            onClick={handleClear}
            size="icon"
            variant="secondary"
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 text-foreground border border-border/60 hover:bg-background/90"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // 上传区域
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={dropzoneClass}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center h-full p-6">
            <div className="flex items-center justify-center rounded-full border border-dashed border-border/70 p-4 mb-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-sm mb-2 text-center text-foreground">
              {t.aiGenerate.upload.hint}
            </p>
            <p className="text-xs text-muted-foreground mb-4 text-center">
              {t.aiGenerate.upload.formats}
            </p>

            {isHero ? (
              <div className="mt-4 flex items-center gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-8 w-8 rounded-lg border border-border/60 bg-gradient-to-br from-muted/40 to-transparent"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4 text-xs text-muted-foreground space-y-1.5">
                <p className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{t.aiGenerate.upload.examples.flatLay}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{t.aiGenerate.upload.examples.sketch}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{t.aiGenerate.upload.examples.promo}</span>
                </p>
              </div>
            )}
          </label>
        </div>
      )}

      {!uploadedImage && hints.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          onMouseLeave={() => {
            setIsHintHover(false)
            setHoveredHint(null)
          }}
        >
          {hints.map((item) => (
            <span
              key={item}
              className="relative inline-flex items-center justify-center rounded-full border border-transparent bg-muted/30 px-3 py-1 text-[11px] text-muted-foreground/90 cursor-default transition-colors hover:border-primary/50"
              onMouseEnter={() => {
                setIsHintHover(true)
                setHoveredHint(item)
              }}
              onMouseLeave={() => setHoveredHint(null)}
            >
              <span
                className={cn(
                  'transition-all duration-300 ease-out',
                  hoveredHint === item ? 'opacity-0 blur-sm' : 'opacity-100 blur-0'
                )}
              >
                {item}
              </span>
              <span
                className={cn(
                  'pointer-events-none absolute inset-0 flex items-center justify-center text-foreground transition-all duration-300 ease-out',
                  hoveredHint === item ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
                )}
              >
                {t.aiGenerate.hoverHint}
              </span>
            </span>
          ))}
        </div>
      )}
      
      {uploadedImage && (
        <Button
          onClick={handleClear}
          variant="outline"
          size="sm"
          className="w-full border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
        >
          {t.aiGenerate.buttons.reupload}
        </Button>
      )}
    </div>
  )
}
