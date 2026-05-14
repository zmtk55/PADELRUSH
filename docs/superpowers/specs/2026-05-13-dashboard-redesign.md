# Dashboard Redesign — PadelRush

## Objetivo
Transformar el dashboard actual en un centro de comando profesional y responsivo con gráficas, actividad en tiempo real, próximos partidos y top jugadores.

## Layout
```
┌──────────────────────────────────────────────────┐
│ DashboardHeader: saludo + selector de liga + fecha│
├───────────────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌──────┐                │
│ │Stats│ │Stats│ │Stats│ │Stats │  grid 4→2→1    │
│ └─────┘ └─────┘ └─────┘ └──────┘                │
│ ┌──────────────────────────────────────────┐     │
│ │  MatchesChart (recharts, toggle día/sem) │     │
│ ├──────────────────────┬───────────────────┤     │
│ │  UpcomingMatches     │ TopPlayers        │     │
│ │  (próximos partidos) │ (ranking puntos)  │     │
│ ├──────────────────────┴───────────────────┤     │
│ │  ActivityFeed (timeline acciones)        │     │
│ └──────────────────────────────────────────┘     │
└──────────────────────────────────────────────────┘
```

## Componentes nuevos (en `src/components/dashboard/`)

### DashboardHeader
- Saludo dinámico según hora ("Buenos días/tardes")
- Selector de liga (dropdown shadcn) — filtra todo el dashboard
- Fecha actual formateada
- Botón "Nueva liga" para organizers

### StatCard
- Props: label, value, icon, color, trend (opcional), trendValue
- Skeleton individual en loading
- Hover: subtle lift con framer-motion
- Mobile: texto más pequeño

### MatchesChart
- Gráfica de barras con recharts (BarChart)
- Toggle: "Por día" / "Por semana"
- Datos: fetch de matches agrupados por fecha
- Empty state si no hay datos
- Responsive: container se achica en mobile

### UpcomingMatches
- Lista compacta de próximos partidos (status = 'pendiente')
- Cada item: equipo local vs visitante, fecha, hora, countdown
- Si no hay: mensaje "No hay partidos programados"
- Máximo 5 items

### TopPlayers
- Mini ranking: top 5 jugadores por puntos
- Cada fila: posición, avatar (iniciales), nombre, puntos, icono de tendencia
- Datos: query a player_stats order by puntos desc
- Skeleton en carga

### ActivityFeed
- Timeline vertical de acciones recientes
- Tipos: liga creada, partido jugado, participante agregado, equipo formado
- Cada item: icono, texto, timestamp relativo ("hace 2h")
- Máximo 8 items, scroll si excede

## Hooks nuevos

### `src/hooks/useDashboard.js`
- `useDashboardData(leagueId?)` — hook único que dispara queries en paralelo
- Usa `fetch()` nativo con AbortSignal.timeout(8000) para reads
- Retorna: stats, matchesByDate, upcomingMatches, topPlayers, activity
- Estados: loading, error, data

## Estados cubiertos
- **Loading**: skeletons individuales por sección
- **Empty**: mensajes contextuales + iconos para cada sección sin datos
- **Error**: banner de error con retry button por sección (no toda la página)
- **Sin liga seleccionada**: estado informativo "Selecciona una liga para ver detalles"

## Responsive breakpoints
- `grid-cols-4` → `grid-cols-2` (md) → `grid-cols-1` (sm)
- Chart: aspect ratio 21/9 desktop, 16/9 mobile
- UpcomingMatches + TopPlayers: side-by-side en lg+, stacked en md-
- ActivityFeed: ancho completo siempre

## Motion
- StatCards: stagger children con fade-in + slide-up
- Secciones: fade-in al montar
- Hover cards: `whileHover={{ y: -2 }}` con spring
- Skeleton: pulse animation existente

## Dependencias
- recharts (ya instalado)
- framer-motion (ya instalado)
- lucide-react (ya instalado)
- @tanstack/react-query (ya instalado)

## Archivos a modificar
- `src/pages/Dashboard.jsx` — reemplazar contenido completo
- `src/hooks/useDashboard.js` — nuevo
- `src/components/dashboard/` — 6 componentes nuevos

## No tocar
- Sidebar, MobileNav, AppLayout (ya funcionan)
- Tema claro/oscuro (ya existe)
- Sistema de fetching existente en otros hooks
