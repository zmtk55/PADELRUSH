import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

export default function MatchesChart({ data = {} }) {
  const [period, setPeriod] = useState('day')
  const chartData = data[period === 'day' ? 'byDay' : 'byWeek'] || []
  const isEmpty = chartData.length === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-semibold text-lg">Partidos</h2>
        <div className="flex bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setPeriod('day')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
              period === 'day' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Día
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
              period === 'week' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Semana
          </button>
        </div>
      </div>
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <svg width="120" height="60" viewBox="0 0 120 60" fill="none" className="opacity-20 mb-4">
            <rect x="10" y="30" width="12" height="20" rx="2" fill="currentColor" />
            <rect x="30" y="20" width="12" height="30" rx="2" fill="currentColor" />
            <rect x="50" y="10" width="12" height="40" rx="2" fill="currentColor" />
            <rect x="70" y="25" width="12" height="25" rx="2" fill="currentColor" />
          </svg>
          <p className="text-sm">Aún no hay partidos registrados</p>
        </div>
      ) : (
        <div className="w-full aspect-[21/9] max-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}
