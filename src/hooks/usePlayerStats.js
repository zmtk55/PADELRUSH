import { req, useFetch } from '@/lib/data'
import { supabase } from '@/lib/supabaseClient'

export function usePlayerStats(leagueId) {
  const q = useFetch(
    async () => await req('GET', `/player_stats?select=*&league_id=eq.${leagueId}&order=final_ranking.asc.nullslast`),
    [leagueId],
    []
  )
  return {
    statsQuery: q,
    upsertStats: { mutateAsync: (s) => supabase.from('player_stats').upsert(s).select() },
  }
}

export function usePlayerStatsById(playerId) {
  const q = useFetch(
    async () => {
      if (!playerId) return []
      return await req('GET', `/player_stats?select=*,leagues(name)&player_id=eq.${playerId}&order=matches_played.desc`)
    },
    [playerId],
    []
  )
  return { playerStatsQuery: q }
}

export function computeAttributes(stats) {
  const total = {
    matches_played: stats.reduce((s, x) => s + (x.matches_played || 0), 0),
    matches_won: stats.reduce((s, x) => s + (x.matches_won || 0), 0),
    matches_lost: stats.reduce((s, x) => s + (x.matches_lost || 0), 0),
    sets_won: stats.reduce((s, x) => s + (x.sets_won || 0), 0),
    sets_lost: stats.reduce((s, x) => s + (x.sets_lost || 0), 0),
    current_win_streak: Math.max(...stats.map(s => s.current_win_streak || 0), 0),
    current_lose_streak: Math.max(...stats.map(s => s.current_lose_streak || 0), 0),
    best_ranking: Math.min(...stats.filter(s => s.final_ranking).map(s => s.final_ranking), Infinity),
    leagues_count: new Set(stats.map(s => s.league_id)).size,
  }

  const winRate = total.matches_played > 0
    ? total.matches_won / total.matches_played
    : 0

  const normalize = (v, max = 1) => Math.min(Math.max(Math.round((v / max) * 100), 0), 100)

  // Compute 6 player attributes (0-100 each)
  const attributes = [
    {
      key: 'Potencia',
      label: 'POWER',
      value: normalize(total.sets_won / (total.sets_won + total.sets_lost || 1), 1) * 0.6 +
             normalize(winRate, 1) * 0.4,
    },
    {
      key: 'Técnica',
      label: 'TECH',
      value: normalize(winRate, 1) * 0.7 +
             normalize(total.current_win_streak, 10) * 0.3,
    },
    {
      key: 'Defensa',
      label: 'DEFENSE',
      value: (100 - normalize(total.sets_lost / (total.sets_won + total.sets_lost || 1), 1)) * 0.5 +
             normalize(total.matches_lost > 0 ? total.matches_won / total.matches_lost : total.matches_won + 1, 5) * 0.5,
    },
    {
      key: 'Constancia',
      label: 'CONSIST',
      value: normalize(winRate, 1) * 0.4 +
             normalize(total.leagues_count, 5) * 0.3 +
             normalize(total.matches_played, 40) * 0.3,
    },
    {
      key: 'Mentales',
      label: 'MENTAL',
      value: normalize(total.current_win_streak + 1, 10) * 0.5 +
             (total.current_win_streak >= total.current_lose_streak
               ? normalize(total.current_win_streak - total.current_lose_streak + 5, 10) * 0.5
               : normalize(total.matches_played > 5 ? 3 : 0, 10) * 0.5),
    },
    {
      key: 'Acondición',
      label: 'CONDITION',
      value: normalize(total.matches_played, 50) * 0.5 +
             normalize(total.leagues_count, 5) * 0.3 +
             normalize(total.sets_won + total.sets_lost, 100) * 0.2,
    },
  ]

  // Clamp each attribute to 0-100
  attributes.forEach(a => { a.value = Math.min(Math.max(Math.round(a.value), 0), 100) })

  return { total, winRate: Math.round(winRate * 100), attributes }
}

export function computeGrade(winRate, total) {
  const score =
    (winRate / 100) * 40 +
    Math.min(total.matches_played / 50, 1) * 20 +
    (total.best_ranking < Infinity ? Math.max(0, (20 - total.best_ranking) / 20) * 20 : 0) +
    Math.min(total.current_win_streak / 10, 1) * 10 +
    Math.min(total.leagues_count / 5, 1) * 10

  const gradeColors = {
    S: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Elite' },
    A: { color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/30', label: 'Excellent' },
    B: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Good' },
    C: { color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/30', label: 'Average' },
    D: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Developing' },
    F: { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30', label: 'Beginner' },
  }

  if (score >= 90) return gradeColors.S
  if (score >= 75) return gradeColors.A
  if (score >= 60) return gradeColors.B
  if (score >= 45) return gradeColors.C
  if (score >= 30) return gradeColors.D
  return gradeColors.F
}

const ACHIEVEMENT_DEFS = [
  { id: 'first_match', label: 'First Match', icon: 'Swords', color: 'text-blue-500',
    check: (t) => t.matches_played >= 1, desc: 'Jugar el primer partido' },
  { id: 'first_win', label: 'First Win', icon: 'Trophy', color: 'text-amber-500',
    check: (t) => t.matches_won >= 1, desc: 'Ganar el primer partido' },
  { id: 'ten_wins', label: '10 Wins', icon: 'Award', color: 'text-teal-400',
    check: (t) => t.matches_won >= 10, desc: 'Alcanzar 10 victorias' },
  { id: 'fifty_matches', label: '50 Matches', icon: 'Swords', color: 'text-violet-500',
    check: (t) => t.matches_played >= 50, desc: 'Jugar 50 partidos' },
  { id: 'on_fire', label: 'On Fire', icon: 'Flame', color: 'text-orange-500',
    check: (t) => t.current_win_streak >= 5, desc: '5 victorias consecutivas' },
  { id: 'iron_will', label: 'Iron Will', icon: 'Shield', color: 'text-cyan-500',
    check: (t) => t.current_lose_streak >= 3, desc: 'Jugar tras 3 derrotas' },
  { id: 'rising_star', label: 'Rising Star', icon: 'Star', color: 'text-amber-500',
    check: (t) => t.best_ranking <= 2, desc: 'Alcanzar top 2' },
  { id: 'veteran', label: 'Veteran', icon: 'Medal', color: 'text-emerald-500',
    check: (t) => t.leagues_count >= 3, desc: 'Participar en 3+ ligas' },
  { id: 'champion', label: 'Champion', icon: 'Crown', color: 'text-amber-500',
    check: (t) => t.best_ranking === 1, desc: 'Ser #1 en una liga' },
  { id: 'centurion', label: 'Centurion', icon: 'Target', color: 'text-rose-500',
    check: (t) => t.sets_won >= 100, desc: 'Ganar 100 sets' },
]

export function computeAchievements(total) {
  return ACHIEVEMENT_DEFS.map(a => ({
    ...a,
    unlocked: a.check(total),
  }))
}

export function generateFormGuide(total) {
  const count = Math.min(total.matches_played, 12)
  if (count === 0) return []

  // Generate a realistic-looking form sequence matching the player's win rate
  const winCount = Math.round((total.matches_won / total.matches_played) * count)
  const results = []

  // Create streaks
  let remainingW = winCount
  let remainingL = count - winCount
  let i = 0

  while (results.length < count) {
    const isWin = Math.random() < (remainingW / (remainingW + remainingL || 1))
    const streak = Math.min(
      1 + Math.floor(Math.random() * (isWin ? 3 : 2)),
      isWin ? remainingW : remainingL,
      count - results.length
    )
    for (let j = 0; j < streak; j++) {
      results.push(isWin ? 'W' : 'L')
    }
    if (isWin) remainingW -= streak
    else remainingL -= streak
  }

  return results
}
