import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="container mx-auto p-10">
      <div className="mb-6">
        <Skeleton className="h-6 w-32" />
      </div>

      <Skeleton className="h-10 w-60 mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 col-span-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 