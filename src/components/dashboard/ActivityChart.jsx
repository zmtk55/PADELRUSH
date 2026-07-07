import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Activity } from 'lucide-react'
import { useDesignTokens } from '@/hooks/useDesignTokens'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-card border border-border p-3 shadow-elevated">
      <p className="text-xs text-muted-foreground font-body">{label}</p>
      <p className="text-xl font-heading font-bold text-foreground mt-0.5">
        {payload[0].value}{' '}
        <span className="text-xs font-body text-muted-foreground font-normal">
          {payload[0].value === 1 ? 'partido' : 'partidos'}
        </span>
      </p>
    </div>
  )
}

export function ActivityChart({ data: chartData, timeRange = 'week', onTimeRangeChange }) {
  const { getToken } = useDesignTokens()
  const hasData = chartData?.length > 0

  // Get color values from design tokens
  const borderColor = getToken('colors.border', '#e5e5e5')
  const mutedForeground = getToken('colors.muted.foreground', '#9ca3af')
  const foreground = getToken('colors.foreground', '#111')
  const cardForeground = getToken('colors.card.foreground', '#f5f5f5')
  const background = getToken('colors.background', '#ffffff')

  return (
    <div className="bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <div>
            <h3 className="text-[11px] font-heading font-bold tracking-wider text-fg-secondary uppercase">
              {hasData ? `Partidos por ${timeRange === 'week' ? 'semana' : 'mes'}` : 'Actividad'}
            </h3>
            {hasData && (
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                Total: {chartData.reduce((sum, d) => sum + d.partidos, 0)} partidos
              </p>
            )}
          </div>
        </div>
        <div className="flex border border-border">
          <button
            onClick={() => onTimeRangeChange?.('week')}
            className={`px-3 py-1.5 text-xs font-body transition-colors ${
              timeRange === 'week'
                ? 'bg-foreground text-background'
                : 'bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => onTimeRangeChange?.('month')}
            className={`px-3 py-1.5 text-xs font-body transition-colors ${
              timeRange === 'month'
                ? 'bg-foreground text-background'
                : 'bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            Mes
          </button>
        </div>
      </div>

      {hasData ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={borderColor} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: mutedForeground }}
                axisLine={{ stroke: borderColor }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: mutedForeground }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: cardForeground }} />
              <Bar
                dataKey="partidos"
                fill={foreground}
                radius={[1, 1, 0, 0]}
                maxBarSize={48}
                animationDuration={600}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-body">Sin datos de actividad aún</p>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Los partidos jugados aparecerán aquí
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
