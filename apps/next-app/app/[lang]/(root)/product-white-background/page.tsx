'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
} from 'react'
import { CheckCircle2, Download, ImagePlus, Loader2, Shirt, WandSparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import { FeatureCard, FeaturePageShell } from '@/components/feature-page-shell'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const MAX_FILE_SIZE = 15 * 1024 * 1024
const MAX_BATCH = 30

type ItemStatus = 'ready' | 'processing' | 'done'
type NamingMode = 'origin-suffix' | 'prefix-index' | 'date-index'

type UploadItem = {
  id: string
  fileName: string
  fileSize: number
  previewUrl: string
  status: ItemStatus
}

const CATEGORY_OPTIONS = [
  { value: 'top', label: '上衣' },
  { value: 'pants', label: '裤装' },
  { value: 'dress', label: '裙装' },
  { value: 'outerwear', label: '外套' },
  { value: 'shoes-bag', label: '鞋包' },
  { value: 'accessory', label: '配饰' },
]

const SHADOW_OPTIONS = [
  { value: 'none', label: '无阴影' },
  { value: 'soft', label: '软阴影（推荐）' },
  { value: 'standard', label: '标准阴影' },
]

const PADDING_OPTIONS = [
  { value: '5', label: '5%' },
  { value: '8', label: '8%（推荐）' },
  { value: '10', label: '10%' },
]

const SIZE_PRESETS = [
  { value: 'taobao-1-1-800', label: '淘宝 1:1 · 800x800' },
  { value: 'douyin-1-1-1000', label: '抖店 1:1 · 1000x1000' },
  { value: 'pdd-1-1-1000', label: '拼多多 1:1 · 1000x1000' },
  { value: '1688-1-1-1500', label: '1688 1:1 · 1500x1500' },
]

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function sanitizeSegment(text: string) {
  return text
    .trim()
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9-_\u4e00-\u9fa5]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function getDateStamp() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}${mm}${dd}`
}

function buildDownloadName(fileName: string, mode: NamingMode, prefix: string, index: number) {
  const originName = sanitizeSegment(fileName)
  const safePrefix = sanitizeSegment(prefix)
  const seq = String(index + 1).padStart(3, '0')

  if (mode === 'origin-suffix') {
    return `${originName || 'product'}_白底`
  }

  if (mode === 'prefix-index') {
    return `${safePrefix || '白底图'}_${seq}`
  }

  return `${safePrefix || '白底图'}_${getDateStamp()}_${seq}`
}

export default function ProductWhiteBackgroundPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const itemsRef = useRef<UploadItem[]>([])

  const [items, setItems] = useState<UploadItem[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]?.value ?? 'top')
  const [shadow, setShadow] = useState(SHADOW_OPTIONS[1]?.value ?? 'soft')
  const [padding, setPadding] = useState(PADDING_OPTIONS[1]?.value ?? '8')
  const [sizePreset, setSizePreset] = useState(SIZE_PRESETS[1]?.value ?? 'douyin-1-1-1000')
  const [protectColor, setProtectColor] = useState(true)
  const [namingMode, setNamingMode] = useState<NamingMode>('origin-suffix')
  const [filePrefix, setFilePrefix] = useState('')

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl)
      })
    }
  }, [])

  const generatedItems = useMemo(() => items.filter((item) => item.status === 'done'), [items])
  const canGenerate = items.length > 0 && !isGenerating

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return

    const currentCount = items.length
    const rawFiles = Array.from(fileList)

    if (currentCount >= MAX_BATCH) {
      toast.error(`单次最多支持 ${MAX_BATCH} 张，请先导出或清空后再试`)
      return
    }

    const acceptedFiles = rawFiles.slice(0, Math.max(MAX_BATCH - currentCount, 0))
    const validFiles: UploadItem[] = []

    acceptedFiles.forEach((file, index) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} 不是图片文件`)
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} 超过 15MB，请压缩后重试`)
        return
      }

      validFiles.push({
        id: `${Date.now()}-${index}-${file.name}`,
        fileName: file.name,
        fileSize: file.size,
        previewUrl: URL.createObjectURL(file),
        status: 'ready',
      })
    })

    if (validFiles.length > 0) {
      setItems((prev) => [...prev, ...validFiles])
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragActive(false)
    addFiles(event.dataTransfer.files)
  }

  const handleDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!isDragActive) {
      setIsDragActive(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragActive(false)
  }

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return prev.filter((item) => item.id !== id)
    })
  }

  const clearAll = () => {
    setItems((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      return []
    })
  }

  const generateMockResults = async () => {
    if (!canGenerate) return

    const total = items.length
    setIsGenerating(true)
    setItems((prev) => prev.map((item) => ({ ...item, status: 'processing' })))

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setItems((prev) => prev.map((item) => ({ ...item, status: 'done' })))
    setIsGenerating(false)
    toast.success(`已完成 ${total} 张白底图生成`)
  }

  const downloadSingle = (item: UploadItem, index: number) => {
    if (item.status !== 'done') return

    const link = document.createElement('a')
    link.href = item.previewUrl
    link.download = `${buildDownloadName(item.fileName, namingMode, filePrefix, index)}.png`
    link.click()
  }

  const exportGenerated = () => {
    if (generatedItems.length === 0) {
      toast.error('当前没有可导出的图片')
      return
    }

    generatedItems.forEach((item, index) => {
      const link = document.createElement('a')
      link.href = item.previewUrl
      link.download = `${buildDownloadName(item.fileName, namingMode, filePrefix, index)}.png`
      link.click()
    })

    toast.success(`已触发 ${generatedItems.length} 张图片下载`)
  }

  return (
    <FeaturePageShell
      title="白底产品图"
      description="上传图片后，一键生成可上架白底图。界面已简化为上传、设置、导出三步。"
      badge={{
        label: '服装电商工具',
        icon: <Shirt className="h-3.5 w-3.5" />,
      }}
      headerAlign="left"
      className="max-w-6xl"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <FeatureCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">上传商品图</CardTitle>
              <CardDescription>支持批量上传，单次最多 30 张。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleInputChange}
              />

              <div
                className={`rounded-xl border border-dashed p-5 transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-border/70 bg-muted/20'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <ImagePlus className="h-7 w-7 text-muted-foreground" />
                  <p className="text-sm font-medium">拖拽图片到这里，或点击上传</p>
                  <p className="text-xs text-muted-foreground">支持 JPG/PNG/WEBP，单张不超过 15MB</p>
                  <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                    <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                      选择图片
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearAll} disabled={items.length === 0}>
                      清空
                    </Button>
                  </div>
                </div>
              </div>

              {items.length > 0 && (
                <div className="rounded-xl border border-border/70">
                  <div className="grid grid-cols-[1fr_100px_70px] items-center gap-3 border-b border-border/70 px-4 py-2 text-xs text-muted-foreground">
                    <span>文件名</span>
                    <span>状态</span>
                    <span className="text-right">操作</span>
                  </div>
                  <div className="max-h-72 overflow-auto">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1fr_100px_70px] items-center gap-3 border-b border-border/40 px-4 py-2.5 text-sm last:border-b-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate">{item.fileName}</p>
                          <p className="text-xs text-muted-foreground">{formatBytes(item.fileSize)}</p>
                        </div>
                        <span
                          className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs ${
                            item.status === 'done'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : item.status === 'processing'
                                ? 'bg-amber-500/10 text-amber-600'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {item.status === 'done' ? '已生成' : item.status === 'processing' ? '处理中' : '待处理'}
                        </span>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </FeatureCard>

          <FeatureCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">生成结果</CardTitle>
              <CardDescription>默认展示原图与白底图对比。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {generatedItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                  还没有生成结果，点击右侧“开始生成”。
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {generatedItems.map((item, index) => (
                    <div key={item.id} className="rounded-xl border border-border/70 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="truncate text-xs font-medium text-muted-foreground">{item.fileName}</p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          已生成
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/20">
                          <img src={item.previewUrl} alt={`${item.fileName} 原图`} className="h-36 w-full object-cover" />
                          <p className="border-t border-border/50 px-2 py-1 text-center text-xs text-muted-foreground">原图</p>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-border/60 bg-white">
                          <div className="flex h-36 w-full items-center justify-center bg-white p-2">
                            <img
                              src={item.previewUrl}
                              alt={`${item.fileName} 白底图`}
                              className={`max-h-full w-full object-contain ${shadow === 'none' ? '' : shadow === 'soft' ? 'drop-shadow-sm' : 'drop-shadow-md'}`}
                            />
                          </div>
                          <p className="border-t border-border/50 px-2 py-1 text-center text-xs text-muted-foreground">白底图</p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-end">
                        <Button size="sm" variant="outline" onClick={() => downloadSingle(item, index)}>
                          <Download className="mr-1.5 h-4 w-4" />
                          下载
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </FeatureCard>
        </div>

        <FeatureCard className="lg:sticky lg:top-20 lg:self-start">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">设置与导出</CardTitle>
            <CardDescription>保留最常用参数，减少操作负担。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border/60 p-2 text-center">
                <p className="text-xs text-muted-foreground">已上传</p>
                <p className="text-sm font-medium">{items.length} 张</p>
              </div>
              <div className="rounded-lg border border-border/60 p-2 text-center">
                <p className="text-xs text-muted-foreground">已生成</p>
                <p className="text-sm font-medium">{generatedItems.length} 张</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>商品类目</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="选择类目" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>阴影</Label>
              <Select value={shadow} onValueChange={setShadow}>
                <SelectTrigger>
                  <SelectValue placeholder="选择阴影" />
                </SelectTrigger>
                <SelectContent>
                  {SHADOW_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>留白</Label>
                <Select value={padding} onValueChange={setPadding}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择留白" />
                  </SelectTrigger>
                  <SelectContent>
                    {PADDING_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>尺寸</Label>
                <Select value={sizePreset} onValueChange={setSizePreset}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择尺寸" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_PRESETS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
              <p className="text-sm">色彩保护</p>
              <Switch checked={protectColor} onCheckedChange={setProtectColor} />
            </div>

            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/15 p-3">
              <Label>导出命名</Label>
              <Select value={namingMode} onValueChange={(value) => setNamingMode(value as NamingMode)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择命名方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="origin-suffix">原文件名_白底（推荐）</SelectItem>
                  <SelectItem value="prefix-index">自定义前缀_序号</SelectItem>
                  <SelectItem value="date-index">前缀_日期_序号</SelectItem>
                </SelectContent>
              </Select>

              {namingMode !== 'origin-suffix' && (
                <Input
                  value={filePrefix}
                  onChange={(event) => setFilePrefix(event.target.value)}
                  placeholder="输入文件前缀，例如：SKU2026"
                />
              )}
              <p className="text-[11px] text-muted-foreground">导出时自动编号，无需手动填写规则。</p>
            </div>

            <Button className="w-full" onClick={generateMockResults} disabled={!canGenerate}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在生成...
                </>
              ) : (
                <>
                  <WandSparkles className="mr-2 h-4 w-4" />
                  开始生成
                </>
              )}
            </Button>

            <Button className="w-full" variant="outline" onClick={exportGenerated} disabled={generatedItems.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              批量导出
            </Button>
          </CardContent>
        </FeatureCard>
      </div>
    </FeaturePageShell>
  )
}
