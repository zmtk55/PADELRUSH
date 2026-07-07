export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-muted">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card p-6">
            <div className="w-10 h-3 animate-pulse bg-elevated mb-3" />
            <div className="h-9 w-20 animate-pulse bg-elevated mb-2" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-card border border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-4 h-4 animate-pulse bg-elevated" />
          <div className="h-5 w-40 animate-pulse bg-elevated" />
        </div>
        <div className="h-64 bg-muted rounded-sm" />
      </div>

      {/* Two Column Skeleton */}
      <div className="grid lg:grid-cols-2 gap-6">
        {[1, 2].map((col) => (
          <div key={col} className="bg-card border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 animate-pulse bg-elevated" />
              <div className="h-5 w-32 animate-pulse bg-elevated" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((row) => (
                <div key={row} className="flex items-center gap-3">
                  <div className="w-8 h-8 animate-pulse bg-elevated shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-3/4 animate-pulse bg-elevated" />
                    <div className="h-3 w-1/2 animate-pulse bg-elevated" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
