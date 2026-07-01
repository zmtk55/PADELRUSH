import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card-base p-3">
      <p className="text-xs font-body text-muted-foreground">{label}</p>
      <p className="text-xl font-heading font-bold text-foreground mt-0.5">
        {payload[0].value} <span className="text-xs font-body text-muted-foreground font-normal">{payload[0].value === 1 ? 'partido' : 'partidos'}</span>
      </p>
    </div>
  )
}

export function ActivityChart({ data: chartData, timeRange = 'week', onTimeRangeChange }) {
  const hasData = chartData?.length > 0
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-base p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-heading text-base font-semibold text-foreground tracking-wider">
              {hasData ? `Partidos por ${timeRange === 'week' ? 'semana' : 'mes'}` : 'Actividad'}
            </h3>
            {hasData && <p className="text-xs font-body text-muted-foreground mt-0.5">Total: {chartData.reduce((sum, d) => sum + d.partidos, 0)} partidos</p>}
          </div>
        </div>
        <div className="flex rounded-lg bg-muted/50 p-0.5 border border-border/50">
          <button onClick={() => onTimeRangeChange?.('week')} className={"px-3 py-1.5 text-xs font-body font-medium rounded-md transition-colors " + (timeRange === 'week' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>Semana</button>
          <button onClick={() => onTimeRangeChange?.('month')} className={"px-3 py-1.5 text-xs font-body font-medium rounded-md transition-colors " + (timeRange === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>Mes</button>
        </div>
      </div>
      {hasData ? (
        <div className="h-52 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--chart-grid))" strokeOpacity={0.3} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgb(var(--chart-tick))' }} axisLine={{ stroke: 'rgb(var(--chart-grid))', strokeOpacity: 0.3 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--chart-tick))' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgb(var(--chart-grid))', fillOpacity: 0.15 }} />
              <Bar dataKey="partidos" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} maxBarSize={48} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm font-body text-muted-foreground">Sin datos de actividad aun</p>
            <p className="text-xs font-body text-muted-foreground/60 mt-1">Los partidos jugados apareceran aqui</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
