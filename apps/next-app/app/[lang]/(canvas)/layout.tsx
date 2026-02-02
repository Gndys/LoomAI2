import CanvasShell from "./canvas/canvas-shell"

export default function CanvasRootLayout({ children }: { children: React.ReactNode }) {
  return <CanvasShell>{children}</CanvasShell>
}
