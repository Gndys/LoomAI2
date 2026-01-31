'use client'

import { PromptTemplate } from '@libs/ai/prompt-engine'
import { cn } from '@/lib/utils'

interface FunctionSelectorProps {
  functions: PromptTemplate[]
  selectedId: string | null
  onSelect: (id: string) => void
  variant?: 'default' | 'compact'
}

export function FunctionSelector({
  functions,
  selectedId,
  onSelect,
  variant = 'default',
}: FunctionSelectorProps) {
  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">选择功能</h3>
          <p className="text-xs text-slate-400">快速选择一个处理类型</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {functions.map((func) => (
            <button
              key={func.id}
              onClick={() => onSelect(func.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all',
                'bg-white/5 border-white/10 text-slate-200 hover:border-sky-300/50',
                selectedId === func.id ? 'border-sky-300/70 bg-sky-400/10 text-white' : ''
              )}
            >
              <span className="text-sm">{func.icon}</span>
              <span>{func.name}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1 text-slate-100">选择功能</h3>
        <p className="text-xs text-slate-400">点击选择你需要的图片处理功能</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {functions.map((func) => (
          <button
            key={func.id}
            onClick={() => onSelect(func.id)}
            className={cn(
              'group relative overflow-hidden rounded-xl border px-3 py-3 text-left transition-all min-h-[96px]',
              'bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent',
              'border-white/10 hover:border-sky-300/50',
              selectedId === func.id
                ? 'border-sky-300/70 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]'
                : ''
            )}
          >
            {/* 图标 */}
            <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-base">
              {func.icon}
            </div>

            {/* 名称 */}
            <div className="font-semibold text-xs mb-1 text-slate-100">
              {func.name}
            </div>

            {/* 说明 */}
            <div className="text-[11px] text-slate-400 leading-snug">
              {func.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
