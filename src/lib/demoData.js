const demoId = () => `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const demoUser = {
  id: 'demo-user-001',
  email: 'demo@padelrush.app',
  user_metadata: { display_name: 'Organizador Demo' },
}

export const demoProfile = {
  id: 'demo-user-001',
  display_name: 'Organizador Demo',
  role: 'organizer',
  avatar_url: null,
}

const now = new Date().toISOString()

export const demoData = {
  leagues: [
    {
      id: 'demo-league-001',
      name: 'Liga de Pádel Primavera 2026',
      slug: 'liga-padel-primavera-2026',
      sport: 'padel',
      gender: 'mixto',
      season: '2026-1',
      categories: ['5TA', '4TA'],
      status: 'activa',
      color: '#c96442',
      sets_per_match: 2,
      tiebreak_enabled: true,
      organizer_id: 'demo-user-001',
      organizer_name: 'Organizador Demo',
      organizer_whatsapp: '',
      organizer_instagram: '',
      category_formats: { '5TA': 'todos-contra-todos', '4TA': 'todos-contra-todos' },
      created_at: now,
    },
    {
      id: 'demo-league-002',
      name: 'Torneo Relámpago Verano',
      slug: 'torneo-relampago-verano',
      sport: 'padel',
      gender: 'varonil',
      season: '2026-1',
      categories: ['5TA'],
      status: 'proxima',
      color: '#2563eb',
      sets_per_match: 1,
      tiebreak_enabled: true,
      organizer_id: 'demo-user-001',
      organizer_name: 'Organizador Demo',
      category_formats: { '5TA': 'eliminatoria-directa' },
      created_at: now,
    },
  ],
  participants: [
    { id: 'demo-p1', name: 'Carlos López', email: 'carlos@example.com', phone: '', photo_url: null, level: '5TA', gender: 'M' },
    { id: 'demo-p2', name: 'Ana Martínez', email: 'ana@example.com', phone: '', photo_url: null, level: '4TA', gender: 'F' },
    { id: 'demo-p3', name: 'Pedro García', email: 'pedro@example.com', phone: '', photo_url: null, level: '5TA', gender: 'M' },
    { id: 'demo-p4', name: 'Laura Sánchez', email: 'laura@example.com', phone: '', photo_url: null, level: '4TA', gender: 'F' },
    { id: 'demo-p5', name: 'Miguel Torres', email: 'miguel@example.com', phone: '', photo_url: null, level: '5TA', gender: 'M' },
    { id: 'demo-p6', name: 'Sofía Ramírez', email: 'sofia@example.com', phone: '', photo_url: null, level: '5TA', gender: 'F' },
    { id: 'demo-p7', name: 'Jorge Díaz', email: 'jorge@example.com', phone: '', photo_url: null, level: '4TA', gender: 'M' },
    { id: 'demo-p8', name: 'Elena Vargas', email: 'elena@example.com', phone: '', photo_url: null, level: '4TA', gender: 'F' },
    { id: 'demo-p9', name: 'Roberto Gómez', email: 'roberto@example.com', phone: '', photo_url: null, level: '5TA', gender: 'M' },
    { id: 'demo-p10', name: 'Javier Ruiz', email: 'javier@example.com', phone: '', photo_url: null, level: '5TA', gender: 'M' },
    { id: 'demo-p11', name: 'Fernando Castro', email: 'fernando@example.com', phone: '', photo_url: null, level: '5TA', gender: 'M' },
    { id: 'demo-p12', name: 'Andrés Lugo', email: 'andres@example.com', phone: '', photo_url: null, level: '5TA', gender: 'M' },
  ],
  teams: [
    { id: 'demo-t1', league_id: 'demo-league-001', category: '5TA', team_number: 1, player1_id: 'demo-p1', player2_id: 'demo-p3', team_name: 'Los Tigres' },
    { id: 'demo-t2', league_id: 'demo-league-001', category: '5TA', team_number: 2, player1_id: 'demo-p5', player2_id: 'demo-p6', team_name: 'Los Halcones' },
    { id: 'demo-t3', league_id: 'demo-league-001', category: '5TA', team_number: 3, player1_id: 'demo-p9', player2_id: 'demo-p10', team_name: 'Los Leones', player1_name: 'Roberto Gómez', player2_name: 'Javier Ruiz' },
    { id: 'demo-t4', league_id: 'demo-league-001', category: '5TA', team_number: 4, player1_id: 'demo-p11', player2_id: 'demo-p12', team_name: 'Los Coyotes', player1_name: 'Fernando Castro', player2_name: 'Andrés Lugo' },
    { id: 'demo-t5', league_id: 'demo-league-001', category: '4TA', team_number: 1, player1_id: 'demo-p2', player2_id: 'demo-p4', team_name: 'Las Águilas' },
    { id: 'demo-t6', league_id: 'demo-league-001', category: '4TA', team_number: 2, player1_id: 'demo-p7', player2_id: 'demo-p8', team_name: 'Los Búhos' },
  ],
  matches: [
    { id: 'demo-m1', league_id: 'demo-league-001', category: '5TA', round: '1', match_number: 1, team1_id: 'demo-t1', team2_id: 'demo-t2', team1_number: 1, team2_number: 2, team1_name: 'Los Tigres', team2_name: 'Los Halcones', status: 'programado', scheduled_date: '2026-05-20', scheduled_time: '18:00', court: 'Cancha 1' },
    { id: 'demo-m2', league_id: 'demo-league-001', category: '5TA', round: '1', match_number: 2, team1_id: 'demo-t3', team2_id: 'demo-t4', team1_number: 3, team2_number: 4, team1_name: 'Los Leones', team2_name: 'Los Coyotes', status: 'programado', scheduled_date: '2026-05-20', scheduled_time: '19:00', court: 'Cancha 2' },
    { id: 'demo-m3', league_id: 'demo-league-001', category: '5TA', round: '2', match_number: 1, team1_id: 'demo-t1', team2_id: 'demo-t3', team1_number: 1, team2_number: 3, team1_name: 'Los Tigres', team2_name: 'Los Leones', status: 'jugado', set1_team1: 6, set1_team2: 2, set2_team1: 6, set2_team2: 3, sets_won_team1: 2, sets_won_team2: 0, played_date: '2026-05-13' },
    { id: 'demo-m4', league_id: 'demo-league-001', category: '5TA', round: '2', match_number: 2, team1_id: 'demo-t2', team2_id: 'demo-t4', team1_number: 2, team2_number: 4, team1_name: 'Los Halcones', team2_name: 'Los Coyotes', status: 'jugado', set1_team1: 4, set1_team2: 6, set2_team1: 6, set2_team2: 2, set3_team1: 7, set3_team2: 5, sets_won_team1: 2, sets_won_team2: 1, played_date: '2026-05-13' },
    { id: 'demo-m5', league_id: 'demo-league-001', category: '4TA', round: '1', match_number: 1, team1_id: 'demo-t5', team2_id: 'demo-t6', team1_number: 1, team2_number: 2, team1_name: 'Las Águilas', team2_name: 'Los Búhos', status: 'jugado', set1_team1: 6, set1_team2: 1, set2_team1: 6, set2_team2: 2, sets_won_team1: 2, sets_won_team2: 0, played_date: '2026-05-14' },
  ],
  player_stats: [
    { id: 'ps1', league_id: 'demo-league-001', category: '5TA', player_name: 'Carlos López', partner_name: 'Pedro García', matches_played: 2, matches_won: 2, matches_lost: 0, sets_won: 4, sets_lost: 0, games_won: 24, games_lost: 11, win_percentage: 100 },
    { id: 'ps2', league_id: 'demo-league-001', category: '5TA', player_name: 'Pedro García', partner_name: 'Carlos López', matches_played: 2, matches_won: 2, matches_lost: 0, sets_won: 4, sets_lost: 0, games_won: 24, games_lost: 11, win_percentage: 100 },
    { id: 'ps3', league_id: 'demo-league-001', category: '5TA', player_name: 'Miguel Torres', partner_name: 'Sofía Ramírez', matches_played: 2, matches_won: 1, matches_lost: 1, sets_won: 3, sets_lost: 3, games_won: 23, games_lost: 23, win_percentage: 50 },
    { id: 'ps4', league_id: 'demo-league-001', category: '5TA', player_name: 'Sofía Ramírez', partner_name: 'Miguel Torres', matches_played: 2, matches_won: 1, matches_lost: 1, sets_won: 3, sets_lost: 3, games_won: 23, games_lost: 23, win_percentage: 50 },
    { id: 'ps5', league_id: 'demo-league-001', category: '5TA', player_name: 'Roberto Gómez', partner_name: 'Javier Ruiz', matches_played: 2, matches_won: 0, matches_lost: 2, sets_won: 0, sets_lost: 4, games_won: 11, games_lost: 24, win_percentage: 0 },
    { id: 'ps6', league_id: 'demo-league-001', category: '5TA', player_name: 'Javier Ruiz', partner_name: 'Roberto Gómez', matches_played: 2, matches_won: 0, matches_lost: 2, sets_won: 0, sets_lost: 4, games_won: 11, games_lost: 24, win_percentage: 0 },
    { id: 'ps7', league_id: 'demo-league-001', category: '4TA', player_name: 'Ana Martínez', partner_name: 'Laura Sánchez', matches_played: 1, matches_won: 1, matches_lost: 0, sets_won: 2, sets_lost: 0, games_won: 12, games_lost: 3, win_percentage: 100 },
    { id: 'ps8', league_id: 'demo-league-001', category: '4TA', player_name: 'Laura Sánchez', partner_name: 'Ana Martínez', matches_played: 1, matches_won: 1, matches_lost: 0, sets_won: 2, sets_lost: 0, games_won: 12, games_lost: 3, win_percentage: 100 },
  ],
}

export function addDemoLeague(data) {
  const league = { ...data, id: demoId(), created_at: new Date().toISOString() }
  demoData.leagues.push(league)
  return league
}

export function updateDemoLeague(id, data) {
  const idx = demoData.leagues.findIndex(l => l.id === id)
  if (idx !== -1) {
    demoData.leagues[idx] = { ...demoData.leagues[idx], ...data }
    return demoData.leagues[idx]
  }
  return null
}

export function deleteDemoLeague(id) {
  demoData.leagues = demoData.leagues.filter(l => l.id !== id)
}

export function addDemoTeams(leagueId, teams) {
  const inserted = teams.map(t => ({ ...t, id: demoId() }))
  demoData.teams.push(...inserted)
  return inserted
}
