export const demoData = {
  leagues: [
    { id: 'demo-1', name: 'Liga Padel Yucatán 2026', slug: 'liga-padel-yucatan-2026', sport: 'padel', gender: 'mixto', season: '2026-1', status: 'activa', color: '#c96442', categories: ['4TA', '5TA'], created_at: '2026-01-15' },
    { id: 'demo-2', name: 'Copa Primavera', slug: 'copa-primavera', sport: 'padel', gender: 'femenil', season: '2026-1', status: 'proxima', color: '#059669', categories: ['5TA'], created_at: '2026-02-01' },
  ],
  participants: [
    { id: 'p1', name: 'Ana García', level: '5TA', gender: 'femenil' },
    { id: 'p2', name: 'María López', level: '5TA', gender: 'femenil' },
    { id: 'p3', name: 'Sofia Hernández', level: '4TA', gender: 'femenil' },
    { id: 'p4', name: 'Laura Martínez', level: '4TA', gender: 'femenil' },
    { id: 'p5', name: 'Roberto Sánchez', level: '5TA', gender: 'varonil' },
    { id: 'p6', name: 'Carlos Mendoza', level: '5TA', gender: 'varonil' },
    { id: 'p7', name: 'Alejandro Vega', level: '4TA', gender: 'varonil' },
    { id: 'p8', name: 'Diego Castillo', level: '4TA', gender: 'varonil' },
  ],
  teams: [
    { id: 't1', league_id: 'demo-1', category: '5TA', team_number: 1, player1_id: 'p1', player2_id: 'p2', team_name: 'Equipo 1' },
    { id: 't2', league_id: 'demo-1', category: '5TA', team_number: 2, player1_id: 'p5', player2_id: 'p6', team_name: 'Equipo 2' },
    { id: 't3', league_id: 'demo-1', category: '4TA', team_number: 3, player1_id: 'p3', player2_id: 'p4', team_name: 'Equipo 3' },
    { id: 't4', league_id: 'demo-1', category: '4TA', team_number: 4, player1_id: 'p7', player2_id: 'p8', team_name: 'Equipo 4' },
  ],
  matches: [
    { id: 'm1', league_id: 'demo-1', category: '5TA', team1_id: 't1', team2_id: 't2', status: 'jugado', set1_team1: 6, set1_team2: 3, set2_team1: 4, set2_team2: 6, set3_team1: 7, set3_team2: 5, sets_won_team1: 2, sets_won_team2: 1, played_at: '2026-01-20' },
    { id: 'm2', league_id: 'demo-1', category: '4TA', team1_id: 't3', team2_id: 't4', status: 'jugado', set1_team1: 6, set1_team2: 2, set2_team1: 6, set2_team2: 3, sets_won_team1: 2, sets_won_team2: 0, played_at: '2026-01-20' },
    { id: 'm3', league_id: 'demo-1', category: '5TA', team1_id: 't1', team2_id: 't2', status: 'programado', scheduled_date: '2026-02-15', scheduled_time: '18:00' },
  ],
}

export const isDemoMode = (data) => {
  return !data || data.length === 0
}