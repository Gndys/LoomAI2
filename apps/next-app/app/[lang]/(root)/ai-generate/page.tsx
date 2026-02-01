'use client'

import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { useTranslation } from '@/hooks/use-translation'
import { FeaturePageShell, FeatureCard } from '@/components/feature-page-shell'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUploader } from './components/ImageUploader'
import { ResultDisplay } from './components/ResultDisplay'
import { PromptEditor } from './components/PromptEditor'
import { generateRandomPrompt, modelOptions, sizeOptions, styleOptions } from '@libs/ai/prompt-engine'

export default function AIGeneratePage() {
  const { t } = useTranslation()
  // 状态管理
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [showNegative, setShowNegative] = useState(false)
  const [size, setSize] = useState('Auto')
  const [style, setStyle] = useState('无风格')
  const [model, setModel] = useState('loom-pro')
  const [isGenerating, setIsGenerating] = useState(false)

  const hintItems = t.aiGenerate.hints
  const sizeLabels = t.aiGenerate.params.options?.size as Record<string, string> | undefined
  const styleLabels = t.aiGenerate.params.options?.style as Record<string, string> | undefined
  const modelLabels = t.aiGenerate.params.options?.model as Record<string, string> | undefined

  // 上传图片
  const handleImageUpload = (imageData: string) => {
    setUploadedImage(imageData)
    if (imageData) {
      toast.success(t.aiGenerate.toasts.uploadSuccess)
    }
  }

  const handleClearUpload = () => {
    setUploadedImage(null)
    setGeneratedImage(null)
    toast.info(t.aiGenerate.toasts.clearedUpload)
  }

  const handleInlineFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t.aiGenerate.upload.fileTooLarge)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      handleImageUpload(result)
    }
    reader.readAsDataURL(file)
  }

  // 清除所有设置
  const handleClear = () => {
    setPrompt('')
    setNegativePrompt('')
    setShowNegative(false)
    setSize('Auto')
    setStyle('无风格')
    toast.info(t.aiGenerate.toasts.clearedAll)
  }

  const handleRandom = () => {
    const randomPrompt = generateRandomPrompt()
    setPrompt(randomPrompt)
  }

  // 生成图片
  const handleGenerate = async () => {
    if (!uploadedImage || !prompt) {
      toast.error(t.aiGenerate.toasts.needUploadPrompt)
      return
    }

    setIsGenerating(true)
    setGeneratedImage(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: uploadedImage,
          prompt,
          negativePrompt: showNegative ? negativePrompt : '',
          size,
          style,
          model,
        }),
      })

      if (!response.ok) {
        throw new Error('生成失败')
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
      toast.success(t.aiGenerate.toasts.generateSuccess)
    } catch (error) {
      console.error('生成错误:', error)
      toast.error(t.aiGenerate.toasts.generateFailed)
    } finally {
      setIsGenerating(false)
    }
  }

  // 重新生成
  const handleRegenerate = () => {
    handleGenerate()
  }

  // 检查是否可以生成
  const canGenerate = uploadedImage && prompt && !isGenerating

  const panelClass =
    'border-border/60 bg-card/40 shadow-[0_30px_80px_-60px_hsl(var(--primary)/0.25)] backdrop-blur-xl'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <FeaturePageShell
        title={t.aiGenerate.title}
        description={t.aiGenerate.description}
        badge={{ icon: <Sparkles className="size-3.5" />, label: t.aiGenerate.badge }}
        className="max-w-6xl"
        titleClassName="text-3xl font-semibold tracking-tight sm:text-4xl text-foreground"
        descriptionClassName="text-sm sm:text-base text-muted-foreground"
        badgeClassName="border-border/60 bg-background/70 text-muted-foreground"
      >
        <div className="space-y-8">
          {/* 上传前：主舞台 + 上传引导 */}
          {!uploadedImage && (
            <div className="space-y-6">
              <FeatureCard className={panelClass}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {t.aiGenerate.preview.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {t.aiGenerate.preview.description}
                        </p>
                      </div>
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-border/60 bg-gradient-to-br from-foreground/5 via-foreground/2 to-transparent">
                        <div className="absolute inset-0 grid grid-cols-2">
                          <div className="relative">
                            <div className="absolute left-3 top-3 rounded-full bg-background/80 px-2 py-1 text-[10px] text-foreground/80">
                              {t.aiGenerate.preview.before}
                            </div>
                          </div>
                          <div className="relative">
                            <div className="absolute right-3 top-3 rounded-full bg-background/80 px-2 py-1 text-[10px] text-foreground/80">
                              {t.aiGenerate.preview.after}
                            </div>
                          </div>
                        </div>
                        <div className="absolute inset-y-0 left-1/2 w-px bg-border/80" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div className="h-10 w-10 rounded-full border border-border/60 bg-muted/30 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
                          {t.aiGenerate.preview.caption}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <ImageUploader
                        onUpload={handleImageUpload}
                        uploadedImage={uploadedImage}
                        variant="hero"
                        hints={hintItems}
                      />
                    </div>
                  </div>
                </CardContent>
              </FeatureCard>
            </div>
          )}

          {/* 上传后：左侧预览 + 右侧提示词与参数 */}
          {uploadedImage && (
            <FeatureCard className={panelClass}>
              <CardContent className="pt-6">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.2)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {t.aiGenerate.prompt.title}
                      </div>
                    </div>
                    <div>
                      <input
                        id="inline-image-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleInlineFileInput}
                        className="hidden"
                      />
                      <label
                        htmlFor="inline-image-upload"
                        className="inline-flex cursor-pointer items-center rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] text-foreground/80 hover:bg-muted/40 hover:text-foreground"
                      >
                        {t.aiGenerate.buttons.addImage}
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col lg:flex-row gap-4">
                    <div
                      className="relative shrink-0 rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 via-muted/10 to-transparent overflow-hidden"
                      style={{ aspectRatio: '1 / 1', width: '160px', maxWidth: '200px' }}
                    >
                      <Image
                        src={uploadedImage}
                        alt="Uploaded"
                        fill
                        className="object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleClearUpload}
                        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground hover:text-foreground"
                        aria-label={t.aiGenerate.buttons.reupload}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <PromptEditor
                      prompt={prompt}
                      negativePrompt={negativePrompt}
                      showNegative={showNegative}
                      onPromptChange={setPrompt}
                      onNegativePromptChange={setNegativePrompt}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger className="h-8 rounded-full border-border/60 bg-background/70 px-3 text-xs text-foreground/90">
                        <SelectValue placeholder={t.aiGenerate.params.sizePlaceholder} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border/60 text-foreground">
                        {sizeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                            {sizeLabels?.[option.value] ?? option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="h-8 rounded-full border-border/60 bg-background/70 px-3 text-xs text-foreground/90">
                        <SelectValue placeholder={t.aiGenerate.params.stylePlaceholder} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border/60 text-foreground">
                        {styleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                            {styleLabels?.[option.value] ?? option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 text-xs text-foreground/80">
                        <span>{t.aiGenerate.prompt.negativeLabel}</span>
                        <Switch checked={showNegative} onCheckedChange={setShowNegative} />
                      </div>

                      <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="h-8 rounded-md border-border/60 bg-background/60 px-3 text-xs text-foreground/80 hover:bg-muted/40">
                          <span className="text-xs text-foreground/80">模型：</span>
                          <SelectValue placeholder={t.aiGenerate.params.modelPlaceholder} />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border/60 text-foreground">
                          {modelOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                              {modelLabels?.[option.value] ?? option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                        className="h-9 rounded-full border-border/50 bg-background/60 px-4 text-xs text-foreground/85 shadow-sm hover:bg-muted/40 hover:text-foreground"
                      >
                        {t.aiGenerate.prompt.clear}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRandom}
                        className="h-9 rounded-full border-border/50 bg-background/60 px-4 text-xs text-foreground/85 shadow-sm hover:bg-muted/40 hover:text-foreground"
                      >
                        {t.aiGenerate.prompt.random}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleGenerate}
                        disabled={!canGenerate}
                        className="h-9 rounded-full px-5 text-xs font-medium text-background shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)] bg-foreground hover:opacity-90 disabled:opacity-50"
                      >
                        {isGenerating ? t.aiGenerate.generate.generating : t.aiGenerate.generate.button}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </FeatureCard>
          )}

          {/* 生成后：对比区域（生成中也显示） */}
          {(isGenerating || generatedImage) && (
            <FeatureCard className={panelClass}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {t.aiGenerate.comparison.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t.aiGenerate.comparison.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold mb-1 text-foreground">
                          {t.aiGenerate.comparison.reference}
                        </h3>
                        <p className="text-xs text-muted-foreground opacity-0" aria-hidden="true">
                          .
                        </p>
                      </div>
                      <div className="relative aspect-square rounded-2xl overflow-hidden border border-border/60 bg-muted/20">
                        {uploadedImage ? (
                          <Image
                            src={uploadedImage}
                            alt="Original"
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                            {t.aiGenerate.comparison.empty}
                          </div>
                        )}
                      </div>
                    </div>
                    <ResultDisplay
                      generatedImage={generatedImage}
                      isGenerating={isGenerating}
                      onRegenerate={handleRegenerate}
                    />
                  </div>
                </div>
              </CardContent>
            </FeatureCard>
          )}

          {/* 使用的提示词（生成后显示） */}
          {generatedImage && (
            <FeatureCard className={panelClass}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.aiGenerate.promptsUsed.title}
                  </p>
                  <p className="text-sm text-foreground">{prompt}</p>
                  {negativePrompt && (
                    <>
                      <p className="text-sm font-medium text-muted-foreground mt-3">
                        {t.aiGenerate.promptsUsed.negativeTitle}
                      </p>
                      <p className="text-sm text-foreground">{negativePrompt}</p>
                    </>
                  )}
                </div>
              </CardContent>
            </FeatureCard>
          )}
        </div>
      </FeaturePageShell>
    </div>
  )
}
