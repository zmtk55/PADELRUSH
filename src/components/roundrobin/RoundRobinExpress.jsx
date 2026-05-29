import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid, Trophy, ArrowRight, Swords,
  CheckCircle2, AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import RoundRobinStandings, { computeStandings } from './RoundRobinStandings'
import KnockoutBracket from './KnockoutBracket'

/**
 * RoundRobinExpress — Full Round Robin + Knockout tournament system
 *
 * Phases:
 *   1. groups    → Show standings per group, all teams play each other
 *   2. knockout  → Show elimination bracket (semis → final)
 *
 * Props:
 *   matches, teams, leagueId, isOrganizer
 *   onGenerateBracket(generatedMatches) — create bracket matches
 *   onEditMatch(match) — edit/score a match
 */

function computePlayerStats(matches, teams) {
  const stats = {}
  teams.forEach(t => {
    stats[t.id] = {
      id: t.id,
      team_id: t.id,
      team_number: t.number,
      team_name: t.name,
      name: t.name,
      pj: 0, pg: 0, pp: 0, pe: 0,
      sf: 0, sa: 0,
      gf: 0, ga: 0,
      pts: 0,
    }
  })
  matches.forEach(m => {
    const t1 = m.team1_id ? stats[m.team1_id] : null
    const t2 = m.team2_id ? stats[m.team2_id] : null
    if (!t1 || !t2) return
    t1.pj++
    t2.pj++
    const s1 = m.team1_sets ?? m.set1_team1 ?? 0
    const s2 = m.team2_sets ?? m.set1_team2 ?? 0
    t1.sf += s1; t1.sa += s2
    t2.sf += s2; t2.sa += s1
    t1.gf += s1; t1.ga += s2
    t2.gf += s2; t2.ga += s1
    if (s1 > s2) { t1.pg++; t1.pts += 1 }
    else if (s2 > s1) { t2.pg++; t2.pts += 1 }
  })
  return Object.values(stats)
}

export default function RoundRobinExpress({
  matches,
  teams,
  leagueId,
  isOrganizer,
  onGenerateBracket,
  onEditMatch,
}) {
  const [phase, setPhase] = useState('groups')

  // Group teams by their group assignment
  const groups = useMemo(() => {
    const gMap = {}
    teams.forEach(t => {
      const g = t.group || 'A'
      if (!gMap[g]) gMap[g] = []
      gMap[g].push(t)
    })
    return Object.entries(gMap).sort(([a], [b]) => a.localeCompare(b))
  }, [teams])

  // Group matches by group (or category if no group)
  const groupMatches = useMemo(() => {
    const gMap = {}
    groups.forEach(([g]) => { gMap[g] = [] })
    matches.forEach(m => {
      // Find which group this match belongs to
      const team = teams.find(t => t.id === m.team1_id || t.id === m.team2_id)
      const g = team?.group || 'A'
      if (gMap[g]) gMap[g].push(m)
    })
    return gMap
  }, [matches, teams, groups])

  // Check if all group matches are played
  const groupPhaseComplete = useMemo(() => {
    if (groups.length === 0) return false
    return groups.every(([g, gTeams]) => {
      const gMatches = groupMatches[g] || []
      const n = gTeams.length
      const totalNeeded = n < 2 ? 0 : (n * (n - 1)) / 2
      if (totalNeeded === 0) return true // 0-1 teams per group is trivially complete
      const played = gMatches.filter(m => m.status === 'jugado' || m.status === 'walkover').length
      return played >= totalNeeded
    })
  }, [groups, groupMatches])

  // Count bracket matches
  const bracketMatches = useMemo(() =>
    matches.filter(m =>
      m.round === 'semifinal-1' || m.round === 'semifinal-2' ||
      m.round === 'final' || m.round === 'tercer-lugar'
    ),
    [matches]
  )
  const hasBracket = bracketMatches.length > 0

  // Computed stats
  const totalMatches = matches.length
  const playedMatches = matches.filter(m => m.status === 'jugado').length
  const scheduledMatches = matches.filter(m => m.status === 'programado').length

  // Get winning teams per group (top 2)
  const topTeams = useMemo(() => {
    const winners = []
    groups.forEach(([g, gTeams]) => {
      const standings = computeStandings(computePlayerStats(groupMatches[g] || [], gTeams))
      standings.slice(0, 2).forEach(s => winners.push(s))
    })
    return winners
  }, [groups, groupMatches])

  // Generate bracket
  const handleGenerateBracket = () => {
    if (!onGenerateBracket) return

    const groupNames = groups.map(([g]) => g)
    const generatedMatches = []

    if (groupNames.length === 1) {
      // Single group → top 2 go to final directly
      const winners = topTeams.filter(t =>
        groups[0]?.[1]?.some(gt => gt.id === t.team_id)
      )
      if (winners.length >= 2) {
        generatedMatches.push(createMatchPlaceholder('final', winners[0], winners[1], leagueId))
      }
    } else if (groupNames.length >= 2) {
      // Two or more groups → A1 vs B2, B1 vs A2
      const groupAWinners = topTeams.filter(t =>
        groups[0]?.[1]?.some(gt => gt.id === t.team_id)
      )
      const groupBWinners = topTeams.filter(t =>
        groups[1]?.[1]?.some(gt => gt.id === t.team_id)
      )

      if (groupAWinners.length >= 2 && groupBWinners.length >= 2) {
        // SF1: 1A vs 2B
        const sf1 = createMatchPlaceholder('semifinal-1', groupAWinners[0], groupBWinners[1], leagueId)
        if (sf1) generatedMatches.push(sf1)

        // SF2: 1B vs 2A
        const sf2 = createMatchPlaceholder('semifinal-2', groupBWinners[0], groupAWinners[1], leagueId)
        if (sf2) generatedMatches.push(sf2)

        // Final placeholder
        generatedMatches.push({
          id: `final-${Date.now()}`,
          round: 'final',
          match_number: 1,
          league_id: leagueId,
          category: 'ELIMINATORIA',
          team1_id: null,
          team2_id: null,
          team1_number: null,
          team2_number: null,
          team1_name: 'Ganador SF1',
          team2_name: 'Ganador SF2',
          status: 'programado',
        })

        // Third place match
        generatedMatches.push({
          id: `tercer-${Date.now()}`,
          round: 'tercer-lugar',
          match_number: 1,
          league_id: leagueId,
          category: 'ELIMINATORIA',
          team1_id: null,
          team2_id: null,
          team1_number: null,
          team2_number: null,
          team1_name: 'Perdedor SF1',
          team2_name: 'Perdedor SF2',
          status: 'programado',
        })
      }
    }

    onGenerateBracket(generatedMatches)
    setPhase('knockout')
  }

  return (
    <div className="space-y-4">
      {/* Phase indicator */}
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          {[
            { key: 'groups', label: 'Fase de grupos', icon: LayoutGrid },
            { key: 'knockout', label: 'Eliminatorias', icon: Trophy },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setPhase(key)}
              disabled={key === 'knockout' && !hasBracket}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                phase === key
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground',
                key === 'knockout' && !hasBracket && 'opacity-40 cursor-not-allowed'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>{totalMatches} partidos</span>
          <span className="text-foreground font-medium">{playedMatches} jugados</span>
          {scheduledMatches > 0 && <span>{scheduledMatches} pendientes</span>}
        </div>
      </div>

      {/* Groups Phase */}
      <AnimatePresence mode="wait">
        {phase === 'groups' && (
          <motion.div
            key="groups"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-5"
          >
            {/* Group standings */}
            {groups.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border">
                <div className="w-14 h-14 border border-border flex items-center justify-center mx-auto mb-3">
                  <Swords className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-base font-heading font-bold mb-1 tracking-tight">Sin grupos configurados</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Asigna los equipos a grupos en la sección Admin para activar el Round Robin
                </p>
              </div>
            ) : (
              groups.map(([g, gTeams]) => (
                <RoundRobinStandings
                  key={g}
                  players={computePlayerStats(groupMatches[g] || [], gTeams)}
                  groupLabel={g}
                  qualifyingSpots={2}
                />
              ))
            )}

            {/* Group complete → Advance to knockout */}
            {groupPhaseComplete && isOrganizer && !hasBracket && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-2 border-foreground bg-card p-5 text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-foreground" />
                  <p className="font-heading font-bold text-lg tracking-tight">
                    Fase de grupos completada
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Todos los partidos de grupo han sido jugados. Genera el cuadro eliminatorio.
                </p>
                <Button onClick={handleGenerateBracket} size="lg">
                  <Trophy className="w-5 h-5" />
                  Generar eliminatorias
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Not yet complete */}
            {!groupPhaseComplete && groups.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground border border-dashed border-border px-4 py-3">
                <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                <span>
                  Juega todos los partidos de grupo para avanzar a la fase eliminatoria
                </span>
                {playedMatches > 0 && (
                  <span className="font-medium text-muted-foreground ml-auto">
                    {playedMatches}/{groups.reduce((sum, [g]) =>
                      sum + (groupMatches[g]?.length || 0), 0
                    )} jugados
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Knockout Phase */}
        {phase === 'knockout' && (
          <motion.div
            key="knockout"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <KnockoutBracket
              matches={bracketMatches}
              teams={teams}
              isOrganizer={isOrganizer}
              onEditMatch={onEditMatch}
              onCreateBracket={!hasBracket ? handleGenerateBracket : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function createMatchPlaceholder(round, team1, team2, leagueId) {
  if (!team1 || !team2) return null
  return {
    id: `${round}-${Date.now()}-${team1.team_id}-${team2.team_id}`,
    round,
    match_number: round.includes('1') ? 1 : 2,
    league_id: leagueId,
    category: 'ELIMINATORIA',
    team1_id: team1.team_id,
    team2_id: team2.team_id,
    team1_number: team1.team_number,
    team2_number: team2.team_number,
    team1_name: team1.team_name,
    team2_name: team2.team_name,
    status: 'programado',
  }
}
