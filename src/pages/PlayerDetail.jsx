import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, TrendingUp, Activity, Target, Zap, Calendar, Award, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParticipants } from '@/hooks/useParticipants'
import { supabase } from '@/lib/supabaseClient'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'

export default function PlayerDetail() {
  const { playerName } = useParams()
  const navigate = useNavigate()
  const decodedName = decodeURIComponent(playerName)
  const { participantsQuery } = useParticipants()
  const [selectedLeague, setSelectedLeague] = useState('all')

  const { data: allStats = [] } = useQuery({
    queryKey: ['player-stats-by-name', decodedName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .ilike('player_name', decodedName)
      if (error) return []
      return data
    },
  })

  const { data: allLeagues = [] } = useQuery({
    queryKey: ['leagues-for-player', decodedName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_stats')
        .select('league_id, league_name')
        .ilike('player_name', decodedName)
      if (error) return []
      return [...new Map(data.map((d) => [d.league_id, { id: d.league_id, name: d.league_name }])).values()]
    },
  })

  const participant = (participantsQuery.data || []).find(
    (p) => p.name.toLowerCase() === decodedName.toLowerCase()
  )

  const filteredStats = selectedLeague === 'all'
    ? allStats
    : allStats.filter((s) => s.league_id === selectedLeague)

  const totalStats = filteredStats.reduce(
    (acc, s) => ({
      matches_played: acc.matches_played + s.matches_played,
      matches_won: acc.matches_won + s.matches_won,
      matches_lost: acc.matches_lost + s.matches_lost,
      sets_won: acc.sets_won + s.sets_won,
      sets_lost: acc.sets_lost + s.sets_lost,
      games_won: acc.games_won + s.games_won,
      games_lost: acc.games_lost + s.games_lost,
    }),
    { matches_played: 0, matches_won: 0, matches_lost: 0, sets_won: 0, sets_lost: 0, games_won: 0, games_lost: 0 }
  )

  const winRate = totalStats.matches_played > 0
    ? Math.round((totalStats.matches_won / totalStats.matches_played) * 100)
    : 0

  const setsDiff = totalStats.sets_won - totalStats.sets_lost
  const gamesDiff = totalStats.games_won - totalStats.games_lost

  const radarData = [
    { stat: 'Victorias', value: Math.min(totalStats.matches_won * 5, 100) },
    { stat: 'Sets ganados', value: Math.min(totalStats.sets_won * 3, 100) },
    { stat: 'Juegos', value: Math.min(totalStats.games_won * 2, 100) },
    { stat: '% Victoria', value: winRate },
    { stat: 'Sets dif', value: Math.min(Math.max(setsDiff * 10 + 50, 0), 100) },
  ]

  const barData = [
    { name: 'PG', value: totalStats.matches_won, fill: '#22c55e' },
    { name: 'PP', value: totalStats.matches_lost, fill: '#ef4444' },
    { name: 'SG', value: totalStats.sets_won, fill: '#3b82f6' },
    { name: 'SP', value: totalStats.sets_lost, fill: '#f97316' },
    { name: 'JG', value: totalStats.games_won, fill: '#8b5cf6' },
    { name: 'JP', value: totalStats.games_lost, fill: '#ec4899' },
  ]

  const leagueBarData = filteredStats.map((s) => ({
    name: s.league_name?.substring(0, 12) || '—',
    '%': Math.round(s.win_percentage),
    PJ: s.matches_played,
  }))

  const hasStats = totalStats.matches_played > 0

  const levelColors = {
    '3RA': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    '4TA': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    '5TA': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    '6TA': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate('/participantes')} className="mb-4">
        <ArrowLeft className="w-4 h-4" />
        Volver a jugadores
      </Button>

      {/* ── Player Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6 mb-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <motion.div
            className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-border shrink-0"
            whileHover={{ scale: 1.05 }}
          >
            {participant?.photo_url ? (
              <img src={participant.photo_url} alt={decodedName} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-2xl font-bold font-heading"
                style={{ background: 'linear-gradient(135deg, var(--primary), hsl(var(--primary) / 0.5))' }}
              >
                {decodedName.charAt(0).toUpperCase()}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-heading font-bold">{decodedName}</h1>
              {participant?.level && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${levelColors[participant.level] || ''}`}>
                  {participant.level}
                </span>
              )}
              {participant?.gender && (
                <span className="text-xs text-muted-foreground">
                  {participant.gender === 'varonil' ? '♂ Varonil' : '♀ Femenil'}
                </span>
              )}
            </div>
            {participant?.phone && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.854.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {participant.phone}
              </p>
            )}
          </div>

          {/* Win Rate Ring */}
          {hasStats && (
            <motion.div
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-heading font-bold"
                style={{
                  background: `conic-gradient(
                    ${winRate >= 50 ? 'var(--primary)' : 'var(--destructive)'} ${winRate}%,
                    var(--muted) ${winRate}%
                  )`,
                }}
              >
                <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center">
                  <span className={winRate >= 50 ? 'text-primary' : 'text-destructive'}>{winRate}%</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">Win Rate</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── Stats Overview ── */}
      {hasStats ? (
        <>
          {/* Stat cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6"
          >
            {[
              { label: 'Partidos', value: totalStats.matches_played, icon: <Calendar className="w-4 h-4" />, color: 'text-blue-500' },
              { label: 'Victorias', value: totalStats.matches_won, icon: <Trophy className="w-4 h-4" />, color: 'text-emerald-500' },
              { label: 'Derrotas', value: totalStats.matches_lost, icon: <ArrowLeft className="w-4 h-4" />, color: 'text-red-500' },
              { label: 'Sets dif', value: (setsDiff >= 0 ? '+' : '') + setsDiff, icon: <TrendingUp className="w-4 h-4" />, color: setsDiff >= 0 ? 'text-primary' : 'text-destructive' },
              { label: 'Juegos dif', value: (gamesDiff >= 0 ? '+' : '') + gamesDiff, icon: <Activity className="w-4 h-4" />, color: gamesDiff >= 0 ? 'text-blue-500' : 'text-destructive' },
              { label: 'Win %', value: winRate + '%', icon: <Target className="w-4 h-4" />, color: 'text-amber-500' },
            ].map(({ label, value, icon, color }, i) => (
              <motion.div
                key={label}
                className="bg-card border border-border rounded-xl p-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                whileHover={{ y: -2, boxShadow: '0 4px 12px -2px rgba(0,0,0,0.1)' }}
              >
                <div className={`${color} flex justify-center mb-2`}>{icon}</div>
                <p className="text-xl font-heading font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* League filter */}
          {allLeagues.length > 1 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setSelectedLeague('all')}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  selectedLeague === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                Todas ({allStats.length})
              </button>
              {allLeagues.map((l) => {
                const count = allStats.filter((s) => s.league_id === l.id).length
                return (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLeague(l.id)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                      selectedLeague === l.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70'
                    }`}
                  >
                    {l.name} ({count})
                  </button>
                )
              })}
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Radar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Perfil de rendimiento
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="stat" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Jugador" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Victorias vs Derrotas
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <rect key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* League comparison bar */}
          {leagueBarData.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-6 mb-6"
            >
              <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Rendimiento por liga
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={leagueBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="%" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-border rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Activity className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading font-semibold text-lg mb-2">Sin estadísticas</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {decodedName} aún no tiene partidos registrados. Las estadísticas aparecerán aquí cuando se jueguen partidos.
          </p>
        </motion.div>
      )}
    </div>
  )
}