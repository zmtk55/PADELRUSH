import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, LayoutGrid, List, UserPlus, Shuffle, Pencil, Trash2, Filter, SlidersHorizontal, Grid3X3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const gruposLetras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const groupColors = {
  A: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', accent: 'text-amber-600' },
  B: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', accent: 'text-blue-600' },
  C: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', accent: 'text-emerald-600' },
  D: { bg: 'bg-purple-500/10', border: 'border-purple-500/40', accent: 'text-purple-600' },
  E: { bg: 'bg-rose-500/10', border: 'border-rose-500/40', accent: 'text-rose-600' },
  F: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', accent: 'text-cyan-600' },
  G: { bg: 'bg-orange-500/10', border: 'border-orange-500/40', accent: 'text-orange-600' },
  H: { bg: 'bg-pink-500/10', border: 'border-pink-500/40', accent: 'text-pink-600' },
}

export function PlayerPickerPanel({ participants, categories, teams, onTeamsChange }) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || '')
  const [viewMode, setViewMode] = useState('kanban')
  const [selectedGroup, setSelectedGroup] = useState('')
  
  const [mode, setMode] = useState('input')
  const [inputNames, setInputNames] = useState({ player1: '', player2: '', teamName: '' })
  const [selectedPlayer1, setSelectedPlayer1] = useState('')
  const [selectedPlayer2, setSelectedPlayer2] = useState('')
  
  const [showRandomizer, setShowRandomizer] = useState(false)
  const [randomizerConfig, setRandomizerConfig] = useState({ numGroups: 2, method: 'balance' })
  const [editingTeam, setEditingTeam] = useState(null)
  const [editTeamName, setEditTeamName] = useState('')
  
  const [enabledGroups, setEnabledGroups] = useState(['A', 'B'])
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterGroup, setFilterGroup] = useState('all')

  const availablePlayers = participants.filter(p =>
    !teams.some(t => t.player1_id === p.id || t.player2_id === p.id)
  )

  const teamsByCategory = categories.map(cat => ({
    category: cat,
    teams: teams.filter(t => t.category === cat)
  }))

  const teamsWithoutGroup = teams.filter(t => !t.group)
  const usedGroups = [...new Set(teams.filter(t => t.group).map(t => t.group))]

  const toggleGroup = (g) => {
    if (enabledGroups.includes(g)) {
      if (enabledGroups.length > 1) {
        setEnabledGroups(enabledGroups.filter(x => x !== g))
      }
    } else {
      setEnabledGroups([...enabledGroups, g].sort((a, b) => gruposLetras.indexOf(a) - gruposLetras.indexOf(b)))
    }
  }

  const filteredTeams = useMemo(() => {
    let filtered = teams
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory)
    }
    if (filterGroup !== 'all') {
      filtered = filtered.filter(t => t.group === filterGroup)
    }
    return filtered
  }, [teams, filterCategory, filterGroup])

  const teamsWithoutGroupFiltered = filteredTeams.filter(t => !t.group)
  const teamsByGroupFiltered = enabledGroups.map(g => ({
    group: g,
    teams: filteredTeams.filter(t => t.group === g)
  }))

  const addTeamQuick = () => {
    const p1 = inputNames.player1.trim()
    const p2 = inputNames.player2.trim()
    if (!p1 || !p2 || p1 === p2) return

    const existingInCat = teams.filter(t => t.category === selectedCategory).length
    const teamNum = existingInCat + 1
    const newTeam = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: selectedCategory,
      group: selectedGroup || null,
      team_number: teamNum,
      player1_id: `temp-${Date.now()}-1`,
      player2_id: `temp-${Date.now()}-2`,
      player1_name: p1,
      player2_name: p2,
      team_name: inputNames.teamName.trim() || `Equipo ${teamNum}`,
      player1_photo: null,
      player2_photo: null,
    }
    onTeamsChange([...teams, newTeam])
    setInputNames({ player1: '', player2: '', teamName: '' })
  }

  const addTeamFromList = () => {
    if (!selectedPlayer1 || !selectedPlayer2 || selectedPlayer1 === selectedPlayer2) return
    if (!selectedCategory) return

    const p1 = participants.find(p => p.id === selectedPlayer1)
    const p2 = participants.find(p => p.id === selectedPlayer2)
    if (!p1 || !p2) return

    const existingInCat = teams.filter(t => t.category === selectedCategory).length
    const newTeam = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: selectedCategory,
      group: selectedGroup || null,
      team_number: existingInCat + 1,
      player1_id: p1.id,
      player2_id: p2.id,
      player1_name: p1.name,
      player2_name: p2.name,
      player1_photo: p1.photo_url,
      player2_photo: p2.photo_url,
      team_name: `Equipo ${existingInCat + 1}`,
    }
    onTeamsChange([...teams, newTeam])
    setSelectedPlayer1('')
    setSelectedPlayer2('')
  }

  const removeTeam = (teamId) => {
    onTeamsChange(teams.filter(t => t.id !== teamId))
  }

  const assignGroup = (teamId, group) => {
    onTeamsChange(teams.map(t => t.id === teamId ? { ...t, group: group || null } : t))
  }

  const moveTeam = (teamId, newCategory) => {
    const teamToMove = teams.find(t => t.id === teamId)
    if (!teamToMove) return
    const oldCatTeams = teams.filter(t => t.category === teamToMove.category && t.id !== teamId)
    const newCatTeams = teams.filter(t => t.category === newCategory && t.id !== teamId)
    onTeamsChange(teams.map(t => {
      if (t.id === teamId) return { ...t, category: newCategory, team_number: newCatTeams.length + 1 }
      if (t.category === teamToMove.category) return { ...t, team_number: oldCatTeams.findIndex(x => x.id === t.id) + 1 }
      if (t.category === newCategory) return { ...t, team_number: newCatTeams.findIndex(x => x.id === t.id) + 1 }
      return t
    }))
  }

  const updateTeamName = (teamId, newName) => {
    onTeamsChange(teams.map(t => t.id === teamId ? { ...t, team_name: newName } : t))
    setEditingTeam(null)
  }

  const randomizeGroups = () => {
    const ungrouped = teams.filter(t => !t.group)
    if (ungrouped.length === 0) return

    const numGroups = Math.min(randomizerConfig.numGroups, enabledGroups.length)
    const shuffled = [...ungrouped].sort(() => Math.random() - 0.5)
    
    let groups = {}
    enabledGroups.slice(0, numGroups).forEach(g => groups[g] = [])

    if (randomizerConfig.method === 'balance') {
      const perGroup = Math.ceil(ungrouped.length / numGroups)
      let currentGroup = 0
      shuffled.forEach((team, idx) => {
        if (idx > 0 && idx % perGroup === 0 && currentGroup < numGroups - 1) currentGroup++
        groups[enabledGroups[currentGroup]].push(team)
      })
    } else {
      shuffled.forEach((team, idx) => {
        groups[enabledGroups[idx % numGroups]].push(team)
      })
    }

    const updated = teams.map(t => {
      if (!t.group) {
        for (const g of enabledGroups) {
          if (groups[g]?.find(x => x.id === t.id)) {
            return { ...t, group: g }
          }
        }
      }
      return t
    })
    onTeamsChange(updated)
    setShowRandomizer(false)
  }

  const clearAllGroups = () => {
    onTeamsChange(teams.map(t => ({ ...t, group: null })))
  }

  const getGroupStyle = (group) => groupColors[group] || { bg: 'bg-muted', border: 'border-border', accent: 'text-muted-foreground' }

  const teamCount = teams.length
  const groupedCount = teams.filter(t => t.group).length

  return (
    <div className="space-y-4">
      <div className="bg-card border-2 border-dashed border-border rounded-xl p-3">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-24 h-9"><SelectValue placeholder="Cat" /></SelectTrigger>
            <SelectContent>
              {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedGroup || 'none'} onValueChange={v => setSelectedGroup(v === 'none' ? '' : v)}>
            <SelectTrigger className="w-20 h-9"><SelectValue placeholder="Grp" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-</SelectItem>
              {enabledGroups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>

          <button onClick={() => setMode(mode === 'input' ? 'select' : 'input')} 
            className="ml-auto text-xs text-primary hover:underline font-medium">
            {mode === 'input' ? '¿Usar lista?' : '¿Crear nuevos?'}
          </button>
        </div>

        {mode === 'input' ? (
          <div className="flex gap-2 items-end">
            <Input 
              value={inputNames.player1} 
              onChange={e => setInputNames({...inputNames, player1: e.target.value})}
              placeholder="Jugador 1" 
              className="h-9 flex-1"
            />
            <Input 
              value={inputNames.player2} 
              onChange={e => setInputNames({...inputNames, player2: e.target.value})}
              placeholder="Jugador 2" 
              className="h-9 flex-1"
            />
            <Input 
              value={inputNames.teamName} 
              onChange={e => setInputNames({...inputNames, teamName: e.target.value})}
              placeholder="Equipo (opc)" 
              className="h-9 w-32"
            />
            <Button 
              onClick={addTeamQuick} 
              disabled={!inputNames.player1.trim() || !inputNames.player2.trim()} 
              className="h-9 px-4"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 items-end">
            <Select value={selectedPlayer1} onValueChange={setSelectedPlayer1}>
              <SelectTrigger className="h-9 flex-1"><SelectValue placeholder="J1" /></SelectTrigger>
              <SelectContent>
                {availablePlayers.length === 0 && <p className="p-2 text-xs text-muted-foreground">Sin datos</p>}
                {availablePlayers.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPlayer2} onValueChange={setSelectedPlayer2}>
              <SelectTrigger className="h-9 flex-1"><SelectValue placeholder="J2" /></SelectTrigger>
              <SelectContent>
                {availablePlayers.filter(p => p.id !== selectedPlayer1).length === 0 && <p className="p-2 text-xs text-muted-foreground">Sin datos</p>}
                {availablePlayers.filter(p => p.id !== selectedPlayer1).map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={addTeamFromList} 
              disabled={!selectedPlayer1 || !selectedPlayer2} 
              className="h-9 px-4"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-4 h-4 inline mr-1" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode('lista')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'lista' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="w-4 h-4 inline mr-1" />
                Lista
              </button>
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-28 h-9"><Filter className="w-4 h-4 mr-1 inline" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorías</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterGroup} onValueChange={setFilterGroup}>
              <SelectTrigger className="w-28 h-9"><SlidersHorizontal className="w-4 h-4 mr-1 inline" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos grupos</SelectItem>
                <SelectItem value="none">Sin grupo</SelectItem>
                {enabledGroups.map(g => <SelectItem key={g} value={g}>Grupo {g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {teamCount} equipos · {groupedCount} asignados
            </span>
            {teamCount > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowRandomizer(true)}>
                  <Shuffle className="w-4 h-4 mr-1" />
                  Randomizar
                </Button>
                {groupedCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllGroups}>
                    Limpiar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-xs text-muted-foreground mr-2">Grupos:</Label>
            {gruposLetras.map(g => (
              <button
                key={g}
                onClick={() => toggleGroup(g)}
                className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                  enabledGroups.includes(g)
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-muted/50 border-transparent text-muted-foreground/50'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'kanban' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="grid gap-3"
            style={{
              gridTemplateColumns: `minmax(200px, 1fr)`.repeat(enabledGroups.length + 1)
            }}
          >
            <div className="min-w-[200px]">
              <div className="bg-muted/40 border-2 border-dashed border-border rounded-lg p-2">
                <h3 className="font-bold text-xs uppercase text-muted-foreground mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  Sin grupo
                  <span className="ml-auto bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[10px]">
                    {teamsWithoutGroupFiltered.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {teamsWithoutGroupFiltered.map((team) => (
                    <TeamCard 
                      key={team.id} 
                      team={team} 
                      categories={categories} 
                      onMove={moveTeam} 
                      onDelete={removeTeam} 
                      onAssignGroup={assignGroup}
                      onEdit={(t) => { setEditingTeam(t); setEditTeamName(t.team_name) }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {teamsByGroupFiltered.map(({ group, teams: gTeams }) => {
              const colors = getGroupStyle(group)
              return (
                <div key={group} className="min-w-[200px]">
                  <div className={`rounded-lg border-2 p-2 ${colors.border} ${colors.bg}`}>
                    <h3 className={`font-bold text-xs uppercase mb-2 flex items-center gap-2 ${colors.accent}`}>
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {group}
                      <span className="ml-auto bg-background/60 px-1.5 py-0.5 rounded text-[10px]">
                        {gTeams.length}
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {gTeams.map(team => (
                        <TeamCard 
                          key={team.id} 
                          team={team} 
                          categories={categories} 
                          onMove={moveTeam} 
                          onDelete={removeTeam} 
                          onAssignGroup={assignGroup}
                          onEdit={(t) => { setEditingTeam(t); setEditTeamName(t.team_name) }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {viewMode === 'lista' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">Equipo</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">Jugadores</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">Categoría</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">Grupo</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map(team => (
                <tr key={team.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-bold">{team.team_number}</td>
                  <td className="px-4 py-3 font-medium">{team.team_name || `Equipo ${team.team_number}`}</td>
                  <td className="px-4 py-3 text-muted-foreground">{team.player1_name} / {team.player2_name}</td>
                  <td className="px-4 py-3"><span className="bg-muted px-2 py-0.5 rounded text-xs">{team.category}</span></td>
                  <td className="px-4 py-3">
                    {team.group ? (
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{team.group}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingTeam(team); setEditTeamName(team.team_name) }}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeTeam(team.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTeams.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No hay equipos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {teams.length === 0 && (
        <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed border-border">
          <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Agrega equipos con el formulario de arriba</p>
        </div>
      )}

      <Dialog open={showRandomizer} onOpenChange={setShowRandomizer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shuffle className="w-5 h-5" />
              Randomizar Grupos
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Número de grupos</Label>
              <Select 
                value={randomizerConfig.numGroups.toString()} 
                onValueChange={v => setRandomizerConfig({...randomizerConfig, numGroups: parseInt(v)})}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2,3,4,5,6,7,8].map(n => (
                    <SelectItem key={n} value={n.toString()} disabled={n > enabledGroups.length}>{n} grupos</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Método</Label>
              <Select 
                value={randomizerConfig.method} 
                onValueChange={v => setRandomizerConfig({...randomizerConfig, method: v})}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="balance">Equilibrado</SelectItem>
                  <SelectItem value="random">Aleatorio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="text-muted-foreground">
                <strong>{teamsWithoutGroup.length}</strong> equipos → <strong>{Math.min(randomizerConfig.numGroups, enabledGroups.length || 1)}</strong> grupos
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowRandomizer(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={randomizeGroups} className="flex-1" disabled={teamsWithoutGroup.length === 0}>
              <Shuffle className="w-4 h-4 mr-2" />
              Randomizar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTeam} onOpenChange={o => !o && setEditingTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Equipo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Nombre del equipo</Label>
              <Input 
                value={editTeamName} 
                onChange={e => setEditTeamName(e.target.value)}
                placeholder="Nombre equipo"
                className="mt-1"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Jugador 1:</strong> {editingTeam?.player1_name}</p>
              <p><strong>Jugador 2:</strong> {editingTeam?.player2_name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditingTeam(null)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={() => updateTeamName(editingTeam.id, editTeamName)} className="flex-1">
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TeamCard({ team, categories, onMove, onDelete, onAssignGroup, onEdit }) {
  const colors = groupColors[team.group] || {}
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-background border rounded-lg p-3 ${colors.border || 'border-border'}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
          {team.team_number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{team.team_name || `Equipo ${team.team_number}`}</p>
          <p className="text-xs text-muted-foreground truncate">
            {team.player1_name} / {team.player2_name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
        <Select value={team.category} onValueChange={v => onMove(team.id, v)}>
          <SelectTrigger className="h-6 text-xs flex-1 py-0"><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={team.group || 'none'} onValueChange={v => onAssignGroup(team.id, v === 'none' ? '' : v)}>
          <SelectTrigger className="h-6 text-xs w-14 py-0"><SelectValue placeholder="-" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-</SelectItem>
            {gruposLetras.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(team)}>
          <Pencil className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => onDelete(team.id)}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  )
}