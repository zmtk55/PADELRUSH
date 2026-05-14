export function downloadCSV(filename, headers, rows) {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        const str = String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }).join(',')
    ),
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportStandings(standings, leagueName) {
  const headers = ['#', 'Jugador', 'PJ', 'G', 'P', 'SF', 'SC', 'JF', 'JC', 'Win%']
  const rows = standings.map((s, i) => ({
    '#': i + 1,
    Jugador: s.player_name || s.name || '—',
    PJ: s.matches_played || 0,
    G: s.matches_won || 0,
    P: s.matches_lost || 0,
    SF: s.sets_won || 0,
    SC: s.sets_lost || 0,
    JF: s.games_won || 0,
    JC: s.games_lost || 0,
    'Win%': s.win_percentage != null ? `${s.win_percentage}%` : '0%',
  }))
  downloadCSV(`clasificacion-${leagueName}`, headers, rows)
}

export function exportParticipants(participants) {
  const headers = ['Nombre', 'Nivel', 'Género', 'Teléfono', 'Registro']
  const rows = participants.map((p) => ({
    Nombre: p.name || '—',
    Nivel: p.level || '—',
    Género: p.gender || '—',
    Teléfono: p.phone || '',
    Registro: p.created_at ? new Date(p.created_at).toLocaleDateString('es-MX') : '',
  }))
  downloadCSV('participantes', headers, rows)
}

export function exportMatches(matches) {
  const headers = ['Ronda', 'Equipo 1', 'Equipo 2', 'Categoría', 'Fecha', 'Hora', 'Cancha', 'Resultado', 'Estado']
  const rows = matches.map((m) => ({
    Ronda: m.round || '',
    'Equipo 1': m.team1_name || m.team1?.name || '—',
    'Equipo 2': m.team2_name || m.team2?.name || '—',
    Categoría: m.category || '',
    Fecha: m.scheduled_date || m.played_date || '',
    Hora: m.scheduled_time || '',
    Cancha: m.court || '',
    Resultado: m.sets_won_team1 != null ? `${m.sets_won_team1}-${m.sets_won_team2}` : '',
    Estado: m.status || '',
  }))
  downloadCSV('partidos', headers, rows)
}
