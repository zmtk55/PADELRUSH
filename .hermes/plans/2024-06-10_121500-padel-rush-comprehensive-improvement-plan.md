Now, enhance the existing form components with better validation and UX:
Actually, the existing UI components are quite good. For Task 4, we'll focus on creating the quick creation components and enhancing specific workflows rather than modifying base UI components.

Let me continue with the implementation steps for Task 4:

### Step 4: Run test to verify pass
Run: `npm test src/components/leagues/QuickLeagueCreate.test.jsx -- --watchAll=false`
Expected: PASS - All tests should pass

### Step 5: Commit
```bash
git add src/components/leagues/QuickLeagueCreate.jsx src/components/teams/QuickTeamCreate.jsx src/components/matches/QuickMatchResult.jsx src/components/leagues/QuickLeagueCreate.test.jsx
git commit -m "feat: add quick creation components for improved input flow"
```

---

## Task 5: Enhance Super Toolbar

**Objective:** Create an enhanced super toolbar that provides quick access to common actions, addressing the "super toolbar" requirement.

**Files:**
- Create: `src/components/layout/SuperToolbar.jsx`
- Create: `src/components/layout/ToolbarButton.jsx`
- Modify: `src/pages/Leagues.jsx` (to use super toolbar)
- Modify: `src/pages/LeagueDetail.jsx` (to use super toolbar)
- Modify: `src/pages/Dashboard.jsx` (to use super toolbar)
- Test: `src/components/layout/SuperToolbar.test.jsx`

### Step 1: Write failing test
Create `src/components/layout/SuperToolbar.test.jsx`:
```javascript
import { render, screen } from '@testing-library/react';
import SuperToolbar from './SuperToolbar';

describe('SuperToolbar Component', () => {
  it('should display default action buttons', () => {
    render(<SuperToolbar />);
    
    expect(screen.getByRole('button', { name: /nueva liga/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear equipo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ver calendario/i })).toBeInTheDocument();
  });

  it('should show context-specific actions when provided', () => {
    render(<SuperToolbar context="league-detail" leagueId={1} />);
    
    expect(screen.getByRole('button', { name: /editar liga/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /agregar equipo/i })).toBeInTheDocument();
  });

  it('should handle button clicks and call callbacks', () => {
    const handleNewLeague = jest.fn();
    render(<SuperToolbar onNewLeague={handleNewLeague} />);
    
    screen.getByRole('button', { name: /nueva liga/i }).click();
    expect(handleNewLeague).toHaveBeenCalled();
  });
});
```

### Step 2: Run test to verify failure
Run: `npm test src/components/layout/SuperToolbar.test.jsx -- --watchAll=false`
Expected: FAIL - component doesn't exist yet

### Step 3: Write minimal implementation
Create the ToolbarButton component:
Create `src/components/layout/ToolbarButton.jsx`:
```javascript
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export default function ToolbarButton({ 
  icon, 
  label, 
  onClick, 
  variant = 'default', 
  size = 'default',
  disabled = false,
  href,
  ...props
}) {
  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={`
          inline-flex items-center gap-2 rounded-md border font-medium 
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring 
          focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none
          ${variant === 'default' ? 'border-border hover:border-primary/50' : ''}
          ${variant === 'outline' ? 'border border-hover hover:bg-muted/50' : ''}
          ${variant === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : ''}
          ${size === 'sm' ? 'h-9 px-3 text-sm' : size === 'lg' ? 'h-11 px-8 text-lg' : 'h-10 px-4'}
        `}
        {...props}
      >
        {icon && <icon className="w-4 h-4" />}
        <span>{label}</span>
        {!href && <ChevronRight className="w-3 h-3 ms-2" />}
      </a>
    );
  }

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled}
      {...props}
    >
      {icon && <icon className="mr-2 h-4 w-4" />}
      {label}
      {!href && <ChevronRight className="ml-2 h-3 w-3" />}
    </Button>
  );
}
```

Create the SuperToolbar component:
Create `src/components/layout/SuperToolbar.jsx`:
```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLeagues } from '@/hooks/useLeagues';
import { useTeams } from '@/hooks/useTeams';
import { useMatches } from '@/hooks/useMatches';
import ToolbarButton from './ToolbarButton';
import { Plus, Users, Calendar, Trophy, RefreshCw, Filter, Search } from 'lucide-react';

export default function SuperToolbar({ 
  context = 'global', 
  leagueId = null, 
  teamId = null, 
  matchId = null,
  onNewLeague,
  onNewTeam,
  onNewMatch,
  onRefresh,
  onFilter,
  onSearch
}) {
  const navigate = useNavigate();
  const { isOrganizer } = useAuth();
  const { refetch: refetchLeagues } = useLeagues();
  const { refetch: refetchTeams } = useTeams();
  const { refetch: refetchMatches } = useMatches();
  
  const [searchTerm, setSearchTerm] = useState('');

  const handleNewLeague = () => {
    if (onNewLeague) onNewLeague();
    else navigate('/ligas/nueva');
  };
  
  const handleNewTeam = () => {
    if (onNewTeam) onNewTeam();
    else if (leagueId) navigate(`/ligas/${leagueId}/equipos/nuevo`);
  };
  
  const handleNewMatch = () => {
    if (onNewMatch) onNewMatch();
    else if (leagueId) navigate(`/ligas/${leagueId}/partidos/nuevo`);
  };
  
  const handleRefresh = () => {
    if (onRefresh) onRefresh();
    else {
      refetchLeagues();
      refetchTeams();
      refetchMatches();
    }
  };
  
  const handleFilter = () => {
    if (onFilter) onFilter();
    // Would open filter dialog/pane
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (onSearch) onSearch(e.target.value);
    // Would implement live search
  };

  // Default actions based on context
  const getDefaultActions = () => {
    switch (context) {
      case 'league-list':
        return [
          { icon: Plus, label: 'Nueva Liga', onClick: handleNewLeague, isOrganizerOnly: true },
          { icon: Users, label: 'Nuevo Equipo', onClick: handleNewTeam, isOrganizerOnly: true },
          { icon: Calendar, label: 'Ver Calendario', onClick: () => navigate('/partidos') },
          { icon: RefreshCw, label: 'Actualizar', onClick: handleRefresh },
          { icon: Filter, label: 'Filtrar', onClick: handleFilter },
          { icon: Search, label: 'Buscar', onClick: handleSearch, isInput: true },
        ];
      case 'league-detail':
        return [
          { icon: Users, label: 'Agregar Equipo', onClick: handleNewTeam, isOrganizerOnly: true },
          { icon: Calendar, label: 'Programar Partido', onClick: handleNewMatch, isOrganizerOnly: true },
          { icon: Plus, label: 'Nueva Liga Similar', onClick: handleNewLeague, isOrganizerOnly: true },
          { icon: RefreshCw, label: 'Actualizar', onClick: handleRefresh },
        ];
      case 'team-detail':
        return [
          { icon: Calendar, label: 'Ver Partidos', onClick: () => navigate(`/equipos/${teamId}/partidos`) },
          { icon: RefreshCw, label: 'Actualizar', onClick: handleRefresh },
        ];
      case 'match-detail':
        return [
          { icon: RefreshCw, label: 'Actualizar', onClick: handleRefresh },
        ];
      case 'dashboard':
        return [
          { icon: Plus, label: 'Nueva Liga', onClick: handleNewLeague, isOrganizerOnly: true },
          { icon: Users, label: 'Ver Todos Equipos', onClick: () => navigate('/equipos') },
          { icon: Calendar, label: 'Ver Partidos Próximos', onClick: () => navigate('/partidos') },
          { icon: Trophy, label: 'Ver Clasificaciones', onClick: () => navigate('/clasificacion') },
          { icon: RefreshCw, label: 'Actualizar', onClick: handleRefresh },
        ];
      default: // global
        return [
          { icon: Plus, label: 'Nueva Liga', onClick: handleNewLeague, isOrganizerOnly: true },
          { icon: Users, label: 'Ver Equipos', onClick: () => navigate('/equipos') },
          { icon: Calendar, label: 'Ver Partidos', onClick: () => navigate('/partidos') },
          { icon: Trophy, label: 'Ver Clasificaciones', onClick: () => navigate('/clasificacion') },
          { icon: RefreshCw, label: 'Actualizar', onClick: handleRefresh },
        ];
    }
  };

  const actions = getDefaultActions();

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-border">
      {/* Search Input (if applicable) */}
      {actions.some(action => action.isInput) && (
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar ligas, equipos, partidos..."
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-foreground/30"
          />
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <div key={index}>
            {!action.isOrganizerOnly || isOrganizer ? (
              <ToolbarButton
                icon={action.icon}
                label={action.label}
                onClick={action.onClick}
                variant={action.variant || 'default'}
                size={action.size || 'default'}
                disabled={action.disabled}
                href={action.href}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
```

Now, modify the Leagues page to use the super toolbar:
Modify `src/pages/Leagues.jsx`:
```javascript
// Add import
import SuperToolbar from '@/components/layout/SuperToolbar';

// In the component, replace the PageHeader action with SuperToolbar:
<PageHeader
  title="Ligas"
  description={`${leagues.length} ${leagues.length === 1 ? 'liga' : 'ligas'}`}
/>
{/* Replace the action prop with SuperToolbar */}
```

Actually, let me be more specific about the implementation:

Modify `src/pages/Leagues.jsx`:
```javascript
import SuperToolbar from '@/components/layout/SuperToolbar';

// ... inside the return statement ...

return (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <PageHeader
      title="Ligas"
      description={`${filteredLeagues.length} ${filteredLeagues.length === 1 ? 'liga' : 'ligas'}`}
    />
    <SuperToolbar 
      context="league-list"
      isOrganizer={isOrganizer}
      onNewLeague={() => navigate('/ligas/nueva')}
      onRefresh={() => leaguesQuery.refetch()}
    />
    {/* Rest of the component remains the same */}
  </motion.div>
);
```

Apply similar modifications to LeagueDetail.jsx and Dashboard.jsx.

### Step 4: Run test to verify pass
Run: `npm test src/components/layout/SuperToolbar.test.jsx -- --watchAll=false`
Expected: PASS - All tests should pass

### Step 5: Commit
```bash
git add src/components/layout/SuperToolbar.jsx src/components/layout/ToolbarButton.jsx src/components/layout/SuperToolbar.test.jsx
git commit -m "feat: add super toolbar for quick access to common actions"
```

---