// Motor de horarios para PadelRush.
// Logica pura (sin React, sin Supabase) para generar, reajustar y validar
// el calendario de partidos sobre N canchas a lo largo del tiempo.
//
// Cada partido se maneja con scheduled_date ('YYYY-MM-DD') y scheduled_time ('HH:MM').
// Internamente todo se combina a un objeto Date para poder comparar y sumar minutos.

function toDateTime(date, time) {
  if (!date || !time) return null
  const dt = new Date(`${date}T${time}:00`)
  return Number.isNaN(dt.getTime()) ? null : dt
}

function fromDateTime(dt) {
  const pad = (n) => String(n).padStart(2, '0')
  const date = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
  const time = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`
  return { date, time }
}

function addMinutes(dt, minutes) {
  return new Date(dt.getTime() + minutes * 60000)
}

/**
 * Genera horarios automaticos para una lista de partidos ya armada (round robin u otro),
 * repartiendolos entre N canchas. Nunca deja a un equipo jugando dos partidos que se encimen,
 * y nunca deja dos partidos en la misma cancha al mismo tiempo.
 *
 * Estrategia: cada cancha es una "cola" independiente. Por cada partido (en orden de ronda),
 * se busca la cancha donde puede arrancar mas temprano sin chocar con la cancha misma
 * ni con el ultimo partido de cualquiera de los dos equipos.
 */
export function generateAutoSchedule({ matches, courtCount, startDate, startTime, durationMinutes = 90, restMinutes = 0 }) {
  const start = toDateTime(startDate, startTime)
  if (!start || !courtCount || courtCount < 1) return matches

  const courtFree = Array.from({ length: courtCount }, () => start)
  const teamFree = new Map() // teamId -> Date en que ese equipo vuelve a estar libre

  const ordered = [...matches].sort((a, b) => {
    const ra = parseInt(a.round, 10) || 0
    const rb = parseInt(b.round, 10) || 0
    if (ra !== rb) return ra - rb
    return (a.category || '').localeCompare(b.category || '')
  })

  const placed = ordered.map((m) => {
    const t1Free = teamFree.get(m.team1_id) || start
    const t2Free = teamFree.get(m.team2_id) || start

    let bestCourt = 0
    let bestStart = null
    for (let c = 0; c < courtCount; c++) {
      const candidate = new Date(Math.max(courtFree[c].getTime(), t1Free.getTime(), t2Free.getTime()))
      if (bestStart === null || candidate.getTime() < bestStart.getTime()) {
        bestStart = candidate
        bestCourt = c
      }
    }

    const end = addMinutes(bestStart, durationMinutes)
    courtFree[bestCourt] = end
    teamFree.set(m.team1_id, addMinutes(end, restMinutes))
    teamFree.set(m.team2_id, addMinutes(end, restMinutes))

    const { date, time } = fromDateTime(bestStart)
    return { ...m, scheduled_date: date, scheduled_time: time, court: String(bestCourt + 1) }
  })

  // Regresar en el mismo orden en que entraron, solo con los campos de horario llenos.
  const byId = new Map(placed.map((m) => [m.id, m]))
  return matches.map((m) => byId.get(m.id) || m)
}

/**
 * Detecta choques entre partidos ya programados:
 * - dos partidos en la misma cancha que se encimen en tiempo.
 * - un mismo equipo con dos partidos que se encimen en tiempo (en cualquier cancha).
 * Regresa un Map: matchId -> [{ type: 'court' | 'team', withId }]
 */
export function detectConflicts(matches, durationMinutes = 90) {
  const conflicts = new Map()

  const withTime = matches
    .filter((m) => m.scheduled_date && m.scheduled_time)
    .map((m) => {
      const startDt = toDateTime(m.scheduled_date, m.scheduled_time)
      return { ...m, _start: startDt, _end: addMinutes(startDt, durationMinutes) }
    })

  const overlap = (a, b) => a._start < b._end && b._start < a._end

  const add = (id, entry) => {
    if (!conflicts.has(id)) conflicts.set(id, [])
    conflicts.get(id).push(entry)
  }

  for (let i = 0; i < withTime.length; i++) {
    for (let j = i + 1; j < withTime.length; j++) {
      const a = withTime[i]
      const b = withTime[j]
      if (!overlap(a, b)) continue

      if (a.court && b.court && String(a.court) === String(b.court)) {
        add(a.id, { type: 'court', withId: b.id })
        add(b.id, { type: 'court', withId: a.id })
      }

      const sharesTeam = [a.team1_id, a.team2_id].some((t) => t && (t === b.team1_id || t === b.team2_id))
      if (sharesTeam) {
        add(a.id, { type: 'team', withId: b.id })
        add(b.id, { type: 'team', withId: a.id })
      }
    }
  }

  return conflicts
}

/**
 * Reajusta el calendario cuando alguien mueve manualmente un partido.
 *
 * mode:
 *  - 'push'   -> cascada: corre hacia adelante todo lo que sigue en esa misma cancha,
 *                manteniendo los huecos originales entre partidos. Esto resuelve el caso
 *                "se me retraso el de las 7, lo paso a las 9" sin tener que tocar
 *                el de las 9 y el de las 10 a mano.
 *  - 'swap'   -> intercambia este partido con el que esta ocupando el horario/cancha destino.
 *                Nada mas se mueve.
 *  - 'manual' -> solo mueve este partido. No toca nada mas (puede generar choques,
 *                que luego se ven con detectConflicts).
 */
export function cascadeReschedule({ matches, matchId, newDate, newTime, newCourt, mode = 'push' }) {
  const match = matches.find((m) => m.id === matchId)
  if (!match) return matches

  const targetCourt = newCourt != null ? String(newCourt) : match.court
  const oldStart = toDateTime(match.scheduled_date, match.scheduled_time)
  const newStart = toDateTime(newDate, newTime)

  if (mode === 'swap') {
    const occupying = matches.find(
      (m) => m.id !== matchId && String(m.court) === targetCourt && m.scheduled_date === newDate && m.scheduled_time === newTime
    )
    return matches.map((m) => {
      if (m.id === matchId) return { ...m, scheduled_date: newDate, scheduled_time: newTime, court: targetCourt }
      if (occupying && m.id === occupying.id) {
        return { ...m, scheduled_date: match.scheduled_date, scheduled_time: match.scheduled_time, court: match.court }
      }
      return m
    })
  }

  if (mode === 'manual' || !oldStart || !newStart) {
    return matches.map((m) => (m.id === matchId ? { ...m, scheduled_date: newDate, scheduled_time: newTime, court: targetCourt } : m))
  }

  // mode 'push'
  const delta = newStart.getTime() - oldStart.getTime()
  return matches.map((m) => {
    if (m.id === matchId) return { ...m, scheduled_date: newDate, scheduled_time: newTime, court: targetCourt }
    if (String(m.court) !== targetCourt || !m.scheduled_date || !m.scheduled_time) return m

    const mStart = toDateTime(m.scheduled_date, m.scheduled_time)
    if (!mStart || mStart.getTime() < oldStart.getTime()) return m // solo empuja lo que estaba despues

    const shifted = new Date(mStart.getTime() + delta)
    const { date, time } = fromDateTime(shifted)
    return { ...m, scheduled_date: date, scheduled_time: time }
  })
}

/**
 * Busca automaticamente el primer hueco valido para UN partido especifico, sin tocar
 * a los demas. Pensado como boton "autocorregir" sobre un choque puntual.
 */
export function autoFixMatch({ matches, matchId, courtCount, durationMinutes = 90, restMinutes = 0 }) {
  const match = matches.find((m) => m.id === matchId)
  if (!match || !courtCount) return matches

  const others = matches.filter((m) => m.id !== matchId && m.scheduled_date && m.scheduled_time)

  const allStarts = others.map((m) => toDateTime(m.scheduled_date, m.scheduled_time)).filter(Boolean)
  const dayStart =
    allStarts.length > 0
      ? allStarts.reduce((min, d) => (d < min ? d : min))
      : toDateTime(match.scheduled_date, match.scheduled_time) || new Date()

  const MAX_SLOTS = 60 // suficiente margen para un dia largo de torneo

  for (let slot = 0; slot < MAX_SLOTS; slot++) {
    const candidateStart = addMinutes(dayStart, slot * durationMinutes)
    const candidateEnd = addMinutes(candidateStart, durationMinutes)

    for (let c = 1; c <= courtCount; c++) {
      const courtBusy = others.some((m) => {
        if (String(m.court) !== String(c)) return false
        const mStart = toDateTime(m.scheduled_date, m.scheduled_time)
        const mEnd = addMinutes(mStart, durationMinutes)
        return candidateStart < mEnd && mStart < candidateEnd
      })
      if (courtBusy) continue

      const teamBusy = others.some((m) => {
        const sharesTeam = [m.team1_id, m.team2_id].some((t) => t && (t === match.team1_id || t === match.team2_id))
        if (!sharesTeam) return false
        const mStart = toDateTime(m.scheduled_date, m.scheduled_time)
        const mEnd = addMinutes(addMinutes(mStart, durationMinutes), restMinutes)
        return candidateStart < mEnd && mStart < candidateEnd
      })
      if (teamBusy) continue

      const { date, time } = fromDateTime(candidateStart)
      return matches.map((m) => (m.id === matchId ? { ...m, scheduled_date: date, scheduled_time: time, court: String(c) } : m))
    }
  }

  return matches // no se encontro hueco en el rango buscado
}
