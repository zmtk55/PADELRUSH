# Diseño: Terminar Sección de Equipos — PadelRush

**Fecha:** 2026-06-30
**Estado:** Aprobado
**Alcance:** 4 mejoras para completar la sección de equipos

---

## Resumen Ejecutivo

Completar la sección de equipos de PadelRush con 4 mejoras:
1. Página de detalle de equipo con stats completas y historial
2. Consolidar 3 flujos de creación en PlayerPickerPanel
3. Tabla `team_stats` con actualización automática de métricas de pareja
4. Drag & drop real con @dnd-kit

---

## 1. Página de Detalle de Equipo

### Route
`/ligas/:leagueId/equipos/:teamId`

### Estructura de la página

#### Header (`TeamHeader`)
- Avatares de ambos jugadores (圆形, tamaño grande)
- Nombres de los jugadores
- Badge de categoría (ej: "5TA")
- Badge de grupo (ej: "Grupo A")
- Número de equipo
- Botón "Volver a equipos"

#### Stats de Pareja (`TeamStatsCards`)
4 cards en grid:
- **Partidos Jugados:** total de partidos como pareja
- **Partidos Ganados:** con porcentaje de victoria
- **Partidos Perdidos:** con porcentaje de derrota
- **Racha Actual:** streak positivo/negativo con indicador visual

#### Gráficas (`TeamComparison`)
- **Radar Chart:** comparar pareja vs promedio de la liga en 5 métricas (winrate, sets promedio, games ganados, etc.)
- **Línea de Tendencia:** evolución del winrate a lo largo de los partidos

#### Historial de Partidos (`TeamMatchHistory`)
Tabla con columnas:
- Fecha
- Rival (nombre del equipo contrario)
- Resultado (Ganado/Perdido)
- Score (sets)
- Link al partido (si existe detalle)

### Componentes a crear

| Componente | Archivo | Responsabilidad |
|-----------|---------|-----------------|
| TeamDetail | `src/pages/TeamDetail.jsx` | Página principal, orquesta datos |
| TeamHeader | `src/components/teams/TeamHeader.jsx` | Info del equipo + avatares |
| TeamStatsCards | `src/components/teams/TeamStatsCards.jsx` | Cards de métricas |
| TeamMatchHistory | `src/components/teams/TeamMatchHistory.jsx` | Tabla de historial |
| TeamComparison | `src/components/teams/TeamComparison.jsx` | Gráficas comparativas |

### Datos necesarios

```javascript
// Fetch principal
const { data: team } = useQuery(['team', teamId], () => 
  supabase.from('teams').select('*').eq('id', teamId).single()
);

const { data: stats } = useTeamStats(teamId);

const { data: matches } = useQuery(['teamMatches', teamId], () =>
  supabase.from('matches')
    .select('*')
    .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
    .order('match_date', { ascending: false })
);
```

### Routing update

En `src/App.jsx` agregar:
```jsx
<Route path="/ligas/:leagueId/equipos/:teamId" element={<TeamDetail />} />
```

---

## 2. Consolidar Flujos de Creación

### Problema actual
3 UIs de creación de equipos con lógica duplicada:
- `Teams.jsx` → diálogo simple (nombre + categoría + 2 jugadores)
- `Admin.jsx` → diálogo con grid de selección
- `PlayerPickerPanel.jsx` → kanban/lista + grupos + randomizer (más completo)

### Solución
Unificar en PlayerPickerPanel como UI principal.

### Cambios

#### Teams.jsx
- Eliminar diálogo de creación inline
- Botón "Crear equipo" → redirigir a `/ligas/:id/admin` (pestana equipos) o abrir PlayerPickerPanel en modal
- Mantener botones de editar/eliminar (usa diálogos existentes)

#### Admin.jsx
- Reemplazar sección de creación de equipos con PlayerPickerPanel embebido
- Mantener el resto del admin intacto

#### PlayerPickerPanel.jsx
- Agregar prop `mode: 'full' | 'compact'`
- Modo `full`: kanban + lista + grupos + randomizer (para wizard y admin)
- Modo `compact`: solo lista con selección de jugadores (para Teams.jsx modal)
- Exportar componente para uso externo

### Hook useTeams.js
Ya está consolidado — no necesita cambios.

---

## 3. Stats por Pareja (team_stats)

### Nueva tabla Supabase

```sql
CREATE TABLE team_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  matches_played INT DEFAULT 0,
  matches_won INT DEFAULT 0,
  matches_lost INT DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  current_streak INT DEFAULT 0,
  streak_type TEXT CHECK (streak_type IN ('W', 'L')),
  avg_score DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, league_id)
);

-- Índices para queries frecuentes
CREATE INDEX idx_team_stats_team ON team_stats(team_id);
CREATE INDEX idx_team_stats_league ON team_stats(league_id);
```

### Actualización automática

**Opción elegida:** Edge function o database trigger

```sql
-- Trigger function que se ejecuta al insertar/actualizar match
CREATE OR REPLACE FUNCTION update_team_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalcular stats para ambos equipos del match
  -- Actualizar team_stats para team1_id
  -- Actualizar team_stats para team2_id
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Edge function alternativa:** `supabase/functions/update-team-stats/index.ts`
- Se invoca desde el frontend después de cada resultado
- Más control, menos acoplamiento a la DB

### Hook useTeamStats.js

```javascript
export function useTeamStats(teamId) {
  return useQuery(['teamStats', teamId], async () => {
    const { data } = await supabase
      .from('team_stats')
      .select('*')
      .eq('team_id', teamId)
      .single();
    return data;
  });
}
```

### Métricas calculadas

| Métrica | Cálculo |
|---------|---------|
| matches_played | COUNT(matches WHERE team involved) |
| matches_won | COUNT(matches WHERE team won) |
| matches_lost | COUNT(matches WHERE team lost) |
| win_rate | (matches_won / matches_played) * 100 |
| current_streak | Contar victorias/derrotas consecutivas |
| avg_score | Promedio de games ganados por partido |

---

## 4. Drag & Drop con @dnd-kit

### Instalación

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Implementación en PlayerPickerPanel

#### Estructura

```jsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCorners}
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDragEnd={handleDragEnd}
>
  <div className="kanban-board">
    {grupos.map(grupo => (
      <KanbanColumn key={grupo} id={grupo}>
        <SortableContext items={equiposPorGrupo[grupo]}>
          {equiposPorGrupo[grupo].map(equipo => (
            <SortableTeamCard key={equipo.id} equipo={equipo} />
          ))}
        </SortableContext>
      </KanbanColumn>
    ))}
  </div>
</DndContext>
```

#### Componentes

| Componente | Responsabilidad |
|-----------|-----------------|
| `DndContext` | Provider global de drag & drop |
| `KanbanColumn` | Columna de grupo (droppable) |
| `SortableContext` | Contexto de ordenamiento |
| `SortableTeamCard` | Tarjeta de equipo (draggable) |
| `DragOverlay` | Preview visual mientras se arrastra |

#### Comportamiento

- **Drag entre columnas:** Cambia el `group` del equipo en Supabase
- **Drag dentro de columna:** Reordena `team_number` dentro del grupo
- **Feedback visual:** Overlay con opacidad 0.8, placeholder donde se suelta
- **Restricciones:** Solo funciona en vista kanban, requiere permisos admin

#### Sensors

```javascript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);
```

---

## 5. Resumen de Archivos

### Crear

| Archivo | Descripción |
|---------|-------------|
| `src/pages/TeamDetail.jsx` | Página de detalle de equipo |
| `src/components/teams/TeamHeader.jsx` | Header con info del equipo |
| `src/components/teams/TeamStatsCards.jsx` | Cards de métricas |
| `src/components/teams/TeamMatchHistory.jsx` | Tabla de historial |
| `src/components/teams/TeamComparison.jsx` | Gráficas comparativas |
| `src/hooks/useTeamStats.js` | Hook para stats de pareja |
| `src/components/teams/KanbanBoard.jsx` | Tablero kanban con DnD |
| `src/components/teams/SortableTeamCard.jsx` | Tarjeta arrastrable |
| `src/components/teams/KanbanColumn.jsx` | Columna de grupo |

### Modificar

| Archivo | Cambios |
|---------|---------|
| `src/App.jsx` | Nueva route para TeamDetail |
| `src/components/leagues/PlayerPickerPanel.jsx` | @dnd-kit + modo compact |
| `src/pages/Teams.jsx` | Redirigir creación a PlayerPickerPanel |
| `src/pages/Admin.jsx` | Usar PlayerPickerPanel embebido |
| `package.json` | Agregar @dnd-kit dependencies |

### Database

| Archivo | Descripción |
|---------|-------------|
| `supabase/migrations/XXXX_create_team_stats.sql` | Nueva tabla + triggers |

---

## 6. Orden de Implementación

1. **Fase 1 — Database:** Crear tabla `team_stats` + triggers
2. **Fase 2 — Stats:** Crear `useTeamStats.js` + componente `TeamStatsCards`
3. **Fase 3 — Detalle:** Crear `TeamDetail.jsx` + componentes relacionados
4. **Fase 4 — Consolidación:** Refactorizar PlayerPickerPanel, Teams.jsx, Admin.jsx
5. **Fase 5 — Drag & Drop:** Instalar @dnd-kit, implementar en PlayerPickerPanel
6. **Fase 6 — Testing:** Verificar todas las flujos, responsive, permisos

---

## 7. Criterios de Aceptación

- [ ] `/ligas/:id/equipos/:teamId` muestra detalle completo del equipo
- [ ] Stats de pareja se actualizan automáticamente al registrar resultado
- [ ] PlayerPickerPanel funciona en modo full y compact
- [ ] Teams.jsx y Admin.jsx usan PlayerPickerPanel para creación
- [ ] Drag & drop funciona en kanban (cambiar grupo + reordenar)
- [ ] Todas las migraciones de DB ejecutan sin errores
- [ ] Responsive en mobile y desktop
- [ ] Permisos: solo admins pueden crear/editar/eliminar equipos
