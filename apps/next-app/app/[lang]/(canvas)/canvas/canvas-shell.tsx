'use client'

import { useEffect } from 'react'

export default function CanvasShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    const prev = {
      htmlOverscroll: html.style.overscrollBehavior,
      htmlOverscrollX: html.style.overscrollBehaviorX,
      bodyOverscroll: body.style.overscrollBehavior,
      bodyOverscrollX: body.style.overscrollBehaviorX,
      bodyOverflow: body.style.overflow,
    }

    html.style.overscrollBehavior = 'none'
    html.style.overscrollBehaviorX = 'none'
    body.style.overscrollBehavior = 'none'
    body.style.overscrollBehaviorX = 'none'
    body.style.overflow = 'hidden'

    return () => {
      html.style.overscrollBehavior = prev.htmlOverscroll
      html.style.overscrollBehaviorX = prev.htmlOverscrollX
      body.style.overscrollBehavior = prev.bodyOverscroll
      body.style.overscrollBehaviorX = prev.bodyOverscrollX
      body.style.overflow = prev.bodyOverflow
    }
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {children}
    </div>
  )
}
