'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { sizeOptions, styleOptions, modelOptions } from '@libs/ai/prompt-engine'
import { useTranslation } from '@/hooks/use-translation'

interface ParamControlsProps {
  size: string
  style: string
  model: string
  onSizeChange: (size: string) => void
  onStyleChange: (style: string) => void
  onModelChange: (model: string) => void
}

export function ParamControls({
  size,
  style,
  model,
  onSizeChange,
  onStyleChange,
  onModelChange,
}: ParamControlsProps) {
  const { t } = useTranslation()
  const sizeLabels = t.aiGenerate.params.options?.size as Record<string, string> | undefined
  const styleLabels = t.aiGenerate.params.options?.style as Record<string, string> | undefined
  const modelLabels = t.aiGenerate.params.options?.model as Record<string, string> | undefined

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-1 text-foreground">{t.aiGenerate.params.title}</h3>
        <p className="text-xs text-muted-foreground">{t.aiGenerate.params.description}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 尺寸选择 */}
        <div className="space-y-2">
          <Label htmlFor="size-select" className="text-sm text-foreground">
            {t.aiGenerate.params.sizeLabel}
          </Label>
          <Select value={size} onValueChange={onSizeChange}>
            <SelectTrigger
              id="size-select"
              className="bg-background border-border/60 text-foreground focus:ring-primary/40"
            >
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
        </div>

        {/* 风格选择 */}
        <div className="space-y-2">
          <Label htmlFor="style-select" className="text-sm text-foreground">
            {t.aiGenerate.params.styleLabel}
          </Label>
          <Select value={style} onValueChange={onStyleChange}>
            <SelectTrigger
              id="style-select"
              className="bg-background border-border/60 text-foreground focus:ring-primary/40"
            >
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

        {/* 模型选择 */}
        <div className="space-y-2">
          <Label htmlFor="model-select" className="text-sm text-foreground">
            {t.aiGenerate.params.modelLabel}
          </Label>
          <Select value={model} onValueChange={onModelChange}>
            <SelectTrigger
              id="model-select"
              className="bg-background border-border/60 text-foreground focus:ring-primary/40"
            >
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
      </div>
    </div>
  )
}
