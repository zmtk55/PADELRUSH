# Equipos Section Completion — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the PadelRush teams section with team detail page, consolidated creation flows, pair stats, and real drag & drop.

**Architecture:** 4 independent features implemented in sequence: (1) database layer for team stats, (2) team detail page with stats/history/comparison, (3) consolidate 3 creation UIs into PlayerPickerPanel, (4) drag & drop with @dnd-kit in kanban view.

**Tech Stack:** React 18, Vite, Supabase (PostgreSQL + REST API), shadcn/ui, Tanstack React Query, Recharts, @dnd-kit, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-06-30-equipos-section-design.md`

---

## Chunk 1: Database & Stats Foundation

### Task 1: Create team_stats table migration

**Files:**
- Create: `supabase/migrations/20260630_create_team_stats.sql`

- [ ] **Step 1: Write migration SQL**

```sql
-- supabase/migrations/20260630_create_team_stats.sql

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

CREATE INDEX idx_team_stats_team ON team_stats(team_id);
CREATE INDEX idx_team_stats_league ON team_stats(league_id);

-- Function to update team stats after match result
CREATE OR REPLACE FUNCTION update_team_stats_on_match()
RETURNS TRIGGER AS $$
DECLARE
  team1_stats RECORD;
  team2_stats RECORD;
BEGIN
  -- Get or create stats for team1
  INSERT INTO team_stats (team_id, league_id) VALUES (NEW.team1_id, NEW.league_id)
  ON CONFLICT (team_id, league_id) DO NOTHING;
  
  -- Get or create stats for team2
  INSERT INTO team_stats (team_id, league_id) VALUES (NEW.team2_id, NEW.league_id)
  ON CONFLICT (team_id, league_id) DO NOTHING;

  -- Recalculate stats for team1
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE winner_team_id = NEW.team1_id) as won,
    COUNT(*) FILTER (WHERE winner_team_id = NEW.team2_id) as lost
  INTO team1_stats
  FROM matches 
  WHERE league_id = NEW.league_id 
    AND (team1_id = NEW.team1_id OR team2_id = NEW.team1_id)
    AND status = 'completed';

  UPDATE team_stats SET
    matches_played = team1_stats.total,
    matches_won = team1_stats.won,
    matches_lost = team1_stats.lost,
    win_rate = CASE WHEN team1_stats.total > 0 
      THEN ROUND((team1_stats.won::DECIMAL / team1_stats.total) * 100, 2) 
      ELSE 0 END,
    updated_at = NOW()
  WHERE team_id = NEW.team1_id AND league_id = NEW.league_id;

  -- Recalculate stats for team2
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE winner_team_id = NEW.team2_id) as won,
    COUNT(*) FILTER (WHERE winner_team_id = NEW.team1_id) as lost
  INTO team2_stats
  FROM matches 
  WHERE league_id = NEW.league_id 
    AND (team1_id = NEW.team2_id OR team2_id = NEW.team2_id)
    AND status = 'completed';

  UPDATE team_stats SET
    matches_played = team2_stats.total,
    matches_won = team2_stats.won,
    matches_lost = team2_stats.lost,
    win_rate = CASE WHEN team2_stats.total > 0 
      THEN ROUND((team2_stats.won::DECIMAL / team2_stats.total) * 100, 2) 
      ELSE 0 END,
    updated_at = NOW()
  WHERE team_id = NEW.team2_id AND league_id = NEW.league_id;

  -- Calculate current streaks for both teams
  PERFORM calculate_streak(NEW.team1_id, NEW.league_id);
  PERFORM calculate_streak(NEW.team2_id, NEW.league_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate current streak
CREATE OR REPLACE FUNCTION calculate_streak(p_team_id UUID, p_league_id UUID)
RETURNS VOID AS $$
DECLARE
  streak_count INT := 0;
  streak_char TEXT := 'W';
  match_rec RECORD;
BEGIN
  -- Get most recent completed matches for this team
  FOR match_rec IN 
    SELECT winner_team_id, match_date
    FROM matches 
    WHERE league_id = p_league_id 
      AND (team1_id = p_team_id OR team2_id = p_team_id)
      AND status = 'completed'
    ORDER BY match_date DESC
    LIMIT 50
  LOOP
    IF streak_count = 0 THEN
      -- First match determines streak type
      IF match_rec.winner_team_id = p_team_id THEN
        streak_count := 1;
        streak_char := 'W';
      ELSE
        streak_count := -1;
        streak_char := 'L';
      END IF;
    ELSIF (streak_char = 'W' AND match_rec.winner_team_id = p_team_id) THEN
      streak_count := streak_count + 1;
    ELSIF (streak_char = 'L' AND match_rec.winner_team_id != p_team_id) THEN
      streak_count := streak_count - 1;
    ELSE
      -- Streak broken
      EXIT;
    END IF;
  END LOOP;

  UPDATE team_stats SET
    current_streak = streak_count,
    streak_type = streak_char
  WHERE team_id = p_team_id AND league_id = p_league_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger on matches table
CREATE TRIGGER trigger_update_team_stats
  AFTER INSERT OR UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_team_stats_on_match();
```

- [ ] **Step 2: Verify migration syntax**

Run: `psql -f supabase/migrations/20260630_create_team_stats.sql --dry-run` or validate in Supabase SQL editor
Expected: No syntax errors

- [ ] **Step 3: Commit migration**

```bash
git add supabase/migrations/20260630_create_team_stats.sql
git commit -m "feat(db): add team_stats table with auto-update trigger"
```

---

### Task 2: Create useTeamStats hook

**Files:**
- Create: `src/hooks/useTeamStats.js`

- [ ] **Step 1: Write the hook**

```javascript
// src/hooks/useTeamStats.js
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export function useTeamStats(teamId) {
  return useQuery({
    queryKey: ['teamStats', teamId],
    queryFn: async () => {
      if (!teamId) return null;
      
      const { data, error } = await supabase
        .from('team_stats')
        .select('*')
        .eq('team_id', teamId)
        .single();
      
      if (error) {
        // If no stats exist yet, return default values
        if (error.code === 'PGRST116') {
          return {
            team_id: teamId,
            matches_played: 0,
            matches_won: 0,
            matches_lost: 0,
            win_rate: 0,
            current_streak: 0,
            streak_type: null,
            avg_score: 0,
          };
        }
        throw error;
      }
      
      return data;
    },
    enabled: !!teamId,
  });
}

export function useLeagueTeamStats(leagueId) {
  return useQuery({
    queryKey: ['leagueTeamStats', leagueId],
    queryFn: async () => {
      if (!leagueId) return [];
      
      const { data, error } = await supabase
        .from('team_stats')
        .select('*, teams!inner(id, team_name, category, player1_name, player2_name)')
        .eq('league_id', leagueId)
        .order('win_rate', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!leagueId,
  });
}
```

- [ ] **Step 2: Verify hook compiles**

Run: `npm run dev` and check console for import errors
Expected: No compilation errors

- [ ] **Step 3: Commit hook**

```bash
git add src/hooks/useTeamStats.js
git commit -m "feat(hooks): add useTeamStats and useLeagueTeamStats hooks"
```

---

## Chunk 2: Team Detail Page

### Task 3: Create TeamHeader component

**Files:**
- Create: `src/components/teams/TeamHeader.jsx`

- [ ] **Step 1: Write TeamHeader component**

```jsx
// src/components/teams/TeamHeader.jsx
import { ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const categoryColors = {
  '1RA': 'bg-red-500/20 text-red-400 border-red-500/30',
  '2DA': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  '3RA': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  '4TA': 'bg-green-500/20 text-green-400 border-green-500/30',
  '5TA': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function TeamHeader({ team, leagueName }) {
  const navigate = useNavigate();
  
  const categoryColor = categoryColors[team?.category] || 'bg-muted text-muted-foreground';

  return (
    <div className="flex items-start gap-4 mb-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="mt-1"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold">
            {team?.player1_name} & {team?.player2_name}
          </h1>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={categoryColor}>
            {team?.category}
          </Badge>
          
          {team?.group && (
            <Badge variant="outline">
              Grupo {team.group}
            </Badge>
          )}
          
          {team?.team_number && (
            <Badge variant="secondary">
              Equipo #{team.team_number}
            </Badge>
          )}
          
          {team?.team_name && (
            <span className="text-muted-foreground text-sm ml-2">
              "{team.team_name}"
            </span>
          )}
        </div>
        
        {leagueName && (
          <p className="text-sm text-muted-foreground mt-2">
            {leagueName}
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify component renders**

Run: `npm run dev` and check TeamHeader renders without errors
Expected: Component renders with team info

- [ ] **Step 3: Commit**

```bash
git add src/components/teams/TeamHeader.jsx
git commit -m "feat(teams): add TeamHeader component"
```

---

### Task 4: Create TeamStatsCards component

**Files:**
- Create: `src/components/teams/TeamStatsCards.jsx`

- [ ] **Step 1: Write TeamStatsCards component**

```jsx
// src/components/teams/TeamStatsCards.jsx
import { Trophy, Target, XCircle, Flame, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

function StatCard({ icon: Icon, title, value, subtitle, color, trend }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn('h-4 w-4', color)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 mt-1 text-xs',
            trend >= 0 ? 'text-green-500' : 'text-red-500'
          )}>
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(trend)}% vs anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TeamStatsCards({ stats }) {
  if (!stats) return null;

  const winRate = stats.win_rate || 0;
  const streakText = stats.current_streak === 0 
    ? 'Sin racha'
    : `${Math.abs(stats.current_streak)} ${stats.streak_type === 'W' ? 'ganados' : 'perdidos'}`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        icon={Target}
        title="Jugados"
        value={stats.matches_played}
        subtitle="partidos como pareja"
      />
      <StatCard
        icon={Trophy}
        title="Ganados"
        value={stats.matches_won}
        subtitle={`${winRate.toFixed(1)}% winrate`}
        color="text-green-500"
      />
      <StatCard
        icon={XCircle}
        title="Perdidos"
        value={stats.matches_lost}
        subtitle={`${(100 - winRate).toFixed(1)}% derrota`}
        color="text-red-500"
      />
      <StatCard
        icon={Flame}
        title="Racha"
        value={stats.current_streak === 0 ? '-' : Math.abs(stats.current_streak)}
        subtitle={streakText}
        color={stats.streak_type === 'W' ? 'text-orange-500' : 'text-blue-500'}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify component renders**

Run: `npm run dev` and verify TeamStatsCards displays stats
Expected: 4 stat cards render with data

- [ ] **Step 3: Commit**

```bash
git add src/components/teams/TeamStatsCards.jsx
git commit -m "feat(teams): add TeamStatsCards component"
```

---

### Task 5: Create TeamMatchHistory component

**Files:**
- Create: `src/components/teams/TeamMatchHistory.jsx`

- [ ] **Step 1: Write TeamMatchHistory component**

```jsx
// src/components/teams/TeamMatchHistory.jsx
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { cn } from '../../lib/utils';

export default function TeamMatchHistory({ matches, teamId }) {
  if (!matches || matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Partidos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No hay partidos registrados para este equipo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Partidos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Rival</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => {
              const isTeam1 = match.team1_id === teamId;
              const rival = isTeam1 ? match.team2_name : match.team1_name;
              const isWinner = match.winner_team_id === teamId;
              const score = isTeam1 
                ? `${match.team1_sets}-${match.team2_sets}`
                : `${match.team2_sets}-${match.team1_sets}`;

              return (
                <TableRow key={match.id}>
                  <TableCell className="text-muted-foreground">
                    {match.match_date 
                      ? format(new Date(match.match_date), 'dd MMM yyyy', { locale: es })
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="font-medium">
                    {rival || 'Equipo desconocido'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={isWinner ? 'default' : 'destructive'}
                      className={cn(
                        isWinner && 'bg-green-500/20 text-green-400 border-green-500/30'
                      )}
                    >
                      {isWinner ? 'Ganado' : 'Perdido'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {score}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verify component renders**

Run: `npm run dev` and verify TeamMatchHistory displays matches
Expected: Table renders with match data or empty state

- [ ] **Step 3: Commit**

```bash
git add src/components/teams/TeamMatchHistory.jsx
git commit -m "feat(teams): add TeamMatchHistory component"
```

---

### Task 6: Create TeamComparison component

**Files:**
- Create: `src/components/teams/TeamComparison.jsx`

- [ ] **Step 1: Write TeamComparison component**

```jsx
// src/components/teams/TeamComparison.jsx
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

function RadarComparison({ teamStats, leagueAvg }) {
  const data = [
    { metric: 'Winrate', team: teamStats?.win_rate || 0, promedio: leagueAvg?.win_rate || 0 },
    { metric: 'Partidos', team: Math.min((teamStats?.matches_played || 0) * 5, 100), promedio: Math.min((leagueAvg?.matches_played || 0) * 5, 100) },
    { metric: 'Racha', team: Math.min(Math.abs(teamStats?.current_streak || 0) * 10, 100), promedio: Math.min(Math.abs(leagueAvg?.current_streak || 0) * 10, 100) },
    { metric: 'Derrotas', team: 100 - (teamStats?.win_rate || 0), promedio: 100 - (leagueAvg?.win_rate || 0) },
    { metric: 'Consistencia', team: (teamStats?.matches_played || 0) > 5 ? 80 : 40, promedio: 60 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Radar name="Equipo" dataKey="team" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
        <Radar name="Promedio Liga" dataKey="promedio" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.1} />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function TrendLine({ matchHistory }) {
  if (!matchHistory || matchHistory.length === 0) return null;

  let wins = 0;
  const data = matchHistory.reverse().map((match, index) => {
    const isTeam1 = match.team1_id === match.team_id;
    const isWinner = match.winner_team_id === match.team_id;
    if (isWinner) wins++;
    
    return {
      partido: index + 1,
      winrate: ((wins / (index + 1)) * 100).toFixed(1),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="partido" tick={{ fill: 'hsl(var(--foreground))' }} />
        <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--foreground))' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="winrate" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function TeamComparison({ teamStats, leagueAvg, matchHistory, teamId }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Comparación con Liga</CardTitle>
        </CardHeader>
        <CardContent>
          <RadarComparison teamStats={teamStats} leagueAvg={leagueAvg} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evolución Winrate</CardTitle>
        </CardHeader>
        <CardContent>
          {matchHistory && matchHistory.length > 0 ? (
            <TrendLine matchHistory={matchHistory.map(m => ({ ...m, team_id: teamId }))} />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Necesitas al menos un partido para ver la tendencia
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verify charts render**

Run: `npm run dev` and verify charts display correctly
Expected: Radar chart and line chart render with data

- [ ] **Step 3: Commit**

```bash
git add src/components/teams/TeamComparison.jsx
git commit -m "feat(teams): add TeamComparison with radar and trend charts"
```

---

### Task 7: Create TeamDetail page

**Files:**
- Create: `src/pages/TeamDetail.jsx`

- [ ] **Step 1: Write TeamDetail page**

```jsx
// src/pages/TeamDetail.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useTeamStats } from '../hooks/useTeamStats';
import TeamHeader from '../components/teams/TeamHeader';
import TeamStatsCards from '../components/teams/TeamStatsCards';
import TeamMatchHistory from '../components/teams/TeamMatchHistory';
import TeamComparison from '../components/teams/TeamComparison';
import { Loader2 } from 'lucide-react';

export default function TeamDetail() {
  const { leagueId, teamId } = useParams();
  const navigate = useNavigate();

  // Fetch team data
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!teamId,
  });

  // Fetch league name
  const { data: league } = useQuery({
    queryKey: ['league', leagueId],
    queryFn: async () => {
      const { data } = await supabase
        .from('leagues')
        .select('name')
        .eq('id', leagueId)
        .single();
      return data;
    },
    enabled: !!leagueId,
  });

  // Fetch team stats
  const { data: stats, isLoading: statsLoading } = useTeamStats(teamId);

  // Fetch match history
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['teamMatches', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
        .eq('status', 'completed')
        .order('match_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!teamId,
  });

  // Fetch league average stats for comparison
  const { data: leagueAvg } = useQuery({
    queryKey: ['leagueAvgStats', leagueId],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_stats')
        .select('*')
        .eq('league_id', leagueId);
      
      if (!data || data.length === 0) return null;
      
      return {
        win_rate: data.reduce((sum, s) => sum + s.win_rate, 0) / data.length,
        matches_played: data.reduce((sum, s) => sum + s.matches_played, 0) / data.length,
        current_streak: data.reduce((sum, s) => sum + Math.abs(s.current_streak), 0) / data.length,
      };
    },
    enabled: !!leagueId,
  });

  if (teamLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Equipo no encontrado</h2>
        <p className="text-muted-foreground">
          El equipo que buscas no existe o fue eliminado.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <TeamHeader team={team} leagueName={league?.name} />
      
      <TeamStatsCards stats={stats} />
      
      <div className="mb-6">
        <TeamComparison 
          teamStats={stats} 
          leagueAvg={leagueAvg}
          matchHistory={matches}
          teamId={teamId}
        />
      </div>
      
      <TeamMatchHistory matches={matches} teamId={teamId} />
    </div>
  );
}
```

- [ ] **Step 2: Add route to App.jsx**

Find the existing teams route in `src/App.jsx` and add the detail route:

```jsx
// Find this existing route:
<Route path="/ligas/:leagueId/equipos" element={<Teams />} />

// Add this new route after it:
<Route path="/ligas/:leagueId/equipos/:teamId" element={<TeamDetail />} />
```

- [ ] **Step 3: Verify page loads**

Run: `npm run dev` and navigate to `/ligas/:id/equipos/:teamId`
Expected: Full team detail page renders with stats, charts, and match history

- [ ] **Step 4: Commit**

```bash
git add src/pages/TeamDetail.jsx src/App.jsx
git commit -m "feat(teams): add TeamDetail page with full stats and history"
```

---

## Chunk 3: Consolidate Creation Flows

### Task 8: Add compact mode to PlayerPickerPanel

**Files:**
- Modify: `src/components/leagues/PlayerPickerPanel.jsx`

- [ ] **Step 1: Add mode prop and conditional rendering**

Find the component's props and add `mode`:

```jsx
// At the top of the component function, add mode prop
export default function PlayerPickerPanel({ 
  teams, 
  setTeams, 
  participants, 
  categories, 
  gruposLetras = [], 
  onPersist,
  mode = 'full'  // Add this prop
}) {
```

Then wrap the kanban/list toggle and some advanced features in a conditional:

```jsx
// Find the view toggle buttons (kanban/list) and wrap in:
{mode === 'full' && (
  <div className="flex gap-2">
    {/* existing kanban/list toggle buttons */}
  </div>
)}
```

Also wrap the randomizer button:

```jsx
{mode === 'full' && (
  <Button onClick={randomizeTeams} variant="outline" size="sm">
    <Shuffle className="h-4 w-4 mr-2" />
    Aleatorizar
  </Button>
)}
```

- [ ] **Step 2: Verify both modes work**

Run: `npm run dev` and test:
- PlayerPickerPanel in wizard (full mode) shows all features
- Passing `mode="compact"` hides kanban toggle and randomizer

- [ ] **Step 3: Commit**

```bash
git add src/components/leagues/PlayerPickerPanel.jsx
git commit -m "feat(teams): add compact mode to PlayerPickerPanel"
```

---

### Task 9: Update Teams.jsx to use PlayerPickerPanel

**Files:**
- Modify: `src/pages/Teams.jsx`

- [ ] **Step 1: Replace creation dialog with redirect/modal**

Find the "Crear equipo" button in Teams.jsx and replace the dialog opening logic:

```jsx
// Find the button that opens the create dialog
// Change onClick to navigate to admin or open modal

// Option A: Navigate to admin
<Button onClick={() => navigate(`/ligas/${leagueId}/admin`)}>
  <Plus className="h-4 w-4 mr-2" />
  Crear equipo
</Button>

// Option B: Open PlayerPickerPanel in a modal (preferred)
const [showCreateModal, setShowCreateModal] = useState(false);

// Add modal at the end of the return:
{showCreateModal && (
  <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Crear Equipos</DialogTitle>
      </DialogHeader>
      <PlayerPickerPanel
        teams={teams}
        setTeams={setTeams}
        participants={participants}
        categories={categories}
        gruposLetras={gruposLetras}
        onPersist={handlePersist}
        mode="compact"
      />
    </DialogContent>
  </Dialog>
)}
```

- [ ] **Step 2: Remove old creation dialog code**

Remove the old Dialog/DialogContent for team creation that's no longer used.

- [ ] **Step 3: Verify Teams.jsx works**

Run: `npm run dev` and test creating a team from Teams page
Expected: Opens PlayerPickerPanel in compact mode

- [ ] **Step 4: Commit**

```bash
git add src/pages/Teams.jsx
git commit -m "feat(teams): update Teams.jsx to use PlayerPickerPanel for creation"
```

---

### Task 10: Update Admin.jsx to use PlayerPickerPanel

**Files:**
- Modify: `src/pages/Admin.jsx`

- [ ] **Step 1: Replace teams section with PlayerPickerPanel**

Find the "Equipos" tab content in Admin.jsx and replace the custom creation UI:

```jsx
// Find the teams section/tab content
// Replace the existing dialog/grid with:

<PlayerPickerPanel
  teams={teams}
  setTeams={setTeams}
  participants={participants}
  categories={categories}
  gruposLetras={gruposLetras}
  onPersist={handlePersistTeams}
  mode="full"
/>
```

- [ ] **Step 2: Remove duplicate team creation code**

Remove the old Dialog/DialogContent and grid selection UI for teams that's now redundant.

- [ ] **Step 3: Verify Admin.jsx works**

Run: `npm run dev` and test the Equipos tab in Admin
Expected: PlayerPickerPanel renders with full features

- [ ] **Step 4: Commit**

```bash
git add src/pages/Admin.jsx
git commit -m "feat(teams): update Admin.jsx to use PlayerPickerPanel"
```

---

## Chunk 4: Drag & Drop Implementation

### Task 11: Install @dnd-kit dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dependencies**

Run: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

- [ ] **Step 2: Verify installation**

Run: `npm list @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
Expected: All three packages listed with versions

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @dnd-kit dependencies"
```

---

### Task 12: Create KanbanBoard with DnD

**Files:**
- Create: `src/components/teams/KanbanBoard.jsx`
- Create: `src/components/teams/KanbanColumn.jsx`
- Create: `src/components/teams/SortableTeamCard.jsx`

- [ ] **Step 1: Write KanbanBoard component**

```jsx
// src/components/teams/KanbanBoard.jsx
import { useState } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';

export default function KanbanBoard({ 
  teams, 
  gruposLetras, 
  onMoveTeam, 
  onReorderTeam,
  readOnly = false 
}) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group teams by their group
  const teamsByGroup = {};
  gruposLetras.forEach(g => { teamsByGroup[g] = []; });
  teamsByGroup['sin-grupo'] = [];

  teams.forEach(team => {
    const group = team.group || 'sin-grupo';
    if (!teamsByGroup[group]) teamsByGroup[group] = [];
    teamsByGroup[group].push(team);
  });

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeTeam = teams.find(t => t.id === active.id);
    if (!activeTeam) return;

    // Determine target group
    let targetGroup;
    if (gruposLetras.includes(over.id)) {
      // Dropped on a column
      targetGroup = over.id;
    } else {
      // Dropped on a card, find its group
      const overTeam = teams.find(t => t.id === over.id);
      targetGroup = overTeam?.group || 'sin-grupo';
    }

    if (activeTeam.group !== targetGroup) {
      onMoveTeam(activeTeam.id, targetGroup === 'sin-grupo' ? null : targetGroup);
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTeam = teams.find(t => t.id === active.id);
    const overTeam = teams.find(t => t.id === over.id);

    if (activeTeam && overTeam && activeTeam.id !== overTeam.id) {
      onReorderTeam(activeTeam.id, overTeam.id);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {gruposLetras.map(grupo => (
          <KanbanColumn
            key={grupo}
            id={grupo}
            label={`Grupo ${grupo}`}
            teams={teamsByGroup[grupo] || []}
            activeId={activeId}
            readOnly={readOnly}
          />
        ))}
        {teamsByGroup['sin-grupo']?.length > 0 && (
          <KanbanColumn
            id="sin-grupo"
            label="Sin grupo"
            teams={teamsByGroup['sin-grupo']}
            activeId={activeId}
            readOnly={readOnly}
          />
        )}
      </div>
    </DndContext>
  );
}
```

- [ ] **Step 2: Write KanbanColumn component**

```jsx
// src/components/teams/KanbanColumn.jsx
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTeamCard from './SortableTeamCard';
import { cn } from '../../lib/utils';

export default function KanbanColumn({ id, label, teams, activeId, readOnly }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-shrink-0 w-72 bg-muted/30 rounded-lg p-3 min-h-[200px]',
        isOver && 'ring-2 ring-primary/50'
      )}
    >
      <h3 className="font-semibold text-sm mb-3 text-muted-foreground">
        {label}
        <span className="ml-2 text-xs">({teams.length})</span>
      </h3>
      
      <SortableContext items={teams.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {teams.map(team => (
            <SortableTeamCard 
              key={team.id} 
              team={team} 
              isDragging={activeId === team.id}
              readOnly={readOnly}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
```

- [ ] **Step 3: Write SortableTeamCard component**

```jsx
// src/components/teams/SortableTeamCard.jsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../ui/card';
import { GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function SortableTeamCard({ team, isDragging, readOnly }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: team.id, disabled: readOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-3 cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 ring-2 ring-primary'
      )}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        {!readOnly && (
          <button
            className="mt-1 text-muted-foreground hover:text-foreground"
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {team.player1_name} & {team.player2_name}
          </p>
          {team.team_name && (
            <p className="text-xs text-muted-foreground truncate">
              "{team.team_name}"
            </p>
          )}
          <div className="flex gap-2 mt-1">
            <span className="text-xs bg-muted px-2 py-0.5 rounded">
              {team.category}
            </span>
            {team.team_number && (
              <span className="text-xs text-muted-foreground">
                #{team.team_number}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: Integrate KanbanBoard into PlayerPickerPanel**

In `PlayerPickerPanel.jsx`, find the kanban view and replace with KanbanBoard:

```jsx
// Find the kanban view section and replace with:
{view === 'kanban' && mode === 'full' && (
  <KanbanBoard
    teams={teams}
    gruposLetras={gruposLetras}
    onMoveTeam={(teamId, newGroup) => {
      setTeams(teams.map(t => 
        t.id === teamId ? { ...t, group: newGroup } : t
      ));
    }}
    onReorderTeam={(activeId, overId) => {
      // Handle reordering logic
    }}
  />
)}
```

- [ ] **Step 5: Verify drag & drop works**

Run: `npm run dev` and test:
- Drag a team card between group columns
- Verify the group updates in the UI and persists
- Test that read-only mode prevents dragging

- [ ] **Step 6: Commit**

```bash
git add src/components/teams/KanbanBoard.jsx src/components/teams/KanbanColumn.jsx src/components/teams/SortableTeamCard.jsx src/components/leagues/PlayerPickerPanel.jsx
git commit -m "feat(teams): implement drag & drop with @dnd-kit"
```

---

## Chunk 5: Final Integration & Testing

### Task 13: Integration testing

- [ ] **Step 1: Test team detail page navigation**

Run: `npm run dev`
Navigate: Teams list → click a team → verify detail page loads
Expected: Full team detail with stats, charts, and history

- [ ] **Step 2: Test team creation flows**

Test from Teams.jsx:
1. Click "Crear equipo"
2. Verify PlayerPickerPanel opens in compact mode
3. Create a team and verify it appears in the list

Test from Admin.jsx:
1. Navigate to Admin → Equipos tab
2. Verify PlayerPickerPanel renders with full features
3. Create a team with groups and verify kanban view

- [ ] **Step 3: Test drag & drop**

1. Open PlayerPickerPanel in kanban view
2. Drag a team from one group to another
3. Verify the team's group updates
4. Refresh page and verify the change persisted

- [ ] **Step 4: Test stats update**

1. Create two teams in the same league
2. Record a match result between them
3. Navigate to team detail page
4. Verify stats (matches_played, matches_won, win_rate) updated

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(teams): complete teams section with detail page, stats, and DnD"
```

---

## Summary

| Chunk | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-2 | Database layer (team_stats table + hooks) |
| 2 | 3-7 | Team detail page (header, stats, history, comparison) |
| 3 | 8-10 | Consolidate creation flows (PlayerPickerPanel) |
| 4 | 11-12 | Drag & drop (@dnd-kit implementation) |
| 5 | 13 | Integration testing |

**Estimated Effort:** 2-3 hours for implementation

**Dependencies:**
- Supabase access for migration
- Existing shadcn/ui components
- React Query already configured
