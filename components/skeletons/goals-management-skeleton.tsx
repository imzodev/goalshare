import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function GoalsManagementSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="backdrop-blur-sm bg-white/40 dark:bg-gray-900/40 border-white/20">
          <CardHeader className="pb-3">
            <div className="h-6 w-3/4 rounded bg-muted animate-pulse" />
            <div className="flex gap-2 mt-2">
              <div className="h-5 w-16 rounded bg-muted animate-pulse" />
              <div className="h-5 w-20 rounded bg-muted animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
              <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-2 w-full rounded bg-muted animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
