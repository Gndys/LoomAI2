import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CardBoundaryPlaygroundPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Card Boundary Playground</h1>
          <p className="text-muted-foreground">
            Compare card edge clarity options before applying changes to the main UI.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Default</CardTitle>
              <CardDescription>Current border + shadow.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              This is the baseline card style for reference.
            </CardContent>
          </Card>

          <Card className="border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
            <CardHeader>
              <CardTitle>Crisp Border</CardTitle>
              <CardDescription>Thin border, tighter shadow.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              1px translucent border increases edge contrast.
            </CardContent>
          </Card>

          <Card className="border-white/8 shadow-[0_6px_18px_rgba(0,0,0,0.28),0_0_0_1px_rgba(255,255,255,0.06)]">
            <CardHeader>
              <CardTitle>Layered Shadow</CardTitle>
              <CardDescription>Outer glow + inner ring.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Two-layer shadow separates the card from background.
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          Tip: focus on the card edge around headers and lighter areas to compare clarity.
        </div>
      </div>
    </div>
  );
}
