'use client'

import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from '@/hooks/use-translation'

interface PromptEditorProps {
  prompt: string
  negativePrompt: string
  showNegative: boolean
  onPromptChange: (prompt: string) => void
  onNegativePromptChange: (prompt: string) => void
}

export function PromptEditor({
  prompt,
  negativePrompt,
  showNegative,
  onPromptChange,
  onNegativePromptChange,
}: PromptEditorProps) {
  const { t } = useTranslation()

  return (
    <div className="flex-1 rounded-2xl border border-border/60 bg-background/60">
      <Textarea
        id="prompt"
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder={t.aiGenerate.prompt.positivePlaceholder}
        className="min-h-[140px] resize-none border-0 bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <div
        className={`px-3 py-2 ${
          showNegative ? 'border-t border-border/60' : 'border-t border-transparent'
        }`}
        aria-hidden={!showNegative}
      >
        <div
          className={`text-[11px] text-muted-foreground transition-opacity ${
            showNegative ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {t.aiGenerate.prompt.negativeLabel}
        </div>
        <Textarea
          id="negative-prompt"
          value={negativePrompt}
          onChange={(e) => onNegativePromptChange(e.target.value)}
          placeholder={t.aiGenerate.prompt.negativePlaceholder}
          tabIndex={showNegative ? 0 : -1}
          className={`mt-2 min-h-[70px] resize-none border-0 bg-transparent px-0 py-0 text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-opacity ${
            showNegative ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />
      </div>
    </div>
  )
}
