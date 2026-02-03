'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { nanoid } from 'nanoid'
import {
  ArrowUpRight,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Download,
  DraftingCompass,
  Hand,
  ImagePlus,
  Italic,
  MessageSquare,
  MoreHorizontal,
  MousePointer2,
  Megaphone,
  Palette,
  PencilLine,
  RefreshCcw,
  Share2,
  Sparkles,
  Trash2,
  Type,
  Upload,
  Underline,
  Wand2,
  Square,
  Scissors,
  Copy,
  Layers,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThemeToggle } from '@/components/theme-toggle'
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
}

type CanvasImageItem = CanvasBaseItem & {
  type: 'image'
  data: {
    src: string
    key?: string
    provider?: string
    expiresAt?: string
    name?: string
  }
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

const STORAGE_KEY = 'loomai:canvas:phase0'
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
const NOTE_STICKY_TEXT_COLOR = '#713f12'
const NOTE_STICKY_BACKGROUND_COLOR = '#fef9c3'
const NOTE_STICKY_BORDER_COLOR = '#fde68a'
const NOTE_NEUTRAL_TEXT_COLOR = '#0f172a'
const NOTE_NEUTRAL_BACKGROUND_COLOR = '#f1f5f9'
const NOTE_NEUTRAL_BORDER_COLOR = '#e2e8f0'
const EXPORT_PADDING = 48
const MAX_EXPORT_SIZE = 8192
const DEBUG_CANVAS = false

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

const DEFAULT_EVOLINK_SIZE =
  config.aiImage.defaults.size ?? config.aiImage.evolinkSizes[0]?.value

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

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
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const [removingBackgroundIds, setRemovingBackgroundIds] = useState<Record<string, boolean>>({})
  const [activeTool, setActiveTool] = useState<ToolId>('select')
  const [backgroundMode, setBackgroundMode] = useState<'solid' | 'transparent'>('solid')
  const [backgroundIntensity, setBackgroundIntensity] = useState<'low' | 'medium' | 'high'>('medium')
  const [backgroundSpacing, setBackgroundSpacing] = useState<'tight' | 'medium' | 'loose'>('medium')
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [isChatMinimized, setIsChatMinimized] = useState(true)
  const [chatInput, setChatInput] = useState('')
  const [isChatPinnedToBottom, setIsChatPinnedToBottom] = useState(true)
  const [showChatJumpToLatest, setShowChatJumpToLatest] = useState(false)
  const chatProvider = 'devdove'
  const chatModel = 'gemini-2.5-flash'
  const [creditBalance, setCreditBalance] = useState<number | null>(null)
  const [isCreditsLoading, setIsCreditsLoading] = useState(false)
  const [canvasInput, setCanvasInput] = useState('')
  const [isCanvasPromptOpen, setIsCanvasPromptOpen] = useState(false)
  const [isCanvasPresetOpen, setIsCanvasPresetOpen] = useState(false)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const imageProviderModels = config.aiImage.availableModels
  const defaultImageProvider = config.aiImage.defaultProvider
  const defaultImageModel =
    config.aiImage.defaultModels[defaultImageProvider] ?? imageProviderModels[defaultImageProvider]?.[0] ?? ''
  const [imageModel, setImageModel] = useState<string>(defaultImageModel)
  const [isImageGenerating, setIsImageGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const canvasInputRef = useRef<HTMLInputElement | null>(null)
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null)
  const chatScrollRef = useRef<HTMLDivElement | null>(null)

  const { data: session } = authClientReact.useSession()
  const user = session?.user
  const { colorScheme, setColorScheme } = useTheme()
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(
    null
  )
  const isSpacePanningActive = isSpaceDown && isPointerInViewport

  const { messages, sendMessage, status, error } = useChat({
    messages: [
      {
        id: 'canvas-assistant-welcome',
        role: 'assistant',
        content: '你好！把需求告诉我，我可以帮你生成设计建议或总结。',
      },
    ],
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onError: (chatError) => {
      console.error('Canvas chat error:', chatError)
    },
  })

  const getViewportRect = () => viewportRef.current?.getBoundingClientRect()

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
    },
    [setSelectedId]
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
      handleDeleteItems(selectedIds.length > 0 ? selectedIds : selectedId ? [selectedId] : [])
    }

    window.addEventListener('keydown', handleDeleteKey, { capture: true })
    return () => {
      window.removeEventListener('keydown', handleDeleteKey, { capture: true })
    }
  }, [handleDeleteItems, selectedId, selectedIds])

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
        clearSelection()
        setEditingId(null)
      }
    }

    window.addEventListener('keydown', handleSelectionKeys)
    return () => window.removeEventListener('keydown', handleSelectionKeys)
  }, [clearSelection, items, syncSelection])

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
          .filter((item) => (item.type === 'text' ? Boolean(item.data?.text?.trim()) : Boolean(item.data?.src)))
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
    if (storageDisabledRef.current) return
    const handle = window.setTimeout(() => {
      try {
        let totalLength = 0
        let skippedLarge = false
        const persistItems: CanvasItem[] = []

        for (const item of items) {
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
    if (!isCanvasPromptOpen) return
    const handle = window.requestAnimationFrame(() => {
      canvasInputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(handle)
  }, [isCanvasPromptOpen])

  useEffect(() => {
    if (isCanvasPromptOpen) return
    setIsCanvasPresetOpen(false)
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
          .filter((item) =>
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

  const addImageItem = (src: string, name: string, metadata?: Partial<CanvasImageItem['data']>) => {
    const img = new Image()
    img.onerror = () => {
      toast.error('图片加载失败，请换一张图试试')
    }
    img.onload = () => {
      const maxSide = 520
      const intrinsicWidth = img.naturalWidth || img.width
      const intrinsicHeight = img.naturalHeight || img.height
      if (!intrinsicWidth || !intrinsicHeight) {
        toast.error('图片尺寸读取失败，请换一张图试试')
        return
      }
      const scale = Math.min(1, maxSide / Math.max(intrinsicWidth, intrinsicHeight))
      const width = intrinsicWidth * scale
      const height = intrinsicHeight * scale

      const rect = getViewportRect()
      const centerX = rect ? rect.width / 2 : 0
      const centerY = rect ? rect.height / 2 : 0
      const worldCenter = screenToWorld(centerX, centerY)

      const nextItem: CanvasItem = {
        id: nanoid(),
        type: 'image',
        x: worldCenter.x - width / 2,
        y: worldCenter.y - height / 2,
        width,
        height,
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
  }

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
              const targetWidth = Math.max(item.width, MIN_TEXT_WIDTH)
              const { height } = measureTextBox(
                text,
                fontSize,
                targetWidth,
                MIN_TEXT_HEIGHT,
                item.data.fontFamily,
                item.data.fontWeight,
                item.data.fontStyle
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
          nextData.fontStyle
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
          addImageItem(result, file.name)
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
        toast.message('没有可导出的内容', { id: toastId })
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
        const paddingX = TEXT_PADDING_X * exportScale
        const paddingY = TEXT_PADDING_Y * exportScale

        if (backgroundColor !== 'transparent') {
          ctx.fillStyle = backgroundColor
          ctx.fillRect(x, y, itemWidth, itemHeight)
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
        toast.message(`已导出，但有 ${failedImages.length} 张图片无法导出`, { id: toastId })
      } else if (exportScale < 1) {
        toast.success(`导出完成（已按最大边 ${MAX_EXPORT_SIZE}px 缩放）`, { id: toastId })
      } else {
        toast.success('导出完成', { id: toastId })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '导出失败'
      toast.error(message, { id: toastId })
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

  const handleToolClick = (toolId: ToolId) => {
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
    if (name) return name
    const fallbackExt = mediaType.split('/')[1] || 'png'
    return `selected-image.${fallbackExt}`
  }

  const sendChat = async () => {
    const text = chatInput.trim()
    if (!text) return
    if (status === 'streaming' || status === 'submitted') return
    const selectedItemsNow = items.filter((item) => selectedIds.includes(item.id))
    const primaryItem = selectedItemsNow.find((item) => item.id === selectedId) ?? selectedItemsNow[0] ?? null
    const hasMultiSelectionNow = selectedItemsNow.length > 1
    let files: FileUIPart[] | undefined
    let attachmentHint = ''

    if (primaryItem?.type === 'image' && primaryItem.data?.src) {
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
    setChatInput('')
    await sendMessage(
      { text: attachmentHint ? `${attachmentHint}${text}` : text, files },
      {
        body: {
          provider: chatProvider,
          model: chatModel,
        },
      }
    )
  }

  const handleGenerateCanvasImage = async () => {
    const prompt = resolvedCanvasPrompt.trim()
    if (!prompt || isImageGenerating) return
    const toastId = toast.loading('正在生成图片...')
    setIsImageGenerating(true)

    try {
      const payload: Record<string, unknown> = {
        prompt,
        model: imageModel,
      }

      if (DEFAULT_EVOLINK_SIZE) {
        payload.size = DEFAULT_EVOLINK_SIZE
      }

      const response = await fetch('/api/image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const message = data?.message || data?.error || '生成失败'
        if (response.status === 401) {
          toast.error('请先登录后再试', { id: toastId })
        } else if (response.status === 402) {
          toast.error('积分不足，请先充值', { id: toastId })
        } else {
          toast.error(message, { id: toastId })
        }
        return
      }

      const imageUrl = data?.data?.imageUrl
      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('未返回图片地址')
      }

      addImageItem(imageUrl, `AI-${imageModel}`)
      setCanvasInput('')
      if (typeof data?.credits?.remaining === 'number') {
        setCreditBalance(data.credits.remaining)
      }
      toast.success('已生成并添加到画布', { id: toastId })
    } catch (error) {
      const message = error instanceof Error ? error.message : '生成失败，请稍后重试'
      toast.error(message, { id: toastId })
    } finally {
      setIsImageGenerating(false)
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

  const resolveMessageText = (message: UIMessage) => {
    const parts = (message as UIMessage & { parts?: { type: string; text?: string }[] }).parts
    if (Array.isArray(parts) && parts.length > 0) {
      return parts
        .map((part) => (part.type === 'text' ? part.text ?? '' : ''))
        .join('')
        .trim()
    }
    return (message as UIMessage & { content?: string }).content ?? ''
  }

  const zoomPercent = Math.round(camera.scale * 100)
  const isChatBusy = status === 'streaming' || status === 'submitted'
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  )
  const selectedItem = selectedItems.find((item) => item.id === selectedId) ?? selectedItems[0] ?? null
  const hasMultiSelection = selectedItems.length > 1
  const selectedItemLabel = hasMultiSelection
    ? `已选 ${selectedItems.length} 项`
    : selectedItem
    ? selectedItem.type === 'text'
      ? selectedItem.data.text.trim().split('\n')[0].slice(0, 16) || '未命名文本'
      : selectedItem.data?.name?.trim() || '未命名图片'
    : ''
  const primaryImageLabel =
    selectedItem?.type === 'image' ? selectedItem.data?.name?.trim() || '未命名图片' : ''
  const selectionCountLabel = selectedItems.length > 0 ? `1/${selectedItems.length}` : ''
  const userDisplayName = user?.name?.trim() || user?.email?.split('@')[0] || '访客'
  const userInitials = userDisplayName.slice(0, 2)
  const hasUserMessage = useMemo(() => messages.some((message) => message.role === 'user'), [messages])
  const creditsDisplay = isCreditsLoading
    ? '…'
    : creditBalance !== null
      ? Math.round(creditBalance).toString()
      : '--'
  const isTextSelected = selectedItem?.type === 'text' && !hasMultiSelection
  const isRemovingBackground =
    selectedItem?.type === 'image' && Boolean(removingBackgroundIds[selectedItem.id])
  const selectedIdsSet = useMemo(() => new Set(selectedIds), [selectedIds])
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
  const isImagePromptMode =
    isCanvasPromptOpen && (activeTool === 'image' || selectedItem?.type === 'image')
  const resolvedCanvasPrompt = useMemo(() => {
    const userText = canvasInput.trim()
    if (!isImagePromptMode) return userText
    const presetPrompt = selectedPreset?.prompt?.trim()
    if (presetPrompt && userText) return `${presetPrompt}\n${userText}`
    if (presetPrompt) return presetPrompt
    return userText
  }, [canvasInput, isImagePromptMode, selectedPreset])
  const canvasPlaceholder = isImagePromptMode
    ? selectedPreset
      ? `补充${selectedPreset.name}的需求…`
      : '你想要创作什么？'
    : '输入文字...'
  const chatQuickPrompts = useMemo(() => {
    const basePrompts = [
      '给我 3 个构图方案',
      '给我配色建议',
      '生成服装平铺图',
      '把当前思路整理成步骤',
    ]
    const focusPrompt = selectedItem ? '总结当前选中对象' : '总结当前画布'
    return [focusPrompt, ...basePrompts].slice(0, 5)
  }, [selectedItem])

  useEffect(() => {
    if (isImagePromptMode) return
    setIsCanvasPresetOpen(false)
  }, [isImagePromptMode])

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

  const insertChatTextToCanvas = useCallback(
    (text: string, asNote = false, noteTone: 'neutral' | 'sticky' = 'sticky') => {
      const value = text.trim()
      if (!value) return
      const chunks = splitChatTextToNotes(value)
      const noteChunks = chunks.length > 0 ? chunks : [value]
      const rect = getViewportRect()
      const worldWidth = rect ? rect.width / camera.scale : DEFAULT_TEXT_BOX_WIDTH * 2
      const preferredColumns = noteChunks.length >= 6 ? 3 : noteChunks.length >= 3 ? 2 : 1
      const maxColumns = Math.max(
        1,
        Math.floor((worldWidth + NOTE_LAYOUT_GAP_X) / (DEFAULT_TEXT_BOX_WIDTH + NOTE_LAYOUT_GAP_X))
      )
      const columns = Math.min(preferredColumns, maxColumns, noteChunks.length)
      const sizes = noteChunks.map((chunk) => measureTextBox(chunk, DEFAULT_TEXT_SIZE, DEFAULT_TEXT_BOX_WIDTH))
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
        toast.success(noteTone === 'sticky' ? '已保存为便签' : '已插入便签')
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

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 w-[min(1200px,calc(100%-2.5rem))] -translate-x-1/2">
        <div className="pointer-events-auto flex items-center justify-between rounded-full border border-border bg-background/80 px-4 py-2 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-full px-2 py-1 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    LA
                  </div>
                  <div className="flex flex-col leading-tight">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      无限画布
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">Phase 0 · LoomAI</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72 p-2">
                <DropdownMenuLabel className="px-2 text-sm font-semibold">画布设置</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">主题色</DropdownMenuLabel>
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
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">背景样式</DropdownMenuLabel>
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-border bg-background/70 px-2 py-1 text-xs font-medium text-muted-foreground">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.image ?? ''} alt={userDisplayName} />
                <AvatarFallback className="text-[10px]">{userInitials}</AvatarFallback>
              </Avatar>
              <span className="max-w-[120px] truncate text-foreground">{userDisplayName}</span>
            </div>
            <ThemeToggle />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExportCanvas}
              disabled={isExporting}
              className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" />
              {isExporting ? '导出中...' : '导出'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  更多
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem className="gap-2">
                  <Share2 className="h-4 w-4" />
                  分享
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">积分</DropdownMenuLabel>
                <DropdownMenuItem disabled className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    余额
                  </span>
                  <span>{creditsDisplay}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              className="h-8 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-[0_12px_24px_-14px_hsl(var(--primary)/0.55)] hover:bg-primary/90"
            >
              升级
            </Button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute left-5 top-24 z-20">
        <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-2xl border border-border bg-background/85 p-2 shadow-md backdrop-blur">
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

      <div className="pointer-events-none absolute right-5 top-24 z-20">
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="rounded-full border border-border bg-background/85 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            缩放 {zoomPercent}%
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => {
                  setIsChatOpen(true)
                  setIsChatMinimized((prev) => !prev)
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/95 text-muted-foreground shadow-sm backdrop-blur transition hover:bg-muted hover:text-foreground"
                aria-label={isChatMinimized ? '展开 AI 对话' : '收起 AI 对话'}
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              {isChatMinimized ? '智能设计师' : '收起对话'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

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

      {isChatOpen && !isChatMinimized && (
        <div className="pointer-events-none absolute bottom-6 right-5 top-32 z-20">
          <div className="pointer-events-auto flex h-full w-[360px] flex-col overflow-hidden rounded-3xl border border-border bg-background/95 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-xs font-semibold text-primary">
                  AI
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">AI 对话</span>
                  <span className="text-xs text-muted-foreground">随时提问，获得建议</span>
                </div>
              </div>
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
                    <p className="text-sm font-medium text-foreground">欢迎来到 AI 对话</p>
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
                    const text = resolveMessageText(message)
                    if (!text) return null
                    const isAssistant = message.role === 'assistant'
                    const actionPlacement = isAssistant ? 'left-2' : 'right-2'
                    const actionPadding = isAssistant ? 'pl-14' : 'pr-14'
                    const actionButtonClass = isAssistant
                      ? 'border-border/70 bg-background/90 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      : 'border-primary/30 bg-primary/10 text-primary hover:border-primary/60 hover:text-primary'
                    return (
                      <Message key={message.id} from={message.role}>
                        <MessageContent
                          variant="contained"
                          className={cn('relative overflow-visible pt-6', actionPadding)}
                        >
                          {message.role === 'assistant' ? (
                            <Response className="text-sm leading-relaxed text-foreground">
                              {text}
                            </Response>
                          ) : (
                            <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
                          )}
                          <div
                            className={cn(
                              'pointer-events-none absolute top-2 flex items-center gap-1 opacity-0 transition',
                              actionPlacement,
                              'group-hover:pointer-events-auto group-hover:opacity-100'
                            )}
                          >
                              <button
                                type="button"
                                onClick={() => copyChatText(text)}
                                className={cn(
                                  'rounded-full border px-2 py-0.5 text-[10px] shadow-sm transition',
                                  actionButtonClass
                                )}
                              >
                                复制
                              </button>
                              <button
                                type="button"
                                onClick={() => insertChatTextToCanvas(text, true, 'neutral')}
                                className={cn(
                                  'rounded-full border px-2 py-0.5 text-[10px] shadow-sm transition',
                                  actionButtonClass
                                )}
                              >
                                插入到画布
                              </button>
                              <button
                                type="button"
                                onClick={() => insertChatTextToCanvas(text, true, 'sticky')}
                                className={cn(
                                  'rounded-full border px-2 py-0.5 text-[10px] shadow-sm transition',
                                  actionButtonClass
                                )}
                              >
                                保存为便签
                              </button>
                          </div>
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
                  placeholder="描述你的需求，例如：生成服装平铺图"
                  className="max-h-32 flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      type="submit"
                      disabled={isChatBusy || chatInput.trim().length === 0}
                      className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="text-xs">
                    发送
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">Enter 发送，Shift+Enter 换行</div>
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
      )}

      {isCanvasPromptOpen && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 w-[min(720px,calc(100%-3rem))] -translate-x-1/2">
          <div className="pointer-events-auto rounded-3xl border border-border bg-background/85 px-4 py-3 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-2">
              {selectedItem?.type === 'image' && (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-muted/30 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-background">
                      <img
                        src={selectedItem.data.src}
                        alt={primaryImageLabel || 'reference'}
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[11px] text-muted-foreground">原始参考</span>
                      <span className="truncate text-sm text-foreground">{primaryImageLabel}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border bg-background/70 px-2 py-1 text-[11px]">
                      {selectionCountLabel}
                    </span>
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
              <div className="flex items-center gap-3">
                {isImagePromptMode && (
                  <DropdownMenu open={isCanvasPresetOpen} onOpenChange={setIsCanvasPresetOpen}>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="快速功能"
                        aria-pressed={isCanvasPresetOpen}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:bg-muted hover:text-foreground',
                          (isCanvasPresetOpen || selectedPresetId) && 'border-primary/40 text-primary'
                        )}
                      >
                        <span className="text-muted-foreground">功能</span>
                        <span className="max-w-[80px] truncate text-foreground">
                          {selectedPreset ? selectedPreset.name : '无'}
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
                )}
                {isImagePromptMode && (
                  <Select value={imageModel} onValueChange={setImageModel} disabled={isImageGenerating}>
                    <SelectTrigger
                      size="sm"
                      className="h-7 rounded-full border border-border bg-background/80 px-2.5 text-[11px] text-muted-foreground hover:bg-muted"
                    >
                      <span className="text-muted-foreground">模型</span>
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
                )}
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
                      variant="ghost"
                      onClick={handleUploadClick}
                      aria-label="添加参考图"
                      className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <ImagePlus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    添加参考图
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsCanvasPromptOpen(false)}
                      aria-label="隐藏提示词输入框"
                      className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    隐藏
                  </TooltipContent>
                </Tooltip>
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
          </div>
        </div>
      )}



      {selectedItem && !hasMultiSelection && (
        <>
          <div
            className="pointer-events-none absolute z-20"
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
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 rounded-full px-2 text-xs"
                    onClick={() => setIsCanvasPromptOpen(true)}
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    编辑
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 rounded-full px-2 text-xs">
                    <Layers className="h-3.5 w-3.5" />
                    变体
                  </Button>
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
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 rounded-full px-2 text-xs text-destructive hover:text-destructive"
                onClick={() => handleDeleteItems(selectedIds.length > 0 ? selectedIds : [selectedItem.id])}
              >
                <Trash2 className="h-3.5 w-3.5" />
                删除
              </Button>
            </div>
          </div>
          <div
            className="pointer-events-none absolute z-20"
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
            const selected = selectedIdsSet.has(item.id)
            const isPrimary = item.id === selectedId
            const isText = item.type === 'text'
            const isEditing = isText && editingId === item.id
            const isNote = isText && item.data.noteStyle
            const textShadow =
              item.type === 'text'
                ? buildTextStrokeShadow(item.data.strokeColor, item.data.strokeWidth)
                : 'none'
            const noteTone = item.data.noteTone ?? 'sticky'
            const noteDecoration = isNote
              ? {
                  border: `1px solid ${
                    noteTone === 'neutral' ? NOTE_NEUTRAL_BORDER_COLOR : NOTE_STICKY_BORDER_COLOR
                  }`,
                  boxShadow:
                    noteTone === 'neutral'
                      ? '0 10px 20px -16px rgba(15, 23, 42, 0.45)'
                      : '0 12px 24px -18px rgba(120, 53, 15, 0.45)',
                }
              : { border: 'none', boxShadow: 'none' }
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
                    {!loadedImages[item.id] && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50 text-xs text-muted-foreground">
                        {brokenImages[item.id] ? '图片加载失败' : '图片加载中'}
                      </div>
                    )}
                    <img
                      src={item.data.src}
                      alt={item.data.name ?? 'canvas'}
                      className="h-full w-full rounded-2xl object-contain shadow-[0_16px_40px_-28px_hsl(var(--foreground)/0.35)]"
                      draggable={false}
                      style={{ WebkitUserDrag: 'none' }}
                      onLoad={() => {
                        setLoadedImages((prev) => ({ ...prev, [item.id]: true }))
                      }}
                      onError={() => handleImageLoadError(item)}
                    />
                    {selected && (
                      <>
                        <div className="pointer-events-none absolute -inset-1 rounded-[20px] border border-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.2)]" />
                        {isPrimary && !hasMultiSelection && (
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
                          fontFamily: item.data.fontFamily,
                          fontWeight: item.data.fontWeight,
                          fontStyle: item.data.fontStyle,
                          textDecoration: item.data.textDecoration,
                          textAlign: item.data.align,
                          textShadow,
                          padding: `${TEXT_PADDING_Y}px ${TEXT_PADDING_X}px`,
                          boxSizing: 'border-box',
                          borderRadius: 12,
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
                          fontFamily: item.data.fontFamily,
                          fontWeight: item.data.fontWeight,
                          fontStyle: item.data.fontStyle,
                          textDecoration: item.data.textDecoration,
                          textAlign: item.data.align,
                          textShadow,
                          padding: `${TEXT_PADDING_Y}px ${TEXT_PADDING_X}px`,
                          boxSizing: 'border-box',
                          borderRadius: 12,
                          height: '100%',
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
            <div className="absolute left-1/2 top-1/2 w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-dashed border-border bg-background/80 p-6 text-center text-sm text-muted-foreground shadow-[0_12px_35px_-25px_hsl(var(--foreground)/0.25)]">
              拖拽图片到画布，或点击左侧工具栏上传 / 添加文本
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
