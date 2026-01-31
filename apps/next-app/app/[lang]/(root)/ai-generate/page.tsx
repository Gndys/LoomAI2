'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { useTranslation } from '@/hooks/use-translation'
import { FeaturePageShell, FeatureCard } from '@/components/feature-page-shell'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageUploader } from './components/ImageUploader'
import { ResultDisplay } from './components/ResultDisplay'
import { PromptEditor } from './components/PromptEditor'
import { ParamControls } from './components/ParamControls'
import { GenerateButton } from './components/GenerateButton'

export default function AIGeneratePage() {
  const { t } = useTranslation()
  // 状态管理
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [size, setSize] = useState('Auto')
  const [style, setStyle] = useState('无风格')
  const [model, setModel] = useState('loom-pro')
  const [isGenerating, setIsGenerating] = useState(false)

  const hintItems = t.aiGenerate.hints

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

  // 清除所有设置
  const handleClear = () => {
    setPrompt('')
    setNegativePrompt('')
    setSize('Auto')
    setStyle('无风格')
    toast.info(t.aiGenerate.toasts.clearedAll)
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
          negativePrompt,
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
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-foreground">
                      {t.aiGenerate.comparison.reference}
                    </div>
                    <div className="relative aspect-square rounded-2xl overflow-hidden border border-border/60 bg-muted/20">
                      <Image
                        src={uploadedImage}
                        alt="Uploaded"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearUpload}
                      className="w-full border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
                    >
                      {t.aiGenerate.buttons.changeImage}
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <PromptEditor
                      prompt={prompt}
                      negativePrompt={negativePrompt}
                      onPromptChange={setPrompt}
                      onNegativePromptChange={setNegativePrompt}
                      onClear={handleClear}
                    />

                    <ParamControls
                      size={size}
                      style={style}
                      model={model}
                      onSizeChange={setSize}
                      onStyleChange={setStyle}
                      onModelChange={setModel}
                    />

                    <div className="flex justify-end">
                      <GenerateButton
                        onClick={handleGenerate}
                        disabled={!canGenerate}
                        isGenerating={isGenerating}
                      />
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
                      <p className="text-xs text-muted-foreground">
                        {t.aiGenerate.comparison.reference}
                      </p>
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
