import { InfiniteCanvas } from '@/components/canvas/infinite-canvas'

export default function CanvasPage() {
  return (
    <div className="flex h-full flex-col px-6 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-foreground">无限画布（Phase 0）</h1>
        <p className="text-sm text-muted-foreground">拖拽、缩放、放置图片与本地自动保存。</p>
      </div>
      <div className="flex-1">
        <InfiniteCanvas />
      </div>
    </div>
  )
}
