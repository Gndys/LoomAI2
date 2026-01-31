'use client'

import { Download, RefreshCw, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/use-translation'

interface ResultDisplayProps {
  generatedImage: string | null
  isGenerating: boolean
  onRegenerate?: () => void
}

export function ResultDisplay({ generatedImage, isGenerating, onRegenerate }: ResultDisplayProps) {
  const { t } = useTranslation()

  const handleDownload = () => {
    if (!generatedImage) return

    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `loom-ai-${Date.now()}.png`
    link.click()
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-1 text-foreground">{t.aiGenerate.result.title}</h3>
        <p className="text-xs text-muted-foreground">{t.aiGenerate.result.description}</p>
      </div>
      
      <div className="relative aspect-square border border-border/60 rounded-2xl overflow-hidden bg-gradient-to-b from-muted/30 to-transparent">
        {isGenerating ? (
          // 生成中
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-sm font-medium mb-1 text-foreground">{t.aiGenerate.result.generating}</p>
            <p className="text-xs text-muted-foreground">{t.aiGenerate.result.eta}</p>
            
            {/* 进度条 */}
            <div className="w-48 h-1.5 bg-muted/40 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-primary/80 animate-pulse" style={{ width: '65%' }} />
            </div>
          </div>
        ) : generatedImage ? (
          // 已生成
          <Image
            src={generatedImage}
            alt="Generated"
            fill
            className="object-contain"
          />
        ) : (
          // 等待生成
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">{t.aiGenerate.result.waiting}</p>
          </div>
        )}
      </div>
      
      {generatedImage && !isGenerating && (
        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {t.aiGenerate.result.download}
          </Button>
          <Button
            onClick={onRegenerate}
            variant="outline"
            className="flex-1 border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t.aiGenerate.result.regenerate}
          </Button>
        </div>
      )}
    </div>
  )
}
