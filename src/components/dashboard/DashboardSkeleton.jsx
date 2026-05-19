export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-muted mb-3" />
            <div className="h-8 w-16 bg-muted rounded mb-2" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="h-6 w-48 bg-muted rounded mb-6" />
        <div className="h-64 bg-muted rounded" />
      </div>

      {/* Two Column Layout Skeleton */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="h-6 w-40 bg-muted rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-muted rounded" />
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="h-6 w-40 bg-muted rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
