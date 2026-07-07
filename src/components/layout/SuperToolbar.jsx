import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useLeagues } from '@/hooks/useLeagues'
import { useTeams } from '@/hooks/useTeams'
import { useMatches } from '@/hooks/useMatches'
import ToolbarButton from './ToolbarButton'
import { Plus, Users, Calendar, Trophy, RefreshCw, Filter, Search } from 'lucide-react'

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
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { refetch: refetchLeagues } = useLeagues()
  const { refetch: refetchTeams } = useTeams()
  const { refetch: refetchMatches } = useMatches()
  
  const [searchTerm, setSearchTerm] = useState('')

  const handleNewLeague = () => {
    if (onNewLeague) onNewLeague()
    else navigate('/ligas/nueva')
  }
  
  const handleNewTeam = () => {
    if (onNewTeam) onNewTeam()
    else if (leagueId) navigate(`/ligas/${leagueId}/equipos/nuevo`)
  }
  
  const handleNewMatch = () => {
    if (onNewMatch) onNewMatch()
    else if (leagueId) navigate(`/ligas/${leagueId}/partidos/nuevo`)
  }
  
  const handleRefresh = () => {
    if (onRefresh) onRefresh()
    else {
      refetchLeagues()
      refetchTeams()
      refetchMatches()
    }
  }
  
  const handleFilter = () => {
    if (onFilter) onFilter()
    // Would open filter dialog/pane
  }
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    if (onSearch) onSearch(e.target.value)
    // Would implement live search
  }

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
        ]
      case 'league-detail':
        return [
          { icon: Users, label: 'Agregar Equipo', onClick: handleNewTeam, isOrganizerOnly: true },
          { icon: Calendar, label: 'Programar Partido', onClick: handleNewMatch, isOrganizerOnly: true },
          { icon: Plus, label: 'Nueva Liga Similar', onClick: handleNewLeague, isOrganizerOnly: true },
          { icon: RefreshCw, label: 'Actualizar', onClick: handleRefresh },
        ]
      case 'team-detail':
        return [
          { icon: Calendar, label: 'Ver Partidos', onClick: () => navigate(`/equipos/${teamId}/partidos`) },
          { icon: RefreshCw, label: 'Actualizar', onClick: handleRefresh },
        ]
      case 'match-detail':
        return [
          { icon: RefreshCw, label: 'Actualizar', onClick: handleRefresh },
        ]
      case 'dashboard':
        return [
          { icon: Plus, label: 'Nueva Liga', onClick: handleNewLeague, isOrganizerOnly: true },
          { icon: Users, label: 'Ver Todos Equipos', onClick: () => navigate('/equipos') },
          { icon: Calendar, label: 'Ver Partidos Próximos', onClick: () => navigate('/partidos') },
          { icon: Trophy, label: 'Ver Clasificaciones', onClick: () => navigate('/clasificacion') },
          { icon: RefreshCw, label: 'Actualizar', onClick: handleRefresh },
        ]
      default: // global
        return [
          { icon: Plus, label: 'Nueva Liga', onClick: handleNewLeague, isOrganizerOnly: true },
          { icon: Users, label: 'Ver Equipos', onClick: () => navigate('/equipos') },
          { icon: Calendar, label: 'Ver Partidos', onClick: () => navigate('/partidos') },
          { icon: Trophy, label: 'Ver Clasificaciones', onClick: () => navigate('/clasificacion') },
          { icon: RefreshCw, label: 'Actualizar', onClick: handleRefresh },
        ]
    }
  }

  const actions = getDefaultActions()

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-border-subtle">
      {/* Search Input (if applicable) */}
      {actions.some(action => action.isInput) && (
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar ligas, equipos, partidos..."
            className="flex h-9 w-full  border border-input bg-background px-3 py-2 text-sm  ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-foreground/30"
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
  )
}