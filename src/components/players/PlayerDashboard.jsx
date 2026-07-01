import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  X, Trophy, Swords as SwordsIcon, TrendingUp, Activity,
  BarChart3, PieChart, Target, Zap, Flame, Star,
  Shield, MapPin, Crown, Award, Medal, User,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
} from 'recharts'
import {
  usePlayerStatsById,
  computeAttributes,
  computeGrade,
  computeAchievements,
  generateFormGuide,
} from '@/hooks/usePlayerStats'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'

/* ===================================================================
   B/N Editorial — The Athletic / NYT aesthetic
   Clean, minimal, black & white with gray accents
   =================================================================== */

const levelLabels = {
  '3RA': 'Avanzado',
  '4TA': 'Intermedio-Alto',
  '5TA': 'Intermedio',
  '6TA': 'Principiante',
}

// --- Stat Card ---
function StatCard({ icon: Icon, label, value, suffix = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex flex-col items-center p-4 border border-border bg-card"
    >
      <Icon className="w-4 h-4 text-muted-foreground mb-2" />
      <span className="text-2xl font-bold font-mono tabular-nums text-foreground leading-none">
        {value}{suffix}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 font-medium">
        {label}
      </span>
    </motion.div>
  )
}

// --- Attribute Bar ---
function AttrBar({ label, value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="space-y-1"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="font-mono tabular-nums text-foreground font-bold">{value}</span>
      </div>
      <div className="h-2 bg-muted w-full">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: delay + 0.2, duration: 0.6, ease: 'easeOut' }}
          className="h-full bg-foreground"
        />
      </div>
    </motion.div>
  )
}

// --- Form Dot (W/L) ---
function FormDot({ result, index }) {
  const isWin = result === 'W'
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + index * 0.03, type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'w-6 h-6 flex items-center justify-center text-[9px] font-bold font-mono border',
        isWin
          ? 'bg-foreground text-background border-foreground'
          : 'bg-card text-muted-foreground border-border'
      )}
    >
      {isWin ? 'W' : 'L'}
    </motion.div>
  )
}

// --- Section Header ---
function SectionHeader({ icon: Icon, label, right }) {
  return (
    <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{label}</h3>
      </div>
      {right && (
        <span className="text-[10px] text-muted-foreground font-mono tabular-nums">{right}</span>
      )}
    </div>
  )
}

// --- Achievement Icon ---
const achievementIcons = {
  Swords: SwordsIcon, Trophy, 'Award': Trophy,
  Flame, Shield, Star, Medal, Crown, Target,
}

/* ===================================================================
   MAIN PLAYER DASHBOARD
   =================================================================== */

export default function PlayerDashboard({ player, open, onClose }) {
  const { playerStatsQuery } = usePlayerStatsById(player?.id)
  const isLoading = playerStatsQuery.isLoading
  const stats = playerStatsQuery.data || []
  const lvl = player?.level
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!isLoading && player) {
      const t = setTimeout(() => setLoaded(true), 400)
      return () => clearTimeout(t)
    }
    setLoaded(false)
  }, [isLoading, player])

  if (!player) return null

  const { total, winRate, attributes } = computeAttributes(stats)
  const grade = computeGrade(winRate, total)
  const achievements = computeAchievements(total)
  const formGuide = generateFormGuide(total)
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const setsTotal = total.sets_won + total.sets_lost

  // Category breakdown
  const categoryData = stats
    .filter(s => s.category)
    .reduce((acc, s) => {
      const ex = acc.find(x => x.category === s.category)
      if (ex) { ex.wins += s.matches_won || 0; ex.losses += s.matches_lost || 0 }
      else acc.push({ category: s.category, wins: s.matches_won || 0, losses: s.matches_lost || 0 })
      return acc
    }, [])

  // Sets distribution
  const setsData = [
    { name: 'Ganados', value: total.sets_won, color: 'rgb(var(--chart-bar-primary))' },
    { name: 'Perdidos', value: total.sets_lost, color: 'rgb(var(--chart-bar-secondary))' },
  ].filter(d => d.value > 0)

  // Performance trend by league
  const trendData = [...stats]
    .sort((a, b) => (a.final_ranking || 999) - (b.final_ranking || 999))
    .slice(0, 8)
    .map(s => ({
      name: (s.leagues?.name || 'LIGA').slice(0, 5),
      winRate: (s.matches_played || 0) > 0
        ? Math.round(((s.matches_won || 0) / (s.matches_played || 1)) * 100) : 0,
    }))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 bg-card">
        {/* Close button */}
        <button
          onClick={onClose}
          className="sticky top-3 z-50 float-right mr-3 mt-3 w-8 h-8 flex items-center justify-center border border-border bg-card hover:bg-muted transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        {isLoading || !loaded ? (
          /* Loading skeleton */
          <div className="flex items-center justify-center min-h-[50vh] px-6">
            <div className="w-full max-w-sm space-y-4">
              <div className="h-5 bg-muted w-3/4 animate-pulse" />
              <div className="h-3 bg-muted w-1/2 animate-pulse" />
              <div className="grid grid-cols-2 gap-3 mt-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted border border-border animate-pulse" />
                ))}
              </div>
              <div className="h-40 bg-muted border border-border animate-pulse mt-3" />
            </div>
          </div>
        ) : (
          <>
            {/* ============================================================
               HERO — Player Profile
               ============================================================ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mx-4 sm:mx-6 mt-2"
            >
              <div className="p-5 sm:p-6 border border-border bg-card">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Photo */}
                  <div className="shrink-0 flex justify-center sm:justify-start">
                    <div className="w-32 sm:w-40 aspect-[3/4] border border-border bg-muted flex items-center justify-center overflow-hidden">
                      {player.photo_url ? (
                        <img
                          src={player.photo_url}
                          alt={player.name}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <User className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                          {player.name}
                        </h1>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {lvl && levelLabels[lvl] && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-border text-muted-foreground bg-muted">
                              <Zap className="w-3 h-3" />
                              {lvl} — {levelLabels[lvl]}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] uppercase tracking-wider border border-border text-muted-foreground">
                            {player.gender === 'femenil' ? 'Femenil' : 'Varonil'}
                          </span>
                        </div>
                      </div>

                      {/* Grade badge */}
                      <div className="shrink-0 flex flex-col items-center">
                        <div className="w-16 h-16 border-2 border-foreground flex items-center justify-center">
                          <span className="text-2xl font-bold font-heading text-foreground">
                            {grade.grade}
                          </span>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1 font-medium">
                          {grade.label}
                        </span>
                      </div>
                    </div>

                    {/* Quick stats row */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="mt-4 pt-4 border-t border-border"
                    >
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-mono tabular-nums">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mr-1">
                          Récord
                        </span>
                        <span className="font-bold text-foreground">{total.matches_won}</span>
                        <span className="text-muted-foreground">—</span>
                        <span className="font-bold text-foreground">{total.matches_lost}</span>
                        <span className="text-muted-foreground">—</span>
                        <span className="font-bold text-foreground">{winRate}%</span>
                        <span className="text-muted-foreground text-[10px]">WR</span>
                        <span className="text-muted-foreground mx-1">|</span>
                        <span className="text-muted-foreground">{total.matches_played} PJ</span>
                        {total.current_win_streak > 0 && (
                          <>
                            <span className="text-muted-foreground mx-1">|</span>
                            <span className="font-bold text-foreground">+{total.current_win_streak}</span>
                            <span className="text-muted-foreground text-[10px]">W streak</span>
                          </>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ============================================================
               QUICK STATS — 4-column grid
               ============================================================ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mx-4 sm:mx-6 mt-3"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-[1px] bg-muted border border-border">
                {[
                  { label: 'Partidos', value: total.matches_played, icon: SwordsIcon },
                  { label: 'Victorias', value: total.matches_won, icon: Trophy },
                  { label: 'Derrotas', value: total.matches_lost, icon: Shield },
                  { label: 'Win Rate', value: winRate, suffix: '%', icon: TrendingUp },
                ].map((s, i) => (
                  <StatCard key={s.label} {...s} delay={0.1 + i * 0.04} />
                ))}
              </div>
            </motion.div>

            {/* ============================================================
               ATTRIBUTES + FORM + RADAR
               ============================================================ */}
            <div className="mx-4 sm:mx-6 mt-3 grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-muted border border-border">
              {/* Attributes */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="p-4 bg-card"
              >
                <SectionHeader icon={BarChart3} label="Atributos" />
                <div className="space-y-3">
                  {attributes.map((attr, i) => (
                    <AttrBar key={attr.key} label={attr.label} value={attr.value} delay={0.2 + i * 0.04} />
                  ))}
                </div>
              </motion.div>

              {/* Form Guide + Streaks */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-card"
              >
                <SectionHeader icon={Activity} label="Forma Reciente"
                  right={formGuide.length > 0 ? `${formGuide.length} partidos` : ''} />

                {formGuide.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {formGuide.map((r, i) => <FormDot key={i} result={r} index={i} />)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-bold text-foreground">
                        W: {formGuide.filter(r => r === 'W').length}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span>
                        L: {formGuide.filter(r => r === 'L').length}
                      </span>
                      <div className="ml-auto w-24 h-1.5 bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(formGuide.filter(r => r === 'W').length / formGuide.length) * 100}%` }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          className="h-full bg-foreground"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-20 flex items-center justify-center text-xs text-muted-foreground">
                    Sin datos de forma reciente
                  </div>
                )}

                {/* Streaks */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Racha de victorias', value: total.current_win_streak, suffix: 'W' },
                      { label: 'Racha de derrotas', value: total.current_lose_streak, suffix: 'L' },
                    ].map((s, i) => (
                      <div key={s.label} className="text-center p-3 bg-muted border border-border">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                          {s.label}
                        </p>
                        <p className="text-xl font-bold font-mono tabular-nums text-foreground">
                          {s.value}
                          <span className="text-xs text-muted-foreground ml-0.5">{s.suffix}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Sets Distribution */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="p-4 bg-card"
              >
                <SectionHeader icon={PieChart} label="Sets"
                  right={setsTotal > 0 ? `Total: ${setsTotal}` : ''} />

                {setsTotal === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
                    Sin datos
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <ResponsiveContainer width={100} height={100}>
                      <RePieChart>
                        <Pie data={setsData} cx="50%" cy="50%" innerRadius={28} outerRadius={44}
                          paddingAngle={4} dataKey="value" stroke="none">
                          {setsData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                      </RePieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {setsData.map(d => {
                        const pct = Math.round((d.value / setsTotal) * 100)
                        return (
                          <div key={d.name}>
                            <div className="flex items-center justify-between text-[11px] mb-0.5">
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <span className="w-2 h-2 inline-block" style={{ background: d.color }} />
                                {d.name}
                              </span>
                              <span className="font-mono tabular-nums text-foreground font-bold">
                                {d.value} ({pct}%)
                              </span>
                            </div>
                            <div className="h-1.5 bg-muted w-full">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="h-full" style={{ background: d.color }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* ============================================================
               PERFORMANCE CHART + CATEGORIES
               ============================================================ */}
            <div className="mx-4 sm:mx-6 mt-3 grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-muted border border-border">
              {/* Win Rate by League */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-card"
              >
                <SectionHeader icon={TrendingUp} label="Rendimiento por Liga" right="Win %" />
                {trendData.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
                    Sin datos
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={trendData} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--chart-grid))" vertical={false} />
                      <XAxis dataKey="name"
                        tick={{ fontSize: 11, fill: 'rgb(var(--chart-tick))' }}
                        axisLine={{ stroke: 'rgb(var(--chart-tooltip-border))' }}
                        tickLine={false} interval={0} />
                      <YAxis domain={[0, 100]}
                        tick={{ fontSize: 11, fill: 'rgb(var(--chart-tick))' }}
                        axisLine={false} tickLine={false} width={20} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgb(var(--chart-tooltip-bg))',
                          border: '1px solid rgb(var(--chart-tooltip-border))',
                          borderRadius: 0,
                          fontSize: '12px',
                          color: 'rgb(var(--chart-tooltip-text))',
                        }}
                        formatter={(v) => [`${v}%`, 'Win Rate']}
                      />
                      <Bar dataKey="winRate" name="Win %" radius={[0, 0, 0, 0]} maxBarSize={16}>
                        {trendData.map((_, i) => (
                          <Cell key={i} fill="rgb(var(--chart-bar-primary))" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </motion.div>

              {/* By Category */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="p-4 bg-card"
              >
                <SectionHeader icon={BarChart3} label="Por Categoría" right="G / P" />
                {categoryData.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
                    Sin datos
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={categoryData} barGap={1} barCategoryGap="15%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--chart-grid))" vertical={false} />
                      <XAxis dataKey="category"
                        tick={{ fontSize: 11, fill: 'rgb(var(--chart-tick))' }}
                        axisLine={{ stroke: 'rgb(var(--chart-tooltip-border))' }}
                        tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--chart-tick))' }}
                        axisLine={false} tickLine={false} width={20} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgb(var(--chart-tooltip-bg))',
                          border: '1px solid rgb(var(--chart-tooltip-border))',
                          borderRadius: 0,
                          fontSize: '12px',
                          color: 'rgb(var(--chart-tooltip-text))',
                        }}
                      />
                      <Bar dataKey="wins" name="G" fill="rgb(var(--chart-bar-primary))" radius={[0, 0, 0, 0]} maxBarSize={14} />
                      <Bar dataKey="losses" name="P" fill="rgb(var(--chart-bar-secondary))" radius={[0, 0, 0, 0]} maxBarSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </motion.div>
            </div>

            {/* ============================================================
               ACHIEVEMENTS
               ============================================================ */}
            {achievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mx-4 sm:mx-6 mt-3"
              >
                <div className="p-4 border border-border bg-card">
                  <SectionHeader icon={Award} label="Logros"
                    right={`${unlockedCount}/${achievements.length}`} />
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {achievements.map((a, i) => {
                      const Icon = achievementIcons[a.icon] || Trophy
                      return (
                        <motion.div
                          key={a.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: a.unlocked ? 1 : 0.4, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.02 }}
                          title={a.desc}
                          className={cn(
                            'p-2 flex flex-col items-center gap-1 text-center border',
                            a.unlocked
                              ? 'border-border bg-card'
                              : 'border-border bg-muted'
                          )}
                        >
                          <div className="w-6 h-6 flex items-center justify-center">
                            <Icon className={cn(
                              'w-3.5 h-3.5',
                              a.unlocked ? 'text-foreground' : 'text-muted-foreground'
                            )} />
                          </div>
                          <span className={cn(
                            'text-[7px] uppercase tracking-wider leading-tight',
                            a.unlocked ? 'text-muted-foreground font-semibold' : 'text-muted-foreground'
                          )}>
                            {a.label}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ============================================================
               LEAGUE BREAKDOWN TABLE
               ============================================================ */}
            {stats.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mx-4 sm:mx-6 mt-3 mb-6"
              >
                <div className="p-4 border border-border bg-card">
                  <SectionHeader icon={MapPin} label="Desglose por Liga"
                    right={`${stats.length} registros`} />

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-foreground">
                          {['Liga', 'PJ', 'G', 'P', 'Set+', 'Set-', 'Win%', 'Rank'].map(h => (
                            <th key={h} className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stats.map((s, i) => {
                          const lWR = (s.matches_played || 0) > 0
                            ? Math.round(((s.matches_won || 0) / (s.matches_played || 1)) * 100) : 0
                          return (
                            <motion.tr
                              key={s.id || i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.45 + i * 0.02 }}
                              className={cn(
                                'border-b border-border hover:bg-muted transition-colors',
                                i % 2 === 0 ? 'bg-card' : 'bg-muted/50'
                              )}
                            >
                              <td className="py-2 px-2 font-semibold text-foreground text-xs">
                                {s.leagues?.name || 'Liga'}
                              </td>
                              <td className="py-2 px-2 font-mono tabular-nums text-muted-foreground">{s.matches_played || 0}</td>
                              <td className="py-2 px-2 font-mono tabular-nums font-bold text-foreground">{s.matches_won || 0}</td>
                              <td className="py-2 px-2 font-mono tabular-nums text-muted-foreground">{s.matches_lost || 0}</td>
                              <td className="py-2 px-2 font-mono tabular-nums text-muted-foreground hidden sm:table-cell">{s.sets_won || 0}</td>
                              <td className="py-2 px-2 font-mono tabular-nums text-muted-foreground hidden sm:table-cell">{s.sets_lost || 0}</td>
                              <td className="py-2 px-2">
                                <span className={cn(
                                  'font-mono tabular-nums font-bold',
                                  lWR >= 50 ? 'text-foreground' : 'text-muted-foreground'
                                )}>
                                  {lWR}%
                                </span>
                              </td>
                              <td className="py-2 px-2 font-mono tabular-nums text-muted-foreground">
                                {s.final_ranking ? `#${s.final_ranking}` : '—'}
                              </td>
                            </motion.tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <div className="mx-4 sm:mx-6 mb-6">
              <div className="border-t border-border pt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>PadelRush — Player Dashboard</span>
                <span className="font-mono tabular-nums">
                  {total.matches_played} partidos · {total.leagues_count} ligas
                </span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
