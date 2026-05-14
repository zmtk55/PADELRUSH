import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Trophy, TrendingUp, Activity, Target,
  Swords, CheckCircle2, XCircle, User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useParticipants } from '@/hooks/useParticipants'
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient'

async function fetchFrom(path, signal) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
    signal,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export default function PlayerDetail() {
  const { playerName } = useParams()
  const navigate = useNavigate()
  const decodedName = decodeURIComponent(playerName)
  const { participantsQuery } = useParticipants()

  const participant = (participantsQuery.data || []).find(
    (p) => p.name.toLowerCase() === decodedName.toLowerCase()
  )
  const participantId = participant?.id

  const { data: allStats = [] } = useQuery({
    queryKey: ['player-stats-by-name', decodedName],
    queryFn: async ({ signal }) => {
      return fetchFrom(`player_stats?select=*&player_name=ilike.${encodeURIComponent(decodedName)}`, signal)
    },
  })

  const { data: teamsData = [] } = useQuery({
    queryKey: ['teams-for-player', participantId],
    queryFn: async ({ signal }) => {
      if (!participantId) return []
      const [t1, t2] = await Promise.all([
        fetchFrom(`teams?select=*&player1_id=eq.${participantId}`, signal),
        fetchFrom(`teams?select=*&player2_id=eq.${participantId}`, signal),
      ])
      const teams = [...t1, ...t2]
      const leagueIds = [...new Set(teams.map((t) => t.league_id).filter(Boolean))]
      let leaguesMap = {}
      if (leagueIds.length > 0) {
        const leagues = await fetchFrom(`leagues?select=id,name&id=in.(${leagueIds.join(',')})`, signal)
        leagues.forEach((l) => { leaguesMap[l.id] = l })
      }
      return teams.map((t) => ({ ...t, leagueObj: leaguesMap[t.league_id] }))
    },
    enabled: !!participantId,
  })

  const { data: matchesData = [] } = useQuery({
    queryKey: ['matches-for-player-teams', teamsData.map((t) => t.id).join(',')],
    queryFn: async ({ signal }) => {
      const ids = teamsData.map((t) => t.id)
      if (ids.length === 0) return []
      const [m1, m2] = await Promise.all([
        fetchFrom(`matches?select=*&team1_id=in.(${ids.join(',')})`, signal),
        fetchFrom(`matches?select=*&team2_id=in.(${ids.join(',')})`, signal),
      ])
      const all = [...m1, ...m2]
      const seen = new Set()
      return all.filter((m) => {
        if (seen.has(m.id)) return false
        seen.add(m.id)
        return true
      })
    },
    enabled: teamsData.length > 0,
  })

  const totalStats = allStats.reduce(
    (acc, s) => ({
      matches_played: acc.matches_played + (s.matches_played || 0),
      matches_won: acc.matches_won + (s.matches_won || 0),
      matches_lost: acc.matches_lost + (s.matches_lost || 0),
      sets_won: acc.sets_won + (s.sets_won || 0),
      sets_lost: acc.sets_lost + (s.sets_lost || 0),
    }),
    { matches_played: 0, matches_won: 0, matches_lost: 0, sets_won: 0, sets_lost: 0 }
  )

  const played = matchesData.filter((m) => m.winner_team_number)
  const pending = matchesData.filter((m) => !m.winner_team_number && m.status !== 'cancelado')

  const playerWonFromMatches = played.filter((m) => {
    const playerTeam = teamsData.find((t) => t.id === m.team1_id || t.id === m.team2_id)
    return playerTeam && m.winner_team_number === playerTeam.team_number
  }).length

  const winPct = totalStats.matches_played > 0
    ? ((totalStats.matches_won / totalStats.matches_played) * 100).toFixed(1)
    : played.length > 0
    ? ((playerWonFromMatches / played.length) * 100).toFixed(1)
    : '0'
  const pctColor = parseFloat(winPct) >= 70
    ? 'text-primary'
    : parseFloat(winPct) >= 40
    ? 'text-amber-400'
    : 'text-red-400'
  const initials = decodedName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  const levelColors = {
    '3RA': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    '4TA': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    '5TA': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    '6TA': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  }

  const hasStats = totalStats.matches_played > 0 || played.length > 0

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate('/jugadores')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="font-heading font-bold text-lg">Jugador</h1>
          <p className="text-xs text-muted-foreground">clic para ver historial</p>
        </div>
      </div>

      {/* ── Player Card Header ── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Banner */}
        <div className="relative h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent">
          <div className="absolute inset-0 bg-gradient-to-r from-card/80 to-transparent" />
        </div>
        <div className="px-5 pb-5 -mt-10 relative">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="shrink-0">
              {participant?.photo_url ? (
                <img
                  src={participant.photo_url}
                  alt={decodedName}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-card shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-heading font-black text-3xl border-4 border-card shadow-xl">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="text-2xl font-heading font-black uppercase tracking-wide leading-tight">
                {decodedName}
              </h2>
              <div className="flex gap-2 mt-1 flex-wrap">
                {participant?.level && (
                  <Badge className={`${levelColors[participant.level] || levelColors['5TA']} font-heading text-xs`}>
                    {participant.level}
                  </Badge>
                )}
                {participant?.gender && (
                  <Badge variant="outline" className="font-heading text-xs">
                    {participant.gender === 'varonil' ? '♂ Varonil' : '♀ Femenil'}
                  </Badge>
                )}
              </div>
              <button
                onClick={() => navigate('/jugadores')}
                className="text-xs text-muted-foreground hover:text-primary mt-1.5 transition-colors"
              >
                ← Volver a jugadores
              </button>
            </div>
            <div className="text-right pb-1">
              <p className={`text-5xl font-heading font-black leading-none ${pctColor}`}>
                {winPct}%
              </p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">% Victoria</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { icon: Swords, label: 'Jugados', value: totalStats.matches_played || played.length, color: 'text-foreground', bg: 'bg-secondary' },
              { icon: Trophy, label: 'Ganados', value: totalStats.matches_won || playerWonFromMatches, color: 'text-primary', bg: 'bg-primary/10' },
              { icon: XCircle, label: 'Perdidos', value: totalStats.matches_lost || (played.length - playerWonFromMatches), color: 'text-red-400', bg: 'bg-red-500/10' },
              { icon: Target, label: 'Pendientes', value: pending.length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
                <s.icon className={`w-4 h-4 mx-auto mb-1.5 ${s.color}`} />
                <p className={`text-2xl font-heading font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wide mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {hasStats && (
            <div className="mt-4">
              <div className="flex justify-between text-[10px] font-body text-muted-foreground mb-1.5">
                <span className="uppercase tracking-wide">Rendimiento global</span>
                <span className={`font-heading font-bold ${pctColor}`}>{winPct}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${winPct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Equipos ── */}
      {teamsData.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-heading font-black text-sm uppercase tracking-wide flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-primary" />
            Equipos
          </h3>
          <div className="space-y-2">
            {teamsData.map((team) => {
              const partner = team.player1_name === decodedName ? team.player2_name : team.player1_name
              const stats = allStats.find(
                (s) => s.category === team.category && s.partner_name === partner
              )
              return (
                <div
                  key={team.id}
                  className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary/15 text-primary border-primary/25 font-heading text-xs">
                      {team.category}
                    </Badge>
                    <div>
                      <p className="text-sm font-body font-medium">con {partner || '—'}</p>
                      {team.leagueObj?.name && (
                        <p className="text-[10px] text-muted-foreground font-body">{team.leagueObj.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-black text-sm text-primary">
                      {stats?.win_percentage || 0}%
                    </p>
                    <p className="text-[10px] text-muted-foreground font-body">
                      {stats?.matches_won || 0}G / {stats?.matches_played || 0}J
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Historial de Partidos ── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-black text-sm uppercase tracking-wide">
            Historial ({played.length} partidos)
          </h3>
        </div>
        <div className="divide-y divide-border max-h-96 overflow-y-auto">
          {played.length === 0 && (
            <p className="text-center text-muted-foreground font-body py-8 text-sm">
              Sin partidos jugados
            </p>
          )}
          {played.map((m) => {
            const playerTeam = teamsData.find((t) => t.id === m.team1_id || t.id === m.team2_id)
            const won = playerTeam && m.winner_team_number === playerTeam.team_number
            const isT1 = playerTeam && m.team1_id === playerTeam.id
            const oppName = isT1
              ? m.team2_name || `Equipo ${m.team2_number}`
              : m.team1_name || `Equipo ${m.team1_number}`

            const sets = [
              isT1 ? { t1: m.set1_team1, t2: m.set1_team2 } : { t1: m.set1_team2, t2: m.set1_team1 },
              isT1 && m.set2_team1 != null ? { t1: m.set2_team1, t2: m.set2_team2 } : !isT1 && m.set2_team1 != null ? { t1: m.set2_team2, t2: m.set2_team1 } : null,
              isT1 && m.set3_team1 != null ? { t1: m.set3_team1, t2: m.set3_team2 } : !isT1 && m.set3_team1 != null ? { t1: m.set3_team2, t2: m.set3_team1 } : null,
            ].filter(Boolean)

            return (
              <div
                key={m.id}
                className={`px-5 py-3 flex items-center gap-3 ${won ? 'bg-primary/5' : 'bg-red-500/5'}`}
              >
                {won ? (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium truncate">vs {oppName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                      {m.category}
                    </Badge>
                    {m.match_number && (
                      <span className="text-[10px] text-muted-foreground font-body">#{m.match_number}</span>
                    )}
                    {m.court && (
                      <span className="text-[10px] text-muted-foreground font-body">· {m.court}</span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right text-xs font-heading font-black space-y-0.5">
                  {sets.map((s, i) => (
                    <div key={i} className={won ? 'text-primary' : 'text-muted-foreground'}>
                      {s.t1}-{s.t2}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Empty state ── */}
      {!hasStats && played.length === 0 && teamsData.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-10 h-10 text-primary/40" />
          </div>
          <p className="text-foreground font-heading font-black text-lg uppercase tracking-wide">
            Sin estadísticas
          </p>
          <p className="text-muted-foreground font-body text-sm mt-1">
            {decodedName} aún no tiene partidos registrados
          </p>
        </div>
      )}
    </div>
  )
}