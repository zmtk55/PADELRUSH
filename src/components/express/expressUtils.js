// --- Constants ---
export const STORAGE_KEY = 'padelrush-express-tournament'

export const STEPS = [
  { id: 'config', label: 'Config', desc: 'Nombre y canchas' },
  { id: 'players', label: 'Jugadores', desc: 'Participantes' },
  { id: 'rounds', label: 'Jornadas', desc: 'Fase de grupos' },
  { id: 'standings', label: 'Final', desc: 'Clasificacion' },
  { id: 'knockout', label: 'Eliminatorias', desc: 'Campeon' },
]

export const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-lime-500 to-green-600',
  'from-fuchsia-500 to-purple-600',
  'from-sky-500 to-indigo-600',
]

// --- IDs ---
let playerIdCounter = 0
const newId = () => `p_${Date.now()}_${++playerIdCounter}`
export const matchId = () => `m_${Date.now()}_${++playerIdCounter}`

// --- Player factory ---
export function createPlayer(name) {
  return {
    id: newId(),
    name: name.trim(),
    pj: 0, pg: 0, pe: 0, pp: 0,
    sf: 0, sa: 0, gf: 0, ga: 0, pts: 0,
  }
}

// --- Round-Robin generation ---
export function generateRounds(players, courts, pointsPerWin) {
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

// --- Stats computation ---
export function getPlayerStats(players, rounds, pointsPerWin) {
  const stats = {}
  players.forEach(p => {
    stats[p.id] = { id: p.id, name: p.name,
      pj: 0, pg: 0, pe: 0, pp: 0,
      sf: 0, sa: 0, gf: 0, ga: 0, pts: 0,
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
}

// --- Persistence ---
export function saveTournament(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {}
}

export function loadTournament() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!Array.isArray(data?.players)) return null
    return data
  } catch { return null }
}

export function clearSavedTournament() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}

// --- Sharing ---
import { computeStandings } from '@/components/roundrobin/RoundRobinStandings'

export function handleShare(stats, tournamentName) {
  const sorted = computeStandings(stats)
  const topText = sorted.slice(0, 5).map((p, i) =>
    `${i + 1}. ${p.name} - ${p.pts} pts`
  ).join('\n')
  const text = `\ud83c\udfc6 ${tournamentName || "Torneo Express"}\n\nClasificaci\u00f3n:\n${topText}\n\n\u00a1Sigue la acci\u00f3n con PadelRush!`

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      navigator.share({ title: tournamentName || 'Torneo Express', text })
      return
    } catch (e) { if (e.name !== 'AbortError') console.warn(e) }
  }
  navigator.clipboard?.writeText(text).catch(() => {})
}
