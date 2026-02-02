'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { nanoid } from 'nanoid'
import {
  ArrowUpRight,
  ChevronDown,
  Download,
  Hand,
  ImagePlus,
  MessageSquare,
  MousePointer2,
  RefreshCcw,
  Share2,
  Sparkles,
  SlidersHorizontal,
  Trash2,
  Type,
  Upload,
  Wand2,
  Square,
  Scissors,
  Copy,
  Layers,
  X,
  Grid2X2,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { Message, MessageContent } from '@/components/ai-elements/message'
import type { FileUIPart, UIMessage } from 'ai'
import { authClientReact } from '@libs/auth/authClient'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from '@/hooks/use-theme'
import { type ColorScheme, THEME_CONFIG } from '@libs/ui/themes'

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
      corner: 'tl' | 'tr' | 'bl' | 'br'
      startWorldX: number
      startWorldY: number
      startWidth: number
      startHeight: number
      itemX: number
      itemY: number
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
const DEFAULT_TEXT = '双击编辑文字'
const DEFAULT_TEXT_SIZE = 28
const MIN_TEXT_WIDTH = 40
const MIN_TEXT_HEIGHT = 24
const EXPORT_PADDING = 48
const MAX_EXPORT_SIZE = 8192
const DEBUG_CANVAS = false

type ToolId = 'select' | 'hand' | 'text' | 'image' | 'shape'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

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
  const pendingPanTimeoutRef = useRef<number | null>(null)
  const pendingPanStartRef = useRef<{ x: number; y: number } | null>(null)
  const textEditRef = useRef<HTMLTextAreaElement | null>(null)
  const lastTextClickRef = useRef<{ id: string | null; time: number }>({ id: null, time: 0 })

  const [camera, setCamera] = useState<CameraState>({ x: 0, y: 0, scale: 1 })
  const [items, setItems] = useState<CanvasItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSpaceDown, setIsSpaceDown] = useState(false)
  const [dragMode, setDragMode] = useState<'pan' | 'item' | 'resize' | 'select' | null>(null)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const [activeTool, setActiveTool] = useState<ToolId>('select')
  const [backgroundMode, setBackgroundMode] = useState<'solid' | 'transparent'>('solid')
  const [backgroundIntensity, setBackgroundIntensity] = useState<'low' | 'medium' | 'high'>('medium')
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [chatInput, setChatInput] = useState('')
  const chatProvider = 'devdove'
  const chatModel = 'gemini-2.5-flash'
  const [creditBalance, setCreditBalance] = useState<number | null>(null)
  const [isCreditsLoading, setIsCreditsLoading] = useState(false)
  const [canvasInput, setCanvasInput] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const { data: session } = authClientReact.useSession()
  const user = session?.user
  const { colorScheme, setColorScheme } = useTheme()
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(
    null
  )

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

  const measureTextBox = useCallback((text: string, fontSize: number) => {
    if (typeof document === 'undefined') {
      return { width: MIN_TEXT_WIDTH, height: MIN_TEXT_HEIGHT }
    }
    const measurer = document.createElement('div')
    measurer.style.position = 'absolute'
    measurer.style.visibility = 'hidden'
    measurer.style.whiteSpace = 'pre-wrap'
    measurer.style.fontSize = `${fontSize}px`
    measurer.style.lineHeight = '1.3'
    measurer.style.fontWeight = '500'
    measurer.style.fontFamily = 'inherit'
    measurer.style.padding = '0'
    measurer.style.border = '0'
    measurer.style.margin = '0'
    measurer.textContent = text && text.length > 0 ? text : ' '
    document.body.appendChild(measurer)
    const rect = measurer.getBoundingClientRect()
    document.body.removeChild(measurer)
    return {
      width: Math.max(Math.ceil(rect.width), MIN_TEXT_WIDTH),
      height: Math.max(Math.ceil(rect.height), MIN_TEXT_HEIGHT),
    }
  }, [])

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
      const value = text?.trim() ? text : DEFAULT_TEXT
      const { width, height } = measureTextBox(value, DEFAULT_TEXT_SIZE)
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
      if (event.code !== 'Space') return
      if (isEditableTarget(event.target)) return
      event.preventDefault()
      setIsSpaceDown(true)
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      if (isEditableTarget(event.target)) return
      event.preventDefault()
      setIsSpaceDown(false)
    }

    window.addEventListener('keydown', handleKeyDown, { passive: false })
    window.addEventListener('keyup', handleKeyUp, { passive: false })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

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
            return {
              ...item,
              data: {
                ...item.data,
                text: textValue,
                fontSize,
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
    const gridSize = 24 * camera.scale
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
  }, [backgroundMode, backgroundIntensity, camera])

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
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (editingId && !isEditableTarget(event.target) && event.button === 0 && !isSpaceDown && activeTool !== 'hand') {
      commitTextItem(editingId)
      setActiveTool('select')
      return
    }

    if (event.button === 1 || isSpaceDown || activeTool === 'hand') {
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

    if (event.button === 0 && activeTool === 'select' && !isSpaceDown) {
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

    if (event.button === 0) {
      pendingPanStartRef.current = { x: event.clientX, y: event.clientY }
      pendingPanTimeoutRef.current = window.setTimeout(() => {
        dragStateRef.current = {
          kind: 'pan',
          startX: event.clientX,
          startY: event.clientY,
          cameraX: camera.x,
          cameraY: camera.y,
        }
        setDragMode('pan')
        viewportRef.current?.setPointerCapture(event.pointerId)
        pendingPanTimeoutRef.current = null
        pendingPanStartRef.current = null
      }, 180)
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current && pendingPanTimeoutRef.current && pendingPanStartRef.current) {
      const dx = Math.abs(event.clientX - pendingPanStartRef.current.x)
      const dy = Math.abs(event.clientY - pendingPanStartRef.current.y)
      if (dx > 3 || dy > 3) {
        window.clearTimeout(pendingPanTimeoutRef.current)
        pendingPanTimeoutRef.current = null
        pendingPanStartRef.current = null
      }
    }

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

      const startWidth = dragState.startWidth
      const startHeight = dragState.startHeight
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

      const scale = Math.max(rawWidth / startWidth, rawHeight / startHeight, minSize / startWidth, minSize / startHeight)
      const nextWidth = Math.max(startWidth * scale, minSize)
      const nextHeight = Math.max(startHeight * scale, minSize)

      const nextX =
        dragState.corner === 'tl' || dragState.corner === 'bl' ? anchor.x - nextWidth : anchor.x
      const nextY =
        dragState.corner === 'tl' || dragState.corner === 'tr' ? anchor.y - nextHeight : anchor.y

      setItems((prev) =>
        prev.map((item) =>
          item.id === dragState.id
            ? {
                ...item,
                x: Math.round(nextX * 100) / 100,
                y: Math.round(nextY * 100) / 100,
                width: Math.round(nextWidth * 100) / 100,
                height: Math.round(nextHeight * 100) / 100,
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
    if (pendingPanTimeoutRef.current) {
      window.clearTimeout(pendingPanTimeoutRef.current)
      pendingPanTimeoutRef.current = null
      pendingPanStartRef.current = null
    }
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

  const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null
    if (target?.closest('[data-canvas-item]')) return
    updateCamera({ x: 0, y: 0, scale: 1 })
  }

  const handleItemPointerDown = (event: React.PointerEvent<HTMLDivElement>, item: CanvasItem) => {
    if (event.button !== 0) return
    if (isSpaceDown) return
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
    corner: 'tl' | 'tr' | 'bl' | 'br'
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
    }

    syncSelection([item.id], item.id)
    setDragMode('resize')
    viewportRef.current?.setPointerCapture(event.pointerId)
  }

  const addImageItem = (src: string, name: string) => {
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

  const updateTextItem = (id: string, text: string, fontSize: number) => {
    const { width, height } = measureTextBox(text, fontSize)
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.type === 'text'
          ? {
              ...item,
              width,
              height,
              data: {
                ...item.data,
                text,
                fontSize,
              },
            }
          : item
      )
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

      addImageItem(data.url, data.originalName ?? file.name)
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
      const fontFamily = bodyStyle.fontFamily || 'sans-serif'
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
        ctx.fillStyle = textColor
        ctx.textBaseline = 'top'
        ctx.font = `500 ${fontSize}px ${fontFamily}`
        const lineHeight = fontSize * 1.3
        text.split('\n').forEach((line, index) => {
          ctx.fillText(line, x, y + index * lineHeight)
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
      const response = await fetch(item.data.src)
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

  const toggleBackgroundMode = () => {
    setBackgroundMode((prev) => (prev === 'solid' ? 'transparent' : 'solid'))
  }

  const toggleBackgroundIntensity = () => {
    setBackgroundIntensity((prev) => {
      if (prev === 'low') return 'medium'
      if (prev === 'medium') return 'high'
      return 'low'
    })
  }

  const intensityLabel = backgroundIntensity === 'low' ? '弱' : backgroundIntensity === 'medium' ? '中' : '强'

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
      const mediaType = resolveImageMediaType(primaryItem.data.src, primaryItem.data.name)
      const filename = resolveImageFileName(primaryItem.data.name, mediaType)
      files = [
        {
          type: 'file',
          mediaType,
          filename,
          url: primaryItem.data.src,
        },
      ]
      const label = primaryItem.data?.name?.trim() || '未命名图片'
      attachmentHint = hasMultiSelectionNow
        ? `【已附加图片：${label}（多选，仅附加一张）】\n`
        : `【已附加图片：${label}】\n`
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

  const sendCanvasText = () => {
    const text = canvasInput.trim()
    if (!text) return
    const { width, height } = measureTextBox(text, DEFAULT_TEXT_SIZE)
    const center = getViewportCenterWorld()
    createTextItem(center.x - width / 2, center.y - height / 2, text, false)
    setCanvasInput('')
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
  const userDisplayName = user?.name?.trim() || user?.email?.split('@')[0] || '访客'
  const userInitials = userDisplayName.slice(0, 2)
  const creditsDisplay = isCreditsLoading
    ? '…'
    : creditBalance !== null
      ? Math.round(creditBalance).toString()
      : '--'
  const isTextSelected = selectedItem?.type === 'text' && !hasMultiSelection
  const selectedIdsSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const tools: { id: ToolId; label: string; Icon: LucideIcon }[] = [
    { id: 'select', label: '选择', Icon: MousePointer2 },
    { id: 'hand', label: '拖拽', Icon: Hand },
    { id: 'text', label: '文本', Icon: Type },
    { id: 'image', label: '图片', Icon: ImagePlus },
    { id: 'shape', label: '形状', Icon: Square },
  ]

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
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>画布设置</DropdownMenuLabel>
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
              onClick={toggleBackgroundMode}
              className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Grid2X2 className="h-3.5 w-3.5" />
              {backgroundMode === 'solid' ? '透明' : '纯色'}
            </Button>
            {backgroundMode === 'transparent' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleBackgroundIntensity}
                className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                强度 {intensityLabel}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsChatOpen((prev) => !prev)}
              className={cn(
                'h-8 rounded-full px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground',
                isChatOpen &&
                  'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]'
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              AI 对话
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Share2 className="h-3.5 w-3.5" />
              分享
            </Button>
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
            <div className="flex items-center gap-1 rounded-full border border-border bg-background/70 px-2 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              {creditsDisplay}
            </div>
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
          {tools.map(({ id, label, Icon }) => (
            <Button
              key={id}
              size="icon"
              variant="ghost"
              onClick={() => setActiveTool(id)}
              aria-label={label}
              className={cn(
                'h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground',
                activeTool === id &&
                  'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]'
              )}
            >
              <Icon className="h-5 w-5" />
            </Button>
          ))}
          <div className="my-1 h-px w-6 bg-border" />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleUploadClick}
            aria-label="上传图片"
            className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Upload className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => updateCamera({ x: 0, y: 0, scale: 1 })}
            aria-label="复位视图"
            className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <RefreshCcw className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleClear}
            aria-label="清空画布"
            className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="pointer-events-none absolute right-5 top-24 z-20">
        <div className="pointer-events-auto rounded-full border border-border bg-background/85 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          缩放 {zoomPercent}%
        </div>
      </div>

      {isChatOpen && (
        <div className="pointer-events-none absolute bottom-6 right-5 top-32 z-20 w-[360px]">
          <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-background/95 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-xs font-semibold text-primary">
                  AI
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">AI 对话</span>
                  <span className="text-xs text-muted-foreground">
                    {isChatBusy ? '正在生成中…' : '随时提问，获得建议'}
                  </span>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsChatOpen(false)}
                className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                  <MessageSquare className="h-5 w-5" />
                  暂无对话，开始提问吧
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((message) => {
                    const text = resolveMessageText(message)
                    if (!text) return null
                    return (
                      <Message key={message.id} from={message.role}>
                        <MessageContent variant="contained">
                          <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
                        </MessageContent>
                      </Message>
                    )
                  })}
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
                </div>
              )}
              <div className="flex items-end gap-2 rounded-2xl border border-border bg-background px-3 py-2 shadow-sm">
                <textarea
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
                <Button
                  size="icon"
                  type="submit"
                  disabled={isChatBusy || chatInput.trim().length === 0}
                  className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">Enter 发送，Shift+Enter 换行</div>
            </form>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 w-[min(720px,calc(100%-3rem))] -translate-x-1/2">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-background/85 px-4 py-3 shadow-lg backdrop-blur">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Wand2 className="h-4 w-4" />
          </div>
          <input
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            placeholder="你想要创作什么？"
            value={canvasInput}
            onChange={(event) => setCanvasInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' || event.shiftKey) return
              event.preventDefault()
              sendCanvasText()
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleUploadClick}
            aria-label="添加参考图"
            className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ImagePlus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className="h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-[0_12px_24px_-14px_hsl(var(--primary)/0.55)] hover:bg-primary/90"
            aria-label="发送"
            onClick={sendCanvasText}
            disabled={canvasInput.trim().length === 0}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="pointer-events-none absolute left-5 bottom-5 z-20 hidden items-center gap-2 rounded-full border border-border bg-background/85 px-3 py-1 text-xs text-muted-foreground shadow-sm md:flex">
        滚轮缩放 · 空格+拖拽平移 · Shift/⌘/Ctrl 点击多选 · 拖动选框
      </div>

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
                    onClick={() => setEditingId(selectedItem.id)}
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
                  <Button size="sm" variant="ghost" className="h-7 gap-1 rounded-full px-2 text-xs">
                    <Wand2 className="h-3.5 w-3.5" />
                    编辑
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 rounded-full px-2 text-xs">
                    <Layers className="h-3.5 w-3.5" />
                    变体
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 rounded-full px-2 text-xs">
                    <Scissors className="h-3.5 w-3.5" />
                    去背
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
            : isSpaceDown
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
        onPointerLeave={handlePointerUp}
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
                      onError={() => {
                        setBrokenImages((prev) => ({ ...prev, [item.id]: true }))
                      }}
                    />
                    {selected && (
                      <>
                        <div className="pointer-events-none absolute -inset-1 rounded-[20px] border border-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.2)]" />
                        {isPrimary && !hasMultiSelection && (
                          <>
                            <div
                              className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full border border-primary bg-background shadow-sm"
                              onPointerDown={(event) => handleResizePointerDown(event, item, 'tl')}
                              style={{ cursor: 'nwse-resize' }}
                            />
                            <div
                              className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border border-primary bg-background shadow-sm"
                              onPointerDown={(event) => handleResizePointerDown(event, item, 'tr')}
                              style={{ cursor: 'nesw-resize' }}
                            />
                            <div
                              className="absolute -left-1.5 -bottom-1.5 h-3 w-3 rounded-full border border-primary bg-background shadow-sm"
                              onPointerDown={(event) => handleResizePointerDown(event, item, 'bl')}
                              style={{ cursor: 'nesw-resize' }}
                            />
                            <div
                              className="absolute -right-1.5 -bottom-1.5 h-3 w-3 rounded-full border border-primary bg-background shadow-sm"
                              onPointerDown={(event) => handleResizePointerDown(event, item, 'br')}
                              style={{ cursor: 'nwse-resize' }}
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
                    {isEditing ? (
                      <textarea
                        ref={textEditRef}
                        value={item.data.text}
                        onChange={(event) => updateTextItem(item.id, event.target.value, item.data.fontSize)}
                        onBlur={() => commitTextItem(item.id)}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter' || event.shiftKey) return
                          event.preventDefault()
                          commitTextItem(item.id)
                        }}
                        onPointerDown={(event) => event.stopPropagation()}
                        onDoubleClick={(event) => event.stopPropagation()}
                        className="h-full w-full resize-none bg-transparent text-foreground outline-none font-medium"
                        style={{ fontSize: `${item.data.fontSize}px`, lineHeight: 1.3 }}
                      />
                    ) : (
                      <div
                        className="whitespace-pre-wrap text-foreground font-medium"
                        style={{ fontSize: `${item.data.fontSize}px`, lineHeight: 1.3 }}
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
