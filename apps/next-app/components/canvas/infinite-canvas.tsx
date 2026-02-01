'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { nanoid } from 'nanoid'
import { Upload, RefreshCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CanvasItem = {
  id: string
  type: 'image'
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  data: {
    src: string
    key?: string
    provider?: string
    expiresAt?: string
    name?: string
  }
}

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
    }

const STORAGE_KEY = 'loomai:canvas:phase0'
const MIN_SCALE = 0.2
const MAX_SCALE = 4
const ZOOM_SPEED = 0.0015
const MAX_FILE_SIZE_MB = 10
const USE_MOCK_UPLOAD = true
const MAX_PERSISTED_SRC_LENGTH = 200_000
const MAX_PERSISTED_TOTAL_LENGTH = 3_000_000
const DEBUG_CANVAS = false

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

export function InfiniteCanvas() {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dragStateRef = useRef<DragState | null>(null)
  const storageDisabledRef = useRef(false)
  const warnedLargeItemsRef = useRef(false)

  const [camera, setCamera] = useState<CameraState>({ x: 0, y: 0, scale: 1 })
  const [items, setItems] = useState<CanvasItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isSpaceDown, setIsSpaceDown] = useState(false)
  const [dragMode, setDragMode] = useState<'pan' | 'item' | null>(null)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})

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
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        setHasHydrated(true)
        return
      }
      const parsed = JSON.parse(raw) as { camera?: CameraState; items?: CanvasItem[] }
      if (parsed.camera) setCamera(parsed.camera)
      if (parsed.items) setItems(parsed.items.filter((item) => Boolean(item.data?.src)))
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
          const src = item.data?.src
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

  const gridStyle = useMemo(() => {
    const gridSize = 24 * camera.scale
    const positionX = camera.x % gridSize
    const positionY = camera.y % gridSize

    return {
      backgroundColor: '#F6F2E9',
      backgroundImage:
        'radial-gradient(circle, rgba(148, 120, 84, 0.35) 1px, transparent 1px)',
      backgroundSize: `${gridSize}px ${gridSize}px`,
      backgroundPosition: `${positionX}px ${positionY}px`,
    }
  }, [camera])

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
    if (event.button === 1 || isSpaceDown) {
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

    setSelectedId(null)
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
      const nextX = dragState.itemX + (worldPoint.x - dragState.startWorldX)
      const nextY = dragState.itemY + (worldPoint.y - dragState.startWorldY)

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
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current) return
    dragStateRef.current = null
    setDragMode(null)
    viewportRef.current?.releasePointerCapture(event.pointerId)
  }

  const handleDoubleClick = () => {
    updateCamera({ x: 0, y: 0, scale: 1 })
  }

  const handleItemPointerDown = (event: React.PointerEvent<HTMLDivElement>, item: CanvasItem) => {
    if (event.button !== 0) return
    if (isSpaceDown) return

    event.stopPropagation()
    const rect = getViewportRect()
    if (!rect) return

    const screenX = event.clientX - rect.left
    const screenY = event.clientY - rect.top
    const worldPoint = screenToWorld(screenX, screenY)

    dragStateRef.current = {
      kind: 'item',
      id: item.id,
      startWorldX: worldPoint.x,
      startWorldY: worldPoint.y,
      itemX: item.x,
      itemY: item.y,
    }

    setSelectedId(item.id)
    setDragMode('item')
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
      setSelectedId(nextItem.id)
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
    setSelectedId(null)
  }

  const zoomPercent = Math.round(camera.scale * 100)

  return (
    <div className="relative h-full min-h-[70vh] w-full">
      <div className="absolute left-6 top-6 z-20 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={handleUploadClick}>
          <Upload className="mr-2 h-4 w-4" />
          上传图片
        </Button>
        <Button size="sm" variant="outline" onClick={() => updateCamera({ x: 0, y: 0, scale: 1 })}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          复位视图
        </Button>
        <Button size="sm" variant="ghost" onClick={handleClear}>
          <Trash2 className="mr-2 h-4 w-4" />
          清空
        </Button>
      </div>

      <div className="absolute right-6 top-6 z-20 rounded-full border border-border bg-background/90 px-3 py-1 text-xs text-muted-foreground">
        缩放 {zoomPercent}%
      </div>

      <div className="absolute left-6 bottom-6 z-20 rounded-lg border border-border bg-background/90 px-3 py-2 text-xs text-muted-foreground">
        滚轮缩放 · 空格+拖拽平移 · 双击复位
      </div>

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
          'relative h-full w-full overflow-hidden rounded-2xl border border-border',
          dragMode === 'pan' ? 'cursor-grabbing' : isSpaceDown ? 'cursor-grab' : 'cursor-default'
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
          {items.map((item) => {
            const selected = item.id === selectedId
            return (
              <div
                key={item.id}
                className={cn(
                  'absolute select-none',
                  dragMode === 'item' && selected ? 'cursor-grabbing' : 'cursor-move'
                )}
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                  outline: DEBUG_CANVAS ? '1px dashed rgba(148,163,184,0.6)' : undefined,
                  background: DEBUG_CANVAS ? 'rgba(15, 23, 42, 0.2)' : undefined,
                }}
                onPointerDown={(event) => handleItemPointerDown(event, item)}
              >
                {DEBUG_CANVAS && (
                  <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-[10px] text-white">
                    {Math.round(item.width)}×{Math.round(item.height)}
                  </div>
                )}
                {!loadedImages[item.id] && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 text-xs text-muted-foreground">
                    {brokenImages[item.id] ? '图片加载失败' : '图片加载中'}
                  </div>
                )}
                <img
                  src={item.data.src}
                  alt={item.data.name ?? 'canvas'}
                  className="h-full w-full rounded-lg object-contain shadow-sm"
                  draggable={false}
                  onLoad={() => {
                    setLoadedImages((prev) => ({ ...prev, [item.id]: true }))
                  }}
                  onError={() => {
                    setBrokenImages((prev) => ({ ...prev, [item.id]: true }))
                  }}
                />
                {selected && (
                  <div className="pointer-events-none absolute -inset-1 rounded-xl border border-primary/70 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]" />
                )}
              </div>
            )
          })}

          {items.length === 0 && (
            <div className="absolute left-1/2 top-1/2 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-dashed border-border bg-background/80 p-6 text-center text-sm text-muted-foreground">
              拖拽图片到画布或点击左上角上传
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
