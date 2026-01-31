'use client'

import { Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/use-translation'

interface GenerateButtonProps {
  onClick: () => void
  disabled: boolean
  isGenerating: boolean
  credits?: number
}

export function GenerateButton({ onClick, disabled, isGenerating, credits = 10 }: GenerateButtonProps) {
  const { t, tWithParams } = useTranslation()
  const creditsText = tWithParams(t.aiGenerate.generate.credits, { credits: credits.toString() })

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isGenerating}
      size="lg"
      className="px-10 h-12 text-base font-semibold rounded-full bg-primary text-primary-foreground shadow-[0_12px_40px_-20px_hsl(var(--primary)/0.45)] hover:opacity-90 disabled:opacity-50"
    >
      <Rocket className="mr-2 h-5 w-5" />
      {isGenerating ? t.aiGenerate.generate.generating : t.aiGenerate.generate.button}
      {!isGenerating && <span className="ml-2 text-sm opacity-90">{creditsText}</span>}
    </Button>
  )
}
