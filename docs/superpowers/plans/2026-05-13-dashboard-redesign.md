# Dashboard Redesign Implementation Plan

> **For agentic workers:** Implement sequentially. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform dashboard into professional command center with charts, upcoming matches, top players, activity feed

**Architecture:** 6 new dashboard components in `src/components/dashboard/`, 1 new hook `useDashboard.js`, replace `src/pages/Dashboard.jsx`. Uses fetch() nativo para reads (timeout 8s) por restricción de supabase-js.

**Tech Stack:** React 18, Tailwind 3, shadcn/ui, recharts, framer-motion, lucide-react, @tanstack/react-query

---

### Task 1: DashboardHeader component

**Files:**
- Create: `src/components/dashboard/DashboardHeader.jsx`

- [ ] **Create DashboardHeader**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ChevronDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

function formatDate() {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function DashboardHeader({ leagues, selectedLeagueId, onLeagueChange }) {
  const navigate = useNavigate()
  const { user, isOrganizer } = useAuth()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">
          {getGreeting()}, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'usuario'}
        </h1>
        <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-1">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate()}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {leagues.length > 0 && (
          <Select value={selectedLeagueId || ''} onValueChange={onLeagueChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas las ligas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ligas</SelectItem>
              {leagues.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {isOrganizer && (
          <Button onClick={() => navigate('/ligas/nueva')}>
            <Plus className="w-4 h-4" />
            Nueva Liga
          </Button>
        )}
      </div>
    </div>
  )
}
```

---

### Task 2: StatCard component

**Files:**
- Create: `src/components/dashboard/StatCard.jsx`

- [ ] **Create StatCard**

```jsx
import { motion } from 'framer-motion'

export default function StatCard({ label, value, icon: Icon, color, trend, trendValue, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:shadow-black/5 transition-shadow"
    >
      <div className={`p-2 rounded-lg bg-background w-fit ${color} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-heading font-bold">{value}</p>
      <div className="flex items-center gap-1.5">
        <p className="text-sm text-muted-foreground">{label}</p>
        {trend && (
          <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
      <div className="w-9 h-9 rounded-lg bg-muted mb-3" />
      <div className="h-6 w-14 bg-muted rounded mb-1" />
      <div className="h-3 w-20 bg-muted rounded" />
    </div>
  )
}
```

---

### Task 3: MatchesChart component

**Files:**
- Create: `src/components/dashboard/MatchesChart.jsx`

- [ ] **Create MatchesChart**

```jsx
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

export default function MatchesChart({ data = [] }) {
  const [period, setPeriod] = useState('day')

  const isEmpty = data.length === 0

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
          <BarChart width={200} height={100} data={[{ name: '', value: 0 }]} className="opacity-20">
            <Bar dataKey="value" fill="currentColor" />
          </BarChart>
          <p className="text-sm mt-4">Aún no hay partidos registrados</p>
        </div>
      ) : (
        <div className="w-full aspect-[21/9] max-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
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
```

---

### Task 4: UpcomingMatches component

**Files:**
- Create: `src/components/dashboard/UpcomingMatches.jsx`

- [ ] **Create UpcomingMatches**

```jsx
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function timeAgo(dateStr) {
  const diff = new Date(dateStr) - new Date()
  if (diff < 0) return 'Ya comenzó'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 0) return `En ${days} día${days > 1 ? 's' : ''}`
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours > 0) return `En ${hours}h`
  const mins = Math.floor(diff / (1000 * 60))
  return `En ${mins}min`
}

export default function UpcomingMatches({ matches = [], leagueId }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-semibold text-lg">Próximos partidos</h2>
        {leagueId && (
          <button
            onClick={() => navigate(`/ligas/${leagueId}/partidos`)}
            className="text-xs text-primary hover:underline"
          >
            Ver todos
          </button>
        )}
      </div>
      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Calendar className="w-10 h-10 mb-2 opacity-40" />
          <p className="text-sm">No hay partidos programados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.slice(0, 5).map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {m.team1_name || 'Equipo 1'} vs {m.team2_name || 'Equipo 2'}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(m.scheduled_at || m.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {m.location || '—'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-medium text-primary whitespace-nowrap">
                {new Date(m.scheduled_at || m.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
```

---

### Task 5: TopPlayers component

**Files:**
- Create: `src/components/dashboard/TopPlayers.jsx`

- [ ] **Create TopPlayers**

```jsx
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Medal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const rankColors = ['text-amber-500', 'text-gray-400', 'text-amber-700']

export default function TopPlayers({ players = [], leagueId }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-semibold text-lg">Top jugadores</h2>
        {leagueId && (
          <button
            onClick={() => navigate(`/ligas/${leagueId}/standings`)}
            className="text-xs text-primary hover:underline"
          >
            Clasificación
          </button>
        )}
      </div>
      {players.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Medal className="w-10 h-10 mb-2 opacity-40" />
          <p className="text-sm">Sin datos de jugadores aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {players.slice(0, 5).map((p, i) => (
            <div
              key={p.id || i}
              onClick={() => navigate(`/jugadores/${p.name}`)}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <span className={`w-6 text-center text-sm font-bold ${rankColors[i] || 'text-muted-foreground'}`}>
                {i + 1}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                {p.name ? p.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name || 'Jugador'}</p>
                <p className="text-xs text-muted-foreground">{p.puntos || 0} pts</p>
              </div>
              {p.trend && (
                p.trend === 'up'
                  ? <TrendingUp className="w-4 h-4 text-emerald-500" />
                  : <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
```

---

### Task 6: ActivityFeed component

**Files:**
- Create: `src/components/dashboard/ActivityFeed.jsx`

- [ ] **Create ActivityFeed**

```jsx
import { motion } from 'framer-motion'
import { Trophy, Users, Swords, UserPlus, Clock } from 'lucide-react'

const activityIcons = {
  league_created: Trophy,
  match_played: Swords,
  participant_added: UserPlus,
  team_formed: Users,
}

const activityColors = {
  league_created: 'text-primary',
  match_played: 'text-emerald-500',
  participant_added: 'text-blue-500',
  team_formed: 'text-amber-500',
}

function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000)
  if (seconds < 60) return 'Ahora'
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `Hace ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days}d`
}

export default function ActivityFeed({ activities = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <h2 className="font-heading font-semibold text-lg mb-4">Actividad reciente</h2>
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Clock className="w-10 h-10 mb-2 opacity-40" />
          <p className="text-sm">Sin actividad reciente</p>
        </div>
      ) : (
        <div className="space-y-0 max-h-[320px] overflow-y-auto pr-2">
          {activities.slice(0, 8).map((a, i) => {
            const Icon = activityIcons[a.type] || Clock
            const color = activityColors[a.type] || 'text-muted-foreground'
            return (
              <div key={a.id || i} className="flex gap-3 py-3 border-b border-border last:border-0">
                <div className={`p-1.5 rounded-lg bg-background ${color} shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(a.created_at)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
```

---

### Task 7: useDashboard hook

**Files:**
- Create: `src/hooks/useDashboard.js`

- [ ] **Create useDashboard**

```js
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function fetchFrom(path, signal) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    signal,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function groupByDate(matches) {
  const groups = {}
  matches.forEach((m) => {
    const date = m.played_at?.split('T')[0] || m.date
    groups[date] = (groups[date] || 0) + 1
  })
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([name, value]) => ({ name: name.slice(5), value }))
}

function groupByWeek(matches) {
  const groups = {}
  matches.forEach((m) => {
    const d = new Date(m.played_at || m.date)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = weekStart.toISOString().slice(0, 10)
    groups[key] = (groups[key] || 0) + 1
  })
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([name, value]) => ({ name: `Sem ${name.slice(5)}`, value }))
}

export function useDashboardData(leagueId) {
  const filter = leagueId && leagueId !== 'all' ? `&league_id=eq.${leagueId}` : ''

  const statsQuery = useQuery({
    queryKey: ['dashboard-stats', leagueId],
    queryFn: async ({ signal }) => {
      const [leagues, participants, matches] = await Promise.all([
        fetchFrom(`leagues?select=id,status,categories${filter}&limit=100`, signal),
        fetchFrom(`participants?select=id${filter}&limit=1000`, signal),
        fetchFrom(`matches?select=id,status,played_at,date${filter}&limit=500`, signal),
      ])
      const activas = leagues.filter((l) => l.status === 'activa').length
      const jugados = matches.filter((m) => m.status === 'jugado').length
      return {
        totalLeagues: leagues.length,
        activas,
        participantes: participants.length,
        partidosJugados: jugados,
      }
    },
    staleTime: 30_000,
  })

  const chartQuery = useQuery({
    queryKey: ['dashboard-chart', leagueId],
    queryFn: async ({ signal }) => {
      const matches = await fetchFrom(`matches?select=id,status,played_at,date,league_id${filter}&status=eq.jugado&limit=500`, signal)
      return { byDay: groupByDate(matches), byWeek: groupByWeek(matches) }
    },
    staleTime: 30_000,
  })

  const upcomingQuery = useQuery({
    queryKey: ['dashboard-upcoming', leagueId],
    queryFn: async ({ signal }) => {
      const now = new Date().toISOString()
      return fetchFrom(`matches?select=*,team1:team1_id(name),team2:team2_id(name)&status=eq.pendiente&order=scheduled_at.asc&limit=5${filter}`, signal)
    },
    staleTime: 15_000,
  })

  const topPlayersQuery = useQuery({
    queryKey: ['dashboard-top-players', leagueId],
    queryFn: async ({ signal }) => {
      const stats = await fetchFrom(`player_stats?select=*,participant:participant_id(name)&order=puntos.desc&limit=5${filter}`, signal)
      return stats.map((s) => ({
        id: s.id,
        name: s.participant?.name || 'Jugador',
        puntos: s.puntos || 0,
        trend: s.partidos_jugados > 3 ? (s.puntos > 10 ? 'up' : 'down') : null,
      }))
    },
    staleTime: 30_000,
  })

  const activityQuery = useQuery({
    queryKey: ['dashboard-activity', leagueId],
    queryFn: async ({ signal }) => {
      return fetchFrom(`leagues?select=id,name,created_at,status&order=created_at.desc&limit=8${filter.replace('league_id', 'id')}`, signal)
        .then((leagues) =>
          leagues.map((l) => ({
            id: `league-${l.id}`,
            type: 'league_created',
            message: `Liga "${l.name}" creada`,
            created_at: l.created_at,
          }))
        )
    },
    staleTime: 30_000,
  })

  return {
    stats: statsQuery.data || { totalLeagues: 0, activas: 0, participantes: 0, partidosJugados: 0 },
    chartData: chartQuery.data || { byDay: [], byWeek: [] },
    upcomingMatches: upcomingQuery.data || [],
    topPlayers: topPlayersQuery.data || [],
    activities: activityQuery.data || [],
    isLoading: statsQuery.isLoading || chartQuery.isLoading || upcomingQuery.isLoading || topPlayersQuery.isLoading || activityQuery.isLoading,
    isError: statsQuery.isError || chartQuery.isError || upcomingQuery.isError || topPlayersQuery.isError || activityQuery.isError,
    refetchAll: () => {
      statsQuery.refetch()
      chartQuery.refetch()
      upcomingQuery.refetch()
      topPlayersQuery.refetch()
      activityQuery.refetch()
    },
  }
}
```

---

### Task 8: Rewrite Dashboard page

**Files:**
- Modify: `src/pages/Dashboard.jsx` (replace entire file)

- [ ] **Rewrite Dashboard.jsx**

```jsx
import { useState } from 'react'
import { Trophy, Users, Calendar, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatCard, { StatCardSkeleton } from '@/components/dashboard/StatCard'
import MatchesChart from '@/components/dashboard/MatchesChart'
import UpcomingMatches from '@/components/dashboard/UpcomingMatches'
import TopPlayers from '@/components/dashboard/TopPlayers'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import { useDashboardData } from '@/hooks/useDashboard'
import { useLeagues } from '@/hooks/useLeagues'

export default function Dashboard() {
  const { leaguesQuery } = useLeagues()
  const leagues = leaguesQuery.data || []
  const [selectedLeagueId, setSelectedLeagueId] = useState('all')
  const { stats, chartData, upcomingMatches, topPlayers, activities, isLoading, isError, refetchAll } =
    useDashboardData(selectedLeagueId)

  const statCards = [
    { label: 'Ligas activas', icon: Trophy, color: 'text-primary', value: stats.activas },
    { label: 'Participantes', icon: Users, color: 'text-blue-500', value: stats.participantes },
    { label: 'Partidos jugados', icon: Calendar, color: 'text-emerald-500', value: stats.partidosJugados },
    { label: 'Total ligas', icon: TrendingUp, color: 'text-amber-500', value: stats.totalLeagues },
  ]

  return (
    <div>
      <DashboardHeader
        leagues={leagues}
        selectedLeagueId={selectedLeagueId}
        onLeagueChange={setSelectedLeagueId}
      />

      {isError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-sm"
        >
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-red-600 dark:text-red-400">Error al cargar datos</p>
          <button
            onClick={refetchAll}
            className="ml-auto flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reintentar
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading
          ? [1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)
          : statCards.map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 0.05} />
            ))
        }
      </div>

      <div className="space-y-6">
        <MatchesChart data={chartData} />

        <div className="grid lg:grid-cols-2 gap-6">
          <UpcomingMatches matches={upcomingMatches} leagueId={selectedLeagueId !== 'all' ? selectedLeagueId : null} />
          <TopPlayers players={topPlayers} leagueId={selectedLeagueId !== 'all' ? selectedLeagueId : null} />
        </div>

        <ActivityFeed activities={activities} />
      </div>
    </div>
  )
}
```

- [ ] **Verify build**

Run: `npm run build`
Expected: Build succeeds without errors
