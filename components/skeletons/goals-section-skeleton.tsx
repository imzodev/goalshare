export function GoalsSectionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border bg-white/40 dark:bg-gray-800/40 px-4 py-4 animate-pulse"
        >
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="mt-2 h-3 w-2/3 rounded bg-muted/70" />
          <div className="mt-4 h-2 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}
