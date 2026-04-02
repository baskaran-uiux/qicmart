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

export function OrderDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-16 space-y-10">
      {/* Header Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800/50 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-40 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Bento Skeleton */}
        <div className="md:col-span-2 lg:col-span-3 h-40 bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 p-8 animate-pulse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800/50 rounded" />
                        <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    </div>
                ))}
            </div>
        </div>

        {/* Big Items Card Skeleton */}
        <div className="md:col-span-2 h-[500px] bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 animate-pulse">
            <div className="p-7 border-b border-zinc-50 dark:border-zinc-800 flex justify-between">
                <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-6 w-20 bg-zinc-100 dark:bg-zinc-800/50 rounded-full" />
            </div>
            <div className="p-7 space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-6">
                        <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
                        <div className="flex-1 space-y-2">
                            <div className="h-5 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                            <div className="h-4 w-1/2 bg-zinc-100 dark:bg-zinc-800/50 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Small Cards Skeletons */}
        <div className="space-y-6">
            <div className="h-52 bg-zinc-950 rounded-[40px] border border-zinc-900 animate-pulse" />
            <div className="h-52 bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="w-full h-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 flex flex-col gap-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800/50 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          <div className="h-10 w-28 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
        </div>
      </div>
      <div className="flex-1 flex gap-3 sm:gap-6 px-2 overflow-hidden items-end">
        {[65, 45, 75, 40, 85, 55, 95, 60, 45, 80, 50, 70].map((h, i) => (
          <div 
            key={i} 
            className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-t-2xl min-w-[12px]"
            style={{ 
              height: `${h}%`,
              opacity: i === 6 ? 1 : 0.4
            }}
          />
        ))}
      </div>
      <div className="flex justify-between px-2 pt-2 border-t border-zinc-50 dark:border-zinc-800/50">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-2 w-8 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
        ))}
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-8 space-y-8 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-800 rounded" />
          <div className="h-14 w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800" />
        </div>
      ))}
      <div className="pt-4 flex gap-4">
        <div className="h-14 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        <div className="h-14 w-full bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
      </div>
    </div>
  )
}

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col h-[400px]">
          <div className="h-48 bg-zinc-100 dark:bg-zinc-800" />
          <div className="p-6 space-y-4 flex-1">
            <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded" />
              <div className="h-3 w-2/3 bg-zinc-100 dark:bg-zinc-800/50 rounded" />
            </div>
          </div>
          <div className="p-6 border-t border-zinc-50 dark:border-zinc-800 flex justify-between items-center">
            <div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
            <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function NewsletterSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-[24px] border border-zinc-200 dark:border-zinc-800 h-32" />
        ))}
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 h-[500px]" />
    </div>
  )
}

export function SEOSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex gap-4 overflow-x-hidden pb-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex-shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 space-y-8">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-8 h-[600px]" />
        </div>
      </div>
    </div>
  )
}
