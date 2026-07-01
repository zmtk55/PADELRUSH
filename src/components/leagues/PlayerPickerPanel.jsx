import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Plus, LayoutGrid, List, UserPlus, Shuffle, Pencil, Trash2,
  Search, Check, Users, ArrowRight, RotateCcw
} from 'lucide-react'
import KanbanBoard from '../teams/KanbanBoard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GROUP_COLORS, GRADIENT_PALETTE } from '@/lib/theme-palette'

const gruposLetras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const groupColors = GROUP_COLORS

const getInitials = (n) => { if (!n) return '?'; return n.charAt(0).toUpperCase() }

const getAvatarColor = (seed) => {
  if (!seed) return `${GRADIENT_PALETTE[0].from} ${GRADIENT_PALETTE[0].to}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  const g = GRADIENT_PALETTE[Math.abs(hash) % GRADIENT_PALETTE.length]
  return `${g.from} ${g.to}`
}


// ========== Player Autocomplete Component ==========
function PlayerAutocomplete({ participants, value, onChange, placeholder, excludedIds }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightIdx, setHighlightIdx] = useState(0)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => { setHighlightIdx(0) }, [value])

  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !inputRef.current.contains(e.target))
        setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const filtered = useMemo(() => {
    if (!search.trim()) return participants.slice(0, 8)
    const q = search.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    return participants
      .filter(p => {
        const nameNorm = p.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        return nameNorm.includes(q) && !excludedIds?.includes(p.id)
      })
      .slice(0, 10)
  }, [participants, search, excludedIds])

  const exactMatch = participants.find(p => p.name.toLowerCase() === search.trim().toLowerCase())
  const canCreate = search.trim().length >= 2 && !exactMatch

  const selectPlayer = (p) => { onChange(p); setIsOpen(false) }
  const createPlayer = () => {
    if (!canCreate) return
    const newP = { id: 'new-' + Date.now(), name: search.trim(), isNew: true }
    onChange(newP); setIsOpen(false)
  }
  const clearSelection = () => { onChange(null); setTimeout(() => inputRef.current?.focus(), 50) }

  if (value && value.name) {
    return (
      <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 group animate-in fade-in zoom-in-95 duration-150">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br ${getAvatarColor(value.name)}`}
        >
          {getInitials(value.name)}
        </div>
        <span className="text-sm font-medium">{value.name}</span>
        {value.isNew ? (
          <span className="text-[9px] font-semibold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full">Nuevo</span>
        ) : (
          <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Existente</span>
        )}
        <button
          onClick={clearSelection}
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/10 hover:text-destructive rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setIsOpen(true); setHighlightIdx(0) }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx(i => Math.min(i + 1, Math.max(filtered.length - 1, 0))) }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIdx(i => Math.max(i - 1, 0)) }
            else if (e.key === 'Enter') {
              e.preventDefault()
              if (filtered.length > 0) { selectPlayer(filtered[highlightIdx]) }
              else if (canCreate) { createPlayer() }
            }
            else if (e.key === 'Escape') { setIsOpen(false) }
          }}
          placeholder={placeholder || "Buscar jugador..."}
          className="w-full h-10 pl-9 pr-4 bg-background border border-input rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
        >
          {filtered.length === 0 && !canCreate && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Escribe al menos 2 caracteres...
            </div>
          )}
          {filtered.map((p, i) => (
            <button
              key={p.id}
              onClick={() => selectPlayer(p)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors ${i === highlightIdx ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br ${getAvatarColor(p.name)}`}>
                {getInitials(p.name)}
              </div>
              <span>{p.name}</span>
              <Check className={`w-3.5 h-3.5 ml-auto ${i === highlightIdx ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
          {canCreate && (
            <button
              onClick={createPlayer}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm border-t border-border text-primary font-medium hover:bg-primary/5 transition-colors"
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary/10 text-primary border border-primary/30">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span>Crear nuevo: <strong>{search.trim()}</strong></span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}


// ========== Main Component ==========
export function PlayerPickerPanel({ participants, categories, teams, onTeamsChange, mode = 'full' }) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || '')
  const [viewMode, setViewMode] = useState('kanban')
  const [selectedGroup, setSelectedGroup] = useState('__none')
  const [player1, setPlayer1] = useState(null)
  const [player2, setPlayer2] = useState(null)
  const [teamName, setTeamName] = useState('')
  const [showRandomizer, setShowRandomizer] = useState(false)
  const [randomizerConfig, setRandomizerConfig] = useState({ numGroups: 2, method: 'balance' })
  const [editingTeam, setEditingTeam] = useState(null)

  const enabledGroups = useMemo(() => {
    const g = new Set(teams.filter(t => t.category === selectedCategory && t.group).map(t => t.group))
    return gruposLetras.filter(l => g.has(l))
  }, [teams, selectedCategory])

  const addTeam = () => {
    if (!player1 || !player2 || !selectedCategory) return
    const p1Name = player1.name?.trim()
    const p2Name = player2.name?.trim()
    if (!p1Name || !p2Name || p1Name === p2Name) return

    const existingInCat = teams.filter(t => t.category === selectedCategory).length
    const teamNum = existingInCat + 1
    const id = 'team-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)

    const newTeam = {
      id,
      category: selectedCategory,
      group: selectedGroup === '__none' ? null : selectedGroup,
      team_number: teamNum,
      player1_id: player1.isNew ? ('new-' + Date.now() + '-1') : player1.id,
      player2_id: player2.isNew ? ('new-' + Date.now() + '-2') : player2.id,
      player1_name: p1Name,
      player2_name: p2Name,
      team_name: teamName.trim() || ('Equipo ' + teamNum),
      player1_isNew: !!player1.isNew,
      player2_isNew: !!player2.isNew,
    }

    onTeamsChange([...teams, newTeam])
    setPlayer1(null)
    setPlayer2(null)
    setTeamName('')
  }

  const removeTeam = (teamId) => {
    onTeamsChange(teams.filter(t => t.id !== teamId))
  }

  const assignGroup = (teamId, group) => {
    onTeamsChange(teams.map(t => t.id === teamId ? { ...t, group } : t))
  }

  const moveTeam = (teamId, direction) => {
    const catTeams = teams.filter(t => t.category === teamId.split('-')[0])
    const idx = catTeams.findIndex(t => t.id === teamId)
    if (idx === -1) return
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= catTeams.length) return
    const newTeams = [...teams]
    const swapIdx = teams.findIndex(t => t.id === catTeams[newIdx].id)
    const curIdx = teams.findIndex(t => t.id === teamId)
    ;[newTeams[curIdx], newTeams[swapIdx]] = [newTeams[swapIdx], newTeams[curIdx]]
    // Re-number
    const updated = newTeams.map((t, i) => {
      const prev = newTeams.slice(0, i).filter(pt => pt.category === t.category)
      return { ...t, team_number: prev.length + 1 }
    })
    onTeamsChange(updated)
  }

  const randomizeGroups = () => {
    const { numGroups } = randomizerConfig
    const catTeams = teams.filter(t => t.category === selectedCategory && !t.group)
    if (catTeams.length === 0) return
    const shuffled = [...catTeams].sort(() => Math.random() - 0.5)
    const groupKeys = gruposLetras.slice(0, numGroups)
    const updated = teams.map(t => {
      if (t.category === selectedCategory && !t.group) {
        const idx = shuffled.indexOf(t)
        return { ...t, group: groupKeys[idx % numGroups] }
      }
      return t
    })
    onTeamsChange(updated)
    setShowRandomizer(false)
  }

  const clearAllGroups = () => {
    onTeamsChange(teams.map(t => ({ ...t, group: null })))
  }

  const getTeamStyle = (team) => {
    const colors = groupColors[team.group]
    if (!colors) return 'bg-card border-border'
    return colors.bg + ' ' + colors.border
  }

  const teamCount = teams.length
  const groupedCount = teams.filter(t => t.group).length
  const canAddTeam = player1 && player2 && selectedCategory && player1.name !== player2.name


  return (
    <div className="space-y-4">
      {/* TEAM CREATION CARD */}
      <div className="bg-gradient-to-br from-card to-muted/30 border-2 border-dashed border-primary/20 rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Crear equipo</h3>
            <p className="text-xs text-muted-foreground">
              Busca jugadores existentes o escribe para crear nuevos
            </p>
          </div>
        </div>

        {/* Category + Group selectors */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <Label className="text-xs text-muted-foreground mb-1 block">Categoría</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <Label className="text-xs text-muted-foreground mb-1 block">Grupo (opcional)</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Sin grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Sin grupo</SelectItem>
                {gruposLetras.slice(0, 4).map(g => (
                  <SelectItem key={g} value={g}>
                    <span className="flex items-center gap-2">
                      <span className={
                        'w-2.5 h-2.5 rounded-full ' +
                        (groupColors[g]?.bg?.replace('/10', '/40') || 'bg-muted')
                      } />
                      Grupo {g}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Player slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 gap-3 mb-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Jugador 1
              {player1 && (
                <span className={
                  'ml-2 text-[10px] px-1.5 py-0.5 rounded-full ' +
                  (player1.isNew
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-emerald-500/10 text-emerald-600')
                }>
                  {player1.isNew ? 'Nuevo' : 'Existente'}
                </span>
              )}
            </Label>
            <PlayerAutocomplete
              participants={participants}
              value={player1}
              onChange={setPlayer1}
              placeholder="Buscar o crear jugador..."
              excludedIds={player2 ? [player2.id] : []}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Jugador 2
              {player2 && (
                <span className={
                  'ml-2 text-[10px] px-1.5 py-0.5 rounded-full ' +
                  (player2.isNew
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-emerald-500/10 text-emerald-600')
                }>
                  {player2.isNew ? 'Nuevo' : 'Existente'}
                </span>
              )}
            </Label>
            <PlayerAutocomplete
              participants={participants}
              value={player2}
              onChange={setPlayer2}
              placeholder="Buscar o crear jugador..."
              excludedIds={player1 ? [player1.id] : []}
            />
          </div>
        </div>

        {/* Team name + Add button */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1 block">
              Nombre del equipo (opcional)
            </Label>
            <Input
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Ej: Los poderosos"
              className="h-9 text-sm"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={addTeam}
            disabled={!canAddTeam}
            className={
              'h-9 px-4 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ' +
              (canAddTeam
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                : 'bg-muted text-muted-foreground cursor-not-allowed')
            }
          >
            <Plus className="w-4 h-4" />
            Añadir
          </motion.button>
        </div>
      </div>

      {/* VIEW CONTROLS */}
      <div className="bg-card border border-border rounded-xl p-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {mode === 'full' && (
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors ' +
                    (viewMode === 'kanban'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground')
                  }
                >
                  <LayoutGrid className="w-4 h-4 inline mr-1" />
                  Kanban
                </button>
                <button
                  onClick={() => setViewMode('lista')}
                  className={
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors ' +
                    (viewMode === 'lista'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground')
                  }
                >
                  <List className="w-4 h-4 inline mr-1" />
                  Lista
                </button>
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {teamCount} equipo{teamCount !== 1 ? 's' : ''}
              {groupedCount > 0 && ` (${groupedCount} agrupados)`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'full' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRandomizer(true)}
                disabled={teams.filter(t => t.category === selectedCategory && !t.group).length < 2}
                className="h-8 text-xs"
              >
                <Shuffle className="w-3.5 h-3.5 mr-1" />
                Randomizar
              </Button>
            )}
            {enabledGroups.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllGroups}
                className="h-8 text-xs text-muted-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Limpiar grupos
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* TEAM LIST */}
      <AnimatePresence mode="wait">
        {viewMode === 'kanban' && (
          <motion.div
            key="kanban"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-x-auto overscroll-x-contain pb-2"
          >
            <KanbanBoard
              teams={teams.filter(t => t.category === selectedCategory)}
              gruposLetras={enabledGroups}
              onMoveTeam={(teamId, newGroup) => {
                onTeamsChange(teams.map(t => 
                  t.id === teamId ? { ...t, group: newGroup } : t
                ));
              }}
              onReorderTeam={(activeId, overId) => {
                const filtered = teams.filter(t => t.category === selectedCategory);
                const activeIdx = filtered.findIndex(t => t.id === activeId);
                const overIdx = filtered.findIndex(t => t.id === overId);
                if (activeIdx === -1 || overIdx === -1) return;
                const newTeams = [...teams];
                const activeTeam = newTeams.find(t => t.id === activeId);
                const overTeam = newTeams.find(t => t.id === overId);
                if (activeTeam && overTeam) {
                  const activeOriginalIdx = teams.indexOf(activeTeam);
                  const overOriginalIdx = teams.indexOf(overTeam);
                  newTeams.splice(activeOriginalIdx, 1);
                  newTeams.splice(overOriginalIdx, 0, activeTeam);
                  onTeamsChange(newTeams);
                }
              }}
            />
          </motion.div>
        )}

      {/* LIST VIEW */}
      {viewMode === 'lista' && (
        <motion.div
          key="lista"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">Equipo</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">Jugadores</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">Categoria</th>
                <th className="text-center px-4 py-3 font-medium text-xs uppercase tracking-wide">Grupo</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {teams.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="w-8 h-8 opacity-30" />
                      <p className="text-sm">Crear equipos usando el formulario de arriba</p>
                    </div>
                  </td>
                </tr>
              )}
              {teams.map((team, i) => (
                <motion.tr
                  key={team.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{team.team_number}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{team.team_name || 'Equipo ' + team.team_number}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <PlayerBadge name={team.player1_name} isNew={team.player1_isNew} />
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <PlayerBadge name={team.player2_name} isNew={team.player2_isNew} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{team.category}</td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={team.group || ''}
                      onChange={e => assignGroup(team.id, e.target.value || null)}
                      className={
                        'text-xs rounded-md border px-2 py-1 bg-transparent ' +
                        (team.group ? 'font-medium' : 'text-muted-foreground')
                      }
                      style={{
                        borderColor: team.group ? (groupColors[team.group]?.border || 'hsl(var(--border))').replace('/40', '') : undefined,
                        color: team.group ? (groupColors[team.group]?.accent || 'inherit').replace('text-', '') : undefined,
                      }}
                    >
                      <option value="">Sin grupo</option>
                      {gruposLetras.slice(0, 8).map(g => (
                        <option key={g} value={g}>Grupo {g}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingTeam(team)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeTeam(team.id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
      </AnimatePresence>


      {/* RANDOMIZER DIALOG */}
      <Dialog open={showRandomizer} onOpenChange={setShowRandomizer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shuffle className="w-5 h-5" />
              Randomizar grupos
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Número de grupos</Label>
              <Select
                value={randomizerConfig.numGroups.toString()}
                onValueChange={v => setRandomizerConfig({ ...randomizerConfig, numGroups: parseInt(v) })}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6, 7, 8].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n} grupos</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">
              <p>
                Se asignarán grupos aleatoriamente a {teams.filter(t => t.category === selectedCategory && !t.group).length} equipo
               {teams.filter(t => t.category === selectedCategory && !t.group).length !== 1 ? 's' : ''} 
                sin grupo en la categoría <strong>{selectedCategory}</strong>.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowRandomizer(false)}>
                Cancelar
              </Button>
              <Button onClick={randomizeGroups}>
                <Shuffle className="w-4 h-4 mr-1.5" />
                Randomizar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT TEAM DIALOG */}
      <Dialog open={!!editingTeam} onOpenChange={(open) => { if (!open) setEditingTeam(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Editar equipo
            </DialogTitle>
          </DialogHeader>
          {editingTeam && (
            <EditTeamDialog
              team={editingTeam}
              participants={participants}
              onSave={(updated) => {
                onTeamsChange(teams.map(t => t.id === updated.id ? updated : t))
                setEditingTeam(null)
              }}
              onClose={() => setEditingTeam(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


// ========== Player Badge Component ==========
function PlayerBadge({ name, isNew }) {
  if (!name) return null
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={
          'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ' +
          (isNew
            ? 'bg-amber-500/10 text-amber-600 border border-amber-200'
            : 'bg-primary/10 text-primary')
        }
      >
        {getInitials(name)}
      </div>
      <span className="text-sm truncate max-w-[100px]">{name}</span>
      {isNew && (
        <span className="text-[9px] font-semibold text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded-full">
          Nuevo
        </span>
      )}
    </div>
  )
}

// ========== Team Card Component ==========
function TeamCard({ team, categories, onMove, onDelete, onAssignGroup, onEdit }) {
  const colors = groupColors[team.group] || {}
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={
        'bg-background border rounded-lg p-3 hover:shadow-sm transition-all group ' +
        (colors.border || 'border-border')
      }
    >
      <div className="flex items-center gap-2.5">
        <div
          className={
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ' +
            (team.group ? colors.accent + ' ' + colors.bg : 'bg-primary/10 text-primary')
          }
        >
          {team.team_number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-xs truncate">
            {team.team_name || 'Equipo ' + team.team_number}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <PlayerBadge name={team.player1_name} isNew={team.player1_isNew} />
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <PlayerBadge name={team.player2_name} isNew={team.player2_isNew} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-border/50">
        <div className="flex-1">
          <select
            value={team.group || ''}
            onChange={e => onAssignGroup(team.id, e.target.value || null)}
            className={
              'text-[10px] w-full rounded border px-1.5 py-1 bg-transparent ' +
              (team.group ? 'font-medium' : 'text-muted-foreground')
            }
            style={{
              borderColor: team.group ? (colors.border?.replace('/40', '/20') || 'hsl(var(--border))') : undefined,
            }}
          >
            <option value="">Sin grupo</option>
            {gruposLetras.slice(0, 8).map(g => (
              <option key={g} value={g}>Grupo {g}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => onEdit(team)}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
          title="Editar"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onClick={() => onDelete(team.id)}
          className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
          title="Eliminar"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  )
}

// ========== Edit Team Dialog Component ==========
function EditTeamDialog({ team, participants, onSave, onClose }) {
  const [p1, setP1] = useState({
    id: team.player1_id,
    name: team.player1_name,
    isNew: team.player1_isNew,
  })
  const [p2, setP2] = useState({
    id: team.player2_id,
    name: team.player2_name,
    isNew: team.player2_isNew,
  })
  const [tName, setTName] = useState(team.team_name || '')

  const handleSave = () => {
    onSave({
      ...team,
      player1_name: p1.name,
      player2_name: p2.name,
      player1_id: p1.isNew ? ('new-' + Date.now() + '-1') : p1.id,
      player2_id: p2.isNew ? ('new-' + Date.now() + '-2') : p2.id,
      player1_isNew: p1.isNew,
      player2_isNew: p2.isNew,
      team_name: tName.trim() || team.team_name,
    })
  }

  return (
    <div className="space-y-4 py-4">
      <div>
        <Label className="text-sm font-medium">Nombre del equipo</Label>
        <Input
          value={tName}
          onChange={e => setTName(e.target.value)}
          className="mt-1"
          placeholder={team.team_name || 'Nombre del equipo'}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium">Jugador 1</Label>
          <PlayerAutocomplete
            participants={participants}
            value={p1}
            onChange={setP1}
            placeholder="Jugador 1..."
            excludedIds={p2 ? [p2.id] : []}
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Jugador 2</Label>
          <PlayerAutocomplete
            participants={participants}
            value={p2}
            onChange={setP2}
            placeholder="Jugador 2..."
            excludedIds={p1 ? [p1.id] : []}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} disabled={!p1 || !p2 || p1.name === p2.name}>
          <Check className="w-4 h-4 mr-1.5" />
          Guardar
        </Button>
      </div>
    </div>
  )
}
