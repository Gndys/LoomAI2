'use client'

import { useState } from 'react'
import { Dices, Trash2 } from 'lucide-react'
import { generateRandomPrompt } from '@libs/ai/prompt-engine'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/hooks/use-translation'

interface PromptEditorProps {
  prompt: string
  negativePrompt: string
  onPromptChange: (prompt: string) => void
  onNegativePromptChange: (prompt: string) => void
  onClear: () => void
}

export function PromptEditor({
  prompt,
  negativePrompt,
  onPromptChange,
  onNegativePromptChange,
  onClear,
}: PromptEditorProps) {
  const { t } = useTranslation()
  const [showNegative, setShowNegative] = useState(false)

  const handleRandom = () => {
    const randomPrompt = generateRandomPrompt()
    onPromptChange(randomPrompt)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-1 text-foreground">{t.aiGenerate.prompt.title}</h3>
        <p className="text-xs text-muted-foreground">{t.aiGenerate.prompt.description}</p>
      </div>
      
      {/* 正向提示词 */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-sm font-medium text-foreground">
          {t.aiGenerate.prompt.positiveLabel}
        </Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={t.aiGenerate.prompt.positivePlaceholder}
          className="min-h-[100px] resize-none bg-background border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
        />
      </div>
      
      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setShowNegative(!showNegative)}
          variant="outline"
          size="sm"
          className="border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
        >
          {showNegative ? t.aiGenerate.prompt.negativeToggleHide : t.aiGenerate.prompt.negativeToggleShow}
        </Button>
        
        <Button
          onClick={handleRandom}
          variant="outline"
          size="sm"
          className="border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
        >
          <Dices className="w-4 h-4 mr-1.5" />
          {t.aiGenerate.prompt.random}
        </Button>
        
        <Button
          onClick={onClear}
          variant="outline"
          size="sm"
          className="border-border/60 bg-background/70 text-foreground/90 hover:bg-muted/40 hover:text-foreground"
        >
          <Trash2 className="w-4 h-4 mr-1.5" />
          {t.aiGenerate.prompt.clear}
        </Button>
      </div>
      
      {/* 负面提示词（可展开） */}
      {showNegative && (
        <div className="space-y-2 pt-2 border-t border-border/60">
          <Label htmlFor="negative-prompt" className="text-sm font-medium text-foreground">
            {t.aiGenerate.prompt.negativeLabel}
            <span className="text-xs text-muted-foreground ml-2">{t.aiGenerate.prompt.negativeHint}</span>
          </Label>
          <Textarea
            id="negative-prompt"
            value={negativePrompt}
            onChange={(e) => onNegativePromptChange(e.target.value)}
            placeholder={t.aiGenerate.prompt.negativePlaceholder}
            className="min-h-[80px] resize-none bg-background border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
          />
        </div>
      )}
    </div>
  )
}
