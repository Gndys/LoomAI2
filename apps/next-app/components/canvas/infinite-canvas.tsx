'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { nanoid } from 'nanoid'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bot,
  Bold,
  ChevronDown,
  Download,
  DraftingCompass,
  Hand,
  History,
  ImagePlus,
  Italic,
  Moon,
  Eye,
  EyeOff,
  MessageSquare,
  MoreHorizontal,
  MousePointer2,
  Megaphone,
  Lock,
  Loader2,
  Unlock,
  Palette,
  PencilLine,
  RefreshCcw,
  Share2,
  Sparkles,
  Sun,
  Trash2,
  Type,
  Upload,
  Underline,
  Wand2,
  Square,
  Scissors,
  Copy,
  Layers,
  Plus,
  X,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import type { FileUIPart, UIMessage } from 'ai'
import { authClientReact } from '@libs/auth/authClient'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from '@/hooks/use-theme'
import { type ColorScheme, THEME_CONFIG } from '@libs/ui/themes'
import { getAllFunctions } from '@libs/ai/prompt-engine'
import { config } from '@config'

type CanvasBaseItem = {
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  label?: string
  hidden?: boolean
  locked?: boolean
}

type CanvasImageItem = CanvasBaseItem & {
  type: 'image'
  data: {
    src: string
    generation?: CanvasImageGenerationState
    key?: string
    provider?: string
    expiresAt?: string
    name?: string
    meta?: {
      source:
        | 'upload'
        | 'generate'
        | 'remove-background'
        | 'layered'
        | 'duplicate'
        | 'import'
        | 'lasso'
        | 'lasso-edit'
        | 'lasso-mark'
      model?: string
      provider?: string
      prompt?: string
      size?: string
      derivedFromId?: string
      createdAt?: string
    }
  }
}

type CanvasImageGenerationState = {
  status: 'pending'
  progress: number
  startedAt: string
}

type CanvasTextItem = CanvasBaseItem & {
  type: 'text'
  data: {
    text: string
    fontSize: number
    color: string
    backgroundColor: string
    strokeColor: string
    strokeWidth: number
    fontFamily: string
    fontWeight: number
    fontStyle: 'normal' | 'italic'
    textDecoration: 'none' | 'underline'
    align: 'left' | 'center' | 'right' | 'justify'
    noteStyle?: boolean
    noteTone?: 'neutral' | 'sticky'
  }
}

type CanvasItem = CanvasImageItem | CanvasTextItem

type CameraState = {
  x: number
  y: number
  scale: number
}

type DragState =
  | {
      kind: 'pan'
      startX: number
      startY: number
      cameraX: number
      cameraY: number
    }
  | {
      kind: 'item'
      id: string
      startWorldX: number
      startWorldY: number
      itemX: number
      itemY: number
      groupIds?: string[]
      groupPositions?: Array<{ id: string; x: number; y: number }>
    }
  | {
      kind: 'resize'
      id: string
      corner: 'tl' | 'tr' | 'bl' | 'br' | 'tm' | 'bm' | 'ml' | 'mr'
      startWorldX: number
      startWorldY: number
      startWidth: number
      startHeight: number
      itemX: number
      itemY: number
      startFontSize?: number
    }
  | {
      kind: 'select'
      startWorldX: number
      startWorldY: number
      currentWorldX: number
      currentWorldY: number
      additive: boolean
    }

type LassoPoint = {
  x: number
  y: number
}

type LassoState = {
  itemId: string
  points: LassoPoint[]
  isDrawing: boolean
  closed: boolean
}

type CanvasChatAgentSource = 'builtin' | 'custom'

type CanvasChatAgent = {
  id: string
  name: string
  source: CanvasChatAgentSource
  systemPrompt: string
  starterPrompts: string[]
}

type CanvasChatHistoryItem = {
  id: string
  title: string
  agentId: string
  updatedAt: string
  messages: UIMessage[]
}

const STORAGE_KEY = 'loomai:canvas:phase0'
const SEED_STORAGE_KEY = 'loomai:canvas:seed'
const CHAT_AGENT_STORAGE_KEY = 'loomai:canvas:chat-agents:v1'
const CHAT_HISTORY_STORAGE_KEY = 'loomai:canvas:chat-history:v1'
const CHAT_AGENT_NONE_VALUE = '__none__'
const MAX_CHAT_HISTORY = 20
const MIN_SCALE = 0.2
const MAX_SCALE = 4
const ZOOM_SPEED = 0.0015
const MAX_FILE_SIZE_MB = 10
const USE_MOCK_UPLOAD = true
const MAX_PERSISTED_SRC_LENGTH = 200_000
const MAX_PERSISTED_TOTAL_LENGTH = 3_000_000
const DUPLICATE_OFFSET = 24
const SIGNED_URL_REFRESH_BUFFER_MS = 2 * 60 * 1000
const DEFAULT_TEXT = '双击编辑文字'
const DEFAULT_TEXT_SIZE = 28
const DEFAULT_TEXT_BOX_WIDTH = 320
const DEFAULT_TEXT_BOX_HEIGHT = 56
const MIN_TEXT_FONT_SIZE = 12
const MAX_TEXT_FONT_SIZE = 160
const MIN_TEXT_WIDTH = 40
const MIN_TEXT_HEIGHT = 24
const TEXT_PADDING_X = 16
const TEXT_PADDING_Y = 10
const DEFAULT_TEXT_COLOR = 'hsl(var(--foreground))'
const DEFAULT_TEXT_BACKGROUND = 'transparent'
const DEFAULT_TEXT_STROKE = 'transparent'
const DEFAULT_TEXT_STROKE_WIDTH = 0
const DEFAULT_TEXT_FONT_FAMILY = 'inherit'
const DEFAULT_TEXT_FONT_WEIGHT = 500
const NOTE_CHUNK_TARGET = 140
const NOTE_CHUNK_MAX = 200
const NOTE_LAYOUT_GAP_X = 24
const NOTE_LAYOUT_GAP_Y = 20
const NOTE_FONT_SIZE = 14
const NOTE_PADDING_X = 12
const NOTE_PADDING_Y = 8
const NOTE_RADIUS = 14
const NOTE_STICKY_TEXT_COLOR = '#713f12'
const NOTE_STICKY_BACKGROUND_COLOR = '#fef9c3'
const NOTE_STICKY_BORDER_COLOR = '#fde68a'
const NOTE_NEUTRAL_TEXT_COLOR = '#0f172a'
const NOTE_NEUTRAL_BACKGROUND_COLOR = '#f1f5f9'
const NOTE_NEUTRAL_BORDER_COLOR = '#e2e8f0'
const CHAT_BUBBLE_FONT_SIZE = 14
const CHAT_BUBBLE_MAX_WIDTH = 300
const CHAT_BUBBLE_FALLBACK_USER_BG = '#0f766e'
const CHAT_BUBBLE_FALLBACK_ASSISTANT_BG = '#e2e8f0'
const CHAT_BUBBLE_FALLBACK_ASSISTANT_TEXT = '#0f172a'
const IMAGE_ITEM_MAX_SIDE = 520
const PENDING_IMAGE_MAX_PROGRESS = 94
const PENDING_IMAGE_PLACEHOLDER_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
const MAX_CHAT_AGENT_NAME_LENGTH = 20
const MAX_CHAT_AGENT_PROMPT_LENGTH = 6000
const MAX_CUSTOM_CHAT_AGENT_COUNT = 20
const EXPORT_PADDING = 48
const MAX_EXPORT_SIZE = 8192
const DEBUG_CANVAS = false
const FASHION_TREND_AGENT_ID = 'fashion-trend-expert'
const FASHION_TREND_IMAGE_MODEL = 'z-image'

const FASHION_TREND_AGENT_SYSTEM_PROMPT = `你是一个**爆款服装拆解与预测专家**，而我是一个完全不懂时尚、不懂市场、不懂设计的小白。

我现在有一个非常贪婪的需求：我想通过分析一张服装图片，就能预测出下一个爆款，并且能直接生成图片。但我什么都不会，我需要你成为这个领域的绝对专家来帮我。

## 我的具体需求：

当我给你一张人物穿着服装的图片时，你需要：

### 第一步：深度拆解爆火原因
请像一个资深时尚买手+数据分析师+心理学家一样，从以下维度分析：
- **视觉冲击力**：配色、衣服的整体形状、材质、细节设计有什么独特之处？
- **情绪价值**：这套服装传递了什么情绪？（松弛感/高级感/叛逆感/少女感等）
- **社交货币**：为什么人们愿意分享？（好看/有趣/有共鸣/显身份）
- **流行趋势契合度**：符合当下哪些流行元素？（多巴胺穿搭/老钱风/Y2K/山系等）
- **穿搭场景**：适合什么场景？目标人群是谁？
- **价格带预判**：这个风格对应什么消费层级？

### 第二步：爆款预测（这是最关键的！）
基于第一步分析，给我 **3-5 个具体的爆款方向预测**，每个预测包括：
- **预测方向**：例如“同色系但增加解构设计”“保留版型但换成更大胆的配色”
- **爆火逻辑**：为什么这个方向会火？基于什么人群洞察或趋势判断？
- **差异化亮点**：和原图相比，创新点在哪里？
- **适用场景**：什么人会买？在哪里穿？

### 第三步：生成可直接使用的 AI 绘图提示词
针对每个爆款预测，给我**完整的、可直接复制使用的 Midjourney/Stable Diffusion 提示词**，格式如下：

【预测方向名称】
提示词（英文）：
[示例格式如下]
[详细的服装描述], [风格关键词], [材质细节], [配色方案], [拍摄角度], [光线氛围], [模特姿态], --ar 3:4 --style raw --v 6

提示词（中文翻译）：
[方便我理解的中文版本]

关键参数说明：
- 为什么用这个风格参数
- 为什么选择这个比例
- 其他重要参数的作用

## 重要提醒：
1. 别用专业术语糊弄我，要用大白话解释。
2. 给我具体、可执行建议，不要空话。
3. 提示词必须完整到可直接复制粘贴。
4. 每个判断都要告诉我“为什么”。

## 输出格式
必须按下面结构输出：

---
## 📸 原图分析

### 爆火原因拆解
1. **视觉冲击力**：[具体分析]
2. **情绪价值**：[具体分析]
3. **社交货币**：[具体分析]
4. **流行趋势**：[具体分析]
5. **核心卖点总结**：[一句话概括]

---
## 🔥 爆款预测

### 预测方向1：[名称]
**爆火逻辑**：[为什么会火]
**差异化亮点**：[创新点]
**目标人群**：[谁会买]

**AI生图提示词**：
[完整英文提示词]
中文翻译：[...]
参数说明：[...]

（方向2~方向5同格式）

---
## 💡 额外建议
[告诉我哪个方向最容易起量、哪个方向利润空间大]

最后必须单独询问我：“是否要我现在直接生成图片？回复‘同意生成方向1/2/3...’即可开始。”
在我明确同意前，不要直接进入生图执行。`

const BUILTIN_CHAT_AGENTS: CanvasChatAgent[] = [
  {
    id: 'designer',
    name: '智能设计师',
    source: 'builtin',
    systemPrompt:
      '你是服装设计场景里的智能设计师。回答时先给结论，再给3条可执行建议；语言简洁，避免空泛表达；若信息不足先提最多2个澄清问题。',
    starterPrompts: ['给我 3 个构图方案', '把当前思路整理成步骤', '总结当前画布并给改进建议'],
  },
  {
    id: 'color',
    name: '配色顾问',
    source: 'builtin',
    systemPrompt:
      '你是配色顾问，专注服装配色与系列化建议。优先输出主色/辅色/点缀色与比例，并补充场景适配和避坑建议。',
    starterPrompts: ['给我配色建议', '给我 2 套春夏配色方案', '按通勤场景优化当前配色'],
  },
  {
    id: 'pattern',
    name: '版型顾问',
    source: 'builtin',
    systemPrompt:
      '你是版型顾问，擅长结构拆解和工艺表达。回答时尽量用“版型要点/工艺要点/风险点”三段式，便于直接执行。',
    starterPrompts: ['总结当前选中对象', '给我版型优化建议', '把这个需求拆成打版步骤'],
  },
  {
    id: FASHION_TREND_AGENT_ID,
    name: '爆款服装拆解与预测专家',
    source: 'builtin',
    systemPrompt: FASHION_TREND_AGENT_SYSTEM_PROMPT,
    starterPrompts: [
      '分析这张穿搭图：拆解爆火原因并给我 3 个爆款方向',
      '按小白能看懂的方式输出，并附上完整可复制提示词',
      '给我方向 1~3，并告诉我是否要直接生成图片',
    ],
  },
]

const normalizeAgentName = (value: string) => value.trim().slice(0, MAX_CHAT_AGENT_NAME_LENGTH)
const normalizeAgentPrompt = (value: string) => value.trim().slice(0, MAX_CHAT_AGENT_PROMPT_LENGTH)

const buildChatWelcomeMessage = (agentName?: string): UIMessage => ({
  id: `canvas-assistant-welcome-${nanoid(8)}`,
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: agentName
        ? `你好！我是${agentName}，把需求告诉我，我会给你可执行的建议。`
        : '你好！把需求告诉我，我可以帮你分析图片、给出建议或总结。',
    },
  ],
})

const normalizeChatHistoryMessages = (source: UIMessage[]) =>
  source.map((message) => {
    const parts = (message as UIMessage & { parts?: unknown }).parts
    const content = (message as UIMessage & { content?: unknown }).content
    const files = (message as UIMessage & { files?: unknown }).files
    const attachments = (message as UIMessage & { attachments?: unknown }).attachments
    const experimentalAttachments = (message as UIMessage & { experimental_attachments?: unknown }).experimental_attachments
    return {
      id: message.id,
      role: message.role,
      ...(parts ? { parts } : {}),
      ...(content ? { content } : {}),
      ...(files ? { files } : {}),
      ...(attachments ? { attachments } : {}),
      ...(experimentalAttachments ? { experimental_attachments: experimentalAttachments } : {}),
    } as UIMessage
  })

const normalizeAgentStarterPrompts = (value: unknown) => {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean)
    .slice(0, 5)
}

const toCustomChatAgent = (value: unknown): CanvasChatAgent | null => {
  if (!value || typeof value !== 'object') return null
  const source = (value as { source?: unknown }).source
  if (source !== 'custom') return null
  const name = normalizeAgentName(String((value as { name?: unknown }).name ?? ''))
  const systemPrompt = normalizeAgentPrompt(String((value as { systemPrompt?: unknown }).systemPrompt ?? ''))
  if (!name || !systemPrompt) return null
  const rawId = (value as { id?: unknown }).id
  const id = typeof rawId === 'string' && rawId.trim() ? rawId.trim() : `custom-${nanoid(10)}`
  return {
    id,
    name,
    source: 'custom',
    systemPrompt,
    starterPrompts: normalizeAgentStarterPrompts((value as { starterPrompts?: unknown }).starterPrompts),
  }
}

type SignedUrlPayload = {
  url: string
  key?: string
  provider?: string
  expiresAt?: string
}

const parseAmzDate = (value: string) => {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/)
  if (!match) return null
  const [, year, month, day, hour, minute, second] = match
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)))
}

const parseUrlExpiry = (src: string) => {
  try {
    const url = new URL(src)
    const expires = url.searchParams.get('Expires')
    if (expires) {
      const expiresAt = Number(expires) * 1000
      if (Number.isFinite(expiresAt)) return expiresAt
    }
    const amzDate = url.searchParams.get('X-Amz-Date')
    const amzExpires = url.searchParams.get('X-Amz-Expires')
    if (amzDate && amzExpires) {
      const parsed = parseAmzDate(amzDate)
      const ttl = Number(amzExpires) * 1000
      if (parsed && Number.isFinite(ttl)) {
        return parsed.getTime() + ttl
      }
    }
  } catch {
    return null
  }
  return null
}

const isSignedUrlExpiring = (src: string, expiresAt?: string) => {
  const parsedExpiry = expiresAt ? new Date(expiresAt).getTime() : parseUrlExpiry(src)
  if (!Number.isFinite(parsedExpiry) || !parsedExpiry) return false
  return parsedExpiry - Date.now() < SIGNED_URL_REFRESH_BUFFER_MS
}

const parseStorageKeyFromUrl = (src: string) => {
  try {
    const url = new URL(src)
    const pathname = decodeURIComponent(url.pathname || '')
    const key = pathname.replace(/^\/+/, '')
    return key || null
  } catch {
    return null
  }
}

const TEXT_STROKE_COLORS = [
  { value: 'transparent', label: '无' },
  { value: '#0f172a', label: '黑' },
  { value: '#ef4444', label: '红' },
  { value: '#22c55e', label: '绿' },
  { value: '#3b82f6', label: '蓝' },
  { value: '#f97316', label: '橙' },
  { value: '#ffffff', label: '白' },
]

const TEXT_BACKGROUND_COLORS = [
  { value: 'transparent', label: '无' },
  { value: '#fff7ed', label: '米' },
  { value: '#fee2e2', label: '粉' },
  { value: '#dbeafe', label: '蓝' },
  { value: '#dcfce7', label: '绿' },
  { value: '#fef9c3', label: '黄' },
  { value: '#ede9fe', label: '紫' },
]

const TEXT_FONT_OPTIONS = [
  { value: 'inherit', label: '读取系统字体' },
  { value: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif', label: 'Inter' },
  { value: '"PingFang SC", "Microsoft YaHei", sans-serif', label: '苹方' },
  { value: '"Noto Sans SC", "Microsoft YaHei", sans-serif', label: 'Noto Sans' },
  { value: '"Source Han Sans SC", "Microsoft YaHei", sans-serif', label: '思源黑体' },
  { value: '"Times New Roman", serif', label: 'Times' },
  { value: '"Georgia", serif', label: 'Georgia' },
  { value: '"Courier New", monospace', label: 'Courier' },
]

const TEXT_SIZE_PRESETS = [
  { id: 'xs', label: 'XS', size: 14 },
  { id: 's', label: 'S', size: 18 },
  { id: 'm', label: 'M', size: 28 },
  { id: 'l', label: 'L', size: 36 },
  { id: 'xl', label: 'XL', size: 48 },
]

const RESIZE_HANDLES = [
  { id: 'tl', className: '-left-1.5 -top-1.5', cursor: 'nwse-resize' },
  { id: 'tm', className: 'left-1/2 -top-1.5 -translate-x-1/2', cursor: 'ns-resize' },
  { id: 'tr', className: '-right-1.5 -top-1.5', cursor: 'nesw-resize' },
  { id: 'ml', className: '-left-1.5 top-1/2 -translate-y-1/2', cursor: 'ew-resize' },
  { id: 'mr', className: '-right-1.5 top-1/2 -translate-y-1/2', cursor: 'ew-resize' },
  { id: 'bl', className: '-left-1.5 -bottom-1.5', cursor: 'nesw-resize' },
  { id: 'bm', className: 'left-1/2 -bottom-1.5 -translate-x-1/2', cursor: 'ns-resize' },
  { id: 'br', className: '-right-1.5 -bottom-1.5', cursor: 'nwse-resize' },
] as const

type ToolId = 'select' | 'hand' | 'text' | 'image' | 'shape'

const CANVAS_PRESET_ICON_MAP: Record<string, LucideIcon> = {
  'flat-lay': ImagePlus,
  sketch: PencilLine,
  promo: Megaphone,
  pattern: DraftingCompass,
  recolor: Palette,
}

const CANVAS_PRESET_ACTIONS = getAllFunctions().map((preset) => ({
  id: preset.id,
  name: preset.name,
  description: preset.description,
  Icon: CANVAS_PRESET_ICON_MAP[preset.id] ?? Sparkles,
  prompt: preset.positive,
}))

const IMAGE_PROVIDER_LABELS = {
  evolink: 'EvoLink',
} as const

const isSquareOnlyEvolinkModel = (model: string) => model === 'z-image'

const resolveCanvasReferenceImageLimit = (model: string) => {
  if (model === 'z-image') return 0
  const limits = (config.aiImage.referenceImageLimits?.evolink ?? {}) as Record<string, number>
  const fallback = config.aiImage.referenceImageFallback ?? 1
  const limit = limits[model]
  return typeof limit === 'number' ? Math.max(0, limit) : fallback
}

const resolveDefaultEvolinkSize = (model: string) =>
  isSquareOnlyEvolinkModel(model)
    ? '1:1'
    : (config.aiImage.defaults.size ?? config.aiImage.evolinkSizes[0]?.value)

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const fitImageToCanvasSize = (intrinsicWidth: number, intrinsicHeight: number, maxSide = IMAGE_ITEM_MAX_SIDE) => {
  const scale = Math.min(1, maxSide / Math.max(intrinsicWidth, intrinsicHeight))
  return {
    width: Math.max(1, Math.round(intrinsicWidth * scale)),
    height: Math.max(1, Math.round(intrinsicHeight * scale)),
  }
}

const resolvePendingImageDimensions = (size?: string) => {
  if (!size || size === 'auto') {
    return fitImageToCanvasSize(1024, 1024)
  }

  const customMatch = size.match(/^(\d{2,4})x(\d{2,4})$/i)
  if (customMatch) {
    const width = Number(customMatch[1])
    const height = Number(customMatch[2])
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      return fitImageToCanvasSize(width, height)
    }
  }

  const ratioMatch = size.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/)
  if (ratioMatch) {
    const ratioW = Number(ratioMatch[1])
    const ratioH = Number(ratioMatch[2])
    if (Number.isFinite(ratioW) && Number.isFinite(ratioH) && ratioW > 0 && ratioH > 0) {
      return fitImageToCanvasSize(ratioW * 1000, ratioH * 1000)
    }
  }

  return fitImageToCanvasSize(1024, 1024)
}

const buildTextStrokeShadow = (color: string, width: number) => {
  if (!color || color === 'transparent' || width <= 0) return 'none'
  const w = Math.max(1, Math.round(width))
  const offsets = [-w, 0, w]
  const shadows: string[] = []
  offsets.forEach((x) => {
    offsets.forEach((y) => {
      if (x === 0 && y === 0) return
      shadows.push(`${x}px ${y}px 0 ${color}`)
    })
  })
  return shadows.join(', ')
}

const wrapCanvasText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  if (maxWidth <= 0) return text.split('\n')
  const lines: string[] = []
  const paragraphs = text.split('\n')
  paragraphs.forEach((paragraph, paragraphIndex) => {
    if (paragraph.length === 0) {
      lines.push('')
      return
    }
    let line = ''
    for (const char of paragraph) {
      const testLine = line + char
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line)
        line = char
      } else {
        line = testLine
      }
    }
    if (line) lines.push(line)
  })
  return lines
}

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

const isMultiSelectModifier = (event: Pick<KeyboardEvent, 'shiftKey' | 'metaKey' | 'ctrlKey'>) =>
  event.shiftKey || event.metaKey || event.ctrlKey

const normalizeRect = (startX: number, startY: number, endX: number, endY: number) => {
  const left = Math.min(startX, endX)
  const top = Math.min(startY, endY)
  return {
    x: left,
    y: top,
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
  }
}

const rectsIntersect = (
  rectA: { x: number; y: number; width: number; height: number },
  rectB: { x: number; y: number; width: number; height: number }
) =>
  rectA.x <= rectB.x + rectB.width &&
  rectA.x + rectA.width >= rectB.x &&
  rectA.y <= rectB.y + rectB.height &&
  rectA.y + rectA.height >= rectB.y

type PromptExtraction = {
  body: string
  prompt?: string
}

type FashionPromptDraft = {
  sourceMessageId: string
  prompts: string[]
}

const PROMPT_SECTION_REGEX =
  /^\s*(提示词(?:（英文）|（中文翻译）|\(英文\)|\(中文翻译\))?|英文提示词|中文提示词|正向提示词|负向提示词|prompt(?:\s*\(english\)|\s*\(chinese\))?|positive prompt|negative prompt)\s*(?:[:：]\s*(.*))?$/i

const hasPromptLabel = (text: string) =>
  text.includes('提示词') || text.toLowerCase().includes('prompt')

const isGenericPromptLabel = (label: string) => /^(提示词|prompt)$/i.test(label.trim())
const ENGLISH_PROMPT_SECTION_REGEX =
  /(?:提示词（英文）|提示词\(英文\)|英文提示词|english prompt|prompt\s*\(english\))\s*(?:[:：]\s*)?(?:```(?:[\w-]+)?\s*([\s\S]*?)```|([^\n]+))/gi
const CODE_BLOCK_REGEX = /```(?:[\w-]+)?\s*([\s\S]*?)```/g
const GENERATE_INTENT_REGEX = /(生成|生图|出图|画图|render|generate)/i
const GENERATE_NEGATIVE_REGEX = /(不生成|先别生成|暂不生成|不要生成|not\s+generate|don't\s+generate|do\s+not\s+generate)/i
const GENERATE_CONFIRM_SET = new Set([
  '好',
  '好的',
  '同意',
  '可以',
  '行',
  '确认',
  '确定',
  '开始',
  'yes',
  'ok',
  'okay',
  'go',
])
const CHINESE_NUMERAL_MAP: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
}

const normalizeGenerationIntent = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[，。！？!?,.;；:："“”'‘’`~·（）()【】\[\]{}]/g, '')

const shouldTriggerPromptGeneration = (text: string) => {
  const value = text.trim()
  if (!value) return false
  if (GENERATE_NEGATIVE_REGEX.test(value)) return false
  const normalized = normalizeGenerationIntent(value)
  return GENERATE_CONFIRM_SET.has(normalized) || GENERATE_INTENT_REGEX.test(value)
}

const resolvePromptDirectionIndex = (text: string, total: number) => {
  if (total <= 1) return 0
  const match = text.match(/(?:方向|方案|第)\s*([1-5一二三四五])(?:\s*(?:个|条|种|款|版))?/i)
  const raw = match?.[1]
  if (!raw) return 0
  const index = Number(raw)
  if (Number.isFinite(index)) {
    return clamp(index - 1, 0, total - 1)
  }
  const mapped = CHINESE_NUMERAL_MAP[raw]
  if (!mapped) return 0
  return clamp(mapped - 1, 0, total - 1)
}

const buildChatTextMessage = (role: 'user' | 'assistant', text: string): UIMessage => ({
  id: `canvas-chat-${role}-${nanoid(8)}`,
  role,
  parts: [{ type: 'text', text }],
})

const extractPromptFromText = (text: string): PromptExtraction => {
  if (!hasPromptLabel(text)) return { body: text }
  const lines = text.split(/\r?\n/)
  const bodyLines: string[] = []
  const promptBlocks: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const match = line.match(PROMPT_SECTION_REGEX)
    if (!match) {
      bodyLines.push(line)
      i += 1
      continue
    }

    const label = match[1].trim()
    const inline = (match[2] ?? '').trim()
    const isGeneric = isGenericPromptLabel(label)

    if (inline) {
      promptBlocks.push(isGeneric ? inline : `${label}：${inline}`)
      i += 1
      continue
    }

    const collected: string[] = []
    let j = i + 1
    while (j < lines.length) {
      const nextLine = lines[j]
      if (nextLine.trim() === '') break
      if (PROMPT_SECTION_REGEX.test(nextLine)) break
      collected.push(nextLine)
      j += 1
    }

    if (collected.length > 0) {
      promptBlocks.push(isGeneric ? collected.join('\n') : `${label}：\n${collected.join('\n')}`)
    } else if (!isGeneric) {
      promptBlocks.push(`${label}：`)
    }

    let nextIndex = j
    if (nextIndex < lines.length && lines[nextIndex].trim() === '') {
      nextIndex += 1
    }
    i = nextIndex
  }

  const body = bodyLines.join('\n').trim()
  const prompt = promptBlocks.join('\n').trim()
  return {
    body,
    prompt: prompt || undefined,
  }
}

const resolveCanvasMessageText = (message: UIMessage) => {
  const parts = (message as UIMessage & { parts?: { type: string; text?: string }[] }).parts
  if (Array.isArray(parts) && parts.length > 0) {
    return parts
      .map((part) => (part.type === 'text' ? part.text ?? '' : ''))
      .join('')
      .trim()
  }
  return (message as UIMessage & { content?: string }).content ?? ''
}

const extractEnglishPromptCandidates = (text: string) => {
  const value = text.trim()
  if (!value) return []
  const candidates: string[] = []
  const seen = new Set<string>()
  const pushCandidate = (candidate: string) => {
    const normalized = candidate.replace(/\r\n/g, '\n').trim()
    if (!normalized) return
    if (normalized.length < 24) return
    if (seen.has(normalized)) return
    seen.add(normalized)
    candidates.push(normalized)
  }

  for (const match of value.matchAll(ENGLISH_PROMPT_SECTION_REGEX)) {
    pushCandidate((match[1] ?? match[2] ?? '').trim())
  }

  for (const match of value.matchAll(CODE_BLOCK_REGEX)) {
    const block = (match[1] ?? '').trim()
    if (!block) continue
    if (/--ar\s*\d+:\d+|--v\s*\d+|--style\s+\w+/i.test(block)) {
      pushCandidate(block)
    }
  }

  if (candidates.length === 0) {
    const fallbackPrompt = extractPromptFromText(value).prompt
    if (fallbackPrompt) {
      pushCandidate(fallbackPrompt)
    }
  }

  return candidates.slice(0, 5)
}

export function InfiniteCanvas() {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dragStateRef = useRef<DragState | null>(null)
  const storageDisabledRef = useRef(false)
  const warnedLargeItemsRef = useRef(false)
  const textEditRef = useRef<HTMLTextAreaElement | null>(null)
  const textStylePanelRef = useRef<HTMLDivElement | null>(null)
  const lastTextClickRef = useRef<{ id: string | null; time: number }>({ id: null, time: 0 })
  const refreshingSignedUrlsRef = useRef<Record<string, Promise<SignedUrlPayload | null>>>({})
  const lassoPointerIdRef = useRef<number | null>(null)
  const lassoStateRef = useRef<LassoState | null>(null)
  const itemsRef = useRef<CanvasItem[]>([])
  const loadedImagesRef = useRef<Record<string, boolean>>({})
  const brokenImagesRef = useRef<Record<string, boolean>>({})
  const imageLoadRetryTimersRef = useRef<Record<string, number>>({})
  const refreshingImageUrlsRef = useRef<Record<string, boolean>>({})

  const [camera, setCamera] = useState<CameraState>({ x: 0, y: 0, scale: 1 })
  const [items, setItems] = useState<CanvasItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSpaceDown, setIsSpaceDown] = useState(false)
  const [isPointerInViewport, setIsPointerInViewport] = useState(false)
  const [dragMode, setDragMode] = useState<'pan' | 'item' | 'resize' | 'select' | null>(null)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})
  const [brokenThumbnails, setBrokenThumbnails] = useState<Record<string, boolean>>({})
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const [removingBackgroundIds, setRemovingBackgroundIds] = useState<Record<string, boolean>>({})
  const [decomposingLayerIds, setDecomposingLayerIds] = useState<Record<string, boolean>>({})
  const [layerDecomposeCount, setLayerDecomposeCount] = useState(4)
  const [layerGuidanceScale, setLayerGuidanceScale] = useState(5)
  const [activeTool, setActiveTool] = useState<ToolId>('select')
  const [backgroundMode, setBackgroundMode] = useState<'solid' | 'transparent'>('solid')
  const [backgroundIntensity, setBackgroundIntensity] = useState<'low' | 'medium' | 'high'>('medium')
  const [backgroundSpacing, setBackgroundSpacing] = useState<'tight' | 'medium' | 'loose'>('medium')
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [isChatMinimized, setIsChatMinimized] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [customChatAgents, setCustomChatAgents] = useState<CanvasChatAgent[]>([])
  const [selectedChatAgentId, setSelectedChatAgentId] = useState<string>(
    FASHION_TREND_AGENT_ID
  )
  const [isChatAgentComposerOpen, setIsChatAgentComposerOpen] = useState(false)
  const [newChatAgentName, setNewChatAgentName] = useState('')
  const [newChatAgentPrompt, setNewChatAgentPrompt] = useState('')
  const [isChatPinnedToBottom, setIsChatPinnedToBottom] = useState(true)
  const [showChatJumpToLatest, setShowChatJumpToLatest] = useState(false)
  const [chatHistories, setChatHistories] = useState<CanvasChatHistoryItem[]>([])
  const [activeChatHistoryId, setActiveChatHistoryId] = useState<string | null>(null)
  const chatProvider = 'devdove'
  const chatModel = 'gemini-2.5-flash'
  const [creditBalance, setCreditBalance] = useState<number | null>(null)
  const [isCreditsLoading, setIsCreditsLoading] = useState(false)
  const [canvasInput, setCanvasInput] = useState('')
  const [isCanvasPromptOpen, setIsCanvasPromptOpen] = useState(false)
  const [isCanvasPromptAdvanced, setIsCanvasPromptAdvanced] = useState(false)
  const [isCanvasPresetOpen, setIsCanvasPresetOpen] = useState(false)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(true)
  const [isDecomposeMenuOpen, setIsDecomposeMenuOpen] = useState(false)
  const [renamingLayerId, setRenamingLayerId] = useState<string | null>(null)
  const [layerNameDraft, setLayerNameDraft] = useState('')
  const [layerContextMenu, setLayerContextMenu] = useState<{ id: string; x: number; y: number } | null>(null)
  const [layerDetailPopover, setLayerDetailPopover] = useState<{ id: string; x: number; y: number } | null>(null)
  const [imageSizeMap, setImageSizeMap] = useState<Record<string, { width: number; height: number }>>({})
  const [lassoState, setLassoState] = useState<LassoState | null>(null)
  const [isLassoProcessing, setIsLassoProcessing] = useState(false)
  const imageProviderModels = config.aiImage.availableModels
  const defaultImageProvider = config.aiImage.defaultProvider
  const defaultImageModel =
    config.aiImage.defaultModels[defaultImageProvider] ?? imageProviderModels[defaultImageProvider]?.[0] ?? ''
  const [imageModel, setImageModel] = useState<string>(defaultImageModel)
  const [imageSizeMode, setImageSizeMode] = useState<string>(config.aiImage.defaults.size ?? 'auto')
  const [customSizeWidth, setCustomSizeWidth] = useState('')
  const [customSizeHeight, setCustomSizeHeight] = useState('')
  const [isImageGenerating, setIsImageGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const canvasInputRef = useRef<HTMLInputElement | null>(null)
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null)
  const chatScrollRef = useRef<HTMLDivElement | null>(null)
  const pendingImageProgressTimerRef = useRef<number | null>(null)
  const [fashionPromptDraft, setFashionPromptDraft] = useState<FashionPromptDraft | null>(null)
  const processedFashionAssistantIdsRef = useRef<Set<string>>(new Set())

  const { data: session } = authClientReact.useSession()
  const user = session?.user
  const { colorScheme, setColorScheme, theme, setTheme } = useTheme()
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(
    null
  )
  const isSpacePanningActive = isSpaceDown && isPointerInViewport

  const { messages, sendMessage, setMessages, status, error } = useChat({
    messages: [
      buildChatWelcomeMessage(BUILTIN_CHAT_AGENTS[0]?.name),
    ],
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onError: (chatError) => {
      console.error('Canvas chat error:', chatError)
    },
  })

  const getViewportRect = () => viewportRef.current?.getBoundingClientRect()

  const resolveThemeColor = useCallback((token: string, fallback: string, alpha?: number) => {
    if (typeof window === 'undefined') return fallback
    const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
    if (!value) return fallback
    return typeof alpha === 'number' ? `hsl(${value} / ${alpha})` : `hsl(${value})`
  }, [])

  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      return {
        x: (screenX - camera.x) / camera.scale,
        y: (screenY - camera.y) / camera.scale,
      }
    },
    [camera]
  )

  const worldToScreen = useCallback(
    (worldX: number, worldY: number) => {
      return {
        x: worldX * camera.scale + camera.x,
        y: worldY * camera.scale + camera.y,
      }
    },
    [camera]
  )

  const resolveImageMetrics = useCallback(
    (item: CanvasImageItem) => {
      const size = imageSizeMap[item.id]
      if (!size) return null
      const intrinsicWidth = size.width
      const intrinsicHeight = size.height
      if (!intrinsicWidth || !intrinsicHeight) return null
      const scale = Math.min(item.width / intrinsicWidth, item.height / intrinsicHeight)
      const displayWidth = intrinsicWidth * scale
      const displayHeight = intrinsicHeight * scale
      const offsetX = (item.width - displayWidth) / 2
      const offsetY = (item.height - displayHeight) / 2
      return {
        intrinsicWidth,
        intrinsicHeight,
        scale,
        displayWidth,
        displayHeight,
        offsetX,
        offsetY,
      }
    },
    [imageSizeMap]
  )

  const resolveImagePoint = useCallback(
    (item: CanvasImageItem, worldX: number, worldY: number) => {
      const metrics = resolveImageMetrics(item)
      if (!metrics) return null
      const localX = worldX - item.x
      const localY = worldY - item.y
      const withinX = localX >= metrics.offsetX && localX <= metrics.offsetX + metrics.displayWidth
      const withinY = localY >= metrics.offsetY && localY <= metrics.offsetY + metrics.displayHeight
      if (!withinX || !withinY) return null
      const imageX = (localX - metrics.offsetX) / metrics.scale
      const imageY = (localY - metrics.offsetY) / metrics.scale
      return {
        x: clamp(imageX, 0, metrics.intrinsicWidth),
        y: clamp(imageY, 0, metrics.intrinsicHeight),
      }
    },
    [resolveImageMetrics]
  )

  const resolveLocalPoint = useCallback(
    (item: CanvasImageItem, point: LassoPoint) => {
      const metrics = resolveImageMetrics(item)
      if (!metrics) return null
      return {
        x: point.x * metrics.scale + metrics.offsetX,
        y: point.y * metrics.scale + metrics.offsetY,
      }
    },
    [resolveImageMetrics]
  )

  const buildLassoPath = useCallback(
    (item: CanvasImageItem, points: LassoPoint[], closed: boolean) => {
      if (points.length === 0) return ''
      const resolved = points
        .map((point) => resolveLocalPoint(item, point))
        .filter(Boolean) as Array<{ x: number; y: number }>
      if (resolved.length === 0) return ''
      const segments = resolved.map((point) => `${point.x},${point.y}`).join(' L ')
      return closed ? `M ${segments} Z` : `M ${segments}`
    },
    [resolveLocalPoint]
  )


  const getLassoBounds = useCallback((points: LassoPoint[]) => {
    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY
    points.forEach((point) => {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    })
    if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
      return null
    }
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }, [])

  const measureTextBox = useCallback(
    (
      text: string,
      fontSize: number,
      maxWidth?: number,
      minHeight = MIN_TEXT_HEIGHT,
      fontFamily = DEFAULT_TEXT_FONT_FAMILY,
      fontWeight = DEFAULT_TEXT_FONT_WEIGHT,
      fontStyle: 'normal' | 'italic' = 'normal',
      paddingX = TEXT_PADDING_X,
      paddingY = TEXT_PADDING_Y
    ) => {
    if (typeof document === 'undefined') {
      return { width: maxWidth ?? MIN_TEXT_WIDTH, height: minHeight }
    }
    const measurer = document.createElement('div')
    measurer.style.position = 'absolute'
    measurer.style.visibility = 'hidden'
    measurer.style.whiteSpace = 'pre-wrap'
    measurer.style.wordBreak = 'break-word'
    measurer.style.fontSize = `${fontSize}px`
    measurer.style.lineHeight = '1.3'
    measurer.style.fontWeight = `${fontWeight}`
    measurer.style.fontFamily = fontFamily
    measurer.style.fontStyle = fontStyle
    measurer.style.padding = '0'
    measurer.style.border = '0'
    measurer.style.margin = '0'
    if (maxWidth) {
      const innerWidth = Math.max(maxWidth - paddingX * 2, MIN_TEXT_WIDTH)
      measurer.style.width = `${innerWidth}px`
    }
    measurer.textContent = text && text.length > 0 ? text : ' '
    document.body.appendChild(measurer)
    const rect = measurer.getBoundingClientRect()
    document.body.removeChild(measurer)
    const contentWidth = Math.ceil(rect.width)
    const contentHeight = Math.ceil(rect.height)
    return {
      width: maxWidth
        ? Math.max(Math.ceil(maxWidth), MIN_TEXT_WIDTH)
        : Math.max(contentWidth + paddingX * 2, MIN_TEXT_WIDTH),
      height: Math.max(contentHeight + paddingY * 2, minHeight),
    }
  },
    []
  )

  const syncSelection = useCallback(
    (nextIds: string[], primaryId?: string | null) => {
      const uniqueIds = Array.from(new Set(nextIds))
      setSelectedIds(uniqueIds)
      if (primaryId !== undefined) {
        setSelectedId(primaryId)
        return
      }
      if (uniqueIds.length === 0) {
        setSelectedId(null)
        return
      }
      if (selectedId && uniqueIds.includes(selectedId)) {
        setSelectedId(selectedId)
        return
      }
      setSelectedId(uniqueIds[uniqueIds.length - 1])
    },
    [selectedId]
  )

  const clearSelection = useCallback(() => {
    setSelectedIds([])
    setSelectedId(null)
  }, [])

  const getViewportCenterWorld = useCallback(() => {
    const rect = getViewportRect()
    const centerX = rect ? rect.width / 2 : 0
    const centerY = rect ? rect.height / 2 : 0
    return screenToWorld(centerX, centerY)
  }, [screenToWorld])

  const createTextItem = useCallback(
    (worldX: number, worldY: number, text?: string, shouldEdit = false) => {
      const rawText = typeof text === 'string' ? text : ''
      const hasText = rawText.trim().length > 0
      const value = hasText ? rawText : shouldEdit ? '' : DEFAULT_TEXT
      const { width, height } = measureTextBox(
        value,
        DEFAULT_TEXT_SIZE,
        DEFAULT_TEXT_BOX_WIDTH,
        shouldEdit ? DEFAULT_TEXT_BOX_HEIGHT : MIN_TEXT_HEIGHT,
        DEFAULT_TEXT_FONT_FAMILY,
        DEFAULT_TEXT_FONT_WEIGHT,
        'normal'
      )
      const nextItem: CanvasTextItem = {
        id: nanoid(),
        type: 'text',
        x: worldX,
        y: worldY,
        width,
        height,
        data: {
          text: value,
          fontSize: DEFAULT_TEXT_SIZE,
          color: DEFAULT_TEXT_COLOR,
          backgroundColor: DEFAULT_TEXT_BACKGROUND,
          strokeColor: DEFAULT_TEXT_STROKE,
          strokeWidth: DEFAULT_TEXT_STROKE_WIDTH,
          fontFamily: DEFAULT_TEXT_FONT_FAMILY,
          fontWeight: DEFAULT_TEXT_FONT_WEIGHT,
          fontStyle: 'normal',
          textDecoration: 'none',
          align: 'left',
          noteStyle: false,
          noteTone: 'sticky',
        },
      }
      setItems((prev) => [...prev, nextItem])
      syncSelection([nextItem.id], nextItem.id)
      if (shouldEdit) {
        setEditingId(nextItem.id)
      }
      return nextItem.id
    },
    [measureTextBox, syncSelection]
  )

  const createChatBubbleItem = useCallback(
    (
      worldX: number,
      worldY: number,
      text: string,
      role: 'user' | 'assistant',
      anchor: 'top-left' | 'center' = 'top-left'
    ) => {
      const value = text.trim()
      if (!value) return null
      const backgroundColor =
        role === 'user'
          ? resolveThemeColor('--primary', CHAT_BUBBLE_FALLBACK_USER_BG, 0.12)
          : resolveThemeColor('--muted', CHAT_BUBBLE_FALLBACK_ASSISTANT_BG, 0.3)
      const textColor = resolveThemeColor('--foreground', CHAT_BUBBLE_FALLBACK_ASSISTANT_TEXT)
      const { width, height } = measureTextBox(
        value,
        CHAT_BUBBLE_FONT_SIZE,
        CHAT_BUBBLE_MAX_WIDTH,
        MIN_TEXT_HEIGHT,
        DEFAULT_TEXT_FONT_FAMILY,
        DEFAULT_TEXT_FONT_WEIGHT,
        'normal',
        TEXT_PADDING_X,
        TEXT_PADDING_Y
      )
      const resolvedX = anchor === 'center' ? worldX - width / 2 : worldX
      const resolvedY = anchor === 'center' ? worldY - height / 2 : worldY
      const nextItem: CanvasTextItem = {
        id: nanoid(),
        type: 'text',
        x: resolvedX,
        y: resolvedY,
        width,
        height,
        data: {
          text: value,
          fontSize: CHAT_BUBBLE_FONT_SIZE,
          color: textColor,
          backgroundColor,
          strokeColor: 'transparent',
          strokeWidth: 0,
          fontFamily: DEFAULT_TEXT_FONT_FAMILY,
          fontWeight: DEFAULT_TEXT_FONT_WEIGHT,
          fontStyle: 'normal',
          textDecoration: 'none',
          align: 'left',
          noteStyle: false,
          noteTone: 'neutral',
        },
      }
      setItems((prev) => [...prev, nextItem])
      syncSelection([nextItem.id], nextItem.id)
      return nextItem.id
    },
    [measureTextBox, resolveThemeColor, syncSelection]
  )

  const insertChatMessageToCanvas = useCallback(
    (text: string, role: 'user' | 'assistant') => {
      const value = text.trim()
      if (!value) return
      const selectedItemsNow = items.filter((item) => selectedIds.includes(item.id))
      const primaryItem = selectedItemsNow.find((item) => item.id === selectedId) ?? selectedItemsNow[0] ?? null
      if (primaryItem) {
        const offset = 24
        const x = primaryItem.x + primaryItem.width + offset
        const y = primaryItem.y
        createChatBubbleItem(x, y, value, role, 'top-left')
      } else {
        const center = getViewportCenterWorld()
        createChatBubbleItem(center.x, center.y, value, role, 'center')
      }
      toast.success('已插入到画布')
    },
    [createChatBubbleItem, getViewportCenterWorld, items, selectedId, selectedIds]
  )

  const handleDeleteItems = useCallback(
    (itemIds: string[]) => {
      if (itemIds.length === 0) return
      const idSet = new Set(itemIds)
      setItems((prev) => prev.filter((item) => !idSet.has(item.id)))
      setEditingId((prev) => (prev && idSet.has(prev) ? null : prev))
      setSelectedIds((prev) => {
        const next = prev.filter((id) => !idSet.has(id))
        setSelectedId((current) => {
          if (current && !next.includes(current)) {
            return next[0] ?? null
          }
          if (!current) {
            return next[0] ?? null
          }
          return current
        })
        return next
      })
      setLoadedImages((prev) => {
        let changed = false
        const next = { ...prev }
        idSet.forEach((id) => {
          if (next[id]) {
            delete next[id]
            changed = true
          }
        })
        return changed ? next : prev
      })
      setBrokenImages((prev) => {
        let changed = false
        const next = { ...prev }
        idSet.forEach((id) => {
          if (next[id]) {
            delete next[id]
            changed = true
          }
        })
        return changed ? next : prev
      })
      setImageSizeMap((prev) => {
        let changed = false
        const next = { ...prev }
        idSet.forEach((id) => {
          if (next[id]) {
            delete next[id]
            changed = true
          }
        })
        return changed ? next : prev
      })
    },
    [setSelectedId]
  )

  const handleDeleteItemsSafe = useCallback(
    (ids: string[]) => {
      const nextIds = items
        .filter((item) => ids.includes(item.id))
        .filter((item) => !(item.type === 'image' && item.data.generation?.status === 'pending'))
        .map((item) => item.id)
      if (!nextIds.length) {
        toast.message('图片生成中，暂不支持删除')
        return
      }
      handleDeleteItems(nextIds)
    },
    [handleDeleteItems, items]
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return
      if (event.code === 'Space') {
        if (isPointerInViewport) {
          event.preventDefault()
        }
        setIsSpaceDown(true)
        return
      }

      const key = event.key.toLowerCase()
      const toolMap: Record<string, ToolId> = {
        v: 'select',
        h: 'hand',
        t: 'text',
        i: 'image',
        s: 'shape',
      }
      const nextTool = toolMap[key]
      if (nextTool) {
        event.preventDefault()
        setActiveTool(nextTool)
      }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      if (isEditableTarget(event.target)) return
      if (isPointerInViewport) {
        event.preventDefault()
      }
      setIsSpaceDown(false)
    }

    window.addEventListener('keydown', handleKeyDown, { passive: false })
    window.addEventListener('keyup', handleKeyUp, { passive: false })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isPointerInViewport])

  useEffect(() => {
    const handleDeleteKey = (event: KeyboardEvent) => {
      const isDeleteKey =
        event.key === 'Delete' ||
        event.key === 'Backspace' ||
        event.code === 'Delete' ||
        event.code === 'Backspace'
      if (!isDeleteKey) return
      if (isEditableTarget(event.target)) return
      if (selectedIds.length === 0 && !selectedId) return
      event.preventDefault()
      handleDeleteItemsSafe(selectedIds.length > 0 ? selectedIds : selectedId ? [selectedId] : [])
    }

    window.addEventListener('keydown', handleDeleteKey, { capture: true })
    return () => {
      window.removeEventListener('keydown', handleDeleteKey, { capture: true })
    }
  }, [handleDeleteItemsSafe, selectedId, selectedIds])

  useEffect(() => {
    const handleSelectionKeys = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        const allIds = items.map((item) => item.id)
        syncSelection(allIds, allIds[allIds.length - 1] ?? null)
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        if (lassoStateRef.current) {
          setLassoState(null)
          return
        }
        clearSelection()
        setEditingId(null)
      }
    }

    window.addEventListener('keydown', handleSelectionKeys)
    return () => window.removeEventListener('keydown', handleSelectionKeys)
  }, [clearSelection, items, syncSelection])

  useEffect(() => {
    if (!lassoState) return
    const targetExists = items.some((item) => item.id === lassoState.itemId)
    if (!targetExists) {
      setLassoState(null)
      return
    }
    const isSelected =
      selectedId === lassoState.itemId || (selectedIds.length > 0 && selectedIds.includes(lassoState.itemId))
    if (!isSelected) {
      setLassoState(null)
    }
  }, [items, lassoState, selectedId, selectedIds])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
      }
    }

    const handleGesture = (event: Event) => {
      event.preventDefault()
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false })
    viewport.addEventListener('gesturestart', handleGesture, { passive: false } as AddEventListenerOptions)
    viewport.addEventListener('gesturechange', handleGesture, { passive: false } as AddEventListenerOptions)
    viewport.addEventListener('gestureend', handleGesture, { passive: false } as AddEventListenerOptions)

    return () => {
      viewport.removeEventListener('wheel', handleWheel)
      viewport.removeEventListener('gesturestart', handleGesture as EventListener)
      viewport.removeEventListener('gesturechange', handleGesture as EventListener)
      viewport.removeEventListener('gestureend', handleGesture as EventListener)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        setHasHydrated(true)
        return
      }
      const parsed = JSON.parse(raw) as { camera?: CameraState; items?: CanvasItem[] }
      if (parsed.camera) setCamera(parsed.camera)
      if (parsed.items) {
        const nextItems = parsed.items
          .map((item) => {
            if (item.type !== 'text') return item
            const textValue = item.data?.text ?? DEFAULT_TEXT
            const fontSize = item.data?.fontSize ?? DEFAULT_TEXT_SIZE
            const color = item.data?.color ?? DEFAULT_TEXT_COLOR
            const backgroundColor = item.data?.backgroundColor ?? DEFAULT_TEXT_BACKGROUND
            const strokeColor = item.data?.strokeColor ?? DEFAULT_TEXT_STROKE
            const strokeWidth = item.data?.strokeWidth ?? DEFAULT_TEXT_STROKE_WIDTH
            const fontFamily = item.data?.fontFamily ?? DEFAULT_TEXT_FONT_FAMILY
            const fontWeight = item.data?.fontWeight ?? DEFAULT_TEXT_FONT_WEIGHT
            const fontStyle = item.data?.fontStyle ?? 'normal'
            const textDecoration = item.data?.textDecoration ?? 'none'
            const align = item.data?.align ?? 'left'
            return {
              ...item,
              data: {
                ...item.data,
                text: textValue,
                fontSize,
                color,
                backgroundColor,
                strokeColor,
                strokeWidth,
                fontFamily,
                fontWeight,
                fontStyle,
                textDecoration,
                align,
              },
            }
          })
          .filter((item) =>
            item.type === 'text'
              ? Boolean(item.data?.text?.trim())
              : Boolean(item.data?.src) && item.data?.generation?.status !== 'pending'
          )
        setItems(nextItems)
      }
    } catch (error) {
      console.error('Failed to restore canvas state', error)
    } finally {
      setHasHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hasHydrated) return
    if (typeof window === 'undefined') return
    try {
      const raw = window.sessionStorage.getItem(SEED_STORAGE_KEY)
      if (!raw) return
      window.sessionStorage.removeItem(SEED_STORAGE_KEY)
      const parsed = JSON.parse(raw) as { prompt?: string; image?: string }
      if (parsed.prompt) {
        setCanvasInput(parsed.prompt)
        setIsCanvasPromptOpen(true)
      }
      if (parsed.image) {
        requestAnimationFrame(() => {
          addImageItem(parsed.image as string, 'ai-generate')
        })
      }
    } catch (error) {
      console.error('Failed to restore canvas seed', error)
    }
  }, [hasHydrated])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const rawAgents = window.localStorage.getItem(CHAT_AGENT_STORAGE_KEY)
      if (rawAgents) {
        const parsed = JSON.parse(rawAgents) as unknown
        if (Array.isArray(parsed)) {
          const restored = parsed
            .map((item) => toCustomChatAgent(item))
            .filter((item): item is CanvasChatAgent => Boolean(item))
            .slice(0, MAX_CUSTOM_CHAT_AGENT_COUNT)
          setCustomChatAgents(restored)
        }
      }
    } catch (chatAgentError) {
      console.error('Failed to restore chat agents', chatAgentError)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(CHAT_AGENT_STORAGE_KEY, JSON.stringify(customChatAgents))
    } catch (chatAgentError) {
      console.error('Failed to persist chat agents', chatAgentError)
    }
  }, [customChatAgents])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) return
      const restored = parsed
        .filter((item) => item && typeof item === 'object')
        .map((item) => {
          const record = item as Partial<CanvasChatHistoryItem>
          if (!record.id || !record.title || !Array.isArray(record.messages)) return null
          return {
            id: String(record.id),
            title: String(record.title),
            agentId: String(record.agentId ?? CHAT_AGENT_NONE_VALUE),
            updatedAt: String(record.updatedAt ?? ''),
            messages: normalizeChatHistoryMessages(record.messages as UIMessage[]),
          } satisfies CanvasChatHistoryItem
        })
        .filter((item): item is CanvasChatHistoryItem => Boolean(item))
        .slice(0, MAX_CHAT_HISTORY)
      if (restored.length > 0) {
        setChatHistories(restored)
      }
    } catch (historyError) {
      console.error('Failed to restore chat history', historyError)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(chatHistories))
    } catch (historyError) {
      console.error('Failed to persist chat history', historyError)
    }
  }, [chatHistories])

  useEffect(() => {
    if (!hasHydrated) return
    if (storageDisabledRef.current) return
    const handle = window.setTimeout(() => {
      try {
        let totalLength = 0
        let skippedLarge = false
        const persistItems: CanvasItem[] = []

        for (const item of items) {
          if (item.type === 'image' && item.data?.generation?.status === 'pending') {
            continue
          }
          const src = item.type === 'image' ? item.data?.src : undefined
          const srcLength = src ? src.length : 0
          const isDataUrl = typeof src === 'string' && src.startsWith('data:')
          const exceedsLimit =
            isDataUrl &&
            (srcLength > MAX_PERSISTED_SRC_LENGTH || totalLength + srcLength > MAX_PERSISTED_TOTAL_LENGTH)

          if (exceedsLimit) {
            skippedLarge = true
            continue
          }

          totalLength += srcLength
          persistItems.push(item)
        }

        if (skippedLarge && !warnedLargeItemsRef.current) {
          warnedLargeItemsRef.current = true
          toast.message('图片较大，刷新后可能不会保留（后续接入素材库可保存）')
        }

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ camera, items: persistItems }))
      } catch (error) {
        console.error('Failed to persist canvas state', error)
        storageDisabledRef.current = true
        toast.error('本地存储不可用，已暂停自动保存')
      }
    }, 300)
    return () => window.clearTimeout(handle)
  }, [camera, items, hasHydrated])

  useEffect(() => {
    if (!error) return
    const message = error instanceof Error ? error.message : 'AI 请求失败，请稍后再试'
    toast.error(message)
  }, [error])

  useEffect(() => {
    return () => {
      if (pendingImageProgressTimerRef.current !== null) {
        window.clearInterval(pendingImageProgressTimerRef.current)
        pendingImageProgressTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    lassoStateRef.current = lassoState
  }, [lassoState])

  useEffect(() => {
    if (!isCanvasPromptOpen) return
    const handle = window.requestAnimationFrame(() => {
      canvasInputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(handle)
  }, [isCanvasPromptOpen])

  useEffect(() => {
    if (isCanvasPromptOpen) return
    setIsCanvasPresetOpen(false)
    setIsCanvasPromptAdvanced(false)
  }, [isCanvasPromptOpen])

  useEffect(() => {
    if (!user?.id) {
      setCreditBalance(null)
      return
    }

    let cancelled = false
    const fetchCredits = async () => {
      setIsCreditsLoading(true)
      try {
        const response = await fetch('/api/credits/status')
        if (!response.ok) return
        const data = await response.json()
        if (!cancelled) {
          const balance = typeof data?.credits?.balance === 'number' ? data.credits.balance : Number(data?.credits?.balance)
          setCreditBalance(Number.isFinite(balance) ? balance : 0)
        }
      } catch (fetchError) {
        console.error('Failed to fetch credits status', fetchError)
      } finally {
        if (!cancelled) setIsCreditsLoading(false)
      }
    }

    fetchCredits()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  useEffect(() => {
    if (!editingId) return
    const handle = window.requestAnimationFrame(() => {
      textEditRef.current?.focus()
      textEditRef.current?.select()
    })
    return () => window.cancelAnimationFrame(handle)
  }, [editingId])

  const gridStyle = useMemo(() => {
    if (backgroundMode === 'solid') {
      return {
        backgroundColor: 'hsl(var(--background))',
      }
    }
    const baseSpacing = {
      tight: 30,
      medium: 60,
      loose: 90,
    }[backgroundSpacing]
    const gridSize = baseSpacing * camera.scale
    const positionX = camera.x % gridSize
    const positionY = camera.y % gridSize
    const intensityConfig = {
      low: { dark: 0.07, light: 0.08, size: 1 },
      medium: { dark: 0.12, light: 0.14, size: 1.2 },
      high: { dark: 0.2, light: 0.22, size: 1.4 },
    }[backgroundIntensity]
    const darkDot = `rgba(0, 0, 0, ${intensityConfig.dark})`
    const lightDot = `rgba(255, 255, 255, ${intensityConfig.light})`
    const dotSize = `${intensityConfig.size}px`

    return {
      backgroundColor: 'hsl(var(--background))',
      backgroundImage:
        `radial-gradient(circle, ${darkDot} ${dotSize}, transparent ${dotSize}),
         radial-gradient(circle, ${lightDot} ${dotSize}, transparent ${dotSize})`,
      backgroundSize: `${gridSize}px ${gridSize}px, ${gridSize}px ${gridSize}px`,
      backgroundPosition: `${positionX}px ${positionY}px, ${positionX + gridSize / 2}px ${positionY +
        gridSize / 2}px`,
    }
  }, [backgroundMode, backgroundIntensity, backgroundSpacing, camera])

  const updateCamera = (next: CameraState) => {
    setCamera({
      x: Math.round(next.x * 100) / 100,
      y: Math.round(next.y * 100) / 100,
      scale: Math.round(next.scale * 1000) / 1000,
    })
  }

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    const rect = getViewportRect()
    if (!rect) return

    const isZoomGesture = event.ctrlKey || event.metaKey
    if (isZoomGesture) {
      const screenX = event.clientX - rect.left
      const screenY = event.clientY - rect.top
      const zoom = Math.exp(-event.deltaY * ZOOM_SPEED)
      const nextScale = clamp(camera.scale * zoom, MIN_SCALE, MAX_SCALE)
      const worldPoint = screenToWorld(screenX, screenY)

      updateCamera({
        x: screenX - worldPoint.x * nextScale,
        y: screenY - worldPoint.y * nextScale,
        scale: nextScale,
      })
      return
    }

    const deltaScale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 120 : 1
    const deltaX = event.deltaX * deltaScale
    const deltaY = event.deltaY * deltaScale

    updateCamera({
      x: camera.x - deltaX,
      y: camera.y - deltaY,
      scale: camera.scale,
    })
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (lassoState) {
      const target = event.target as HTMLElement | null
      if (target?.closest('[data-lasso-overlay]')) return
      setLassoState(null)
    }
    if (
      editingId &&
      !isEditableTarget(event.target) &&
      event.button === 0 &&
      !isSpacePanningActive &&
      activeTool !== 'hand'
    ) {
      commitTextItem(editingId)
      setActiveTool('select')
      return
    }

    if (event.button === 1 || isSpacePanningActive || activeTool === 'hand') {
      event.preventDefault()
      dragStateRef.current = {
        kind: 'pan',
        startX: event.clientX,
        startY: event.clientY,
        cameraX: camera.x,
        cameraY: camera.y,
      }
      setDragMode('pan')
      viewportRef.current?.setPointerCapture(event.pointerId)
      return
    }

    if (activeTool === 'text' && event.button === 0) {
      event.preventDefault()
      const rect = getViewportRect()
      if (!rect) return
      const screenX = event.clientX - rect.left
      const screenY = event.clientY - rect.top
      const worldPoint = screenToWorld(screenX, screenY)
      createTextItem(worldPoint.x, worldPoint.y, '', true)
      setActiveTool('select')
      return
    }

    if (event.button === 0 && activeTool === 'select' && !isSpacePanningActive) {
      event.preventDefault()
      const rect = getViewportRect()
      if (!rect) return
      const screenX = event.clientX - rect.left
      const screenY = event.clientY - rect.top
      const worldPoint = screenToWorld(screenX, screenY)
      const additive = isMultiSelectModifier(event)

      if (!additive) {
        clearSelection()
        setEditingId(null)
      }

      dragStateRef.current = {
        kind: 'select',
        startWorldX: worldPoint.x,
        startWorldY: worldPoint.y,
        currentWorldX: worldPoint.x,
        currentWorldY: worldPoint.y,
        additive,
      }
      setDragMode('select')
      setSelectionBox({ x: worldPoint.x, y: worldPoint.y, width: 0, height: 0 })
      viewportRef.current?.setPointerCapture(event.pointerId)
      return
    }

    clearSelection()
    setEditingId(null)
    setDragMode(null)
  }

  const isWithinTextStylePanel = (node: Element | null) => {
    if (!node) return false
    if (textStylePanelRef.current?.contains(node)) return true
    return Boolean((node as HTMLElement).closest('[data-canvas-text-style-panel]'))
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current
    if (!dragState) return

    if (dragState.kind === 'pan') {
      event.preventDefault()
      updateCamera({
        x: dragState.cameraX + (event.clientX - dragState.startX),
        y: dragState.cameraY + (event.clientY - dragState.startY),
        scale: camera.scale,
      })
      return
    }

    if (dragState.kind === 'item') {
      event.preventDefault()
      const rect = getViewportRect()
      if (!rect) return
      const screenX = event.clientX - rect.left
      const screenY = event.clientY - rect.top
      const worldPoint = screenToWorld(screenX, screenY)
      const deltaX = worldPoint.x - dragState.startWorldX
      const deltaY = worldPoint.y - dragState.startWorldY

      if (dragState.groupPositions && dragState.groupPositions.length > 0) {
        setItems((prev) => {
          const positionMap = new Map(dragState.groupPositions?.map((entry) => [entry.id, entry]))
          return prev.map((item) => {
            const origin = positionMap.get(item.id)
            if (!origin) return item
            return {
              ...item,
              x: Math.round((origin.x + deltaX) * 100) / 100,
              y: Math.round((origin.y + deltaY) * 100) / 100,
            }
          })
        })
        return
      }

      const nextX = dragState.itemX + deltaX
      const nextY = dragState.itemY + deltaY

      setItems((prev) =>
        prev.map((item) =>
          item.id === dragState.id
            ? {
                ...item,
                x: Math.round(nextX * 100) / 100,
                y: Math.round(nextY * 100) / 100,
              }
            : item
        )
      )
    }

    if (dragState.kind === 'resize') {
      event.preventDefault()
      const rect = getViewportRect()
      if (!rect) return
      const screenX = event.clientX - rect.left
      const screenY = event.clientY - rect.top
      const worldPoint = screenToWorld(screenX, screenY)
      const minSize = 40
      const isCorner = ['tl', 'tr', 'bl', 'br'].includes(dragState.corner)
      const isHorizontalEdge = dragState.corner === 'ml' || dragState.corner === 'mr'
      const isVerticalEdge = dragState.corner === 'tm' || dragState.corner === 'bm'

      const startWidth = dragState.startWidth
      const startHeight = dragState.startHeight
      let nextWidth = startWidth
      let nextHeight = startHeight
      let nextX = dragState.itemX
      let nextY = dragState.itemY
      let scale = 1

      if (isCorner) {
        const anchor = (() => {
          switch (dragState.corner) {
            case 'tl':
              return { x: dragState.itemX + startWidth, y: dragState.itemY + startHeight }
            case 'tr':
              return { x: dragState.itemX, y: dragState.itemY + startHeight }
            case 'bl':
              return { x: dragState.itemX + startWidth, y: dragState.itemY }
            case 'br':
              return { x: dragState.itemX, y: dragState.itemY }
          }
        })()

        const rawWidth =
          dragState.corner === 'tl' || dragState.corner === 'bl'
            ? anchor.x - worldPoint.x
            : worldPoint.x - anchor.x
        const rawHeight =
          dragState.corner === 'tl' || dragState.corner === 'tr'
            ? anchor.y - worldPoint.y
            : worldPoint.y - anchor.y

        scale = Math.max(
          rawWidth / startWidth,
          rawHeight / startHeight,
          minSize / startWidth,
          minSize / startHeight
        )
        nextWidth = Math.max(startWidth * scale, minSize)
        nextHeight = Math.max(startHeight * scale, minSize)

        nextX = dragState.corner === 'tl' || dragState.corner === 'bl' ? anchor.x - nextWidth : anchor.x
        nextY = dragState.corner === 'tl' || dragState.corner === 'tr' ? anchor.y - nextHeight : anchor.y
      } else if (isHorizontalEdge) {
        const anchorX = dragState.corner === 'ml' ? dragState.itemX + startWidth : dragState.itemX
        const rawWidth = dragState.corner === 'ml' ? anchorX - worldPoint.x : worldPoint.x - anchorX
        nextWidth = Math.max(rawWidth, minSize)
        nextX = dragState.corner === 'ml' ? anchorX - nextWidth : anchorX
      } else if (isVerticalEdge) {
        const anchorY = dragState.corner === 'tm' ? dragState.itemY + startHeight : dragState.itemY
        const rawHeight = dragState.corner === 'tm' ? anchorY - worldPoint.y : worldPoint.y - anchorY
        nextHeight = Math.max(rawHeight, minSize)
        nextY = dragState.corner === 'tm' ? anchorY - nextHeight : anchorY
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === dragState.id
            ? {
                ...item,
                x: Math.round(nextX * 100) / 100,
                y: Math.round(nextY * 100) / 100,
                width: Math.round(nextWidth * 100) / 100,
                height: (() => {
                  if (item.type !== 'text') return Math.round(nextHeight * 100) / 100
                  const nextFontSize = isCorner
                    ? clamp(
                        Math.round(((dragState.startFontSize ?? item.data.fontSize) * scale) * 10) / 10,
                        MIN_TEXT_FONT_SIZE,
                        MAX_TEXT_FONT_SIZE
                      )
                    : item.data.fontSize
                  const { height } = measureTextBox(
                    item.data.text,
                    nextFontSize,
                    nextWidth,
                    MIN_TEXT_HEIGHT,
                    item.data.fontFamily,
                    item.data.fontWeight,
                    item.data.fontStyle
                  )
                  return Math.round(Math.max(nextHeight, height) * 100) / 100
                })(),
                data:
                  item.type === 'text'
                    ? {
                        ...item.data,
                        fontSize: isCorner
                          ? clamp(
                              Math.round(((dragState.startFontSize ?? item.data.fontSize) * scale) * 10) / 10,
                              MIN_TEXT_FONT_SIZE,
                              MAX_TEXT_FONT_SIZE
                            )
                          : item.data.fontSize,
                      }
                    : item.data,
              }
            : item
        )
      )
    }

    if (dragState.kind === 'select') {
      event.preventDefault()
      const rect = getViewportRect()
      if (!rect) return
      const screenX = event.clientX - rect.left
      const screenY = event.clientY - rect.top
      const worldPoint = screenToWorld(screenX, screenY)
      dragStateRef.current = {
        ...dragState,
        currentWorldX: worldPoint.x,
        currentWorldY: worldPoint.y,
      }
      setSelectionBox(normalizeRect(dragState.startWorldX, dragState.startWorldY, worldPoint.x, worldPoint.y))
    }
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current) return
    const dragState = dragStateRef.current

    if (dragState.kind === 'select') {
      const selection = normalizeRect(
        dragState.startWorldX,
        dragState.startWorldY,
        dragState.currentWorldX,
        dragState.currentWorldY
      )
      setSelectionBox(null)
      const selectionThreshold = 4 / camera.scale
      if (selection.width >= selectionThreshold || selection.height >= selectionThreshold) {
        const boxedIds = items
          .filter(
            (item) =>
              !item.hidden &&
              !item.locked &&
              rectsIntersect(selection, { x: item.x, y: item.y, width: item.width, height: item.height })
          )
          .map((item) => item.id)
        const nextIds = dragState.additive ? Array.from(new Set([...selectedIds, ...boxedIds])) : boxedIds
        syncSelection(nextIds, boxedIds[boxedIds.length - 1] ?? null)
      }
    }

    dragStateRef.current = null
    setDragMode(null)
    viewportRef.current?.releasePointerCapture(event.pointerId)
  }

  const handleViewportPointerEnter = () => {
    setIsPointerInViewport(true)
  }

  const handleViewportPointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsPointerInViewport(false)
    handlePointerUp(event)
  }

  const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null
    if (target?.closest('[data-canvas-item]')) return
    updateCamera({ x: 0, y: 0, scale: 1 })
  }

  const handleItemPointerDown = (event: React.PointerEvent<HTMLDivElement>, item: CanvasItem) => {
    if (event.button !== 0) return
    if (isSpacePanningActive) return
    if (item.locked) return
    if (item.type === 'image' && lassoState?.itemId === item.id) return
    if (item.type === 'text' && editingId === item.id) return
    if (item.type === 'text') {
      const now = performance.now()
      const last = lastTextClickRef.current
      if (last.id === item.id && now - last.time < 320) {
        lastTextClickRef.current = { id: null, time: 0 }
        event.preventDefault()
        event.stopPropagation()
        syncSelection([item.id], item.id)
        setEditingId(item.id)
        setActiveTool('select')
        return
      }
      lastTextClickRef.current = { id: item.id, time: now }
    }

    event.preventDefault()
    event.stopPropagation()

    if (isMultiSelectModifier(event)) {
      if (selectedIds.includes(item.id)) {
        const nextIds = selectedIds.filter((id) => id !== item.id)
        syncSelection(nextIds, selectedId === item.id ? nextIds[nextIds.length - 1] ?? null : selectedId ?? null)
      } else {
        syncSelection([...selectedIds, item.id], item.id)
      }
      return
    }

    if (!selectedIds.includes(item.id)) {
      syncSelection([item.id], item.id)
    } else {
      syncSelection(selectedIds, item.id)
    }

    const rect = getViewportRect()
    if (!rect) return

    const screenX = event.clientX - rect.left
    const screenY = event.clientY - rect.top
    const worldPoint = screenToWorld(screenX, screenY)
    const groupIds = selectedIds.includes(item.id) && selectedIds.length > 1 ? selectedIds : undefined
    const groupPositions = groupIds
      ? items.filter((entry) => groupIds.includes(entry.id)).map((entry) => ({ id: entry.id, x: entry.x, y: entry.y }))
      : undefined

    dragStateRef.current = {
      kind: 'item',
      id: item.id,
      startWorldX: worldPoint.x,
      startWorldY: worldPoint.y,
      itemX: item.x,
      itemY: item.y,
      groupIds,
      groupPositions,
    }

    if (editingId && editingId !== item.id) {
      setEditingId(null)
    }
    setDragMode('item')
    viewportRef.current?.setPointerCapture(event.pointerId)
  }

  const handleResizePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    item: CanvasItem,
    corner: 'tl' | 'tr' | 'bl' | 'br' | 'tm' | 'bm' | 'ml' | 'mr'
  ) => {
    if (event.button !== 0) return
    if (item.locked) return
    event.preventDefault()
    event.stopPropagation()
    const rect = getViewportRect()
    if (!rect) return
    const screenX = event.clientX - rect.left
    const screenY = event.clientY - rect.top
    const worldPoint = screenToWorld(screenX, screenY)

    dragStateRef.current = {
      kind: 'resize',
      id: item.id,
      corner,
      startWorldX: worldPoint.x,
      startWorldY: worldPoint.y,
      startWidth: item.width,
      startHeight: item.height,
      itemX: item.x,
      itemY: item.y,
      startFontSize: item.type === 'text' ? item.data.fontSize : undefined,
    }

    syncSelection([item.id], item.id)
    setDragMode('resize')
    viewportRef.current?.setPointerCapture(event.pointerId)
  }

  const addImageItem = useCallback((
    src: string,
    name: string,
    metadata?: Partial<CanvasImageItem['data']>,
    placement?: { x: number; y: number; width: number; height: number }
  ) => {
    const img = new Image()
    img.onerror = () => {
      toast.error('图片加载失败，请换一张图试试')
    }
    img.onload = () => {
      const intrinsicWidth = img.naturalWidth || img.width
      const intrinsicHeight = img.naturalHeight || img.height
      if (!intrinsicWidth || !intrinsicHeight) {
        toast.error('图片尺寸读取失败，请换一张图试试')
        return
      }
      const nextSize = fitImageToCanvasSize(intrinsicWidth, intrinsicHeight)

      const nextPlacement = placement
        ? {
            x: placement.x,
            y: placement.y,
            width: placement.width,
            height: placement.height,
          }
        : (() => {
            const rect = getViewportRect()
            const centerX = rect ? rect.width / 2 : 0
            const centerY = rect ? rect.height / 2 : 0
            const worldCenter = screenToWorld(centerX, centerY)
            return {
              x: worldCenter.x - nextSize.width / 2,
              y: worldCenter.y - nextSize.height / 2,
              width: nextSize.width,
              height: nextSize.height,
            }
          })()

      const nextItem: CanvasItem = {
        id: nanoid(),
        type: 'image',
        x: nextPlacement.x,
        y: nextPlacement.y,
        width: nextPlacement.width,
        height: nextPlacement.height,
        data: {
          src,
          name,
          ...metadata,
        },
      }

      setItems((prev) => [...prev, nextItem])
      syncSelection([nextItem.id], nextItem.id)
      setBrokenImages((prev) => {
        if (!prev[nextItem.id]) return prev
        const next = { ...prev }
        delete next[nextItem.id]
        return next
      })
      setLoadedImages((prev) => {
        if (!prev[nextItem.id]) return prev
        const next = { ...prev }
        delete next[nextItem.id]
        return next
      })
    }
    img.src = src
  }, [screenToWorld, syncSelection])

  const createPendingImageItem = useCallback(
    (input: { prompt: string; model: string; provider?: string; size?: string }) => {
      const nextId = nanoid()
      const nextSize = resolvePendingImageDimensions(input.size)
      const center = getViewportCenterWorld()
      const nextItem: CanvasImageItem = {
        id: nextId,
        type: 'image',
        x: Math.round((center.x - nextSize.width / 2) * 100) / 100,
        y: Math.round((center.y - nextSize.height / 2) * 100) / 100,
        width: nextSize.width,
        height: nextSize.height,
        data: {
          src: PENDING_IMAGE_PLACEHOLDER_SRC,
          name: `AI-${input.model}`,
          generation: {
            status: 'pending',
            progress: 6,
            startedAt: new Date().toISOString(),
          },
          meta: {
            source: 'generate',
            model: input.model,
            provider: input.provider,
            prompt: input.prompt,
            size: input.size,
            createdAt: new Date().toISOString(),
          },
        },
      }

      setItems((prev) => [...prev, nextItem])
      syncSelection([nextId], nextId)
      setLoadedImages((prev) => ({ ...prev, [nextId]: true }))
      setBrokenImages((prev) => {
        if (!prev[nextId]) return prev
        const next = { ...prev }
        delete next[nextId]
        return next
      })
      return nextItem
    },
    [getViewportCenterWorld, syncSelection]
  )

  const removePendingImageItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    setLoadedImages((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
    setBrokenImages((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
    setImageSizeMap((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
    setSelectedIds((prev) => prev.filter((entryId) => entryId !== id))
    setSelectedId((prev) => (prev === id ? null : prev))
  }, [])

  const setPendingImageProgress = useCallback((id: string, progress: number) => {
    const normalized = clamp(Math.round(progress), 0, 100)
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.type === 'image' && item.data.generation?.status === 'pending'
          ? {
              ...item,
              data: {
                ...item.data,
                generation: {
                  ...item.data.generation,
                  progress: normalized,
                },
              },
            }
          : item
      )
    )
  }, [])

  const finalizePendingImageItem = useCallback(
    (
      pendingId: string,
      input: {
        src: string
        key?: string
        provider?: string
        expiresAt?: string
        model: string
        providerLabel?: string
        prompt: string
        size?: string
        source?: 'generate' | 'lasso-edit'
      }
    ) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== pendingId || item.type !== 'image' || item.data.generation?.status !== 'pending') {
            return item
          }
          return {
            ...item,
            data: {
              ...item.data,
              src: input.src,
              key: input.key,
              provider: input.provider,
              expiresAt: input.expiresAt,
              name: `AI-${input.model}`,
              generation: undefined,
              meta: {
                ...item.data.meta,
                source: input.source ?? 'generate',
                model: input.model,
                provider: input.providerLabel,
                prompt: input.prompt,
                size: input.size,
                createdAt: item.data.meta?.createdAt ?? new Date().toISOString(),
              },
            },
          }
        })
      )
      setLoadedImages((prev) => {
        if (!prev[pendingId]) return prev
        const next = { ...prev }
        delete next[pendingId]
        return next
      })
      setBrokenImages((prev) => {
        if (!prev[pendingId]) return prev
        const next = { ...prev }
        delete next[pendingId]
        return next
      })
      setImageSizeMap((prev) => {
        if (!prev[pendingId]) return prev
        const next = { ...prev }
        delete next[pendingId]
        return next
      })
    },
    []
  )

  const resetImageLoadState = (id: string) => {
    setLoadedImages((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
    setBrokenImages((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const markImageBroken = useCallback((id: string) => {
    setBrokenImages((prev) => {
      if (prev[id]) return prev
      return { ...prev, [id]: true }
    })
  }, [])

  const updateImageItem = (id: string, updates: Partial<CanvasImageItem['data']>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.type === 'image'
          ? {
              ...item,
              data: {
                ...item.data,
                ...updates,
              },
            }
          : item
      )
    )
  }

  const updateTextItem = (id: string, text: string, fontSize: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.type === 'text'
          ? (() => {
              const paddingX = item.data.noteStyle ? NOTE_PADDING_X : TEXT_PADDING_X
              const paddingY = item.data.noteStyle ? NOTE_PADDING_Y : TEXT_PADDING_Y
              const targetWidth = Math.max(item.width, MIN_TEXT_WIDTH)
              const { height } = measureTextBox(
                text,
                fontSize,
                targetWidth,
                MIN_TEXT_HEIGHT,
                item.data.fontFamily,
                item.data.fontWeight,
                item.data.fontStyle,
                paddingX,
                paddingY
              )
              const nextHeight = Math.max(height, item.height)
              return {
                ...item,
                width: targetWidth,
                height: nextHeight,
                data: {
                  ...item.data,
                  text,
                  fontSize,
                },
              }
            })()
          : item
      )
    )
  }

  const updateTextStyle = (id: string, updates: Partial<CanvasTextItem['data']>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id || item.type !== 'text') return item
        const nextData = {
          ...item.data,
          ...updates,
          fontSize:
            typeof updates.fontSize === 'number'
              ? clamp(updates.fontSize, MIN_TEXT_FONT_SIZE, MAX_TEXT_FONT_SIZE)
              : item.data.fontSize,
        }
        const paddingX = nextData.noteStyle ? NOTE_PADDING_X : TEXT_PADDING_X
        const paddingY = nextData.noteStyle ? NOTE_PADDING_Y : TEXT_PADDING_Y
        const shouldMeasure =
          'fontSize' in updates || 'fontFamily' in updates || 'fontWeight' in updates || 'fontStyle' in updates
        if (!shouldMeasure) {
          return {
            ...item,
            data: nextData,
          }
        }
        const { height } = measureTextBox(
          nextData.text,
          nextData.fontSize,
          item.width,
          MIN_TEXT_HEIGHT,
          nextData.fontFamily,
          nextData.fontWeight,
          nextData.fontStyle,
          paddingX,
          paddingY
        )
        return {
          ...item,
          height: Math.max(height, item.height),
          data: nextData,
        }
      })
    )
  }

  const commitTextItem = (id: string) => {
    const current = items.find((item) => item.id === id)
    if (current?.type === 'text' && !current.data.text.trim()) {
      handleDeleteItems([id])
      return
    }
    setEditingId(null)
  }

  const updateItemLabel = (id: string, label?: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              label,
            }
          : item
      )
    )
  }

  const dropSelectionForId = (id: string) => {
    setSelectedIds((prev) => {
      if (!prev.includes(id)) return prev
      const next = prev.filter((entry) => entry !== id)
      setSelectedId((current) => {
        if (current && current !== id) return current
        return next[next.length - 1] ?? null
      })
      return next
    })
    setEditingId((prev) => (prev === id ? null : prev))
  }

  const toggleItemHidden = (id: string) => {
    const target = items.find((item) => item.id === id)
    if (!target) return
    const nextHidden = !target.hidden
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, hidden: nextHidden } : item)))
    if (nextHidden) {
      dropSelectionForId(id)
    }
  }

  const toggleItemLocked = (id: string) => {
    const target = items.find((item) => item.id === id)
    if (!target) return
    const nextLocked = !target.locked
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, locked: nextLocked } : item)))
    if (nextLocked) {
      dropSelectionForId(id)
    }
  }

  const isItemInViewport = (item: CanvasItem) => {
    const rect = getViewportRect()
    if (!rect) return true
    const left = item.x * camera.scale + camera.x
    const top = item.y * camera.scale + camera.y
    const right = left + item.width * camera.scale
    const bottom = top + item.height * camera.scale
    const margin = 80
    return right > margin && bottom > margin && left < rect.width - margin && top < rect.height - margin
  }

  const focusItem = (item: CanvasItem) => {
    const rect = getViewportRect()
    if (!rect) return
    const centerX = item.x + item.width / 2
    const centerY = item.y + item.height / 2
    updateCamera({
      x: rect.width / 2 - centerX * camera.scale,
      y: rect.height / 2 - centerY * camera.scale,
      scale: camera.scale,
    })
  }

  const moveItemInStack = (id: string, direction: 'up' | 'down') => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id)
      if (index === -1) return prev
      const nextIndex = direction === 'up' ? Math.min(prev.length - 1, index + 1) : Math.max(0, index - 1)
      if (index === nextIndex) return prev
      const next = [...prev]
      const [moved] = next.splice(index, 1)
      next.splice(nextIndex, 0, moved)
      return next
    })
  }

  const openLayerContextMenu = (event: React.MouseEvent, item: CanvasItem) => {
    event.preventDefault()
    event.stopPropagation()
    const menuWidth = 200
    const menuHeight = 180
    const padding = 12
    const maxX = window.innerWidth - menuWidth - padding
    const maxY = window.innerHeight - menuHeight - padding
    const x = clamp(event.clientX, padding, Math.max(padding, maxX))
    const y = clamp(event.clientY, padding, Math.max(padding, maxY))
    setLayerDetailPopover(null)
    setLayerContextMenu({ id: item.id, x, y })
  }

  const openLayerDetails = (id: string, anchor: { x: number; y: number }) => {
    const panelWidth = 260
    const panelHeight = 240
    const padding = 12
    const maxX = window.innerWidth - panelWidth - padding
    const maxY = window.innerHeight - panelHeight - padding
    const x = clamp(anchor.x, padding, Math.max(padding, maxX))
    const y = clamp(anchor.y, padding, Math.max(padding, maxY))
    setLayerDetailPopover({ id, x, y })
  }

  const commitLayerRename = (id: string, value: string) => {
    const target = items.find((item) => item.id === id)
    if (!target) return
    const trimmed = value.trim()
    if (target.type === 'image') {
      updateImageItem(id, { name: trimmed || undefined })
    } else {
      updateItemLabel(id, trimmed || undefined)
    }
    setRenamingLayerId(null)
    setLayerNameDraft('')
  }

  const cancelLayerRename = () => {
    setRenamingLayerId(null)
    setLayerNameDraft('')
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file.type.startsWith('image/')) {
      toast.error('仅支持上传图片文件')
      return
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`图片过大，请控制在 ${MAX_FILE_SIZE_MB}MB 以内`)
      return
    }

    const toastId = toast.loading(USE_MOCK_UPLOAD ? '加载中...' : '上传中...')
    try {
      if (USE_MOCK_UPLOAD) {
        const reader = new FileReader()
        reader.onerror = () => {
          toast.error('读取图片失败，请重试', { id: toastId })
        }
        reader.onload = () => {
          const result = typeof reader.result === 'string' ? reader.result : ''
          if (!result) {
            toast.error('读取图片失败，请重试', { id: toastId })
            return
          }
          addImageItem(result, file.name, {
            meta: {
              source: 'upload',
              createdAt: new Date().toISOString(),
            },
          })
          toast.success('已添加到画布', { id: toastId })
        }
        reader.readAsDataURL(file)
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('provider', 'oss')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        const message = payload?.error || payload?.message || '上传失败'
        if (response.status === 401) {
          throw new Error('请先登录后再上传')
        }
        throw new Error(message)
      }

      const data = payload?.data as {
        url: string
        key?: string
        provider?: string
        expiresAt?: string
        originalName?: string
      }

      addImageItem(data.url, data.originalName ?? file.name, {
        key: data.key,
        provider: data.provider,
        expiresAt: data.expiresAt,
        meta: {
          source: 'upload',
          createdAt: new Date().toISOString(),
        },
      })
      toast.success('上传完成', { id: toastId })
    } catch (error) {
      const message = error instanceof Error ? error.message : '上传失败'
      toast.error(message, { id: toastId })
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    handleFiles(event.dataTransfer.files)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleClear = () => {
    setItems([])
    clearSelection()
    setEditingId(null)
  }

  const getDownloadName = (name?: string, mimeType?: string) => {
    if (name && name.includes('.')) return name
    if (mimeType?.includes('png')) return `${name ?? 'canvas-image'}.png`
    if (mimeType?.includes('jpeg')) return `${name ?? 'canvas-image'}.jpg`
    if (mimeType?.includes('webp')) return `${name ?? 'canvas-image'}.webp`
    return `${name ?? 'canvas-image'}.png`
  }

  const loadExportImage = async (src: string) => {
    if (!src) return null
    const loadImageElement = (url: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('图片加载失败'))
        img.src = url
      })

    if (src.startsWith('data:') || src.startsWith('blob:')) {
      try {
        return await loadImageElement(src)
      } catch (error) {
        return null
      }
    }

    try {
      const response = await fetch(src, { mode: 'cors' })
      if (!response.ok) {
        throw new Error('图片请求失败')
      }
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      try {
        return await loadImageElement(objectUrl)
      } finally {
        URL.revokeObjectURL(objectUrl)
      }
    } catch (error) {
      return null
    }
  }

  const buildLassoMarkedImage = async (item: CanvasImageItem, points: LassoPoint[]) => {
    const ensured = await ensureRemoteImageUrl(item, { allowLocal: true })
    const image = await loadExportImage(ensured.url)
    if (!image) {
      throw new Error('图片加载失败')
    }
    const width = image.naturalWidth || image.width
    const height = image.naturalHeight || image.height
    if (!width || !height) {
      throw new Error('图片尺寸读取失败')
    }
    const metrics = resolveImageMetrics(item)
    const scaleX = metrics ? width / metrics.intrinsicWidth : 1
    const scaleY = metrics ? height / metrics.intrinsicHeight : 1

    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.floor(width))
    canvas.height = Math.max(1, Math.floor(height))
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法创建画布')
    }
    ctx.drawImage(image, 0, 0, width, height)
    ctx.save()
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.95)'
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.beginPath()
    points.forEach((point, index) => {
      const x = point.x * scaleX
      const y = point.y * scaleY
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.stroke()
    ctx.restore()

    return canvas.toDataURL('image/png')
  }

  const getExportBounds = (exportItems: CanvasItem[]) => {
    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    for (const item of exportItems) {
      minX = Math.min(minX, item.x)
      minY = Math.min(minY, item.y)
      maxX = Math.max(maxX, item.x + item.width)
      maxY = Math.max(maxY, item.y + item.height)
    }

    if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
      return null
    }

    return { minX, minY, maxX, maxY }
  }

  const handleExportCanvas = async () => {
    if (isExporting) return
    const exportItems = items.filter((item) => {
      if (item.hidden) return false
      if (item.type === 'image') return Boolean(item.data?.src)
      return Boolean(item.data?.text?.trim())
    })

    if (exportItems.length === 0) {
      toast.message('画布为空，暂无可导出的内容')
      return
    }

    setIsExporting(true)
    const toastId = toast.loading('正在导出画布...')
    try {
      const bounds = getExportBounds(exportItems)
      if (!bounds) {
        toast.message('没有可导出的内容', { id: toastId, duration: 4000 })
        return
      }

      const width = Math.ceil(bounds.maxX - bounds.minX + EXPORT_PADDING * 2)
      const height = Math.ceil(bounds.maxY - bounds.minY + EXPORT_PADDING * 2)
      const maxSide = Math.max(width, height)
      const exportScale = maxSide > MAX_EXPORT_SIZE ? MAX_EXPORT_SIZE / maxSide : 1
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const exportBackground = 'transparent'

      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.floor(width * exportScale * dpr))
      canvas.height = Math.max(1, Math.floor(height * exportScale * dpr))
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('无法创建导出画布')
      }

      ctx.scale(dpr, dpr)

      if (exportBackground === 'solid') {
        const backgroundColor = window.getComputedStyle(document.body).backgroundColor || '#ffffff'
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width * exportScale, height * exportScale)
      }

      const bodyStyle = window.getComputedStyle(document.body)
      const textColor = bodyStyle.color || '#111111'
      const defaultFontFamily = bodyStyle.fontFamily || 'sans-serif'
      const failedImages: string[] = []
      const imageMap = new Map<string, HTMLImageElement>()

      await Promise.all(
        exportItems
          .filter((item): item is CanvasImageItem => item.type === 'image')
          .map(async (item) => {
            const image = await loadExportImage(item.data.src)
            if (!image) {
              failedImages.push(item.data.name ?? item.id)
              return
            }
            imageMap.set(item.id, image)
          })
      )

      const offsetX = EXPORT_PADDING - bounds.minX
      const offsetY = EXPORT_PADDING - bounds.minY

      for (const item of exportItems) {
        const x = (item.x + offsetX) * exportScale
        const y = (item.y + offsetY) * exportScale
        const itemWidth = item.width * exportScale
        const itemHeight = item.height * exportScale

        if (item.type === 'image') {
          const image = imageMap.get(item.id)
          if (!image) continue
          ctx.drawImage(image, x, y, itemWidth, itemHeight)
          continue
        }

        const text = item.data.text ?? ''
        if (!text.trim()) continue
        const fontSize = item.data.fontSize * exportScale
        const fontFamily = item.data.fontFamily || defaultFontFamily
        const fontWeight = item.data.fontWeight ?? DEFAULT_TEXT_FONT_WEIGHT
        const fontStyle = item.data.fontStyle ?? 'normal'
        const strokeWidth = item.data.strokeWidth ?? 0
        const strokeColor = item.data.strokeColor ?? 'transparent'
        const backgroundColor = item.data.backgroundColor ?? 'transparent'
        const align = item.data.align ?? 'left'
        const isNote = item.data.noteStyle
        const noteTone = item.data.noteTone ?? 'sticky'
        const paddingX = (isNote ? NOTE_PADDING_X : TEXT_PADDING_X) * exportScale
        const paddingY = (isNote ? NOTE_PADDING_Y : TEXT_PADDING_Y) * exportScale

        if (backgroundColor !== 'transparent') {
          ctx.fillStyle = backgroundColor
          ctx.fillRect(x, y, itemWidth, itemHeight)
        }
        if (isNote) {
          ctx.strokeStyle = noteTone === 'neutral' ? NOTE_NEUTRAL_BORDER_COLOR : NOTE_STICKY_BORDER_COLOR
          ctx.lineWidth = Math.max(1, exportScale)
          ctx.strokeRect(x, y, itemWidth, itemHeight)
        }

        const resolvedTextColor =
          item.data.color && item.data.color !== DEFAULT_TEXT_COLOR ? item.data.color : textColor
        ctx.fillStyle = resolvedTextColor
        ctx.textBaseline = 'top'
        ctx.textAlign = align === 'justify' ? 'left' : align
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
        const lineHeight = fontSize * 1.3
        const maxTextWidth = Math.max(itemWidth - paddingX * 2, 1)
        const lines = wrapCanvasText(ctx, text, maxTextWidth)
        const textX =
          align === 'center'
            ? x + itemWidth / 2
            : align === 'right'
            ? x + itemWidth - paddingX
            : x + paddingX
        lines.forEach((line, index) => {
          const lineY = y + paddingY + index * lineHeight
          if (strokeWidth > 0 && strokeColor !== 'transparent') {
            ctx.lineWidth = strokeWidth * exportScale
            ctx.strokeStyle = strokeColor
            ctx.strokeText(line, textX, lineY)
          }
          ctx.fillText(line, textX, lineY)
          if (item.data.textDecoration === 'underline') {
            const metrics = ctx.measureText(line)
            const underlineY = lineY + lineHeight - fontSize * 0.15
            const underlineWidth = metrics.width
            const underlineX =
              align === 'center'
                ? textX - underlineWidth / 2
                : align === 'right'
                ? textX - underlineWidth
                : textX
            ctx.strokeStyle = resolvedTextColor
            ctx.lineWidth = Math.max(1, fontSize * 0.08)
            ctx.beginPath()
            ctx.moveTo(underlineX, underlineY)
            ctx.lineTo(underlineX + underlineWidth, underlineY)
            ctx.stroke()
          }
        })
      }

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 1))
      if (!blob) {
        throw new Error('导出失败，请稍后再试')
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `loomai-canvas-${timestamp}.png`
      link.click()
      URL.revokeObjectURL(link.href)

      if (failedImages.length > 0) {
        toast.message(`已导出，但有 ${failedImages.length} 张图片无法导出`, { id: toastId, duration: 5000 })
      } else if (exportScale < 1) {
        toast.success(`导出完成（已按最大边 ${MAX_EXPORT_SIZE}px 缩放）`, { id: toastId, duration: 4000 })
      } else {
        toast.success('导出完成', { id: toastId, duration: 3000 })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '导出失败'
      toast.error(message, { id: toastId, duration: 5000 })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadItem = async (item: CanvasImageItem) => {
    const fallbackName = getDownloadName(item.data.name)
    try {
      const resolved = await ensureRemoteImageUrl(item, { allowLocal: true })
      const response = await fetch(resolved.url)
      if (!response.ok) {
        throw new Error('图片请求失败')
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = getDownloadName(item.data.name, blob.type)
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      const link = document.createElement('a')
      link.href = item.data.src
      link.download = fallbackName
      link.target = '_blank'
      link.rel = 'noopener'
      link.click()
    }
  }

  const handleImageLoadError = (item: CanvasImageItem) => {
    const src = item.data?.src
    if (!src) {
      setBrokenImages((prev) => ({ ...prev, [item.id]: true }))
      return
    }
    const shouldRefresh = Boolean(item.data?.key) || isSignedUrlExpiring(src, item.data?.expiresAt)
    if (!shouldRefresh) {
      setBrokenImages((prev) => ({ ...prev, [item.id]: true }))
      return
    }
    void (async () => {
      try {
        const refreshed = await refreshSignedUrlForItem(item)
        if (refreshed?.url) return
      } catch {
        // ignore and fall through to mark broken
      }
      setBrokenImages((prev) => ({ ...prev, [item.id]: true }))
    })()
  }


  const buildCutoutName = (name?: string) => {
    if (!name) return 'cutout.png'
    const base = name.includes('.') ? name.slice(0, Math.max(0, name.lastIndexOf('.'))) : name
    const resolvedBase = base || 'cutout'
    return `${resolvedBase}-cutout.png`
  }

  const buildLayerName = (name: string | undefined, index: number) => {
    const fallback = 'layer'
    const base = name && name.includes('.') ? name.slice(0, Math.max(0, name.lastIndexOf('.'))) : name
    const resolvedBase = base || fallback
    return `${resolvedBase}-layer-${index + 1}.png`
  }

  const dataUrlToFile = (dataUrl: string, name: string) => {
    const [header, data] = dataUrl.split(',')
    if (!header || !data) {
      throw new Error('图片数据格式错误')
    }
    const mimeMatch = header.match(/data:(.*?);base64/)
    const mimeType = mimeMatch?.[1] || 'image/png'
    const binary = atob(data)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new File([bytes], name, { type: mimeType })
  }

  const requestSignedUrl = async (key: string, provider?: string) => {
    const response = await fetch('/api/storage/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, provider }),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = payload?.message || payload?.error || '刷新图片地址失败'
      throw new Error(message)
    }
    return payload?.data as SignedUrlPayload
  }

  const refreshSignedUrlForItem = async (item: CanvasImageItem) => {
    const src = item.data?.src
    if (!src) return null
    const key = item.data?.key ?? parseStorageKeyFromUrl(src)
    if (!key) return null
    if (user?.id && !key.startsWith(`uploads/${user.id}/`)) return null
    const inFlight = refreshingSignedUrlsRef.current[item.id]
    if (inFlight) {
      return inFlight
    }
    const requestPromise = (async () => {
      const refreshed = await requestSignedUrl(key, item.data?.provider)
      if (refreshed?.url) {
        updateImageItem(item.id, {
          src: refreshed.url,
          key: refreshed.key ?? key,
          provider: refreshed.provider ?? item.data?.provider,
          expiresAt: refreshed.expiresAt,
        })
        resetImageLoadState(item.id)
      }
      return refreshed ?? null
    })()
    refreshingSignedUrlsRef.current[item.id] = requestPromise
    try {
      return await requestPromise
    } finally {
      delete refreshingSignedUrlsRef.current[item.id]
    }
  }

  const ensureImageUrlFresh = useCallback(
    (item: CanvasImageItem) => {
      const src = item.data?.src
      if (!src || (!src.startsWith('http://') && !src.startsWith('https://'))) return
      if (!isSignedUrlExpiring(src, item.data?.expiresAt)) return
      if (refreshingImageUrlsRef.current[item.id]) return
      refreshingImageUrlsRef.current[item.id] = true
      void (async () => {
        try {
          await refreshSignedUrlForItem(item)
        } finally {
          delete refreshingImageUrlsRef.current[item.id]
        }
      })()
    },
    [refreshSignedUrlForItem]
  )

  const scheduleImageLoadRetry = useCallback(
    (itemId: string) => {
      if (imageLoadRetryTimersRef.current[itemId]) return
      imageLoadRetryTimersRef.current[itemId] = window.setTimeout(async () => {
        delete imageLoadRetryTimersRef.current[itemId]
        const currentItem = itemsRef.current.find((entry) => entry.id === itemId)
        if (!currentItem || currentItem.type !== 'image') return
        if (currentItem.data?.generation?.status === 'pending') return
        if (loadedImagesRef.current[itemId] || brokenImagesRef.current[itemId]) return

        setBrokenThumbnails((prev) => {
          if (!prev[itemId]) return prev
          const next = { ...prev }
          delete next[itemId]
          return next
        })

        const refreshed = await refreshSignedUrlForItem(currentItem)
        if (refreshed?.url) return
        markImageBroken(itemId)
      }, 8000)
    },
    [markImageBroken, refreshSignedUrlForItem]
  )

  useEffect(() => {
    const liveIds = new Set(items.map((item) => item.id))
    Object.entries(imageLoadRetryTimersRef.current).forEach(([id, timer]) => {
      if (liveIds.has(id)) return
      window.clearTimeout(timer)
      delete imageLoadRetryTimersRef.current[id]
    })

    items.forEach((item) => {
      if (item.type !== 'image') return
      if (item.data?.generation?.status === 'pending') return
      if (!item.data?.src) return
      if (loadedImages[item.id] || brokenImages[item.id]) return
      scheduleImageLoadRetry(item.id)
    })
  }, [items, loadedImages, brokenImages, scheduleImageLoadRetry])

  const uploadImageFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('provider', 'oss')
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = payload?.error || payload?.message || '上传失败'
      if (response.status === 401) {
        throw new Error('请先登录后再上传')
      }
      throw new Error(message)
    }
    return payload?.data as SignedUrlPayload & {
      url: string
      key?: string
      provider?: string
      expiresAt?: string
      originalName?: string
    }
  }

  const ensureRemoteImageUrl = async (item: CanvasImageItem, options?: { allowLocal?: boolean }) => {
    const src = item.data?.src
    if (!src) {
      throw new Error('图片地址缺失')
    }
    if (src.startsWith('http://') || src.startsWith('https://')) {
      if (isSignedUrlExpiring(src, item.data?.expiresAt)) {
        const refreshed = await refreshSignedUrlForItem(item)
        if (refreshed?.url) return refreshed
      }
      return {
        url: src,
        key: item.data?.key,
        provider: item.data?.provider,
        expiresAt: item.data?.expiresAt,
      }
    }
    if (options?.allowLocal) {
      return {
        url: src,
        key: item.data?.key,
        provider: item.data?.provider,
        expiresAt: item.data?.expiresAt,
      }
    }
    const mediaType = resolveImageMediaType(src, item.data?.name)
    const filename = resolveImageFileName(item.data?.name, mediaType)
    let file: File
    if (src.startsWith('data:')) {
      file = dataUrlToFile(src, filename)
    } else {
      const response = await fetch(src)
      if (!response.ok) {
        throw new Error('读取图片失败')
      }
      const blob = await response.blob()
      file = new File([blob], filename, { type: blob.type || mediaType })
    }
    const uploaded = await uploadImageFile(file)
    if (!uploaded?.url || typeof uploaded.url !== 'string') {
      throw new Error('上传失败，未获取到图片地址')
    }
    updateImageItem(item.id, {
      src: uploaded.url,
      key: uploaded.key,
      provider: uploaded.provider,
      expiresAt: uploaded.expiresAt,
    })
    resetImageLoadState(item.id)
    return uploaded
  }

  const loadImageForCutout = async (item: CanvasImageItem) => {
    const resolved = await ensureRemoteImageUrl(item, { allowLocal: true })
    const src = resolved.url
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      if (src.startsWith('http://') || src.startsWith('https://')) {
        img.crossOrigin = 'anonymous'
      }
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = src
    })
  }

  const resetLassoState = () => {
    lassoPointerIdRef.current = null
    setLassoState(null)
  }

  const resetLassoPath = () => {
    setLassoState((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        points: [],
        isDrawing: false,
        closed: false,
      }
    })
  }

  const handleLassoPointerDown = (event: React.PointerEvent<HTMLDivElement>, item: CanvasImageItem) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    if (!resolveImageMetrics(item)) {
      toast.error('图片尚未加载完成')
      return
    }
    const rect = getViewportRect()
    if (!rect) return
    const worldPoint = screenToWorld(event.clientX - rect.left, event.clientY - rect.top)
    const imagePoint = resolveImagePoint(item, worldPoint.x, worldPoint.y)
    if (!imagePoint) return
    lassoPointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    setLassoState({
      itemId: item.id,
      points: [imagePoint],
      isDrawing: true,
      closed: false,
    })
  }

  const handleLassoPointerMove = (event: React.PointerEvent<HTMLDivElement>, item: CanvasImageItem) => {
    if (lassoPointerIdRef.current !== event.pointerId) return
    event.preventDefault()
    event.stopPropagation()
    const rect = getViewportRect()
    if (!rect) return
    const worldPoint = screenToWorld(event.clientX - rect.left, event.clientY - rect.top)
    const imagePoint = resolveImagePoint(item, worldPoint.x, worldPoint.y)
    if (!imagePoint) return
    setLassoState((prev) => {
      if (!prev || prev.itemId !== item.id || !prev.isDrawing) return prev
      const last = prev.points[prev.points.length - 1]
      if (last) {
        const dx = imagePoint.x - last.x
        const dy = imagePoint.y - last.y
        if (dx * dx + dy * dy < 4) {
          return prev
        }
      }
      return {
        ...prev,
        points: [...prev.points, imagePoint],
      }
    })
  }

  const handleLassoPointerUp = (event: React.PointerEvent<HTMLDivElement>, item: CanvasImageItem) => {
    if (lassoPointerIdRef.current !== event.pointerId) return
    event.preventDefault()
    event.stopPropagation()
    lassoPointerIdRef.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
    setLassoState((prev) => {
      if (!prev || prev.itemId !== item.id) return prev
      const shouldClose = prev.points.length >= 3
      return {
        ...prev,
        isDrawing: false,
        closed: shouldClose,
      }
    })
  }

  const handleLassoCutout = async (item: CanvasImageItem) => {
    if (isLassoProcessing) return
    if (!lassoState || lassoState.itemId !== item.id) return
    if (!lassoState.closed || lassoState.points.length < 3) {
      toast.error('请先绘制闭合选区')
      return
    }
    const metrics = resolveImageMetrics(item)
    if (!metrics) {
      toast.error('图片尚未加载完成')
      return
    }
    const bounds = getLassoBounds(lassoState.points)
    if (!bounds || bounds.width <= 1 || bounds.height <= 1) {
      toast.error('选区过小，请重试')
      return
    }

    const padding = 1
    const minX = clamp(Math.floor(bounds.minX - padding), 0, metrics.intrinsicWidth)
    const minY = clamp(Math.floor(bounds.minY - padding), 0, metrics.intrinsicHeight)
    const maxX = clamp(Math.ceil(bounds.maxX + padding), 0, metrics.intrinsicWidth)
    const maxY = clamp(Math.ceil(bounds.maxY + padding), 0, metrics.intrinsicHeight)
    const width = Math.max(1, maxX - minX)
    const height = Math.max(1, maxY - minY)

    const toastId = toast.loading('正在生成抠图...')
    setIsLassoProcessing(true)
    try {
      const image = await loadImageForCutout(item)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Canvas 初始化失败')
      }
      ctx.save()
      ctx.beginPath()
      lassoState.points.forEach((point, index) => {
        const x = point.x - minX
        const y = point.y - minY
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(image, -minX, -minY)
      ctx.restore()
      let dataUrl = ''
      try {
        dataUrl = canvas.toDataURL('image/png')
      } catch {
        throw new Error('图片跨域受限，请先上传后再抠图')
      }

      const nextId = nanoid()
      const nextItem: CanvasItem = {
        id: nextId,
        type: 'image',
        x: Math.round((item.x + metrics.offsetX + minX * metrics.scale) * 100) / 100,
        y: Math.round((item.y + metrics.offsetY + minY * metrics.scale) * 100) / 100,
        width: Math.round(width * metrics.scale * 100) / 100,
        height: Math.round(height * metrics.scale * 100) / 100,
        data: {
          src: dataUrl,
          name: buildCutoutName(item.data.name),
          meta: {
            source: 'lasso',
            derivedFromId: item.id,
            createdAt: new Date().toISOString(),
          },
        },
      }
      setItems((prev) => [...prev, nextItem])
      syncSelection([nextId], nextId)
      resetLassoState()
      toast.success('抠图完成，已生成新图层', { id: toastId })
    } catch (error) {
      const message = error instanceof Error ? error.message : '抠图失败'
      toast.error(message, { id: toastId })
    } finally {
      setIsLassoProcessing(false)
    }
  }

  const pollRemoveBackgroundResult = async (jobId: string, filename?: string) => {
    const maxAttempts = 20
    const delayMs = 1500
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const query = new URLSearchParams({ jobId })
      if (filename) {
        query.set('filename', filename)
      }
      const response = await fetch(`/api/image-seg?${query.toString()}`)
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        const message = payload?.message || payload?.error || '查询失败'
        throw new Error(message)
      }
      const status = payload?.data?.status
      if (status === 'PROCESS_SUCCESS') {
        const imageUrl = payload?.data?.imageUrl
        if (!imageUrl) {
          throw new Error('未获取到去背结果')
        }
        return {
          url: imageUrl as string,
          key: payload?.data?.key,
          provider: payload?.data?.provider,
          expiresAt: payload?.data?.expiresAt,
        }
      }
      if (status === 'PROCESS_FAILED') {
        throw new Error(payload?.data?.errorMessage || '去背失败')
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
    throw new Error('处理超时，请稍后重试')
  }

  const handleRemoveBackground = async (item: CanvasImageItem) => {
    if (!item.data?.src) return
    if (removingBackgroundIds[item.id]) return
    setRemovingBackgroundIds((prev) => ({ ...prev, [item.id]: true }))
    const toastId = toast.loading('正在去背...')
    const appendCutout = (result: SignedUrlPayload, nextName: string) => {
      const nextId = nanoid()
      const nextItem: CanvasItem = {
        id: nextId,
        type: 'image',
        x: Math.round((item.x + DUPLICATE_OFFSET) * 100) / 100,
        y: Math.round((item.y + DUPLICATE_OFFSET) * 100) / 100,
        width: item.width,
        height: item.height,
        data: {
          src: result.url,
          name: nextName,
          key: result.key,
          provider: result.provider,
          expiresAt: result.expiresAt,
          meta: {
            source: 'remove-background',
            derivedFromId: item.id,
            createdAt: new Date().toISOString(),
          },
        },
      }
      setItems((prev) => [...prev, nextItem])
      syncSelection([nextId], nextId)
    }
    try {
      const { url } = await ensureRemoteImageUrl(item)
      const nextName = buildCutoutName(item.data.name)
      const response = await fetch('/api/image-seg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: url,
          filename: nextName,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        const message = payload?.message || payload?.error || '提交失败'
        throw new Error(message)
      }
      const immediateUrl = payload?.data?.imageUrl
      if (payload?.data?.status === 'PROCESS_SUCCESS' && immediateUrl) {
        appendCutout(
          {
            url: immediateUrl,
            key: payload?.data?.key,
            provider: payload?.data?.provider,
            expiresAt: payload?.data?.expiresAt,
          },
          nextName
        )
        toast.success('去背完成', { id: toastId })
        return
      }
      const jobId = payload?.data?.jobId
      if (!jobId) {
        throw new Error('任务创建失败')
      }
      const result = await pollRemoveBackgroundResult(jobId, nextName)
      appendCutout(result, nextName)
      toast.success('去背完成', { id: toastId })
    } catch (error) {
      const message = error instanceof Error ? error.message : '去背失败'
      toast.error(message, { id: toastId })
    } finally {
      setRemovingBackgroundIds((prev) => {
        if (!prev[item.id]) return prev
        const next = { ...prev }
        delete next[item.id]
        return next
      })
    }
  }

  const handleDecomposeLayers = async (item: CanvasImageItem) => {
    if (!item.data?.src) return
    if (decomposingLayerIds[item.id]) return
    setDecomposingLayerIds((prev) => ({ ...prev, [item.id]: true }))
    const toastId = toast.loading('正在拆解图层...')
    try {
      const { url } = await ensureRemoteImageUrl(item)
      const response = await fetch('/api/image-layered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: url,
          filename: item.data?.name,
          numLayers: layerDecomposeCount,
          guidanceScale: layerGuidanceScale,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        const message = payload?.message || payload?.error || '拆解失败'
        throw new Error(message)
      }
      const images = Array.isArray(payload?.data?.images) ? payload.data.images : []
      const normalizedImages: SignedUrlPayload[] = images
        .map((layer) => {
          if (typeof layer === 'string') {
            return { url: layer }
          }
          if (!layer || typeof layer !== 'object') return null
          const raw = layer as Record<string, unknown>
          const url =
            typeof raw.url === 'string'
              ? raw.url
              : typeof raw.imageUrl === 'string'
                ? raw.imageUrl
                : typeof raw.image_url === 'string'
                  ? raw.image_url
                  : null
          if (!url) return null
          const key = typeof raw.key === 'string' ? raw.key : undefined
          const provider = typeof raw.provider === 'string' ? raw.provider : undefined
          const expiresAt = typeof raw.expiresAt === 'string' ? raw.expiresAt : undefined
          return { url, key, provider, expiresAt }
        })
        .filter((layer): layer is SignedUrlPayload => Boolean(layer?.url))

      if (!normalizedImages.length) {
        throw new Error('未获取到图层结果')
      }
      if (normalizedImages.length !== images.length) {
        toast.error('部分图层缺少图片地址，已跳过')
      }
      const nextItems: CanvasItem[] = normalizedImages.map((layer: SignedUrlPayload, index: number) => {
        const layerName = buildLayerName(item.data?.name, index)
        return {
          id: nanoid(),
          type: 'image',
          x: Math.round(item.x * 100) / 100,
          y: Math.round(item.y * 100) / 100,
          width: item.width,
          height: item.height,
          data: {
            src: layer.url,
            name: layerName,
            key: layer.key,
            provider: layer.provider,
            expiresAt: layer.expiresAt,
            meta: {
              source: 'layered',
              model: 'qwen-image-layered',
              provider: 'fal',
              derivedFromId: item.id,
              createdAt: new Date().toISOString(),
            },
          },
        }
      })
      const nextIds = nextItems.map((next) => next.id)
      setItems((prev) => [...prev, ...nextItems])
      syncSelection(nextIds, nextIds[0])
      toast.success('图层已拆解', { id: toastId })
    } catch (error) {
      const message = error instanceof Error ? error.message : '拆解失败'
      toast.error(message, { id: toastId })
    } finally {
      setDecomposingLayerIds((prev) => {
        if (!prev[item.id]) return prev
        const next = { ...prev }
        delete next[item.id]
        return next
      })
    }
  }

  const handleCopyItem = (item: CanvasItem | null) => {
    if (!item) return
    const nextId = nanoid()
    const nextItem: CanvasItem = {
      ...item,
      id: nextId,
      x: Math.round((item.x + DUPLICATE_OFFSET) * 100) / 100,
      y: Math.round((item.y + DUPLICATE_OFFSET) * 100) / 100,
      data: { ...item.data },
    }

    setItems((prev) => [...prev, nextItem])
    syncSelection([nextId], nextId)
    setLoadedImages((prev) => (prev[item.id] ? { ...prev, [nextId]: true } : prev))
    setBrokenImages((prev) => (prev[item.id] ? { ...prev, [nextId]: true } : prev))
  }

  const toggleLassoForItem = (item: CanvasImageItem) => {
    setActiveTool('select')
    setLassoState((prev) => {
      if (prev?.itemId === item.id) return null
      return {
        itemId: item.id,
        points: [],
        isDrawing: false,
        closed: false,
      }
    })
  }

  const handleToolClick = (toolId: ToolId) => {
    if (lassoState) {
      setLassoState(null)
    }
    setActiveTool(toolId)
    if (toolId === 'image') {
      setIsCanvasPromptOpen((prev) => !prev)
      return
    }
    if (toolId === 'text') {
      setIsChatOpen(true)
      setIsChatMinimized(false)
    }
  }

  const resolveImageMediaType = (src: string, name?: string) => {
    if (src.startsWith('data:')) {
      const match = src.match(/^data:([^;]+);/)
      if (match?.[1]) return match[1]
    }
    const base = (name || src).split('?')[0]
    const ext = base.split('.').pop()?.toLowerCase()
    if (ext === 'png') return 'image/png'
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
    if (ext === 'webp') return 'image/webp'
    if (ext === 'gif') return 'image/gif'
    return 'image/png'
  }

  const resolveImageFileName = (name: string | undefined, mediaType: string) => {
    const fallbackExt = mediaType.split('/')[1] || 'png'
    if (name) {
      return name.includes('.') ? name : `${name}.${fallbackExt}`
    }
    return `selected-image.${fallbackExt}`
  }

  const handleChatAgentSwitch = (nextAgentId: string) => {
    if (nextAgentId === selectedChatAgentId) return
    setActiveChatHistoryId(null)
    setFashionPromptDraft(null)
    processedFashionAssistantIdsRef.current.clear()
    if (nextAgentId === CHAT_AGENT_NONE_VALUE) {
      setSelectedChatAgentId(CHAT_AGENT_NONE_VALUE)
      setMessages([buildChatWelcomeMessage()])
      setChatInput('')
      setIsChatPinnedToBottom(true)
      setShowChatJumpToLatest(false)
      requestAnimationFrame(() => {
        chatInputRef.current?.focus()
        scrollChatToBottom('auto')
      })
      return
    }
    const nextAgent = chatAgents.find((agent) => agent.id === nextAgentId)
    if (!nextAgent) return
    setSelectedChatAgentId(nextAgentId)
    setMessages([buildChatWelcomeMessage(nextAgent.name)])
    setChatInput('')
    setIsChatPinnedToBottom(true)
    setShowChatJumpToLatest(false)
    requestAnimationFrame(() => {
      chatInputRef.current?.focus()
      scrollChatToBottom('auto')
    })
  }

  const handleCreateChatAgent = () => {
    const normalizedName = normalizeAgentName(newChatAgentName)
    const normalizedPrompt = normalizeAgentPrompt(newChatAgentPrompt)
    if (!normalizedName || !normalizedPrompt) {
      toast.error('请填写智能体名称和设定提示词')
      return
    }
    if (customChatAgents.length >= MAX_CUSTOM_CHAT_AGENT_COUNT) {
      toast.error(`最多创建 ${MAX_CUSTOM_CHAT_AGENT_COUNT} 个自定义智能体`)
      return
    }
    const nextAgent: CanvasChatAgent = {
      id: `custom-${nanoid(10)}`,
      name: normalizedName,
      source: 'custom',
      systemPrompt: normalizedPrompt,
      starterPrompts: [],
    }
    setCustomChatAgents((prev) => [...prev, nextAgent])
    setSelectedChatAgentId(nextAgent.id)
    setMessages([buildChatWelcomeMessage(nextAgent.name)])
    setNewChatAgentName('')
    setNewChatAgentPrompt('')
    setIsChatAgentComposerOpen(false)
    setActiveChatHistoryId(null)
    toast.success('已创建智能体')
    requestAnimationFrame(() => {
      chatInputRef.current?.focus()
      scrollChatToBottom('auto')
    })
  }

  const sendChat = async () => {
    const text = chatInput.trim()
    if (status === 'streaming' || status === 'submitted') return

    if (
      selectedChatAgentId === FASHION_TREND_AGENT_ID &&
      text &&
      fashionPromptDraft?.prompts?.length &&
      shouldTriggerPromptGeneration(text)
    ) {
      const index = resolvePromptDirectionIndex(text, fashionPromptDraft.prompts.length)
      const selectedPrompt = fashionPromptDraft.prompts[index]
      if (selectedPrompt) {
        setChatInput('')
        const generationStartMessages: UIMessage[] = [
          ...messages,
          buildChatTextMessage('user', text),
          buildChatTextMessage(
            'assistant',
            `收到，开始生成方向 ${index + 1} 的效果图（模型：${FASHION_TREND_IMAGE_MODEL}）...`
          ),
        ]
        setMessages(generationStartMessages)
        const result = await handleGenerateCanvasImage({
          promptOverride: selectedPrompt,
          modelOverride: FASHION_TREND_IMAGE_MODEL,
          sizeOverride: '1:1',
          skipReferenceImages: true,
        })
        setMessages([
          ...generationStartMessages,
          buildChatTextMessage(
            'assistant',
            result.success
              ? `已生成方向 ${index + 1} 的图片并加入画布。要继续生成其他方向吗？你可以回复“同意生成方向2”。`
              : `方向 ${index + 1} 生成失败：${result.error ?? '未知错误'}，你可以重试。`
          ),
        ])
        return
      }
    }

    const selectedItemsNow = items.filter((item) => selectedIds.includes(item.id))
    const primaryItem = selectedItemsNow.find((item) => item.id === selectedId) ?? selectedItemsNow[0] ?? null
    const hasMultiSelectionNow = selectedItemsNow.length > 1
    let files: FileUIPart[] | undefined
    let attachmentHint = ''

    if (
      primaryItem?.type === 'image' &&
      primaryItem.data?.src &&
      primaryItem.data?.generation?.status !== 'pending'
    ) {
      try {
        const ensured = await ensureRemoteImageUrl(primaryItem)
        const mediaType = resolveImageMediaType(ensured.url, primaryItem.data.name)
        const filename = resolveImageFileName(primaryItem.data.name, mediaType)
        files = [
          {
            type: 'file',
            mediaType,
            filename,
            url: ensured.url,
          },
        ]
        const label = primaryItem.data?.name?.trim() || '未命名图片'
        attachmentHint = hasMultiSelectionNow
          ? `【已附加图片：${label}（多选，仅附加一张）】\n`
          : `【已附加图片：${label}】\n`
      } catch (chatImageError) {
        const message = chatImageError instanceof Error ? chatImageError.message : '图片链接已失效'
        toast.error(message)
      }
    }
    if (!text && !files?.length) {
      toast.error('请先输入内容，或选中一张图片再发送')
      return
    }
    if (selectedChatAgentId === FASHION_TREND_AGENT_ID) {
      setFashionPromptDraft(null)
    }
    setChatInput('')
    await sendMessage(
      { text: attachmentHint ? `${attachmentHint}${text}` : text || '请根据附图给建议', files },
      {
        body: {
          provider: chatProvider,
          model: chatModel,
          agent: selectedChatAgentId !== CHAT_AGENT_NONE_VALUE && activeChatAgent
            ? {
                id: activeChatAgent.id,
                name: activeChatAgent.name,
                source: activeChatAgent.source,
                systemPrompt: activeChatAgent.systemPrompt,
              }
            : undefined,
        },
      }
    )
  }

  const handleGenerateCanvasImage = async (options?: {
    promptOverride?: string
    modelOverride?: string
    sizeOverride?: string
    skipReferenceImages?: boolean
  }) => {
    const prompt = (options?.promptOverride ?? resolvedCanvasPrompt).trim()
    if (!prompt || isImageGenerating) {
      return { success: false as const, error: '提示词为空或任务进行中' }
    }
    const toastId = toast.loading('正在生成图片...')
    setIsImageGenerating(true)
    let pendingImageId: string | null = null
    const stopPendingProgress = () => {
      if (pendingImageProgressTimerRef.current !== null) {
        window.clearInterval(pendingImageProgressTimerRef.current)
        pendingImageProgressTimerRef.current = null
      }
    }

    try {
      const model = options?.modelOverride?.trim() || imageModel
      const isSquareOnlyModel = isSquareOnlyEvolinkModel(model)
      const modelOption = imageModelOptions.find((option) => option.value === model)
      const providerLabel = modelOption?.provider
      const isLassoEdit = isLassoActive && isLassoReady && selectedItem?.type === 'image'
      const shouldSkipReferences = options?.skipReferenceImages ?? false
      const referenceImageLimit = shouldSkipReferences ? 0 : resolveCanvasReferenceImageLimit(model)
      if (isLassoActive && !isLassoReady) {
        toast.error('请先闭合套索选区', { id: toastId })
        return { success: false as const, error: '请先闭合套索选区' }
      }
      let resolvedSize: string | undefined
      if (options?.sizeOverride) {
        resolvedSize = options.sizeOverride
      } else if (isSquareOnlyModel) {
        resolvedSize = '1:1'
      } else if (imageSizeMode === 'custom') {
        const width = Number(customSizeWidth)
        const height = Number(customSizeHeight)
        if (!Number.isFinite(width) || !Number.isFinite(height)) {
          toast.error('请输入有效的自定义尺寸', { id: toastId })
          return { success: false as const, error: '请输入有效的自定义尺寸' }
        }
        if (width < 376 || width > 1536 || height < 376 || height > 1536) {
          toast.error('自定义尺寸需在 376-1536 之间', { id: toastId })
          return { success: false as const, error: '自定义尺寸需在 376-1536 之间' }
        }
        resolvedSize = `${Math.round(width)}x${Math.round(height)}`
      } else {
        resolvedSize = imageSizeMode
      }

      if (isSquareOnlyModel && resolvedSize === 'auto') {
        resolvedSize = '1:1'
      }

      if (!resolvedSize) {
        resolvedSize = resolveDefaultEvolinkSize(model)
      }

      const payload: Record<string, unknown> = {
        prompt,
        model,
      }

      if (isLassoEdit) {
        const markedDataUrl = await buildLassoMarkedImage(selectedItem as CanvasImageItem, lassoState!.points)
        const markedFile = dataUrlToFile(markedDataUrl, 'lasso-edit.png')
        const uploaded = await uploadImageFile(markedFile)
        if (!uploaded?.url) {
          throw new Error('标注图上传失败')
        }
        payload.image_urls = [uploaded.url]
      } else {
        if (referenceImageLimit > 0 && selectedImageItems.length > referenceImageLimit) {
          toast.error(`当前模型最多支持 ${referenceImageLimit} 张参考图`, { id: toastId })
          return { success: false as const, error: `当前模型最多支持 ${referenceImageLimit} 张参考图` }
        }

        if (referenceImageLimit > 0 && selectedImageItems.length > 0) {
          const resolvedUrls: string[] = []
          for (const item of selectedImageItems) {
            const ensured = await ensureRemoteImageUrl(item)
            if (!ensured?.url) {
              throw new Error('参考图获取失败')
            }
            resolvedUrls.push(ensured.url)
          }
          if (resolvedUrls.length > 0) {
            payload.image_urls = resolvedUrls
          }
        }
      }

      if (resolvedSize && resolvedSize !== 'auto') {
        payload.size = resolvedSize
      }

      const pendingItem = createPendingImageItem({
        prompt,
        model,
        provider: providerLabel,
        size: resolvedSize,
      })
      pendingImageId = pendingItem.id

      pendingImageProgressTimerRef.current = window.setInterval(() => {
        setItems((prev) =>
          prev.map((item) => {
            if (item.id !== pendingItem.id || item.type !== 'image' || item.data.generation?.status !== 'pending') {
              return item
            }
            const current = item.data.generation.progress
            const delta = current < 35 ? 8 : current < 65 ? 5 : current < 85 ? 3 : 1
            const nextProgress = Math.min(PENDING_IMAGE_MAX_PROGRESS, current + delta)
            if (nextProgress === current) return item
            return {
              ...item,
              data: {
                ...item.data,
                generation: {
                  ...item.data.generation,
                  progress: nextProgress,
                },
              },
            }
          })
        )
      }, 1300)

      const response = await fetch('/api/image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        stopPendingProgress()
        if (pendingImageId) {
          removePendingImageItem(pendingImageId)
          pendingImageId = null
        }
        const message = data?.message || data?.error || '生成失败'
        if (response.status === 401) {
          toast.error('请先登录后再试', { id: toastId })
        } else if (response.status === 402) {
          toast.error('积分不足，请先充值', { id: toastId })
        } else {
          toast.error(message, { id: toastId })
        }
        return { success: false as const, error: message }
      }

      const imageUrl = data?.data?.imageUrl
      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('未返回图片地址')
      }

      const storageKey = typeof data?.data?.key === 'string' ? data.data.key : undefined
      const storageProvider = typeof data?.data?.provider === 'string' ? data.data.provider : undefined
      const expiresAt = typeof data?.data?.expiresAt === 'string' ? data.data.expiresAt : undefined

      if (pendingImageId) {
        setPendingImageProgress(pendingImageId, 99)
      }
      stopPendingProgress()

      if (!pendingImageId) {
        throw new Error('生成占位已丢失，请重试')
      }

      finalizePendingImageItem(pendingImageId, {
        src: imageUrl,
        key: storageKey,
        provider: storageProvider,
        expiresAt,
        model,
        providerLabel,
        prompt,
        size: resolvedSize,
        source: isLassoEdit ? 'lasso-edit' : 'generate',
      })
      pendingImageId = null
      setCanvasInput('')
      if (typeof data?.credits?.remaining === 'number') {
        setCreditBalance(data.credits.remaining)
      }
      toast.success('已生成并添加到画布', { id: toastId })
      return { success: true as const }
    } catch (error) {
      stopPendingProgress()
      if (pendingImageId) {
        removePendingImageItem(pendingImageId)
      }
      const message = error instanceof Error ? error.message : '生成失败，请稍后重试'
      toast.error(message, { id: toastId })
      return { success: false as const, error: message }
    } finally {
      stopPendingProgress()
      setIsImageGenerating(false)
    }
  }

  const handleCreateLassoMark = async () => {
    if (!isLassoActive || !isLassoReady || selectedItem?.type !== 'image') {
      toast.error('请先闭合套索选区')
      return
    }
    const toastId = toast.loading('正在生成选区标注...')
    try {
      const markedDataUrl = await buildLassoMarkedImage(selectedItem, lassoState!.points)
      addImageItem(markedDataUrl, 'lasso-mark', {
        meta: {
          source: 'lasso-mark',
          createdAt: new Date().toISOString(),
        },
      })
      toast.success('已添加选区标注', { id: toastId })
    } catch (error) {
      const message = error instanceof Error ? error.message : '生成失败，请稍后重试'
      toast.error(message, { id: toastId })
    }
  }


  const insertCanvasText = () => {
    const text = resolvedCanvasPrompt.trim()
    if (!text) return
    const { width, height } = measureTextBox(text, DEFAULT_TEXT_SIZE, DEFAULT_TEXT_BOX_WIDTH)
    const center = getViewportCenterWorld()
    createTextItem(center.x - width / 2, center.y - height / 2, text, false)
    setCanvasInput('')
  }

  const handleCanvasSubmit = () => {
    if (isImagePromptMode) {
      void handleGenerateCanvasImage()
      return
    }
    insertCanvasText()
  }

  const handleCanvasPresetSelect = (presetId: string) => {
    const preset = CANVAS_PRESET_ACTIONS.find((item) => item.id === presetId)
    if (!preset) return
    setSelectedPresetId(presetId)
    setIsCanvasPresetOpen(false)
    window.requestAnimationFrame(() => {
      canvasInputRef.current?.focus()
    })
  }

  const handleChatSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await sendChat()
  }

  const handleQuickStartFashionAnalysis = useCallback((prompt: string) => {
    setIsChatOpen(true)
    setIsChatMinimized(false)
    setSelectedChatAgentId(FASHION_TREND_AGENT_ID)
    setChatInput(prompt)
    requestAnimationFrame(() => chatInputRef.current?.focus())
  }, [])

  const resolveMessageText = (message: UIMessage) => resolveCanvasMessageText(message)
  const resolveMessageFiles = (message: UIMessage) => {
    const parts = (message as UIMessage & { parts?: Array<Partial<FileUIPart> & { type?: string }> }).parts
    const partFiles = Array.isArray(parts)
      ? parts.flatMap((part) => {
          if (part.type === 'file' && typeof part.url === 'string') {
            return [part as FileUIPart]
          }
          if (part.type === 'image' && typeof part.url === 'string') {
            return [
              {
                type: 'file',
                url: part.url,
                mediaType: part.mediaType ?? 'image/*',
                filename: part.filename ?? 'image',
              } as FileUIPart,
            ]
          }
          return []
        })
      : []
    const legacyFiles = (message as UIMessage & { files?: FileUIPart[] }).files
    const attachmentFiles = (message as UIMessage & { attachments?: FileUIPart[] }).attachments
    const experimentalFiles = (message as UIMessage & { experimental_attachments?: FileUIPart[] }).experimental_attachments
    const all = [
      ...partFiles,
      ...(Array.isArray(legacyFiles) ? legacyFiles : []),
      ...(Array.isArray(attachmentFiles) ? attachmentFiles : []),
      ...(Array.isArray(experimentalFiles) ? experimentalFiles : []),
    ].filter((file): file is FileUIPart => Boolean(file && typeof file.url === 'string'))
    const seen = new Set<string>()
    return all.filter((file) => {
      const key = `${file.url ?? ''}|${file.filename ?? ''}`
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
  const stripAttachmentHint = (text: string, hasFiles: boolean) => {
    if (!hasFiles) return text
    const lines = text.split('\n')
    if (lines[0]?.startsWith('【已附加图片')) {
      return lines.slice(1).join('\n').trim()
    }
    return text
  }
  const resolveFileBadge = (filename?: string) => {
    if (!filename) return 'FILE'
    const ext = filename.split('.').pop()
    if (!ext) return 'FILE'
    return ext.slice(0, 4).toUpperCase()
  }

  const zoomPercent = Math.round(camera.scale * 100)
  const isChatBusy = status === 'streaming' || status === 'submitted'
  const isChatPanelOpen = isChatOpen && !isChatMinimized
  const layerPanelShiftClass = isLayerPanelOpen ? 'translate-x-[296px]' : 'translate-x-0'
  const chatPanelShiftClass = isChatPanelOpen ? '-translate-x-[376px]' : 'translate-x-0'
  const resolveTextLabel = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return '未命名文本'
    return trimmed.split('\n')[0].slice(0, 16)
  }
  const getLayerLabel = (item: CanvasItem) => {
    if (item.type === 'text') {
      const label = item.label?.trim()
      return label || resolveTextLabel(item.data.text ?? '')
    }
    return item.data?.name?.trim() || '未命名图片'
  }
  const getLayerSourceLabel = (item: CanvasItem) => {
    if (item.type === 'text') return '手动输入'
    const source = item.data.meta?.source
    if (!source) return '未知来源'
    const map: Record<string, string> = {
      upload: '上传',
      generate: '生成',
      'remove-background': '去背',
      layered: '拆解图层',
      duplicate: '复制',
      import: '导入',
      lasso: '套索抠图',
      'lasso-edit': '套索修图',
      'lasso-mark': '选区标注',
    }
    return map[source] ?? '未知来源'
  }
  const formatMetaTime = (value?: string) => {
    if (!value) return '未知'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString()
  }
  const layerItems = useMemo(() => [...items].reverse(), [items])
  const layerOrderMap = useMemo(() => new Map(items.map((item, index) => [item.id, index])), [items])
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  )
  const selectedImageItems = useMemo(
    () =>
      selectedItems.filter(
        (item): item is CanvasImageItem => item.type === 'image' && item.data?.generation?.status !== 'pending'
      ),
    [selectedItems]
  )
  const selectedItem = selectedItems.find((item) => item.id === selectedId) ?? selectedItems[0] ?? null
  const hasMultiSelection = selectedItems.length > 1
  const selectedItemLabel = hasMultiSelection
    ? `已选 ${selectedItems.length} 项`
    : selectedItem
    ? getLayerLabel(selectedItem)
    : ''
  const primaryReferenceItem =
    selectedItem?.type === 'image' && selectedItem.data?.generation?.status !== 'pending'
      ? selectedItem
      : selectedImageItems[0] ?? null
  const primaryReferenceLabel = primaryReferenceItem?.data?.name?.trim() || '未命名图片'
  const userDisplayName = user?.name?.trim() || user?.email?.split('@')[0] || '访客'
  const userInitials = userDisplayName.slice(0, 2)
  const hasUserMessage = useMemo(() => messages.some((message) => message.role === 'user'), [messages])
  const creditsDisplay = isCreditsLoading
    ? '…'
    : creditBalance !== null
      ? Math.round(creditBalance).toString()
      : '--'
  const isTextSelected = selectedItem?.type === 'text' && !hasMultiSelection
  const isSelectedImageGenerating =
    selectedItem?.type === 'image' && selectedItem.data?.generation?.status === 'pending'
  const isRemovingBackground =
    selectedItem?.type === 'image' && Boolean(removingBackgroundIds[selectedItem.id])
  const isLayerDecomposing =
    selectedItem?.type === 'image' && Boolean(decomposingLayerIds[selectedItem.id])
  const isLassoActive = selectedItem?.type === 'image' && lassoState?.itemId === selectedItem.id
  const isLassoReady = Boolean(isLassoActive && lassoState?.closed && lassoState.points.length >= 3)
  const selectedIdsSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const chatAgents = useMemo(
    () => [...BUILTIN_CHAT_AGENTS, ...customChatAgents],
    [customChatAgents]
  )
  const activeChatAgent = useMemo(
    () =>
      selectedChatAgentId === CHAT_AGENT_NONE_VALUE
        ? null
        : chatAgents.find((agent) => agent.id === selectedChatAgentId) ?? chatAgents[0] ?? BUILTIN_CHAT_AGENTS[0],
    [chatAgents, selectedChatAgentId]
  )
  const canCreateChatAgent =
    normalizeAgentName(newChatAgentName).length > 0 && normalizeAgentPrompt(newChatAgentPrompt).length > 0
  const selectedPreset = useMemo(
    () => CANVAS_PRESET_ACTIONS.find((item) => item.id === selectedPresetId) ?? null,
    [selectedPresetId]
  )
  const editingTextItem = useMemo(
    () => items.find((item) => item.id === editingId && item.type === 'text') ?? null,
    [items, editingId]
  )
  const isTextEditing = Boolean(editingTextItem)
  const imageModelOptions = useMemo(() => {
    const providers = Object.entries(imageProviderModels) as Array<[keyof typeof imageProviderModels, string[]]>
    return providers.flatMap(([provider, models]) => {
      const providerLabel = IMAGE_PROVIDER_LABELS[provider as keyof typeof IMAGE_PROVIDER_LABELS] ?? provider
      return models.map((model) => ({
        value: model,
        label: `${providerLabel} · ${model}`,
        provider,
      }))
    })
  }, [imageProviderModels])
  const isTurboImageModel = imageModel === 'z-image-turbo'
  const isSquareOnlyImageModel = isSquareOnlyEvolinkModel(imageModel)
  const referenceImageLimit = useMemo(() => {
    return resolveCanvasReferenceImageLimit(imageModel)
  }, [imageModel])
  const imageSizeOptions = useMemo(() => {
    const base = config.aiImage.evolinkSizes
    if (isSquareOnlyImageModel) {
      return base.filter((option) => option.value !== 'auto')
    }
    return base.filter((option) => option.value !== '1:2' && option.value !== '2:1')
  }, [isSquareOnlyImageModel])
  const imageSizeSelectOptions = useMemo(
    () => [
      ...imageSizeOptions,
      { value: 'custom', label: '自定义', disabled: !isTurboImageModel },
    ],
    [imageSizeOptions, isTurboImageModel]
  )
  const isImagePromptMode =
    isCanvasPromptOpen && (activeTool === 'image' || selectedItem?.type === 'image')
  const showCanvasPromptAdvanced = isImagePromptMode && isCanvasPromptAdvanced
  const resolvedCanvasPrompt = useMemo(() => {
    const userText = canvasInput.trim()
    if (!isImagePromptMode) return userText
    const presetPrompt = selectedPreset?.prompt?.trim()
    if (presetPrompt && userText) return `${presetPrompt}\n${userText}`
    if (presetPrompt) return presetPrompt
    return userText
  }, [canvasInput, isImagePromptMode, selectedPreset])
  const canvasPlaceholder = isImagePromptMode
    ? selectedItem?.type === 'image'
      ? '你想要调整什么？'
      : selectedPreset
        ? `补充${selectedPreset.name}的需求…`
        : '你想要创作什么？'
    : '输入文字...'
  const chatQuickPrompts = useMemo(() => {
    const agentPrompts = (activeChatAgent?.starterPrompts ?? []).filter(Boolean)
    if (agentPrompts.length > 0) {
      return agentPrompts.slice(0, 5)
    }
    const basePrompts = [
      '给我 3 个构图方案',
      '给我配色建议',
      '生成服装平铺图',
      '把当前思路整理成步骤',
    ]
    const focusPrompt = selectedItem ? '总结当前选中对象' : '总结当前画布'
    return [focusPrompt, ...basePrompts].slice(0, 5)
  }, [activeChatAgent, selectedItem])

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    loadedImagesRef.current = loadedImages
  }, [loadedImages])

  useEffect(() => {
    brokenImagesRef.current = brokenImages
  }, [brokenImages])

  useEffect(() => {
    if (!user?.id) return
    items.forEach((item) => {
      if (item.type !== 'image') return
      if (item.data?.generation?.status === 'pending') return
      if (!item.data?.src) return
      ensureImageUrlFresh(item)
    })
  }, [items, ensureImageUrlFresh, user?.id])

  useEffect(() => {
    return () => {
      Object.values(imageLoadRetryTimersRef.current).forEach((timer) => window.clearTimeout(timer))
      imageLoadRetryTimersRef.current = {}
    }
  }, [])

  useEffect(() => {
    if (selectedChatAgentId === CHAT_AGENT_NONE_VALUE) return
    if (chatAgents.length === 0) return
    const exists = chatAgents.some((agent) => agent.id === selectedChatAgentId)
    if (!exists) {
      setSelectedChatAgentId(chatAgents[0]?.id ?? BUILTIN_CHAT_AGENTS[0]?.id ?? CHAT_AGENT_NONE_VALUE)
    }
  }, [chatAgents, selectedChatAgentId])

  useEffect(() => {
    if (selectedChatAgentId === FASHION_TREND_AGENT_ID) return
    setFashionPromptDraft(null)
    processedFashionAssistantIdsRef.current.clear()
  }, [selectedChatAgentId])

  useEffect(() => {
    if (selectedChatAgentId !== FASHION_TREND_AGENT_ID) return
    const processed = processedFashionAssistantIdsRef.current
    let nextDraft: FashionPromptDraft | null = fashionPromptDraft
    let hasDraftUpdate = false

    messages.forEach((message) => {
      if (message.role !== 'assistant') return
      if (processed.has(message.id)) return
      processed.add(message.id)
      const text = resolveCanvasMessageText(message)
      if (!text) return
      const prompts = extractEnglishPromptCandidates(text)
      if (prompts.length === 0) return
      nextDraft = {
        sourceMessageId: message.id,
        prompts,
      }
      hasDraftUpdate = true
    })

    if (hasDraftUpdate && nextDraft) {
      setFashionPromptDraft(nextDraft)
    }
  }, [messages, selectedChatAgentId, fashionPromptDraft])

  useEffect(() => {
    if (isImagePromptMode) return
    if (isCanvasPromptAdvanced) {
      setIsCanvasPromptAdvanced(false)
      setIsCanvasPresetOpen(false)
    }
  }, [isCanvasPromptAdvanced, isImagePromptMode])

  useEffect(() => {
    if (isImagePromptMode) return
    setIsCanvasPresetOpen(false)
  }, [isImagePromptMode])

  useEffect(() => {
    if (imageSizeMode === 'custom') {
      if (!isTurboImageModel) {
        setImageSizeMode(imageSizeOptions[0]?.value ?? '1:1')
      }
      return
    }
    const allowed = new Set(imageSizeOptions.map((option) => option.value))
    if (!allowed.has(imageSizeMode)) {
      setImageSizeMode(imageSizeOptions[0]?.value ?? '1:1')
    }
  }, [imageSizeMode, imageSizeOptions, isTurboImageModel])

  const tools: { id: ToolId; label: string; Icon: LucideIcon; shortcut?: string }[] = [
    { id: 'select', label: '选择', Icon: MousePointer2, shortcut: 'V' },
    { id: 'hand', label: '拖拽', Icon: Hand, shortcut: 'H' },
    { id: 'text', label: '文本', Icon: Type, shortcut: 'T' },
    { id: 'image', label: '图像生成器', Icon: ImagePlus, shortcut: 'I' },
    { id: 'shape', label: '形状', Icon: Square, shortcut: 'S' },
  ]
  const toolOrder: Array<ToolId | 'upload'> = ['select', 'hand', 'text', 'upload', 'shape']
  const imageTool = tools.find((tool) => tool.id === 'image')

  const splitChatTextToNotes = useCallback((text: string) => {
    const normalized = text.replace(/\r\n/g, '\n').trim()
    if (!normalized) return []
    const breakChars = new Set(['。', '！', '？', '；', ';', '，', ',', '、', '\n', '.', '!', '?', ':', '：'])
    const paragraphs = normalized.split(/\n\s*\n+/).map((line) => line.trim()).filter(Boolean)
    const chunks: string[] = []

    const findBreakIndex = (slice: string) => {
      for (let i = slice.length - 1; i >= 0; i -= 1) {
        if (breakChars.has(slice[i])) return i
      }
      return -1
    }

    const pushChunk = (value: string) => {
      const trimmed = value.trim()
      if (trimmed) chunks.push(trimmed)
    }

    const splitParagraph = (paragraph: string) => {
      let rest = paragraph.trim()
      while (rest.length > NOTE_CHUNK_TARGET) {
        const maxLen = rest.length > NOTE_CHUNK_MAX ? NOTE_CHUNK_MAX : NOTE_CHUNK_TARGET
        const slice = rest.slice(0, maxLen)
        const breakIndex = findBreakIndex(slice)
        const minBreak = Math.floor(maxLen * 0.6)
        const cutIndex = breakIndex >= minBreak ? breakIndex + 1 : maxLen
        pushChunk(rest.slice(0, cutIndex))
        rest = rest.slice(cutIndex).trim()
      }
      pushChunk(rest)
    }

    paragraphs.forEach(splitParagraph)
    return chunks
  }, [])

  const scrollChatToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = chatScrollRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior })
  }, [])

  const resolveChatHistoryTitle = useCallback(
    (historyMessages: UIMessage[]) => {
      const firstUser = historyMessages.find((message) => message.role === 'user')
      const candidate = firstUser ? resolveMessageText(firstUser) : ''
      if (candidate) return candidate.slice(0, 24)
      const agentName = activeChatAgent?.name ?? '普通对话'
      return `${agentName} 对话`
    },
    [activeChatAgent?.name, resolveMessageText]
  )
  const formatChatHistoryTime = useCallback((value: string) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString()
  }, [])
  const saveChatHistory = useCallback(
    (snapshot?: UIMessage[]) => {
      const source = snapshot ?? messages
      if (!source.some((message) => message.role === 'user')) return
      const history: CanvasChatHistoryItem = {
        id: nanoid(8),
        title: resolveChatHistoryTitle(source),
        agentId: selectedChatAgentId,
        updatedAt: new Date().toISOString(),
        messages: normalizeChatHistoryMessages(source),
      }
      setChatHistories((prev) => [history, ...prev].slice(0, MAX_CHAT_HISTORY))
      setActiveChatHistoryId(history.id)
    },
    [messages, resolveChatHistoryTitle, selectedChatAgentId]
  )
  const handleNewChat = useCallback(() => {
    saveChatHistory()
    setMessages([buildChatWelcomeMessage(activeChatAgent?.name)])
    setChatInput('')
    setIsChatPinnedToBottom(true)
    setShowChatJumpToLatest(false)
    setFashionPromptDraft(null)
    processedFashionAssistantIdsRef.current.clear()
    setActiveChatHistoryId(null)
    requestAnimationFrame(() => {
      chatInputRef.current?.focus()
      scrollChatToBottom('auto')
    })
  }, [activeChatAgent?.name, saveChatHistory, scrollChatToBottom])
  const handleSelectChatHistory = useCallback(
    (history: CanvasChatHistoryItem) => {
      const candidateAgentId = history.agentId?.trim() || CHAT_AGENT_NONE_VALUE
      const agentExists =
        candidateAgentId === CHAT_AGENT_NONE_VALUE || chatAgents.some((agent) => agent.id === candidateAgentId)
      setSelectedChatAgentId(agentExists ? candidateAgentId : CHAT_AGENT_NONE_VALUE)
      setMessages(normalizeChatHistoryMessages(history.messages))
      setChatInput('')
      setIsChatPinnedToBottom(true)
      setShowChatJumpToLatest(false)
      setFashionPromptDraft(null)
      processedFashionAssistantIdsRef.current.clear()
      setActiveChatHistoryId(history.id)
      requestAnimationFrame(() => scrollChatToBottom('auto'))
    },
    [chatAgents, scrollChatToBottom]
  )

  const copyChatText = useCallback(async (text: string) => {
    const value = text.trim()
    if (!value) return
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = value
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      toast.success('已复制')
    } catch (copyError) {
      console.error('Failed to copy chat text', copyError)
      toast.error('复制失败，请重试')
    }
  }, [])

  const openPromptGenerator = useCallback(
    (prompt: string) => {
      const value = prompt.trim()
      if (!value) return
      setActiveTool('image')
      setIsCanvasPromptOpen(true)
      setCanvasInput((prev) => {
        const existing = prev.trim()
        if (!existing) return value
        if (existing === value) return existing
        return `${existing}\n${value}`
      })
      requestAnimationFrame(() => canvasInputRef.current?.focus())
      toast.success('已填入提示词')
    },
    [setActiveTool, setCanvasInput, setIsCanvasPromptOpen]
  )

  const insertChatTextToCanvas = useCallback(
    (
      text: string,
      options?: {
        asNote?: boolean
        noteTone?: 'neutral' | 'sticky'
        split?: boolean
      }
    ) => {
      const value = text.trim()
      if (!value) return
      const asNote = options?.asNote ?? false
      const noteTone = options?.noteTone ?? 'sticky'
      const shouldSplit = options?.split ?? false
      const targetFontSize = asNote ? NOTE_FONT_SIZE : DEFAULT_TEXT_SIZE
      const paddingX = asNote ? NOTE_PADDING_X : TEXT_PADDING_X
      const paddingY = asNote ? NOTE_PADDING_Y : TEXT_PADDING_Y
      const chunks = shouldSplit ? splitChatTextToNotes(value) : []
      const noteChunks = shouldSplit && chunks.length > 0 ? chunks : [value]
      const rect = getViewportRect()
      const worldWidth = rect ? rect.width / camera.scale : DEFAULT_TEXT_BOX_WIDTH * 2
      const preferredColumns = noteChunks.length >= 6 ? 3 : noteChunks.length >= 3 ? 2 : 1
      const maxColumns = Math.max(
        1,
        Math.floor((worldWidth + NOTE_LAYOUT_GAP_X) / (DEFAULT_TEXT_BOX_WIDTH + NOTE_LAYOUT_GAP_X))
      )
      const columns = Math.min(preferredColumns, maxColumns, noteChunks.length)
      const sizes = noteChunks.map((chunk) =>
        measureTextBox(
          chunk,
          targetFontSize,
          DEFAULT_TEXT_BOX_WIDTH,
          MIN_TEXT_HEIGHT,
          DEFAULT_TEXT_FONT_FAMILY,
          DEFAULT_TEXT_FONT_WEIGHT,
          'normal',
          paddingX,
          paddingY
        )
      )
      const rowCount = Math.ceil(noteChunks.length / columns)
      const rowHeights = Array.from({ length: rowCount }, () => 0)

      sizes.forEach((size, index) => {
        const row = Math.floor(index / columns)
        rowHeights[row] = Math.max(rowHeights[row], size.height)
      })

      const totalHeight =
        rowHeights.reduce((total, height) => total + height, 0) + NOTE_LAYOUT_GAP_Y * (rowCount - 1)
      const totalWidth = columns * DEFAULT_TEXT_BOX_WIDTH + NOTE_LAYOUT_GAP_X * (columns - 1)
      const center = getViewportCenterWorld()
      const startX = center.x - totalWidth / 2
      let currentY = center.y - totalHeight / 2
      const createdIds: string[] = []

      const noteBackground =
        noteTone === 'neutral' ? NOTE_NEUTRAL_BACKGROUND_COLOR : NOTE_STICKY_BACKGROUND_COLOR
      const noteText = noteTone === 'neutral' ? NOTE_NEUTRAL_TEXT_COLOR : NOTE_STICKY_TEXT_COLOR

      for (let row = 0; row < rowCount; row += 1) {
        for (let col = 0; col < columns; col += 1) {
          const index = row * columns + col
          if (index >= noteChunks.length) break
          const x = startX + col * (DEFAULT_TEXT_BOX_WIDTH + NOTE_LAYOUT_GAP_X)
          const y = currentY
          const id = createTextItem(x, y, noteChunks[index], false)
          createdIds.push(id)
          if (asNote) {
            updateTextStyle(id, {
              backgroundColor: noteBackground,
              color: noteText,
              strokeColor: 'transparent',
              strokeWidth: 0,
              fontSize: targetFontSize,
              noteStyle: true,
              noteTone,
            })
          }
        }
        currentY += rowHeights[row] + NOTE_LAYOUT_GAP_Y
      }

      if (createdIds.length > 1) {
        syncSelection(createdIds, createdIds[createdIds.length - 1])
      }

      if (asNote) {
        toast.success(shouldSplit ? '已拆分为便签' : '已保存为便签')
        return
      }
      toast.success('已插入到画布')
    },
    [camera.scale, createTextItem, getViewportCenterWorld, measureTextBox, splitChatTextToNotes, syncSelection, updateTextStyle]
  )

  const handleChatScroll = useCallback(() => {
    const container = chatScrollRef.current
    if (!container) return
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    const isAtBottom = distanceToBottom < 24
    setIsChatPinnedToBottom((prev) => (prev === isAtBottom ? prev : isAtBottom))
    setShowChatJumpToLatest((prev) => (prev === !isAtBottom ? prev : !isAtBottom))
  }, [])

  useEffect(() => {
    if (!isChatOpen || isChatMinimized) return
    if (!isChatPinnedToBottom) return
    scrollChatToBottom('smooth')
  }, [messages, isChatBusy, isChatOpen, isChatMinimized, isChatPinnedToBottom, scrollChatToBottom])

  useEffect(() => {
    if (!isChatOpen || isChatMinimized) return
    setIsChatPinnedToBottom(true)
    setShowChatJumpToLatest(false)
    requestAnimationFrame(() => scrollChatToBottom('auto'))
  }, [isChatOpen, isChatMinimized, scrollChatToBottom])

  useEffect(() => {
    if (!layerContextMenu && !layerDetailPopover) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setLayerContextMenu(null)
      setLayerDetailPopover(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [layerContextMenu, layerDetailPopover])


  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <div
        className={cn(
          'pointer-events-none absolute left-5 top-4 z-30 transition-transform duration-300 ease-out',
          layerPanelShiftClass
        )}
      >
        <div className="pointer-events-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1.5 text-left text-xs shadow-sm backdrop-blur transition hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <AlignJustify className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">未命名</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-2">
              <DropdownMenuItem
                className="gap-2"
                onClick={handleExportCanvas}
                disabled={isExporting}
              >
                <Download className="h-4 w-4" />
                {isExporting ? '导出中...' : '导出画布'}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" disabled>
                <Share2 className="h-4 w-4" />
                分享
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="px-2 text-xs font-semibold text-muted-foreground">
                画布设置
              </DropdownMenuLabel>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-sm">主题色</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56 p-2">
                  <DropdownMenuRadioGroup
                    value={colorScheme}
                    onValueChange={(value) => setColorScheme(value as ColorScheme)}
                  >
                    {Object.entries(THEME_CONFIG).map(([key, config]) => (
                      <DropdownMenuRadioItem key={key} value={key} className="gap-2">
                        <span
                          className="h-3.5 w-3.5 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <span>{config.name}</span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-sm">背景样式</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56 p-2">
                  <DropdownMenuRadioGroup
                    value={backgroundMode}
                    onValueChange={(value) => setBackgroundMode(value as 'solid' | 'transparent')}
                  >
                    <DropdownMenuRadioItem value="solid">纯色</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="transparent">点阵</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  {backgroundMode === 'transparent' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground">点阵间距</DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={backgroundSpacing}
                        onValueChange={(value) => setBackgroundSpacing(value as 'tight' | 'medium' | 'loose')}
                      >
                        <DropdownMenuRadioItem value="tight">紧密</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="medium">标准</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="loose">稀疏</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground">点阵强度</DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={backgroundIntensity}
                        onValueChange={(value) => setBackgroundIntensity(value as 'low' | 'medium' | 'high')}
                      >
                        <DropdownMenuRadioItem value="low">弱</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="medium">中</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="high">强</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition hover:bg-muted/70"
            aria-label={theme === 'light' ? '切换为深色' : '切换为浅色'}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

        </div>
      </div>

      <div
        className={cn(
          'pointer-events-none absolute left-5 top-24 z-20 transition-transform duration-300 ease-out',
          layerPanelShiftClass
        )}
      >
        <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-2xl border border-border bg-background/85 p-2 shadow-md backdrop-blur">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/95 text-muted-foreground shadow-sm backdrop-blur transition hover:bg-muted hover:text-foreground"
                aria-label="账户菜单"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.image ?? ''} alt={userDisplayName} />
                  <AvatarFallback className="text-[10px]">{userInitials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-2">
              <div className="rounded-2xl border border-border bg-background/80 p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.image ?? ''} alt={userDisplayName} />
                    <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{userDisplayName}</div>
                    <div className="truncate text-xs text-muted-foreground">{user?.email ?? ''}</div>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 rounded-full px-3 text-xs font-semibold text-primary-foreground"
                  >
                    升级
                  </Button>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>积分</span>
                  <span className="text-foreground">{creditsDisplay}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2" disabled>
                <MessageSquare className="h-4 w-4" />
                账户管理
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" disabled>
                <Megaphone className="h-4 w-4" />
                使用教程
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" disabled>
                <ArrowUpRight className="h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="my-1 h-px w-6 bg-border" />
          {toolOrder.map((item) => {
            if (item === 'upload') {
              return (
                <Tooltip key="upload">
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleUploadClick}
                      aria-label="上传图片"
                      className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Upload className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    上传图片
                  </TooltipContent>
                </Tooltip>
              )
            }

            const tool = tools.find((entry) => entry.id === item)
            if (!tool) return null
            const Icon = tool.Icon

            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToolClick(tool.id)}
                    aria-label={tool.label}
                    className={cn(
                      'h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground',
                      activeTool === tool.id &&
                        'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  <div className="flex items-center gap-2">
                    <span>{tool.label}</span>
                    {tool.shortcut && (
                      <span className="rounded border border-border bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {tool.shortcut}
                      </span>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
          <div className="my-1 h-px w-6 bg-border" />
          {imageTool && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleToolClick(imageTool.id)}
                  aria-label={imageTool.label}
                  className={cn(
                    'h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground',
                    activeTool === imageTool.id &&
                      'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]'
                  )}
                >
                  <imageTool.Icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                <div className="flex items-center gap-2">
                  <span>{imageTool.label}</span>
                  {imageTool.shortcut && (
                    <span className="rounded border border-border bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {imageTool.shortcut}
                    </span>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => updateCamera({ x: 0, y: 0, scale: 1 })}
                aria-label="复位视图"
                className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <RefreshCcw className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              复位视图
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleClear}
                aria-label="清空画布"
                className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              清空画布
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div
        className={cn(
          'pointer-events-none absolute right-5 top-24 z-20 transition-transform duration-300 ease-out',
          chatPanelShiftClass
        )}
      >
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="rounded-full border border-border bg-background/85 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            缩放 {zoomPercent}%
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-2 top-4 z-20">
        <div className="relative h-full w-[280px]">
          {!isLayerPanelOpen && (
            <div className="pointer-events-auto absolute bottom-0 left-0 z-30">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIsLayerPanelOpen((prev) => !prev)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/95 text-muted-foreground shadow-sm backdrop-blur transition hover:bg-muted hover:text-foreground"
                    aria-label="显示图层面板"
                  >
                    <Layers className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  显示图层
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        <div
            className={cn(
              'flex h-full w-full flex-col overflow-hidden rounded-3xl border border-border bg-background/95 shadow-lg backdrop-blur transition-transform duration-300 ease-out',
              isLayerPanelOpen ? 'pointer-events-auto translate-x-0' : 'pointer-events-none -translate-x-[calc(100%+1.25rem)]'
            )}
            onContextMenuCapture={(event) => {
              event.preventDefault()
              event.stopPropagation()
              const target = event.target as HTMLElement | null
              const row = target?.closest('[data-layer-item]') as HTMLElement | null
              const layerId = row?.dataset?.layerId
              if (!layerId) {
                setLayerContextMenu(null)
                setLayerDetailPopover(null)
                return
              }
              const item = items.find((entry) => entry.id === layerId)
              if (!item) {
                setLayerContextMenu(null)
                setLayerDetailPopover(null)
                return
              }
              if (!item.hidden && !item.locked) {
                if (!isItemInViewport(item)) {
                  focusItem(item)
                }
                syncSelection([item.id], item.id)
              }
              openLayerContextMenu(event, item)
            }}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-xs font-semibold text-primary">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">图层</span>
                  <span className="text-xs text-muted-foreground">{items.length} 项</span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {layerItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">暂无图层</p>
                    <p>上传图片或添加文本后显示。</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {layerItems.map((item) => {
                    const isSelected = selectedIdsSet.has(item.id)
                    const isHidden = Boolean(item.hidden)
                    const isLocked = Boolean(item.locked)
                    const isRenaming = renamingLayerId === item.id
                    const hasThumbError = Boolean(brokenThumbnails[item.id])
                    const label = getLayerLabel(item)
                    const canSelect = !isHidden && !isLocked

                    return (
                      <div
                        key={item.id}
                        data-layer-item
                        data-layer-id={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (!canSelect) return
                          if (!isItemInViewport(item)) {
                            focusItem(item)
                          }
                          syncSelection([item.id], item.id)
                          if (editingId && editingId !== item.id) {
                            commitTextItem(editingId)
                          }
                        }}
                        onKeyDown={(event) => {
                          if (!canSelect) return
                          if (event.key !== 'Enter' && event.key !== ' ') return
                          event.preventDefault()
                          if (!isItemInViewport(item)) {
                            focusItem(item)
                          }
                          syncSelection([item.id], item.id)
                          if (editingId && editingId !== item.id) {
                            commitTextItem(editingId)
                          }
                        }}
                        className={cn(
                          'group flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-xs transition',
                          isSelected
                            ? 'border-primary/60 bg-primary/10 text-foreground'
                            : 'border-border bg-background/80 text-muted-foreground hover:border-primary/40 hover:text-foreground',
                          (isHidden || isLocked) && 'opacity-60'
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <div
                            className={cn(
                              'relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl border',
                              isSelected
                                ? 'border-primary/40 bg-primary/5 text-primary'
                                : 'border-border bg-muted/40 text-muted-foreground'
                            )}
                          >
                            {item.type === 'image' && item.data?.src ? (
                              <>
                                <img
                                  src={item.data.src}
                                  alt={label}
                                  className={cn('h-full w-full object-cover', hasThumbError && 'opacity-0')}
                                  draggable={false}
                                  loading="lazy"
                                  decoding="async"
                                  fetchPriority="low"
                                  onLoad={() => {
                                    if (!hasThumbError) return
                                    setBrokenThumbnails((prev) => {
                                      if (!prev[item.id]) return prev
                                      const next = { ...prev }
                                      delete next[item.id]
                                      return next
                                    })
                                  }}
                                  onError={() => {
                                    setBrokenThumbnails((prev) => {
                                      if (prev[item.id]) return prev
                                      return { ...prev, [item.id]: true }
                                    })
                                  }}
                                />
                                {hasThumbError && (
                                  <ImagePlus className="h-4 w-4 text-muted-foreground" />
                                )}
                              </>
                            ) : item.type === 'image' ? (
                              <ImagePlus className="h-4 w-4" />
                            ) : (
                              <Type className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            {isRenaming ? (
                              <input
                                value={layerNameDraft}
                                onChange={(event) => setLayerNameDraft(event.target.value)}
                                onBlur={() => commitLayerRename(item.id, layerNameDraft)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault()
                                    commitLayerRename(item.id, layerNameDraft)
                                  }
                                  if (event.key === 'Escape') {
                                    event.preventDefault()
                                    cancelLayerRename()
                                  }
                                }}
                                onClick={(event) => event.stopPropagation()}
                                autoFocus
                                className="h-7 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                              />
                            ) : (
                              <div
                                className={cn(
                                  'truncate text-xs font-semibold text-foreground',
                                  isHidden && 'line-through text-muted-foreground'
                                )}
                                onDoubleClick={(event) => {
                                  event.stopPropagation()
                                  setRenamingLayerId(item.id)
                                  setLayerNameDraft(label)
                                }}
                              >
                                {label}
                              </div>
                            )}
                            <div className="text-[10px] text-muted-foreground">
                              {item.type === 'image' ? '图片' : '文本'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              toggleItemHidden(item.id)
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                            aria-label={isHidden ? '显示图层' : '隐藏图层'}
                            title={isHidden ? '显示图层' : '隐藏图层'}
                          >
                            {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              toggleItemLocked(item.id)
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                            aria-label={isLocked ? '解锁图层' : '锁定图层'}
                            title={isLocked ? '解锁图层' : '锁定图层'}
                          >
                            {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="flex h-10 items-center gap-2 bg-background/80 pl-1 pr-2.5 backdrop-blur-sm shadow-[inset_0_1px_0_0_hsl(var(--border)/0.4)]">
              {isLayerPanelOpen && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setIsLayerPanelOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/90 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      aria-label="隐藏图层面板"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    隐藏图层
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>


      {layerContextMenu && (() => {
        const contextItem = items.find((item) => item.id === layerContextMenu.id)
        if (!contextItem) return null
        const orderIndex = layerOrderMap.get(contextItem.id) ?? 0
        const isTopMost = orderIndex >= items.length - 1
        const isBottomMost = orderIndex <= 0
        const label = getLayerLabel(contextItem)
        return (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setLayerContextMenu(null)}
            onContextMenu={(event) => {
              event.preventDefault()
              setLayerContextMenu(null)
            }}
          >
            <div
              className="absolute w-[200px] rounded-2xl border border-border bg-popover/95 p-2 text-xs shadow-lg backdrop-blur"
              style={{ left: layerContextMenu.x, top: layerContextMenu.y }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isTopMost}
                onClick={() => {
                  moveItemInStack(contextItem.id, 'up')
                  setLayerContextMenu(null)
                }}
              >
                <span>上移</span>
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isBottomMost}
                onClick={() => {
                  moveItemInStack(contextItem.id, 'down')
                  setLayerContextMenu(null)
                }}
              >
                <span>下移</span>
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-muted-foreground transition hover:bg-muted hover:text-foreground"
                onClick={() => {
                  setRenamingLayerId(contextItem.id)
                  setLayerNameDraft(label)
                  setLayerContextMenu(null)
                }}
              >
                <span>重命名</span>
                <PencilLine className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-muted-foreground transition hover:bg-muted hover:text-foreground"
                onClick={() => {
                  setLayerContextMenu(null)
                  openLayerDetails(contextItem.id, layerContextMenu)
                }}
              >
                <span>详情</span>
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )
      })()}

      {layerDetailPopover && (() => {
        const detailItem = items.find((item) => item.id === layerDetailPopover.id)
        if (!detailItem) return null
        const meta = detailItem.type === 'image' ? detailItem.data.meta : undefined
        const sourceLabel = getLayerSourceLabel(detailItem)
        const derivedItem = meta?.derivedFromId ? items.find((entry) => entry.id === meta.derivedFromId) ?? null : null
        const derivedLabel = derivedItem ? getLayerLabel(derivedItem) : meta?.derivedFromId ? '已删除' : ''
        return (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setLayerDetailPopover(null)}
            onContextMenu={(event) => {
              event.preventDefault()
              setLayerDetailPopover(null)
            }}
          >
            <div
              className="absolute w-[260px] rounded-2xl border border-border/80 bg-popover/95 p-3 text-xs shadow-lg backdrop-blur"
              style={{ left: layerDetailPopover.x, top: layerDetailPopover.y }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span>类型</span>
                  <span className="text-foreground">{detailItem.type === 'image' ? '图片' : '文本'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>来源</span>
                  <span className="text-foreground">{sourceLabel}</span>
                </div>
                {detailItem.type === 'image' && meta?.model && (
                  <div className="flex items-center justify-between gap-3">
                    <span>模型</span>
                    <span className="text-foreground">{meta.model}</span>
                  </div>
                )}
                {detailItem.type === 'image' && meta?.provider && (
                  <div className="flex items-center justify-between gap-3">
                    <span>提供方</span>
                    <span className="text-foreground">{meta.provider}</span>
                  </div>
                )}
                {detailItem.type === 'image' && meta?.size && (
                  <div className="flex items-center justify-between gap-3">
                    <span>尺寸</span>
                    <span className="text-foreground">{meta.size}</span>
                  </div>
                )}
                {detailItem.type === 'image' && derivedLabel && (
                  <div className="flex items-center justify-between gap-3">
                    <span>来源图层</span>
                    <span className="text-foreground">{derivedLabel}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <span>创建时间</span>
                  <span className="text-foreground">
                    {detailItem.type === 'image' ? formatMetaTime(meta?.createdAt) : '未知'}
                  </span>
                </div>
                {detailItem.type === 'image' && meta?.prompt && (
                  <div className="mt-1 rounded-xl border border-border bg-background/70 p-2 text-[11px] text-foreground">
                    <div className="mb-1 text-[10px] font-semibold text-muted-foreground">提示词</div>
                    <div className="whitespace-pre-wrap break-words">{meta.prompt}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {isTextEditing && editingTextItem && (
        <div className="pointer-events-none absolute left-20 top-32 z-30">
          <div
            ref={textStylePanelRef}
            data-canvas-text-style-panel
            className="pointer-events-auto w-64 rounded-2xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur"
          >
            <div className="space-y-3 text-xs text-muted-foreground">
              <div>
                <div className="text-[11px] font-semibold tracking-wide text-muted-foreground">STROKE</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TEXT_STROKE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        updateTextStyle(editingTextItem.id, {
                          strokeColor: color.value,
                          strokeWidth: color.value === 'transparent' ? 0 : 1,
                        })
                      }
                      className={cn(
                        'relative h-6 w-6 rounded-full border',
                        editingTextItem.data.strokeColor === color.value ? 'border-primary' : 'border-border'
                      )}
                    >
                      <span
                        className="absolute inset-0 rounded-full"
                        style={{
                          backgroundColor: color.value === 'transparent' ? 'transparent' : color.value,
                        }}
                      />
                      {color.value === 'transparent' && (
                        <span className="absolute left-1/2 top-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-muted-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-wide text-muted-foreground">BACKGROUND</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TEXT_BACKGROUND_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => updateTextStyle(editingTextItem.id, { backgroundColor: color.value })}
                      className={cn(
                        'relative h-6 w-6 rounded-full border',
                        editingTextItem.data.backgroundColor === color.value ? 'border-primary' : 'border-border'
                      )}
                    >
                      <span
                        className="absolute inset-0 rounded-full"
                        style={{
                          backgroundColor: color.value === 'transparent' ? 'transparent' : color.value,
                        }}
                      />
                      {color.value === 'transparent' && (
                        <span className="absolute left-1/2 top-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-muted-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-wide text-muted-foreground">FONT</div>
                <div className="mt-2">
                  <Select
                    value={editingTextItem.data.fontFamily}
                    onValueChange={(value) => updateTextStyle(editingTextItem.id, { fontFamily: value })}
                  >
                    <SelectTrigger className="h-9 w-full rounded-lg text-xs">
                      <SelectValue placeholder="选择字体" />
                    </SelectTrigger>
                    <SelectContent data-canvas-text-style-panel>
                      {TEXT_FONT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-wide text-muted-foreground">SIZE</div>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {TEXT_SIZE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => updateTextStyle(editingTextItem.id, { fontSize: preset.size })}
                      className={cn(
                        'rounded-lg border px-2 py-1 text-[11px] font-semibold',
                        editingTextItem.data.fontSize === preset.size
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] font-semibold tracking-wide text-muted-foreground">ALIGN</div>
                  <div className="mt-2 flex gap-2">
                    {[
                      { value: 'left', Icon: AlignLeft },
                      { value: 'center', Icon: AlignCenter },
                      { value: 'right', Icon: AlignRight },
                      { value: 'justify', Icon: AlignJustify },
                    ].map(({ value, Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateTextStyle(editingTextItem.id, { align: value as CanvasTextItem['data']['align'] })}
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg border',
                          editingTextItem.data.align === value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-wide text-muted-foreground">STYLE</div>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateTextStyle(editingTextItem.id, {
                          fontWeight: editingTextItem.data.fontWeight >= 600 ? DEFAULT_TEXT_FONT_WEIGHT : 700,
                        })
                      }
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg border',
                        editingTextItem.data.fontWeight >= 600
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <Bold className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateTextStyle(editingTextItem.id, {
                          fontStyle: editingTextItem.data.fontStyle === 'italic' ? 'normal' : 'italic',
                        })
                      }
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg border',
                        editingTextItem.data.fontStyle === 'italic'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <Italic className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateTextStyle(editingTextItem.id, {
                          textDecoration: editingTextItem.data.textDecoration === 'underline' ? 'none' : 'underline',
                        })
                      }
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg border',
                        editingTextItem.data.textDecoration === 'underline'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <Underline className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 right-2 top-4 z-20">
        <div className="relative h-full w-[360px]">
          {!isChatPanelOpen && (
            <div className="pointer-events-auto absolute right-3 top-3 z-30">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChatOpen(true)
                      setIsChatMinimized((prev) => !prev)
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/95 text-muted-foreground shadow-sm backdrop-blur transition hover:bg-muted hover:text-foreground"
                    aria-label="展开 AI 对话"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs">
                  {activeChatAgent?.name ?? '普通对话'}
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          <div
            className={cn(
              'pointer-events-auto flex h-full w-full flex-col overflow-hidden rounded-3xl border border-border bg-background/95 shadow-lg backdrop-blur transition-transform duration-300 ease-out',
              isChatPanelOpen
                ? 'translate-x-0'
                : 'pointer-events-none translate-x-[calc(100%+1.25rem)]'
            )}
          >
            <div className="border-b border-border">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-xs font-semibold text-primary">
                    AI
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {activeChatAgent?.name ?? '普通对话'}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {activeChatAgent ? '已启用' : '未启用'}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleNewChat}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end" className="text-xs">
                      新建对话
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          >
                            <History className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="end" className="text-xs">
                        历史对话
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent side="left" align="end" className="w-72 p-2">
                      <DropdownMenuLabel className="text-xs text-muted-foreground">历史对话</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {chatHistories.length === 0 ? (
                        <div className="px-2 py-3 text-xs text-muted-foreground">暂无历史对话</div>
                      ) : (
                        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
                          {chatHistories.map((history) => (
                            <DropdownMenuItem
                              key={history.id}
                              onClick={() => handleSelectChatHistory(history)}
                              className={cn(
                                'flex flex-col items-start gap-1 rounded-lg px-2 py-2',
                                history.id === activeChatHistoryId && 'bg-muted/60'
                              )}
                            >
                              <span className="text-sm text-foreground">{history.title}</span>
                              <span className="text-[11px] text-muted-foreground">
                                {formatChatHistoryTime(history.updatedAt)}
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChatOpen(true)
                          setIsChatMinimized((prev) => !prev)
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        aria-label="隐藏 AI 对话"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end" className="text-xs">
                      隐藏对话
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              {isChatAgentComposerOpen && (
                <div className="space-y-2 border-t border-border px-4 py-3">
                  <input
                    value={newChatAgentName}
                    onChange={(event) => setNewChatAgentName(event.target.value.slice(0, MAX_CHAT_AGENT_NAME_LENGTH))}
                    placeholder="智能体名称（例如：上新文案助手）"
                    className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <textarea
                    value={newChatAgentPrompt}
                    onChange={(event) =>
                      setNewChatAgentPrompt(event.target.value.slice(0, MAX_CHAT_AGENT_PROMPT_LENGTH))
                    }
                    rows={4}
                    placeholder="设定提示词：告诉智能体角色、目标、回答风格与限制"
                    className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {normalizeAgentPrompt(newChatAgentPrompt).length}/{MAX_CHAT_AGENT_PROMPT_LENGTH}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-full px-3 text-xs"
                        onClick={() => {
                          setNewChatAgentName('')
                          setNewChatAgentPrompt('')
                          setIsChatAgentComposerOpen(false)
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 rounded-full px-3 text-xs"
                        onClick={handleCreateChatAgent}
                        disabled={!canCreateChatAgent}
                      >
                        创建
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div
              ref={chatScrollRef}
              onScroll={handleChatScroll}
              className="relative flex-1 overflow-y-auto px-4 py-4"
            >
              {!hasUserMessage ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-xs text-muted-foreground">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">欢迎来到 {activeChatAgent?.name ?? '普通对话'}</p>
                    <p>从一个问题开始，我们会给你建议或可执行的步骤。</p>
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {chatQuickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => {
                          if (isChatBusy) return
                          setChatInput(prompt)
                          requestAnimationFrame(() => chatInputRef.current?.focus())
                        }}
                        className="rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] text-foreground transition hover:border-primary/40 hover:text-primary"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((message) => {
                    const messageFiles = resolveMessageFiles(message)
                    const rawText = resolveMessageText(message)
                    const displayText = stripAttachmentHint(rawText, messageFiles.length > 0)
                    const hasDisplayText = displayText.trim().length > 0
                    const actionText = hasDisplayText ? displayText : ''
                    if (!hasDisplayText && messageFiles.length === 0) return null
                    const isAssistant = message.role === 'assistant'
                    const { body: mainText, prompt: promptText } = isAssistant
                      ? extractPromptFromText(displayText)
                      : { body: displayText, prompt: undefined }
                    const messageRole: 'user' | 'assistant' = message.role === 'assistant' ? 'assistant' : 'user'
                    const actionPlacement = isAssistant ? 'left-2' : 'right-2'
                    const actionButtonClass =
                      'border-border/60 bg-background/80 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    return (
                      <Message
                        key={message.id}
                        from={messageRole}
                      >
                        <MessageContent
                          variant="contained"
                          className={cn(
                            'relative overflow-visible rounded-2xl border border-transparent pt-6 shadow-[0_6px_16px_-12px_hsl(var(--foreground)/0.3)]',
                            'group-[.is-user]:bg-primary/10 group-[.is-user]:text-foreground group-[.is-user]:border-primary/20',
                            'group-[.is-assistant]:bg-muted/30 group-[.is-assistant]:text-foreground group-[.is-assistant]:border-border/60'
                          )}
                        >
                          {message.role === 'assistant' ? (
                            <div className="flex flex-col gap-2 text-sm leading-relaxed text-foreground">
                              {messageFiles.length > 0 && (
                                <div className="space-y-2">
                                  {messageFiles.map((file) => {
                                    const isImage = file.mediaType?.startsWith('image/')
                                    return (
                                      <div
                                        key={`${file.url}-${file.filename ?? 'file'}`}
                                        className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 px-2.5 py-2"
                                      >
                                        {isImage ? (
                                          <img
                                            src={file.url}
                                            alt={file.filename ?? 'image'}
                                            className="h-10 w-10 rounded-lg object-cover"
                                          />
                                        ) : (
                                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40 text-[10px] font-semibold text-muted-foreground">
                                            {resolveFileBadge(file.filename)}
                                          </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <div className="truncate text-xs font-medium text-foreground">
                                            {file.filename ?? '未命名附件'}
                                          </div>
                                          <div className="text-[10px] text-muted-foreground">
                                            {file.mediaType ?? '文件'}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                              {hasDisplayText && (
                                <Response className="text-sm leading-relaxed text-foreground">
                                  {mainText}
                                </Response>
                              )}
                              {promptText && (
                                <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2 text-xs">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-semibold text-muted-foreground">提示词</span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => copyChatText(promptText)}
                                        className="rounded-full border border-border/70 bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                                      >
                                        复制
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => openPromptGenerator(promptText)}
                                        className="rounded-full border border-border/70 bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                                      >
                                        生成图片
                                      </button>
                                    </div>
                                  </div>
                                  <div className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap break-words text-[11px] text-foreground scrollbar-hide">
                                    {promptText}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2 text-sm leading-relaxed">
                              {messageFiles.length > 0 && (
                                <div className="space-y-2">
                                  {messageFiles.map((file) => {
                                    const isImage = file.mediaType?.startsWith('image/')
                                    return (
                                      <div
                                        key={`${file.url}-${file.filename ?? 'file'}`}
                                        className="flex items-center gap-3 rounded-xl border border-primary/30 bg-background/80 px-2.5 py-2 text-foreground"
                                      >
                                        {isImage ? (
                                          <img
                                            src={file.url}
                                            alt={file.filename ?? 'image'}
                                            className="h-10 w-10 rounded-lg object-cover"
                                          />
                                        ) : (
                                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40 text-[10px] font-semibold text-muted-foreground">
                                            {resolveFileBadge(file.filename)}
                                          </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <div className="truncate text-xs font-medium text-foreground">
                                            {file.filename ?? '未命名附件'}
                                          </div>
                                          <div className="text-[10px] text-muted-foreground">
                                            {file.mediaType ?? '文件'}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                              {hasDisplayText && (
                                <Response className="text-sm leading-relaxed text-foreground">
                                  {mainText}
                                </Response>
                              )}
                            </div>
                          )}
                          {actionText && (
                            <div
                              className={cn(
                                'pointer-events-none absolute top-2 flex items-center gap-1 opacity-0 transition',
                                actionPlacement,
                                'group-hover:pointer-events-auto group-hover:opacity-100'
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => copyChatText(actionText)}
                                className={cn(
                                  'rounded-full border px-2 py-0.5 text-[10px] shadow-sm transition',
                                  actionButtonClass
                                )}
                              >
                                复制
                              </button>
                              <button
                                type="button"
                                onClick={() => insertChatMessageToCanvas(actionText, messageRole)}
                                className={cn(
                                  'rounded-full border px-2 py-0.5 text-[10px] shadow-sm transition',
                                  actionButtonClass
                                )}
                              >
                                插入
                              </button>
                            </div>
                          )}
                        </MessageContent>
                      </Message>
                    )
                  })}
                  {isChatBusy && (() => {
                    const lastMessage = messages[messages.length - 1]
                    const lastText = lastMessage ? resolveMessageText(lastMessage) : ''
                    if (lastMessage?.role === 'assistant' && lastText) return null
                    return (
                      <Message from="assistant" className="py-2">
                        <MessageContent
                          variant="contained"
                          className="gap-2 px-3 py-2 text-xs text-muted-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <span className="rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground">
                              think
                            </span>
                            <span>正在思考…</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                            <div className="canvas-think-bar h-full w-[38%] rounded-full bg-primary/70" />
                          </div>
                        </MessageContent>
                      </Message>
                    )
                  })()}
                </div>
              )}
              {showChatJumpToLatest && (
                <div className="pointer-events-none sticky bottom-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChatPinnedToBottom(true)
                      setShowChatJumpToLatest(false)
                      scrollChatToBottom('smooth')
                    }}
                    className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1 text-[11px] text-foreground shadow-sm transition hover:border-primary/50 hover:text-primary"
                  >
                    跳到最新
                  </button>
                </div>
              )}
            </div>
            <form onSubmit={handleChatSubmit} className="border-t border-border p-3">
              {selectedItem && (
                <div className="mb-2 flex items-center justify-between gap-2 rounded-2xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary/70" />
                    <span className="shrink-0">{hasMultiSelection ? '已选对象' : '当前对象'}</span>
                    <span className="truncate text-foreground">{selectedItemLabel}</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        onClick={() => {
                          clearSelection()
                          setEditingId(null)
                        }}
                        className="h-7 w-7 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                      取消选择
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
              <div className="flex items-end gap-2 rounded-2xl border border-border bg-background px-3 py-2 shadow-sm">
                <textarea
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' || event.shiftKey) return
                    event.preventDefault()
                    void sendChat()
                  }}
                  rows={1}
                  placeholder={activeChatAgent ? `向${activeChatAgent.name}描述你的需求` : '可直接发送选中图片，或输入你的需求'}
                  className="max-h-32 flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          >
                            <Bot className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        切换智能体
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent side="top" align="end" className="w-56 p-2">
                      <DropdownMenuLabel className="text-xs text-muted-foreground">选择智能体</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={activeChatAgent?.id ?? selectedChatAgentId}
                        onValueChange={handleChatAgentSwitch}
                      >
                        <DropdownMenuRadioItem value={CHAT_AGENT_NONE_VALUE}>
                          普通对话
                        </DropdownMenuRadioItem>
                        {chatAgents.map((agent) => (
                          <DropdownMenuRadioItem key={agent.id} value={agent.id}>
                            {agent.name}{agent.source === 'custom' ? ' · 自建' : ' · 内置'}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setIsChatAgentComposerOpen((prev) => !prev)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {isChatAgentComposerOpen ? '收起创建' : '新建智能体'}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        type="submit"
                        disabled={isChatBusy}
                        className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      发送
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">Enter 发送，Shift+Enter 换行（可仅发送选中图片）</div>
            </form>
            <style jsx>{`
              @keyframes canvas-think {
                0% {
                  transform: translateX(-120%);
                }
                50% {
                  transform: translateX(0%);
                }
                100% {
                  transform: translateX(220%);
                }
              }

              .canvas-think-bar {
                animation: canvas-think 1.4s ease-in-out infinite;
              }
            `}</style>
          </div>
        </div>
      </div>

      {isCanvasPromptOpen && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 w-[min(720px,calc(100%-3rem))] -translate-x-1/2">
        <div className="pointer-events-auto relative">
          <div className="flex flex-col gap-3 rounded-3xl border border-border bg-background/90 px-4 py-3 shadow-lg backdrop-blur">
            {isLassoActive && (
              <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
                <PencilLine className="h-3.5 w-3.5" />
                套索修图模式：圈选区域后输入需求，仅修改选区
              </div>
            )}
            {showCanvasPromptAdvanced && (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-muted/30 px-3 py-2">
                <Select value={imageSizeMode} onValueChange={setImageSizeMode} disabled={isImageGenerating}>
                  <SelectTrigger
                    size="sm"
                    className="h-7 rounded-full border border-border bg-background/80 px-2.5 text-[11px] text-muted-foreground hover:bg-muted"
                  >
                    <span className="text-muted-foreground">Aspect</span>
                    <SelectValue placeholder="Auto" />
                  </SelectTrigger>
                  <SelectContent
                    side="top"
                    className="w-[180px] rounded-2xl border border-border/80 bg-popover/95 p-2 text-xs shadow-lg backdrop-blur"
                  >
                    {imageSizeSelectOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-xs"
                        disabled={Boolean(option.disabled)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {imageSizeMode === 'custom' && (
                  <div className="flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2 py-1 text-[11px] text-muted-foreground">
                    <input
                      inputMode="numeric"
                      value={customSizeWidth}
                      onChange={(event) => setCustomSizeWidth(event.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="宽"
                      className="w-12 bg-transparent text-center text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                      disabled={isImageGenerating}
                    />
                    <span className="text-muted-foreground">x</span>
                    <input
                      inputMode="numeric"
                      value={customSizeHeight}
                      onChange={(event) => setCustomSizeHeight(event.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="高"
                      className="w-12 bg-transparent text-center text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                      disabled={isImageGenerating}
                    />
                  </div>
                )}
                <Select value={imageModel} onValueChange={setImageModel} disabled={isImageGenerating}>
                  <SelectTrigger
                    size="sm"
                    className="h-7 rounded-full border border-border bg-background/80 px-2.5 text-[11px] text-muted-foreground hover:bg-muted"
                  >
                    <span className="text-muted-foreground">Model</span>
                    <SelectValue placeholder="选择模型" />
                  </SelectTrigger>
                  <SelectContent
                    side="top"
                    className="w-[260px] rounded-2xl border border-border/80 bg-popover/95 p-2 text-xs shadow-lg backdrop-blur"
                  >
                    {imageModelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DropdownMenu open={isCanvasPresetOpen} onOpenChange={setIsCanvasPresetOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="构图"
                      aria-pressed={isCanvasPresetOpen}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:bg-muted hover:text-foreground',
                        (isCanvasPresetOpen || selectedPresetId) && 'border-primary/40 text-primary'
                      )}
                    >
                      <span className="text-muted-foreground">Comp</span>
                      <span className="max-w-[80px] truncate text-foreground">
                        {selectedPreset ? selectedPreset.name : 'None'}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    side="top"
                    className="w-[320px] rounded-2xl border border-border/80 bg-popover/95 p-3 shadow-lg backdrop-blur"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span>快速功能</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{selectedPreset ? `已选：${selectedPreset.name}` : '未选择'}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedPresetId(null)}
                          className="rounded-full border border-border bg-background/70 px-2 py-0.5 text-[11px] text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          清空选择
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {CANVAS_PRESET_ACTIONS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleCanvasPresetSelect(preset.id)}
                          className={cn(
                            'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition',
                            selectedPresetId === preset.id
                              ? 'border-primary/60 bg-primary/10 text-primary'
                              : 'border-border bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <preset.Icon className="h-3.5 w-3.5" />
                          <span className="truncate">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                    {selectedPreset && (
                      <div className="mt-2 text-[11px] text-muted-foreground">{selectedPreset.description}</div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            {selectedImageItems.length > 0 && (
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/20 px-3 py-2">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex items-center -space-x-2">
                    {selectedImageItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm"
                      >
                        <img
                          src={item.data.src}
                          alt={item.data?.name?.trim() || 'reference'}
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                      </div>
                    ))}
                    {selectedImageItems.length > 3 && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background text-[11px] text-muted-foreground">
                        +{selectedImageItems.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-[11px] text-muted-foreground">参考图</span>
                    <span className="truncate text-sm text-foreground">
                      {selectedImageItems.length === 1 ? primaryReferenceLabel : `已选 ${selectedImageItems.length} 张`}
                    </span>
                    {isImagePromptMode && (
                      <span className="text-[11px] text-muted-foreground">
                        {referenceImageLimit === 0
                          ? '当前模型不支持参考图'
                          : `最多支持 ${referenceImageLimit} 张参考图`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => {
                      clearSelection()
                      setEditingId(null)
                    }}
                    className="rounded-full border border-border bg-background/70 px-2 py-1 text-[11px] text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    清空选择
                  </button>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-2xl bg-transparent px-1 py-1">
              {isImagePromptMode ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (isCanvasPromptAdvanced) {
                          setIsCanvasPresetOpen(false)
                        }
                        setIsCanvasPromptAdvanced((prev) => !prev)
                      }}
                      aria-label={isCanvasPromptAdvanced ? '收起高级' : '高级'}
                      aria-pressed={isCanvasPromptAdvanced}
                      className={cn(
                        'h-8 w-8 rounded-full border border-border/60 bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground',
                        isCanvasPromptAdvanced && 'border-primary/40 bg-primary/10 text-primary'
                      )}
                    >
                      {isCanvasPromptAdvanced ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {isCanvasPromptAdvanced ? '收起高级' : '高级'}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsCanvasPromptOpen(false)}
                      aria-label="收起"
                      className="h-8 w-8 rounded-full border border-border/60 bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    收起
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleUploadClick}
                    aria-label="添加参考图"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  添加参考图
                </TooltipContent>
              </Tooltip>
              <input
                ref={canvasInputRef}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                placeholder={canvasPlaceholder}
                value={canvasInput}
                onChange={(event) => setCanvasInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' || event.shiftKey) return
                  event.preventDefault()
                  if (isImagePromptMode && isImageGenerating) return
                  handleCanvasSubmit()
                }}
                disabled={isImagePromptMode && isImageGenerating}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-[0_12px_24px_-14px_hsl(var(--primary)/0.55)] hover:bg-primary/90"
                    aria-label={isImagePromptMode ? '生成图片' : '发送'}
                    onClick={handleCanvasSubmit}
                    disabled={resolvedCanvasPrompt.trim().length === 0 || (isImagePromptMode && isImageGenerating)}
                  >
                    {isImagePromptMode && isImageGenerating ? (
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {isImagePromptMode ? (isImageGenerating ? '生成中...' : '生成图片') : '发送'}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setIsCanvasPromptOpen(false)}
                  className="flex h-7 w-10 items-center justify-center rounded-full border border-border bg-background/95 text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
                  aria-label="收起面板"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                收起
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        </div>
      )}



      {selectedItem && !hasMultiSelection && (
        <>
          <div
            className="pointer-events-none absolute z-10"
            style={{
              left: worldToScreen(selectedItem.x + selectedItem.width / 2, selectedItem.y + selectedItem.height)
                .x,
              top: worldToScreen(selectedItem.x + selectedItem.width / 2, selectedItem.y + selectedItem.height)
                .y,
              transform: 'translate(-50%, 16px)',
            }}
          >
            <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-md backdrop-blur">
              {isTextSelected ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 rounded-full px-2 text-xs"
                    onClick={() => {
                      setEditingId(selectedItem.id)
                      setIsCanvasPromptOpen(true)
                    }}
                  >
                    <Type className="h-3.5 w-3.5" />
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 rounded-full px-2 text-xs"
                    onClick={() => handleCopyItem(selectedItem)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    复制
                  </Button>
                </>
              ) : isSelectedImageGenerating ? (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  图片生成中...
                </div>
              ) : (
                <>
                  {!isLassoActive && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 rounded-full px-2 text-xs"
                      onClick={() => setIsCanvasPromptOpen(true)}
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      编辑
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      'h-7 gap-1 rounded-full px-2 text-xs',
                      isLassoActive && 'bg-primary/10 text-primary'
                    )}
                    onClick={() => toggleLassoForItem(selectedItem as CanvasImageItem)}
                    disabled={isLassoProcessing}
                  >
                    <PencilLine className="h-3.5 w-3.5" />
                    {isLassoActive ? '退出套索' : '套索'}
                  </Button>
                  {isLassoActive && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 rounded-full px-2 text-xs"
                        onClick={handleCreateLassoMark}
                      >
                        选区标注
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 rounded-full px-2 text-xs"
                        onClick={() => setIsCanvasPromptOpen(true)}
                      >
                        <Wand2 className="h-3.5 w-3.5" />
                        AI 编辑
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 rounded-full px-2 text-xs"
                        onClick={() => handleLassoCutout(selectedItem as CanvasImageItem)}
                        disabled={!isLassoReady || isLassoProcessing}
                      >
                        <Scissors className="h-3.5 w-3.5" />
                        {isLassoProcessing ? '处理中' : '生成图层'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 rounded-full px-2 text-xs"
                        onClick={resetLassoPath}
                        disabled={isLassoProcessing}
                      >
                        重绘
                      </Button>
                    </>
                  )}
                  {!isLassoActive && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 rounded-full px-2 text-xs"
                        onClick={() => handleRemoveBackground(selectedItem as CanvasImageItem)}
                        disabled={isRemovingBackground}
                      >
                        {isRemovingBackground ? (
                          <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Scissors className="h-3.5 w-3.5" />
                        )}
                        {isRemovingBackground ? '处理中' : '去背'}
                      </Button>
                      <DropdownMenu open={isDecomposeMenuOpen} onOpenChange={setIsDecomposeMenuOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 gap-1 rounded-full px-2 text-xs"
                            disabled={isLayerDecomposing}
                          >
                            {isLayerDecomposing ? (
                              <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Layers className="h-3.5 w-3.5" />
                            )}
                            {isLayerDecomposing ? '处理中' : '拆解图层'}
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          side="top"
                          className="w-[220px] rounded-2xl border border-border/80 bg-popover/95 p-3 text-xs shadow-lg backdrop-blur"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">图层数</span>
                              <input
                                type="number"
                                min={1}
                                max={10}
                                step={1}
                                value={layerDecomposeCount}
                                onChange={(event) => {
                                  const next = Number(event.target.value)
                                  if (!Number.isFinite(next)) return
                                  setLayerDecomposeCount(clamp(Math.round(next), 1, 10))
                                }}
                                className="w-16 rounded-full border border-border bg-background px-2 py-1 text-center text-xs text-foreground focus:outline-none"
                              />
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">引导强度</span>
                              <input
                                type="number"
                                min={1}
                                max={20}
                                step={0.5}
                                value={layerGuidanceScale}
                                onChange={(event) => {
                                  const next = Number(event.target.value)
                                  if (!Number.isFinite(next)) return
                                  const clamped = clamp(next, 1, 20)
                                  setLayerGuidanceScale(Math.round(clamped * 10) / 10)
                                }}
                                className="w-16 rounded-full border border-border bg-background px-2 py-1 text-center text-xs text-foreground focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsDecomposeMenuOpen(false)
                                handleDecomposeLayers(selectedItem as CanvasImageItem)
                              }}
                              disabled={isLayerDecomposing}
                              className="mt-1 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isLayerDecomposing ? '处理中...' : '开始拆解'}
                            </button>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 rounded-full px-2 text-xs"
                        onClick={() => handleDownloadItem(selectedItem as CanvasImageItem)}
                      >
                        <Download className="h-3.5 w-3.5" />
                        下载
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 rounded-full px-2 text-xs"
                        onClick={() => handleCopyItem(selectedItem)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        复制
                      </Button>
                    </>
                  )}
                </>
              )}
              {!isLassoActive && !isSelectedImageGenerating && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 rounded-full px-2 text-xs text-destructive hover:text-destructive"
                  onClick={() => handleDeleteItemsSafe(selectedIds.length > 0 ? selectedIds : [selectedItem.id])}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  删除
                </Button>
              )}
            </div>
          </div>
          <div
            className="pointer-events-none absolute z-10"
            style={{
              left: worldToScreen(selectedItem.x + selectedItem.width, selectedItem.y).x,
              top: worldToScreen(selectedItem.x + selectedItem.width, selectedItem.y).y,
              transform: 'translate(10px, -24px)',
            }}
          >
            <div className="pointer-events-auto rounded-full border border-border bg-background/85 px-2 py-1 text-[10px] font-medium text-muted-foreground shadow-sm">
              {Math.round(selectedItem.width)} × {Math.round(selectedItem.height)}
            </div>
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files)
          event.currentTarget.value = ''
        }}
      />

      <div
        ref={viewportRef}
        className={cn(
          'absolute inset-0 z-0 overflow-hidden',
          dragMode === 'pan'
            ? 'cursor-grabbing'
            : dragMode === 'select'
            ? 'cursor-crosshair'
            : isSpacePanningActive
            ? 'cursor-grab'
            : activeTool === 'text'
            ? 'cursor-text'
            : 'cursor-default'
        )}
        style={gridStyle}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerEnter={handleViewportPointerEnter}
        onPointerLeave={handleViewportPointerLeave}
        onDoubleClick={handleDoubleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onContextMenu={(event) => {
          event.preventDefault()
          setLayerContextMenu(null)
          setLayerDetailPopover(null)
        }}
      >
        <div
          className="absolute left-0 top-0 h-full w-full origin-top-left"
          style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})` }}
        >
          {selectionBox && (
            <div
              className="pointer-events-none absolute rounded-lg border border-primary/70 bg-primary/10"
              style={{
                left: selectionBox.x,
                top: selectionBox.y,
                width: selectionBox.width,
                height: selectionBox.height,
              }}
            />
          )}
          {items.map((item) => {
            if (item.hidden) return null
            const selected = selectedIdsSet.has(item.id)
            const isPrimary = item.id === selectedId
            const isText = item.type === 'text'
            const isImageGeneratingItem = item.type === 'image' && item.data.generation?.status === 'pending'
            const pendingProgress = isImageGeneratingItem ? clamp(item.data.generation?.progress ?? 0, 0, 100) : 0
            const pendingSize =
              item.type === 'image'
                ? item.data.meta?.size && item.data.meta.size !== 'auto'
                  ? item.data.meta.size
                  : `${Math.round(item.width)}×${Math.round(item.height)}`
                : ''
            const isEditing = isText && editingId === item.id
            const isLassoTarget = item.type === 'image' && lassoState?.itemId === item.id
            const lassoPath =
              isLassoTarget && lassoState ? buildLassoPath(item as CanvasImageItem, lassoState.points, lassoState.closed) : ''
            const isLassoDrawing = isLassoTarget && Boolean(lassoState?.isDrawing)
            const isNote = isText && item.data.noteStyle
            const textShadow =
              item.type === 'text'
                ? buildTextStrokeShadow(item.data.strokeColor, item.data.strokeWidth)
                : 'none'
            const noteTone = item.data.noteTone ?? 'sticky'
            const notePaddingX = isNote ? NOTE_PADDING_X : TEXT_PADDING_X
            const notePaddingY = isNote ? NOTE_PADDING_Y : TEXT_PADDING_Y
            const noteRadius = isNote ? NOTE_RADIUS : 12
            const noteHighlight =
              noteTone === 'neutral'
                ? 'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0))'
                : 'linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0))'
            const noteDecoration = isNote
              ? {
                  border: `1px solid ${
                    noteTone === 'neutral' ? NOTE_NEUTRAL_BORDER_COLOR : NOTE_STICKY_BORDER_COLOR
                  }`,
                  boxShadow:
                    noteTone === 'neutral'
                      ? '0 10px 20px -16px rgba(15, 23, 42, 0.45)'
                      : '0 12px 24px -18px rgba(120, 53, 15, 0.45)',
                  backgroundImage: noteHighlight,
                }
              : { border: 'none', boxShadow: 'none', backgroundImage: 'none' }
            return (
              <div
                key={item.id}
                className={cn(
                  'absolute',
                  !isEditing && 'select-none',
                  dragMode === 'item' && selected ? 'cursor-grabbing' : isText ? 'cursor-text' : 'cursor-move'
                )}
                data-canvas-item
                data-canvas-type={item.type}
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                  outline: DEBUG_CANVAS ? '1px dashed rgba(148,163,184,0.6)' : undefined,
                  background: DEBUG_CANVAS ? 'rgba(15, 23, 42, 0.2)' : undefined,
                }}
                onPointerDown={(event) => handleItemPointerDown(event, item)}
                onDoubleClick={(event) => {
                  if (item.type !== 'text' || isEditing) return
                  event.preventDefault()
                  event.stopPropagation()
                  setEditingId(item.id)
                  setActiveTool('select')
                }}
              >
                {DEBUG_CANVAS && (
                  <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-[10px] text-white">
                    {Math.round(item.width)}×{Math.round(item.height)}
                  </div>
                )}
                {item.type === 'image' ? (
                  <>
                    {isImageGeneratingItem ? (
                      <div className="absolute inset-0 flex flex-col rounded-2xl border border-dashed border-primary/40 bg-muted/65 p-3 shadow-[0_16px_40px_-28px_hsl(var(--foreground)/0.35)]">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            生成中
                          </span>
                          <span>{pendingProgress}%</span>
                        </div>
                        <div className="mt-2">
                          <Progress value={pendingProgress} className="h-1.5 bg-primary/15" />
                        </div>
                        <div className="mt-auto flex items-center justify-between text-[10px] text-muted-foreground/90">
                          <span className="max-w-[70%] truncate">{item.data.meta?.model ?? 'AI'}</span>
                          <span>{pendingSize}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {!loadedImages[item.id] && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50 text-xs text-muted-foreground">
                            {brokenImages[item.id] ? '图片加载失败' : '图片加载中'}
                          </div>
                        )}
                        <img
                          src={item.data.src}
                          alt={item.data.name ?? 'canvas'}
                          crossOrigin="anonymous"
                          className="h-full w-full rounded-2xl object-contain shadow-[0_16px_40px_-28px_hsl(var(--foreground)/0.35)]"
                          draggable={false}
                          decoding="async"
                          fetchPriority="high"
                          style={{ WebkitUserDrag: 'none' }}
                          onLoad={(event) => {
                            const target = event.currentTarget
                            if (target.naturalWidth && target.naturalHeight) {
                              setImageSizeMap((prev) => {
                                const existing = prev[item.id]
                                if (
                                  existing &&
                                  existing.width === target.naturalWidth &&
                                  existing.height === target.naturalHeight
                                ) {
                                  return prev
                                }
                                return {
                                  ...prev,
                                  [item.id]: { width: target.naturalWidth, height: target.naturalHeight },
                                }
                              })
                            }
                            setLoadedImages((prev) => ({ ...prev, [item.id]: true }))
                          }}
                          onError={() => handleImageLoadError(item)}
                        />
                      </>
                    )}
                    {isLassoTarget && (
                      <div
                        data-lasso-overlay
                        className="absolute inset-0 rounded-2xl"
                        style={{ cursor: 'crosshair', touchAction: 'none' }}
                        onPointerDown={(event) => handleLassoPointerDown(event, item)}
                        onPointerMove={(event) => handleLassoPointerMove(event, item)}
                        onPointerUp={(event) => handleLassoPointerUp(event, item)}
                        onPointerCancel={(event) => handleLassoPointerUp(event, item)}
                      >
                        <svg
                          className="h-full w-full"
                          viewBox={`0 0 ${item.width} ${item.height}`}
                          preserveAspectRatio="none"
                        >
                          {lassoPath && (
                            <path
                              d={lassoPath}
                              fill="none"
                              stroke="rgba(239, 68, 68, 0.95)"
                              strokeWidth={2}
                            />
                          )}
                        </svg>
                        {!lassoPath && !isLassoDrawing && (
                          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/40 bg-background/80 px-3 py-1 text-[11px] text-muted-foreground shadow-sm">
                            拖动绘制套索
                          </div>
                        )}
                      </div>
                    )}
                    {selected && (
                      <>
                        <div className="pointer-events-none absolute -inset-1 rounded-[20px] border border-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.2)]" />
                        {isPrimary && !hasMultiSelection && !isLassoTarget && !isImageGeneratingItem && (
                          <>
                            {RESIZE_HANDLES.map((handle) => (
                              <div
                                key={handle.id}
                                className={cn(
                                  'absolute h-3 w-3 rounded-full border border-primary bg-background shadow-sm',
                                  handle.className
                                )}
                                onPointerDown={(event) => handleResizePointerDown(event, item, handle.id)}
                                style={{ cursor: handle.cursor }}
                              />
                            ))}
                            <div
                              className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary bg-background shadow-sm"
                              onPointerDown={(event) => handleItemPointerDown(event, item)}
                              style={{ cursor: 'move' }}
                            />
                          </>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {selected && (
                      <div className="pointer-events-none absolute -inset-1 rounded-lg border border-primary/70 shadow-[0_0_0_2px_hsl(var(--primary)/0.12)]" />
                    )}
                    {selected && isPrimary && !hasMultiSelection && !isEditing && (
                      <>
                        {RESIZE_HANDLES.map((handle) => (
                          <div
                            key={handle.id}
                            className={cn(
                              'absolute h-3 w-3 rounded-full border border-primary bg-background shadow-sm',
                              handle.className
                            )}
                            onPointerDown={(event) => handleResizePointerDown(event, item, handle.id)}
                            style={{ cursor: handle.cursor }}
                          />
                        ))}
                        <div
                          className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary bg-background shadow-sm"
                          onPointerDown={(event) => handleItemPointerDown(event, item)}
                          style={{ cursor: 'move' }}
                        />
                      </>
                    )}
                    {isEditing ? (
                      <textarea
                        ref={textEditRef}
                        value={item.data.text}
                        onChange={(event) => updateTextItem(item.id, event.target.value, item.data.fontSize)}
                        onBlur={(event) => {
                          const relatedTarget = event.relatedTarget as Element | null
                          if (isWithinTextStylePanel(relatedTarget)) return
                          if (isWithinTextStylePanel(document.activeElement)) return
                          commitTextItem(item.id)
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter' || event.shiftKey) return
                          event.preventDefault()
                          commitTextItem(item.id)
                        }}
                        onPointerDown={(event) => event.stopPropagation()}
                        onDoubleClick={(event) => event.stopPropagation()}
                        className="h-full w-full resize-none break-words bg-transparent text-foreground outline-none"
                        style={{
                          fontSize: `${item.data.fontSize}px`,
                          lineHeight: 1.3,
                          color: item.data.color,
                          backgroundColor: item.data.backgroundColor,
                          backgroundImage: noteDecoration.backgroundImage,
                          fontFamily: item.data.fontFamily,
                          fontWeight: item.data.fontWeight,
                          fontStyle: item.data.fontStyle,
                          textDecoration: item.data.textDecoration,
                          textAlign: item.data.align,
                          textShadow,
                          padding: `${notePaddingY}px ${notePaddingX}px`,
                          boxSizing: 'border-box',
                          borderRadius: noteRadius,
                          letterSpacing: isNote ? '0.01em' : undefined,
                          ...noteDecoration,
                        }}
                      />
                    ) : (
                      <div
                        className="whitespace-pre-wrap break-words text-foreground"
                        style={{
                          fontSize: `${item.data.fontSize}px`,
                          lineHeight: 1.3,
                          color: item.data.color,
                          backgroundColor: item.data.backgroundColor,
                          backgroundImage: noteDecoration.backgroundImage,
                          fontFamily: item.data.fontFamily,
                          fontWeight: item.data.fontWeight,
                          fontStyle: item.data.fontStyle,
                          textDecoration: item.data.textDecoration,
                          textAlign: item.data.align,
                          textShadow,
                          padding: `${notePaddingY}px ${notePaddingX}px`,
                          boxSizing: 'border-box',
                          borderRadius: noteRadius,
                          height: '100%',
                          letterSpacing: isNote ? '0.01em' : undefined,
                          ...noteDecoration,
                        }}
                        onDoubleClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          setEditingId(item.id)
                          setActiveTool('select')
                        }}
                      >
                        {item.data.text}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}

          {items.length === 0 && (
            <div className="absolute left-1/2 top-1/2 w-[min(560px,calc(100%-3rem))] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-dashed border-border bg-background/85 p-6 text-center text-sm text-muted-foreground shadow-[0_16px_45px_-28px_hsl(var(--foreground)/0.3)] backdrop-blur">
              <div className="space-y-2">
                <p className="text-base font-semibold text-foreground">爆款服装拆解工作台</p>
                <p>先上传一张穿搭图，再让智能体帮你拆解爆火逻辑并给出可生成方向。</p>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button
                  size="sm"
                  onClick={handleUploadClick}
                  className="h-8 rounded-full px-3 text-xs"
                >
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  上传穿搭图
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickStartFashionAnalysis('分析这张穿搭图：拆解爆火原因并给我 3 个爆款方向')}
                  className="h-8 rounded-full px-3 text-xs"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  一键拆解爆火原因
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickStartFashionAnalysis('按小白能看懂的方式输出，并附上完整可复制提示词')}
                  className="h-8 rounded-full px-3 text-xs"
                >
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                  给我 3 个方向
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
