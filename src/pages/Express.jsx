import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {Trophy, Settings, Users, Calendar, Medal, Swords,
  Trash2, RefreshCw, ChevronRight, ChevronLeft,
   UserPlus, LayoutGrid, Sparkles,  
  Zap, Star, PartyPopper, Share2, BarChart3} from 'lucide-react'
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
      className="w-full h-full min-w-[40px] bg-background text-center text-xl sm:text-2xl font-bold tabular-nums outline-none ring-2 ring-foreground/30 rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  ) : (
    <button
      onClick={() => setEditing(true)}
      className={cn(
        'w-full h-full min-w-[40px] flex items-center justify-center text-xl sm:text-2xl font-bold tabular-nums transition-all cursor-text rounded-lg',
        isWinner
          ? 'bg-primary text-primary-foreground shadow-sm'
          : value > 0
            ? 'bg-muted text-foreground hover:bg-muted/80'
            : 'bg-muted/30 text-muted-foreground/40 hover:bg-muted/50'
      )}
    >{value}</button>
  );
}
/* --- Persistence --- */
const STORAGE_KEY = 'padelrush-express-tournament'

function saveTournament(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {}
}

function loadTournament() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!Array.isArray(data?.players)) return null
    return data
  } catch { return null }
}

function clearSavedTournament() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}

/* --- Round-Robin generation --- */
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
  const numRounds = n - 1
  const rounds = []
  for (let r = 0; r < numRounds; r++) {
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
    if (rotating.length > 1) {
      rotating.unshift(rotating.pop())
    }
  }
  return rounds
}
/* --- Steps --- */
const STEPS = [
  { id: 'config', label: 'Config', icon: Trophy, desc: 'Nombre y canchas' },
  { id: 'players', label: 'Jugadores', icon: Trophy, desc: 'Participantes' },
  { id: 'rounds', label: 'Jornadas', icon: Trophy, desc: 'Fase de grupos' },
  { id: 'standings', label: 'Final', icon: Trophy, desc: 'Clasificacion' },
  { id: 'knockout', label: 'Eliminatorias', icon: Trophy, desc: 'Campeon' },
]

export default function Express() {
  const saved = useMemo(() => loadTournament(), [])
  const [step, setStep] = useState(saved?.step ?? 0)
  const [tournamentName, setTournamentName] = useState(saved?.tournamentName ?? '')
  const [courts, setCourts] = useState(saved?.courts ?? 2)
  const [pointsPerWin, setPointsPerWin] = useState(saved?.pointsPerWin ?? 1)
  const [players, setPlayers] = useState(saved?.players ?? [])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [rounds, setRounds] = useState(saved?.rounds ?? [])
  const [knockout, setKnockout] = useState(saved?.knockout ?? null)
  const [tournamentComplete, setTournamentComplete] = useState(saved?.tournamentComplete ?? false)
  const [activeRound, setActiveRound] = useState(saved?.activeRound ?? '0')
  const [showStandings, setShowStandings] = useState(false)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    saveTournament({
      step, tournamentName, courts, pointsPerWin,
      players, rounds, knockout, tournamentComplete, activeRound,
    })
  })

  const canStart = tournamentName.trim()

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

  const handleGenerateRounds = useCallback(() => {
    const generated = generateRounds(players, courts, pointsPerWin)
    setRounds(generated)
    setKnockout(null)
    setTournamentComplete(false)
    setActiveRound('0')
    setStep(2)
  }, [players, courts, pointsPerWin])

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
      stats[p.id] = { id: p.id, name: p.name,
        pj: 0, pg: 0, pe: 0, pp: 0,
        sf: 0, sa: 0,
        gf: 0, ga: 0, pts: 0,
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
          if (m.score) { pA1.gf += m.score.a; pA1.ga += m.score.b; pA2.gf += m.score.a; pA2.ga += m.score.b; pB1.gf += m.score.b; pB1.ga += m.score.a; pB2.gf += m.score.b; pB2.ga += m.score.a; pA1.sf += m.score.a; pA1.sa += m.score.b; pA2.sf += m.score.a; pA2.sa += m.score.b; pB1.sf += m.score.b; pB1.sa += m.score.a; pB2.sf += m.score.b; pB2.sa += m.score.a }
        } else if (m.winner === 2) {
          pA1.pp++; pA2.pp++
          pB1.pg++; pB2.pg++
          pB1.pts += pointsPerWin; pB2.pts += pointsPerWin
          if (m.score) { pA1.gf += m.score.a; pA1.ga += m.score.b; pA2.gf += m.score.a; pA2.ga += m.score.b; pB1.gf += m.score.b; pB1.ga += m.score.a; pB2.gf += m.score.b; pB2.ga += m.score.a; pA1.sf += m.score.a; pA1.sa += m.score.b; pA2.sf += m.score.a; pA2.sa += m.score.b; pB1.sf += m.score.b; pB1.sa += m.score.a; pB2.sf += m.score.b; pB2.sa += m.score.a }
        } else {
          ;[pA1, pA2, pB1, pB2].forEach(p => { p.pe++ })
          if (m.score) { pA1.gf += m.score.a; pA1.ga += m.score.b; pA2.gf += m.score.a; pA2.ga += m.score.b; pB1.gf += m.score.b; pB1.ga += m.score.a; pB2.gf += m.score.b; pB2.ga += m.score.a; pA1.sf += m.score.a; pA1.sa += m.score.b; pA2.sf += m.score.a; pA2.sa += m.score.b; pB1.sf += m.score.b; pB1.sa += m.score.a; pB2.sf += m.score.b; pB2.sa += m.score.a }
        }
      })
    })
    return Object.values(stats)
  }, [players, rounds, pointsPerWin])

  const allRoundsPlayed = useMemo(() => {
    return rounds.length > 0 && rounds.every(r => r.matches.every(m => m.played))
  }, [rounds])

  const handleAdvanceToKnockout = useCallback(() => {
    const stats = getPlayerStats()
    const sorted = computeStandings(stats)
    const topN = sorted.length >= 8 ? 8 : 4
    const selected = sorted.slice(0, topN)
    const semis = []
    if (topN === 8) {
      semis.push({ id: matchId(), team1: [selected[0], selected[7]], team2: [selected[3], selected[4]], winner: null, score: null, played: false })
      semis.push({ id: matchId(), team1: [selected[1], selected[6]], team2: [selected[2], selected[5]], winner: null, score: null, played: false })
    } else {
      semis.push({ id: matchId(), team1: [selected[0], selected[3]], team2: [selected[1], selected[2]], winner: null, score: null, played: false })
    }
    setKnockout({
      semis,
      finalMatch: { id: matchId(), team1: null, team2: null, winner: null, score: null, played: false },
      thirdPlace: topN >= 8 ? { id: matchId(), team1: null, team2: null, winner: null, score: null, played: false } : null,
      finalized: false,
    })
    setStep(4)
  }, [getPlayerStats])

  const handleKnockoutResult = useCallback((matchId, teamIdx, scores) => {
    setKnockout(prev => {
      if (!prev || prev.finalized) return prev
      const updated = { ...prev }
      const isSemi = (m) => prev.semis.some(s => s.id === m)
      const matchScore = scores ? { score: { a: scores.a || 0, b: scores.b || 0 }, played: true } : { played: true, winner: teamIdx }
      if (isSemi(matchId)) {
        updated.semis = prev.semis.map(s => s.id === matchId ? { ...s, winner: teamIdx, ...matchScore } : s)
        const allSemisDone = updated.semis.every(s => s.winner)
        if (allSemisDone) {
          const winners = updated.semis.map(s => s.winner === 1 ? s.team1 : s.team2)
          const losers = updated.semis.map(s => s.winner === 1 ? s.team2 : s.team1)
          updated.finalMatch = { ...prev.finalMatch, team1: winners[0], team2: winners.length > 1 ? winners[1] : null, winner: null, score: null, played: false }
          if (prev.thirdPlace) { updated.thirdPlace = { ...prev.thirdPlace, team1: losers[0], team2: losers.length > 1 ? losers[1] : null, winner: null, score: null, played: false } }
        }
      }
      if (matchId === prev.finalMatch?.id) { updated.finalMatch = { ...prev.finalMatch, winner: teamIdx, ...matchScore }; updated.finalized = true; setTournamentComplete(true) }
      if (prev.thirdPlace && matchId === prev.thirdPlace.id) { updated.thirdPlace = { ...prev.thirdPlace, winner: teamIdx, ...matchScore } }
      return updated
    })
  }, [])

  const standings = useMemo(() => getPlayerStats(), [getPlayerStats])

  const handleNewTournament = useCallback(() => {
    clearSavedTournament()
    setStep(0); setTournamentName(''); setCourts(2); setPointsPerWin(1)
    setPlayers([]); setNewPlayerName(''); setRounds([])
    setKnockout(null); setTournamentComplete(false); setActiveRound('0'); setShowStandings(false)
  }, [])

  const canAdvance = () => {
    switch (step) {
      case 0: return canStart
      case 1: return players.length >= 4
      case 2: return allRoundsPlayed
      case 3: return true
      case 4: return true
      default: return false
    }
  }
  const handleShare = useCallback(async () => {
    const stats = getPlayerStats()
    const sorted = computeStandings(stats)
    const topText = sorted.slice(0, 5).map((p, i) =>
      `${i + 1}. ${p.name} - ${p.pts} pts`
    ).join('\n')
    const text = `🏆 ${tournamentName || "Torneo Express"}

Clasificación:
${topText}

¡Sigue la acción con PadelRush!`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: tournamentName || 'Torneo Express', text })
        return
      } catch (e) { if (e.name !== 'AbortError') console.warn(e) }
    }
    navigator.clipboard?.writeText(text).catch(() => {})
  }, [getPlayerStats, tournamentName])

  /* =====================================================
     Renders
     ===================================================== */

  /* ---- Step 0: Config ---- */
  const renderConfig = () => (
    <motion.div key="config" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <Trophy className="w-12 h-12 mx-auto text-primary/60" />
        <h2 className="text-2xl font-bold">Nuevo Torneo Express</h2>
        <p className="text-muted-foreground">Configura los detalles del torneo</p>
      </div>
      <div className="space-y-2">
        <Label>Nombre del torneo</Label>
        <Input
          value={tournamentName}
          onChange={e => setTournamentName(e.target.value)}
          placeholder="Ej: Viernes de Padel"
          className="text-lg"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Canchas disponibles</Label>
          <Input
            type="number" min="1" max="10"
            value={courts}
            onChange={e => setCourts(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>Puntos por victoria</Label>
          <Input
            type="number" min="1" max="10"
            value={pointsPerWin}
            onChange={e => setPointsPerWin(Number(e.target.value))}
          />
        </div>
      </div>
    </motion.div>
  )


  /* ---- Step 1: Players ---- */
  const renderPlayers = () => (
    <motion.div key="players" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2 mb-4">
        <Users className="w-10 h-10 mx-auto text-primary/60" />
        <h2 className="text-xl font-bold">Jugadores</h2>
        <p className="text-sm text-muted-foreground">Mínimo 4 jugadores para generar las jornadas</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={newPlayerName}
          onChange={e => setNewPlayerName(e.target.value)}
          placeholder="Nombre del jugador"
          onKeyDown={e => { if (e.key === 'Enter') addPlayer() }}
        />
        <Button onClick={addPlayer} disabled={!newPlayerName.trim()}>
          <UserPlus className="w-4 h-4 mr-1" /> Añadir
        </Button>
      </div>

      {players.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {players.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2 group animate-in fade-in duration-200"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium flex-1 truncate">{p.name}</span>
              <button
                onClick={() => removePlayer(p.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {players.length >= 4 && (
        <Button onClick={handleGenerateRounds} className="w-full">
          <Zap className="w-4 h-4 mr-2" /> Generar Jornadas
        </Button>
      )}
    </motion.div>
  )


  const AVATAR_COLORS = [
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-blue-600',
    'from-lime-500 to-green-600',
    'from-fuchsia-500 to-purple-600',
    'from-sky-500 to-indigo-600',
  ]
  

  /* ---- Step 2: Rounds ---- */
  const renderRounds = () => {
    const currentStandings = computeStandings(getPlayerStats())
    const posMap = {}
    currentStandings.forEach((p, i) => { posMap[p.id] = i + 1 })
    const totalMatches = rounds.reduce((s, r) => s + r.matches.length, 0)
    const playedMatches = rounds.reduce((s, r) => s + r.matches.filter(m => m.played).length, 0)

    return (
      <motion.div key="rounds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Jornadas</h2>
            {totalMatches > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {playedMatches} de {totalMatches} partidos jugados
              </p>
            )}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowStandings(true)}>
              <BarChart3 className="w-4 h-4 mr-1" /> Clasificación
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-1" /> Compartir
            </Button>
          </div>
        </div>

        {totalMatches > 0 && (
          <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(playedMatches / totalMatches) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        )}

        <Tabs value={activeRound} onValueChange={setActiveRound} className="w-full">
          <TabsList className="w-full flex-wrap h-auto">
            {rounds.map((r, idx) => (
              <TabsTrigger key={r.number} value={String(idx)} className="flex-1 min-w-[60px]">
                J{idx + 1}
              </TabsTrigger>
            ))}
          </TabsList>


          {rounds.map((round, roundIdx) => (
            <TabsContent key={round.number} value={String(roundIdx)} className="mt-4 space-y-3">
              {round.matches.map((match, matchIdx) => {
                const pA1 = players.find(p => p.id === match.pairA[0]?.id)
                const pA2 = players.find(p => p.id === match.pairA[1]?.id)
                const pB1 = players.find(p => p.id === match.pairB[0]?.id)
                const pB2 = players.find(p => p.id === match.pairB[1]?.id)
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: matchIdx * 0.05 }}
                    className="bg-card border border-border/50 rounded-xl hover:shadow-sm hover:border-border/80 transition-all duration-200"
                  >
                    {/* Header: Cancha + Estado */}
                    <div className="flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-4 pb-2 border-b border-border/50">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="font-medium">Cancha {match.court}</span>
                      </div>
                      {match.played ? (
                        <Badge variant="secondary" className="text-[10px] h-5 bg-green-500/10 text-green-600 border-green-500/20">
                          Completado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] h-5 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800">
                          Pendiente
                        </Badge>
                      )}
                    </div>

                    <div className="p-3 sm:p-4">
                      {/* EQUIPO A */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 flex items-center gap-1.5">
                          {[pA1, pA2].map((player, pi) => {
                            if (!player) return null
                            
                            const pos = posMap[player.id] || '-'
                            return (
                              <div key={pi} className="flex-1 flex items-center gap-1.5 sm:gap-2 bg-muted/50 rounded-md px-2.5 py-2 min-w-0">
                                <div className={"w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-muted-foreground/20 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-muted-foreground shrink-0"}>
                                  {player.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs sm:text-sm font-semibold truncate leading-tight">{player.name}</div>
                                  <div className="text-[8px] sm:text-[10px] text-muted-foreground/60">#{pos}</div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* VS */}
                      <div className="flex items-center gap-3 my-2 sm:my-3">
                        <div className="flex-1 h-px bg-border/50" />
                        <span className="text-[11px] sm:text-xs font-semibold tracking-widest text-muted-foreground/30">VS</span>
                        <div className="flex-1 h-px bg-border/50" />
                      </div>

                      {/* EQUIPO B */}
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div className="flex-1 flex items-center gap-1.5">
                          {[pB1, pB2].map((player, pi) => {
                            if (!player) return null
                            
                            const pos = posMap[player.id] || '-'
                            return (
                              <div key={pi} className="flex-1 flex items-center gap-1.5 sm:gap-2 bg-muted/50 rounded-md px-2.5 py-2 min-w-0">
                                <div className={"w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-muted-foreground/20 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-muted-foreground shrink-0"}>
                                  {player.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs sm:text-sm font-semibold truncate leading-tight">{player.name}</div>
                                  <div className="text-[8px] sm:text-[10px] text-muted-foreground/60">#{pos}</div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* SCORE SECTION */}
                      <div className="bg-muted/40 rounded-xl p-2 sm:p-3 border border-border/50">
                        <div className="flex items-center justify-center gap-2 sm:gap-4">
                          <div className="flex-1 text-center">
                            <div className="w-full max-w-[65px] sm:max-w-[90px] mx-auto aspect-square">
                              <ScoreCell
                                value={match.score?.a ?? 0}
                                onChange={v => handleSaveScore(roundIdx, matchIdx, v, match.score?.b ?? 0)}
                                isWinner={match.played && match.winner === 1}
                              />
                            </div>
                            <span className="block text-[8px] sm:text-[10px] font-medium text-muted-foreground/50 mt-0.5">EQ. A</span>
                          </div>

                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground/30">VS</span>
                          </div>

                          <div className="flex-1 text-center">
                            <div className="w-full max-w-[65px] sm:max-w-[90px] mx-auto aspect-square">
                              <ScoreCell
                                value={match.score?.b ?? 0}
                                onChange={v => handleSaveScore(roundIdx, matchIdx, match.score?.a ?? 0, v)}
                                isWinner={match.played && match.winner === 2}
                              />
                            </div>
                            <span className="block text-[8px] sm:text-[10px] font-medium text-muted-foreground/50 mt-0.5">EQ. B</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    )
  }


  /* ---- Step 3: Standings ---- */
  const renderStandings = () => (
    <motion.div key="standings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Clasificación Final</h2>
          <p className="text-sm text-muted-foreground">Todos los partidos completados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowStandings(true)}>
            <BarChart3 className="w-4 h-4 mr-1" /> Vista detallada
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1" /> Compartir
          </Button>
        </div>
      </div>
      <RoundRobinStandings stats={standings} />
      {allRoundsPlayed && knockout === null && (
        <Button onClick={handleAdvanceToKnockout} className="w-full mt-4">
          <Swords className="w-4 h-4 mr-2" /> Avanzar a Eliminatorias
        </Button>
      )}
    </motion.div>
  )


  /* ---- Step 4: Knockout ---- */
  const renderKnockout = () => (
    <motion.div key="knockout" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Eliminatorias</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowStandings(true)}>
            <BarChart3 className="w-4 h-4 mr-1" /> Clasificación
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1" /> Compartir
          </Button>
        </div>
      </div>
      <KnockoutBracket
                semis={knockout?.semis || []}
                finalMatch={knockout?.finalMatch || null}
                thirdPlace={knockout?.thirdPlace || null}
                onResult={handleKnockoutResult}
              />
      {tournamentComplete && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-6 text-center space-y-3">
          <PartyPopper className="w-12 h-12 mx-auto text-yellow-500" />
          <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">¡Torneo Completo!</h3>
          <p className="text-muted-foreground">Todos los partidos se han jugado</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleShare} variant="outline">
              <Share2 className="w-4 h-4 mr-2" /> Compartir resultados
            </Button>
            <Button onClick={handleNewTournament} variant="default">
              <RefreshCw className="w-4 h-4 mr-2" /> Nuevo Torneo
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )


  /* ---- Standings Panel (overlay) ---- */
  const renderStandingsPanel = () => {
    if (!showStandings) return null
    const stats = getPlayerStats()
    const sorted = computeStandings(stats)
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowStandings(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card border rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-10">
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Clasificación</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-1" /> Compartir
                </Button>
                <button
                  onClick={() => setShowStandings(false)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <RoundRobinStandings stats={stats} />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }


  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-secondary/10">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm">{tournamentName || "Express"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowStandings(true)} className="text-xs">
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} className="text-xs">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleNewTournament} className="text-xs text-muted-foreground">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6 overflow-x-auto overscroll-x-contain">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            let stepClass = "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition-all duration-300"
            if (i === step) stepClass += " bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
            else if (i < step) stepClass += " bg-primary/10 text-primary/70"
            else stepClass += " text-muted-foreground/40"
            return (
              <div key={s.id} className="flex items-center">
                <div className={stepClass}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline font-medium">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={"w-4 sm:w-8 h-px mx-0.5 sm:mx-1 transition-colors duration-300 " + (i < step ? "bg-primary/40" : "bg-border")} />}
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && renderConfig()}
          {step === 1 && renderPlayers()}
          {step === 2 && renderRounds()}
          {step === 3 && renderStandings()}
          {step === 4 && renderKnockout()}
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8 pt-4 border-t">
          <Button variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
          </Button>
          <span className="text-xs text-muted-foreground">{STEPS[step]?.desc}</span>
          <Button onClick={() => { if (step === 3 && !knockout) { handleAdvanceToKnockout() } else { setStep(s => Math.min(STEPS.length - 1, s + 1)) } }} disabled={!canAdvance() || step >= STEPS.length - 1}>
            Siguiente <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {renderStandingsPanel()}
    </div>
  )
}
