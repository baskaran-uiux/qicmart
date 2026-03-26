export function KpiCardSkeleton() {
  return (
    <div className="p-7 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 rounded-[32px] animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      </div>
      <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
      <div className="h-3 w-40 bg-zinc-100 dark:bg-zinc-800/50 rounded" />
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col h-[400px]">
      <div className="p-7 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
      </div>
      <div className="p-5 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800/50 rounded animate-pulse" />
            </div>
            <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ReviewSkeleton() {
  return (
    <div className="p-6 space-y-3 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-3 h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
      <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-800/50 rounded animate-pulse" />
      <div className="flex items-center gap-2 pt-2">
        <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
        <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800/50 rounded animate-pulse" />
      </div>
    </div>
  )
}
