import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Settings, Users, Calendar, Medal, Swords,
  Trash2, RefreshCw, ChevronRight, ChevronLeft,
  CheckCircle2, UserPlus, LayoutGrid, Sparkles,
  Zap, Star, PartyPopper,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import RoundRobinStandings, { computeStandings } from '@/components/roundrobin/RoundRobinStandings'
import KnockoutBracket from '@/components/roundrobin/KnockoutBracket'
import { cn } from '@/lib/utils'
function ScoreCell({ value, onChange, isWinner }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const ref = useRef(null);
  useEffect(() => { setDraft(String(value)) }, [value]);
  useEffect(() => {
    if (editing && ref.current) { ref.current.focus(); ref.current.select(); }
  }, [editing]);
  const commit = () => {
    setEditing(false);
    const p = parseInt(draft, 10);
    const cl = isNaN(p) ? 0 : Math.min(99, Math.max(0, p));
    if (cl !== value) onChange(cl);
    setDraft(String(cl));
  };
  return editing ? (
    <input
      ref={ref}
      type="number" min="0" max="99"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(String(value)); setEditing(false); }}}
      className="w-full h-full min-w-[40px] bg-background text-center text-xl sm:text-2xl font-bold tabular-nums outline-none ring-2 ring-foreground/30  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  ) : (
    <button
      onClick={() => setEditing(true)}
      className={cn(
        'w-full h-full min-w-[40px] flex items-center justify-center text-xl sm:text-2xl font-bold tabular-nums transition-all cursor-text ',
        isWinner
          ? 'bg-court text-primary-foreground shadow-sm'
          : value > 0
            ? 'bg-muted text-foreground hover:bg-muted/80'
            : 'bg-muted/30 text-muted-foreground/40 hover:bg-muted/50'
      )}
    >{value}</button>
  );
}

/* ─────────────────────────────────────────────
   Persistence
   ───────────────────────────────────────────── */

const STORAGE_KEY = 'padelrush-express-tournament'

function saveTournament(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    // localStorage full or unavailable — silently ignore
  }
}

function loadTournament() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!Array.isArray(data?.players)) return null
    return data
  } catch {
    return null
  }
}

function clearSavedTournament() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}

/* ─────────────────────────────────────────────
   Round‑Robin (circle method, every player vs everyone)
   ───────────────────────────────────────────── */

let playerIdCounter = 0
const newId = () => `p_${Date.now()}_${++playerIdCounter}`
const matchId = () => `m_${Date.now()}_${++playerIdCounter}`

function createPlayer(name) {
  return {
    id: newId(),
    name: name.trim(),
    pj: 0, pg: 0, pe: 0, pp: 0,
    sf: 0, sa: 0,
    gf: 0, ga: 0,
    pts: 0,
  }
}

function generateRounds(players, courts, pointsPerWin) {
  const n = players.length
  if (n < 4) return []

  const fixed = { ...players[0] }
  const rotating = players.slice(1).map(p => ({ ...p }))
  const numRounds = n - 1 // full round-robin: each player partners everyone once
  const rounds = []

  for (let r = 0; r < numRounds; r++) {
    // Build arrangement: [fixed, ...rotating]
    const arrangement = [fixed, ...rotating]
    const matches = []

    for (let i = 0; i + 3 < n && matches.length < courts; i += 4) {
      matches.push({
        id: matchId(),
        court: matches.length + 1,
        pairA: [{ ...arrangement[i] }, { ...arrangement[i + 1] }],
        pairB: [{ ...arrangement[i + 2] }, { ...arrangement[i + 3] }],
        winner: null,
        score: null,
        played: false,
      })
    }

    rounds.push({ number: r + 1, matches })

    // Rotate: move last rotating element to front (circle method)
    if (rotating.length > 1) {
      rotating.unshift(rotating.pop())
    }
  }

  return rounds
}

/* ─────────────────────────────────────────────
   Steps
   ───────────────────────────────────────────── */

const STEPS = [
  { id: 'config', label: 'Config', icon: Settings, desc: 'Nombre y canchas' },
  { id: 'players', label: 'Jugadores', icon: Users, desc: 'Participantes' },
  { id: 'rounds', label: 'Jornadas', icon: Calendar, desc: 'Fase de grupos' },
  { id: 'standings', label: 'Final', icon: Medal, desc: 'Clasificación' },
  { id: 'knockout', label: 'Eliminatorias', icon: Trophy, desc: 'Campeón' },
]

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */

export default function Express() {
  // Try to restore saved tournament on mount
  const saved = useMemo(() => loadTournament(), [])

  const [step, setStep] = useState(saved?.step ?? 0)

  // Config
  const [tournamentName, setTournamentName] = useState(saved?.tournamentName ?? '')
  const [courts, setCourts] = useState(saved?.courts ?? 2)
  const [pointsPerWin, setPointsPerWin] = useState(saved?.pointsPerWin ?? 1)

  // Players
  const [players, setPlayers] = useState(saved?.players ?? [])
  const [newPlayerName, setNewPlayerName] = useState('')

  // Rounds
  const [rounds, setRounds] = useState(saved?.rounds ?? [])

  // Knockout
  const [knockout, setKnockout] = useState(saved?.knockout ?? null)
  const [tournamentComplete, setTournamentComplete] = useState(saved?.tournamentComplete ?? false)

  // Active round tab
  const [activeRound, setActiveRound] = useState(saved?.activeRound ?? '0')

  // Score editing state
  // Score editing - handled inline by ScoreCell

  // Skip initial mount save (state already restored from localStorage)
  const isInitialMount = useRef(true)

  // Persist state on every change after initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    saveTournament({
      step,
      tournamentName,
      courts,
      pointsPerWin,
      players,
      rounds,
      knockout,
      tournamentComplete,
      activeRound,
    })
  })

  // Validation
  const canStart = tournamentName.trim()

  /* ——— Player management ——— */
  const addPlayer = useCallback(() => {
    const name = newPlayerName.trim()
    if (!name) return
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) return
    setPlayers(prev => [...prev, createPlayer(name)])
    setNewPlayerName('')
  }, [newPlayerName, players])

  const removePlayer = useCallback((id) => {
    setPlayers(prev => prev.filter(p => p.id !== id))
  }, [])

  /* ——— Round generation ——— */
  const handleGenerateRounds = useCallback(() => {
    const generated = generateRounds(players, courts, pointsPerWin)
    setRounds(generated)
    setKnockout(null)
    setTournamentComplete(false)
    setActiveRound('0')
    setStep(2)
  }, [players, courts, pointsPerWin])

  /* --- Score recording (auto-save inline) --- */
  const handleSaveScore = useCallback((roundIdx, matchIdx, scoreA, scoreB) => {
    setRounds(prev => {
      const updated = prev.map(r => ({ ...r, matches: r.matches.map(m => ({ ...m })) }))
      const match = updated[roundIdx].matches[matchIdx]
      match.score = { a: scoreA, b: scoreB }
      match.winner = scoreA > scoreB ? 1 : scoreB > scoreA ? 2 : null
      match.played = true
      return updated
    })
  }, [])

  const getPlayerStats = useCallback(() => {
    const stats = {}
    players.forEach(p => {
      stats[p.id] = {
        id: p.id, name: p.name,
        pj: 0, pg: 0, pe: 0, pp: 0,
        gf: 0, ga: 0,
        pts: 0,
      }
    })

    rounds.forEach(round => {
      round.matches.forEach(m => {
        if (!m.played) return
        const pA1 = stats[m.pairA[0].id]
        const pA2 = stats[m.pairA[1].id]
        const pB1 = stats[m.pairB[0].id]
        const pB2 = stats[m.pairB[1].id]
        if (!pA1 || !pA2 || !pB1 || !pB2) return

        ;[pA1, pA2, pB1, pB2].forEach(p => { p.pj++ })

        if (m.winner === 1) {
          pA1.pg++; pA2.pg++
          pB1.pp++; pB2.pp++
          pA1.pts += pointsPerWin; pA2.pts += pointsPerWin
          if (m.score) {
            pA1.gf += m.score.a; pA1.ga += m.score.b
            pA2.gf += m.score.a; pA2.ga += m.score.b
            pB1.gf += m.score.b; pB1.ga += m.score.a
            pB2.gf += m.score.b; pB2.ga += m.score.a
          }
        } else if (m.winner === 2) {
          pA1.pp++; pA2.pp++
          pB1.pg++; pB2.pg++
          pB1.pts += pointsPerWin; pB2.pts += pointsPerWin
          if (m.score) {
            pA1.gf += m.score.a; pA1.ga += m.score.b
            pA2.gf += m.score.a; pA2.ga += m.score.b
            pB1.gf += m.score.b; pB1.ga += m.score.a
            pB2.gf += m.score.b; pB2.ga += m.score.a
          }
        } else {
          ;[pA1, pA2, pB1, pB2].forEach(p => { p.pe++ })
          if (m.score) {
            pA1.gf += m.score.a; pA1.ga += m.score.b
            pA2.gf += m.score.a; pA2.ga += m.score.b
            pB1.gf += m.score.b; pB1.ga += m.score.a
            pB2.gf += m.score.b; pB2.ga += m.score.a
          }
        }
      })
    })

    return Object.values(stats)
  }, [players, rounds, pointsPerWin])

  const allRoundsPlayed = useMemo(() => {
    return rounds.length > 0 && rounds.every(r => r.matches.every(m => m.played))
  }, [rounds])

  /* ———— Knockout ———— */
  const handleAdvanceToKnockout = useCallback(() => {
    const stats = getPlayerStats()
    const sorted = computeStandings(stats)

    const topN = sorted.length >= 8 ? 8 : 4
    const selected = sorted.slice(0, topN)

    const semis = []
    if (topN === 8) {
      semis.push({
        id: matchId(),
        team1: [selected[0], selected[7]],
        team2: [selected[3], selected[4]],
        winner: null,
        score: null,
        played: false,
      })
      semis.push({
        id: matchId(),
        team1: [selected[1], selected[6]],
        team2: [selected[2], selected[5]],
        winner: null,
        score: null,
        played: false,
      })
    } else {
      semis.push({
        id: matchId(),
        team1: [selected[0], selected[3]],
        team2: [selected[1], selected[2]],
        winner: null,
        score: null,
        played: false,
      })
    }

    setKnockout({
      semis,
      finalMatch: {
        id: matchId(),
        team1: null,
        team2: null,
        winner: null,
        score: null,
        played: false,
      },
      thirdPlace: topN >= 8 ? {
        id: matchId(),
        team1: null,
        team2: null,
        winner: null,
        score: null,
        played: false,
      } : null,
      finalized: false,
    })
    setStep(4)
  }, [getPlayerStats])

  const handleKnockoutResult = useCallback((matchId, teamIdx, scores) => {
    setKnockout(prev => {
      if (!prev || prev.finalized) return prev

      const updated = { ...prev }
      const isSemi = (m) => prev.semis.some(s => s.id === m)

      // Build score object from scores prop or default to null
      const matchScore = scores ? {
        score: { a: scores.a || 0, b: scores.b || 0 },
        played: true,
      } : { played: true, winner: teamIdx }

      if (isSemi(matchId)) {
        updated.semis = prev.semis.map(s =>
          s.id === matchId ? { ...s, winner: teamIdx, ...matchScore } : s
        )

        const allSemisDone = updated.semis.every(s => s.winner)
        if (allSemisDone) {
          const winners = updated.semis.map(s => s.winner === 1 ? s.team1 : s.team2)
          const losers = updated.semis.map(s => s.winner === 1 ? s.team2 : s.team1)
          updated.finalMatch = {
            ...prev.finalMatch,
            team1: winners[0],
            team2: winners.length > 1 ? winners[1] : null,
            winner: null,
            score: null,
            played: false,
          }
          if (prev.thirdPlace) {
            updated.thirdPlace = {
              ...prev.thirdPlace,
              team1: losers[0],
              team2: losers.length > 1 ? losers[1] : null,
              winner: null,
              score: null,
              played: false,
            }
          }
        }
      }

      if (matchId === prev.finalMatch?.id) {
        updated.finalMatch = { ...prev.finalMatch, winner: teamIdx, ...matchScore }
        updated.finalized = true
        setTournamentComplete(true)
      }

      if (prev.thirdPlace && matchId === prev.thirdPlace.id) {
        updated.thirdPlace = { ...prev.thirdPlace, winner: teamIdx, ...matchScore }
      }

      return updated
    })
  }, [])

  /* ———— Computed standings ———— */
  const standings = useMemo(() => getPlayerStats(), [getPlayerStats])

  /* ———— Reset ———— */
  const handleNewTournament = useCallback(() => {
    clearSavedTournament()
    setStep(0)
    setTournamentName('')
    setCourts(2)
    setPointsPerWin(1)
    setPlayers([])
    setNewPlayerName('')
    setRounds([])
    setKnockout(null)
    setTournamentComplete(false)
    setActiveRound('0')
  }, [])

  /* ———— Step navigation ———— */
  const canAdvance = () => {
    switch (step) {
      case 0: return canStart
      case 1: return true
      case 2: return allRoundsPlayed
      case 3: return true
      case 4: return true
      default: return false
    }
  }

  /* =====================================================
     Renders
     ===================================================== */

  const renderConfig = () => (
    <div className="max-w-lg mx-auto space-y-5 sm:space-y-6">
      <div className="text-center mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border border-border-subtle flex items-center justify-center mx-auto mb-3 sm:mb-4 bg-card">
          <Swords className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-foreground">Round Robin Express</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Todos contra todos — cada jugador se empareja con todos</p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <div>
          <Label className="text-xs sm:text-sm">Nombre del torneo</Label>
          <Input
            value={tournamentName}
            onChange={e => setTournamentName(e.target.value)}
            placeholder="Ej: Express #1"
            className="mt-1.5 h-10 sm:h-auto"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Label className="text-xs sm:text-sm">Canchas</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <Button
                variant="outline"
                size="icon"
                className="w-9 h-9 sm:w-8 sm:h-8 min-w-[36px]"
                onClick={() => setCourts(Math.max(1, courts - 1))}
                disabled={courts <= 1}
              >−</Button>
              <span className="w-10 text-center font-bold font-mono text-base sm:text-lg text-foreground">{courts}</span>
              <Button
                variant="outline"
                size="icon"
                className="w-9 h-9 sm:w-8 sm:h-8 min-w-[36px]"
                onClick={() => setCourts(Math.min(10, courts + 1))}
                disabled={courts >= 10}
              >+</Button>
            </div>
          </div>
          <div>
            <Label className="text-xs sm:text-sm">Puntos/victoria</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <Button
                variant="outline"
                size="icon"
                className="w-9 h-9 sm:w-8 sm:h-8 min-w-[36px]"
                onClick={() => setPointsPerWin(Math.max(1, pointsPerWin - 1))}
                disabled={pointsPerWin <= 1}
              >−</Button>
              <span className="w-10 text-center font-bold font-mono text-base sm:text-lg text-foreground">{pointsPerWin}</span>
              <Button
                variant="outline"
                size="icon"
                className="w-9 h-9 sm:w-8 sm:h-8 min-w-[36px]"
                onClick={() => setPointsPerWin(Math.min(5, pointsPerWin + 1))}
              >+</Button>
            </div>
          </div>
        </div>
      </div>

      {saved && players.length > 0 && (
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-muted border border-border-subtle text-xs text-muted-foreground">
          <span className="truncate">Progreso guardado — {players.length} jug.</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-auto text-xs px-2 py-1 shrink-0"
            onClick={handleNewTournament}
          >
            Nuevo torneo
          </Button>
        </div>
      )}

      <div className="bg-card border border-border-subtle p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">Cómo funciona</p>
        <p>• Cada jugador acumula puntos individuales.</p>
        <p>• Sistema round-robin: todos juegan con y contra todos.</p>
        <p>• Al final, los mejores pasan a eliminatorias.</p>
      </div>
    </div>
  )

  const renderPlayers = () => (
    <div className="max-w-lg mx-auto space-y-4 sm:space-y-5">
      <div className="text-center mb-4 sm:mb-5 px-4 sm:px-0 py-3 sm:py-4 ">
        <h2 className="text-lg sm:text-xl font-heading font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
          <Users className="w-5 h-5 text-court" />
          Jugadores
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Agrega al menos 4 jugadores para comenzar el torneo</p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={newPlayerName}
            onChange={e => setNewPlayerName(e.target.value)}
            placeholder="Nombre del jugador"
            className="h-10 sm:h-auto"
            onKeyDown={e => e.key === 'Enter' && addPlayer()}
          />
        </div>
        <Button
          onClick={addPlayer}
          disabled={!newPlayerName.trim()}
          className="h-10 sm:h-auto min-w-[90px]"
        >
          <UserPlus className="w-4 h-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Agregar</span>
        </Button>
      </div>

      <div className="space-y-1 max-h-72 overflow-y-auto">
        {players.length === 0 ? (
          <p className="text-center text-xs sm:text-sm text-muted-foreground/50 py-8">
            No hay jugadores. Agrega los participantes del torneo.
          </p>
        ) : (
          players.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between px-3 py-2.5 sm:py-3 bg-card border border-border-subtle  hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 bg-court/70 flex items-center justify-center text-xs font-bold text-primary-foreground shadow-sm shrink-0">
                  {i + 1}
                </div>
                <span className="font-medium text-sm text-foreground truncate">{p.name}</span>
              </div>
              <button
                onClick={() => removePlayer(p.id)}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {players.length >= 4 && (
        <div className="border border-border-subtle/80 px-3 sm:px-4 py-2.5 sm:py-3 ">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm text-foreground/80 font-medium">
              <span className="font-bold text-foreground">{players.length}</span> jugadores · <span className="font-bold text-foreground">{courts}</span> {courts === 1 ? 'cancha' : 'canchas'}
            </span>
            <span className="text-xs text-muted-foreground/70 text-right tabular-nums">
              {Math.floor(players.length / 4) * courts} <span className="text-muted-foreground/50">partidos/ronda</span>
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-1.5 flex items-center gap-1.5">
            <LayoutGrid className="w-3 h-3" />
            Sistema round-robin: {players.length - 1} rondas · cada jugador se empareja con todos
          </p>
        </div>
      )}
    </div>
  )

  const renderRounds = () => {
    const totalMatches = rounds.reduce((sum, r) => sum + r.matches.length, 0)
    const playedMatches = rounds.reduce((sum, r) => sum + r.matches.filter(m => m.played).length, 0)
    const pct = totalMatches > 0 ? Math.round((playedMatches / totalMatches) * 100) : 0

    return (
      <div className="space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h2 className="text-lg sm:text-xl font-heading font-bold tracking-tight text-foreground">Jornadas</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {rounds.length} rondas · todos contra todos · {courts} cancha{courts > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 sm:w-32 bg-muted">
              <div
                className="h-full bg-foreground transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-foreground tabular-nums">
              {playedMatches}/{totalMatches}
            </span>
          </div>
        </div>

        {/* Round Tabs — scrollable on mobile */}
        <Tabs value={activeRound} onValueChange={setActiveRound} className="w-full">
          <div className="-mx-4 sm:mx-0">
            <TabsList className="w-full justify-start overflow-x-auto scrollbar-hide px-4 sm:px-0 gap-0.5">
              {rounds.map((round, ri) => {
                const roundPlayed = round.matches.every(m => m.played)
                return (
                  <TabsTrigger
                    key={ri}
                    value={String(ri)}
                    className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[36px]"
                  >
                    R{round.number}
                    {roundPlayed ? (
                      <CheckCircle2 className="w-3 h-3 text-court shrink-0" />

                    ) : null}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>
          {rounds.map((round, ri) => (
            <TabsContent key={ri} value={String(ri)} className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
              >
                {round.matches.map((match, mi) => {
                  const isAWinner = match.played && match.winner === 1
                  const isBWinner = match.played && match.winner === 2
                  const hasScore = (match.score?.a ?? 0) > 0 || (match.score?.b ?? 0) > 0
                  const isLive = hasScore && !match.played
                  return (
                    <div
                      key={match.id}
                      className={cn(
                        'bg-card border transition-all duration-200 overflow-hidden',
                        match.played ? 'border-border-subtle' : 'border-border-subtle/60 hover:border-foreground/30'
                      )}
                    >
                      {/* --- Header --- */}
                      <div className={cn(
                        'flex items-center justify-between px-3 sm:px-4 py-2 border-b',
                        match.played ? 'bg-muted/20 border-border-subtle' : 'bg-muted/10 border-border-subtle/60'
                      )}>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center  text-[10px] sm:text-xs font-bold',
                            match.played ? 'bg-foreground text-background' : 'bg-muted-foreground/20 text-muted-foreground'
                          )}>{match.court}</div>
                          <span className="text-xs sm:text-sm font-semibold text-foreground">Cancha {match.court}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isLive && <span className="w-1.5 h-1.5  bg-success animate-pulse" />}
                          <span className={cn(
                            'text-[10px] sm:text-xs font-medium px-2 py-0.5 ',
                            match.played ? 'bg-court/[0.1] text-court' : isLive ? 'bg-success/10 text-success' : 'bg-muted-foreground/10 text-muted-foreground'
                          )}>{match.played ? 'Jugado' : isLive ? 'En vivo' : 'Pendiente'}</span>
                        </div>
                      </div>


                      {/* --- Teams --- */}
                      <div className="p-3 sm:p-4 space-y-0">
                        {/* Team A */}
                        <div className={cn(
                          'flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3  transition-colors',
                          isAWinner ? 'bg-court/[0.05] ring-1 ring-court/20' : (match.played ? 'bg-muted/20' : 'hover:bg-muted/30')
                        )}>
                          <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7">
                            {isAWinner && <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-court" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={cn('text-sm sm:text-base font-bold truncate', isAWinner ? 'text-court' : 'text-foreground')}>{match.pairA[0].name}</div>
                            <div className={cn('text-xs sm:text-sm truncate', isAWinner ? 'text-court/70' : 'text-muted-foreground')}>{match.pairA[1].name}</div>
                          </div>
                          <div className={cn('w-10 h-10 sm:w-12 sm:h-12  overflow-hidden shrink-0', isAWinner ? 'ring-2 ring-court' : 'ring-1 ring-border')}>
                            <ScoreCell value={match.score?.a ?? 0} onChange={(v) => handleSaveScore(ri, mi, v, match.score?.b ?? 0)} isWinner={isAWinner} />
                          </div>
                        </div>

                        {/* VS divider */}
                        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1">
                          <div className="flex-1 h-px bg-border/50" />
                          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">VS</span>
                          <div className="flex-1 h-px bg-border/50" />
                        </div>

                        {/* Team B */}
                        <div className={cn(
                          'flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3  transition-colors',
                          isBWinner ? 'bg-court/[0.05] ring-1 ring-court/20' : (match.played ? 'bg-muted/20' : 'hover:bg-muted/30')
                        )}>
                          <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7">
                            {isBWinner && <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-court" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={cn('text-sm sm:text-base font-bold truncate', isBWinner ? 'text-court' : 'text-foreground')}>{match.pairB[0].name}</div>
                            <div className={cn('text-xs sm:text-sm truncate', isBWinner ? 'text-court/70' : 'text-muted-foreground')}>{match.pairB[1].name}</div>
                          </div>
                          <div className={cn('w-10 h-10 sm:w-12 sm:h-12  overflow-hidden shrink-0', isBWinner ? 'ring-2 ring-court' : 'ring-1 ring-border')}>
                            <ScoreCell value={match.score?.b ?? 0} onChange={(v) => handleSaveScore(ri, mi, match.score?.a ?? 0, v)} isWinner={isBWinner} />
                          </div>
                        </div>

                        {/* Result */}
                        {match.played ? (
                          <div className="mt-2 px-3 sm:px-4">
                            <div className={cn(
                              'text-[10px] sm:text-xs font-semibold text-center py-1.5 rounded-md',
                              match.winner ? 'bg-court/[0.05] text-court' : 'bg-muted text-muted-foreground'
                            )}>{match.winner
                              ? (match.winner === 1 ? match.pairA[0].name.split(' ')[0] + ' & ' + match.pairA[1].name.split(' ')[0] : match.pairB[0].name.split(' ')[0] + ' & ' + match.pairB[1].name.split(' ')[0]) + ' ganan ' + (match.score?.a ?? 0) + '-' + (match.score?.b ?? 0)
                              : 'Empate ' + (match.score?.a ?? 0) + '-' + (match.score?.b ?? 0)
                            }</div>
                          </div>
                        ) : (
                          <div className="mt-2 px-3 sm:px-4">
                            <div className="text-[10px] sm:text-xs text-center text-muted-foreground/40 py-1.5">Toca el marcador para registrar resultado</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </motion.div>
              </TabsContent>
            ))}

          </Tabs>
        {/* All rounds done banner */}
        {allRoundsPlayed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-foreground bg-card p-5 sm:p-6 text-center"
          >
            <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-foreground mx-auto mb-2" />
            <p className="font-heading font-bold text-base sm:text-lg tracking-tight text-foreground mb-1">
              Jornadas completadas
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Todos los partidos se han jugado. Revisa la clasificación y avanza a eliminatorias.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
              <Button onClick={() => setStep(3)} variant="outline" className="w-full sm:w-auto">
                Ver clasificación
              </Button>
              <Button onClick={handleAdvanceToKnockout} className="w-full sm:w-auto">
                <Trophy className="w-4 h-4" />
                Ir a eliminatorias
              </Button>
            </div>
          </motion.div>
        )}

        {!allRoundsPlayed && rounds.length > 0 && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateRounds}
              className="text-muted-foreground"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerar rondas
            </Button>
          </div>
        )}
      </div>
    )
  }

  const renderStandings = () => {
    const topN = standings.length >= 8 ? 8 : 4
    return (
      <div className="space-y-4 sm:space-y-5 max-w-2xl mx-auto">
        <div className="text-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-heading font-bold tracking-tight text-foreground">Clasificación final</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Los mejores {topN} pasan a eliminatorias
          </p>
        </div>

        <RoundRobinStandings
          players={standings}
          qualifyingSpots={topN}
          title={tournamentName || 'Clasificación'}
        />

        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
          <Button variant="outline" onClick={() => setStep(2)} className="w-full sm:w-auto">
            <ChevronLeft className="w-4 h-4" />
            Volver a rondas
          </Button>
          <Button onClick={handleAdvanceToKnockout} className="w-full sm:w-auto">
            <Trophy className="w-4 h-4" />
            Generar eliminatorias
          </Button>
        </div>
      </div>
    )
  }

  const renderKnockout = () => {
    const hasChampion = knockout?.finalMatch?.winner
    return (
      <div className="space-y-4 sm:space-y-5 max-w-3xl mx-auto">
        <div className="text-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-heading font-bold tracking-tight text-foreground">Eliminatorias</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {hasChampion ? '¡Torneo completado!' : 'Selecciona el ganador de cada partido'}
          </p>
        </div>

        <KnockoutBracket
          semis={knockout?.semis || []}
          finalMatch={knockout?.finalMatch}
          thirdPlace={knockout?.thirdPlace}
          onResult={handleKnockoutResult}
        />

        {hasChampion && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="border-2 border-foreground bg-card p-6 sm:p-8 text-center shadow-lg"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20  bg-foreground flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-background" />
            </div>
            <p className="font-heading font-bold text-xl sm:text-2xl tracking-tight text-foreground mb-1">¡Campeón!</p>
            <p className="text-base sm:text-lg font-semibold text-foreground">
              {knockout.finalMatch.winner === 1
                ? knockout.finalMatch.team1?.map(p => p.name).join(' & ')
                : knockout.finalMatch.team2?.map(p => p.name).join(' & ')}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              {tournamentName}
            </p>
            <Button
              className="mt-6 w-full sm:w-auto gap-2 border-2 hover:bg-muted/50 transition-all duration-200"
              variant="outline"
              onClick={handleNewTournament}
            >
              <RefreshCw className="w-4 h-4" />
              Nuevo torneo
            </Button>
          </motion.div>
        )}
      </div>
    )
  }

  /* =====================================================
     Main layout
     ===================================================== */

  return (
    <div className="max-w-4xl mx-auto px-0 sm:px-2">
      {/* Step indicator with connecting lines */}
      <div className="flex items-center mb-6 sm:mb-8 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center shrink-0">
            {/* Connector line (before, except first) */}
            {i > 0 && (
              <div className={cn(
                'w-6 sm:w-8 h-0.5 mx-0.5 transition-colors duration-500',
                i <= step ? 'bg-foreground/40' : 'bg-border'
              )} />
            )}
            <button
              onClick={() => i <= step && setStep(i)}
              disabled={i > step}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-300  shrink-0',
                i === step
                  ? 'bg-foreground text-background shadow-lg shadow-foreground/20 scale-105'
                  : i < step
                    ? 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                    : 'text-muted-foreground/25 cursor-not-allowed'
              )}
            >
              <div className={cn(
                'w-5 h-5 sm:w-6 sm:h-6  flex items-center justify-center transition-all',
                i === step
                  ? 'bg-background/20'
                  : i < step
                    ? 'bg-foreground/10'
                    : 'bg-muted-foreground/10'
              )}>
                <s.icon className={cn(
                  'w-2.5 h-2.5 sm:w-3 sm:h-3',
                  i === step ? 'text-background' : i < step ? 'text-foreground/70' : 'text-muted-foreground/30'
                )} />
              </div>
              <span className="hidden sm:inline">{s.label}</span>
              {i < step && <CheckCircle2 className="w-2.5 h-2.5 text-success hidden sm:block" />}
            </button>
          </div>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {step === 0 && renderConfig()}
          {step === 1 && renderPlayers()}
          {step === 2 && renderRounds()}
          {step === 3 && renderStandings()}
          {step === 4 && renderKnockout()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-2 sm:gap-0 justify-between mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-border-subtle">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="text-xs sm:text-sm h-9 sm:h-10 gap-1.5 border-2 hover:bg-muted/50 transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {step === 0 && (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            className="text-xs sm:text-sm h-9 sm:h-10"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {step === 1 && (
          <Button
            onClick={handleGenerateRounds}
            disabled={players.length < 4}
            className="text-xs sm:text-sm h-9 sm:h-10"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Generar rondas</span>
          </Button>
        )}

        {step === 2 && allRoundsPlayed && (
          <Button
            onClick={() => setStep(3)}
            className="text-xs sm:text-sm h-9 sm:h-10"
          >
            Ver clasificación
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
