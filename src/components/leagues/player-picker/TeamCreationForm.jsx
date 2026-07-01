import { useState } from 'react'
import { Users, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { PlayerAutocomplete } from './PlayerAutocomplete'
import { groupColors, gruposLetras } from './constants'

export function TeamCreationForm({ participants, categories, teams, onTeamsChange, selectedCategory, setSelectedCategory }) {
  // selectedCategory & setSelectedCategory come from parent
  const [selectedGroup, setSelectedGroup] = useState('')
  const [player1, setPlayer1] = useState(null)
  const [player2, setPlayer2] = useState(null)
  const [teamName, setTeamName] = useState('')

  const canAddTeam = player1 && player2 && selectedCategory && player1.name !== player2.name

  const addTeam = () => {
    if (!player1 || !player2 || !selectedCategory) return
    const p1Name = player1.name?.trim()
    const p2Name = player2.name?.trim()
    if (!p1Name || !p2Name || p1Name === p2Name) return
    const existingInCat = teams.filter(t => t.category === selectedCategory).length
    const teamNum = existingInCat + 1
    const id = 'team-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    const newTeam = {
      id, category: selectedCategory, group: selectedGroup || null,
      team_number: teamNum,
      player1_id: player1.isNew ? ('new-' + Date.now() + '-1') : player1.id,
      player2_id: player2.isNew ? ('new-' + Date.now() + '-2') : player2.id,
      player1_name: p1Name, player2_name: p2Name,
      team_name: teamName.trim() || ('Equipo ' + teamNum),
      player1_isNew: !!player1.isNew, player2_isNew: !!player2.isNew,
    }
    onTeamsChange([...teams, newTeam])
    setPlayer1(null); setPlayer2(null); setTeamName('')
  }

  return (
    <div className='bg-gradient-to-br from-card to-muted/30 border-2 border-dashed border-primary/20 rounded-xl p-4 sm:p-5'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center'><Users className='w-5 h-5' /></div>
        <div><h3 className='font-semibold text-sm'>Crear equipo</h3><p className='text-xs text-muted-foreground'>Busca jugadores existentes o escribe para crear nuevos</p></div>
      </div>
      <div className='flex items-center gap-2 mb-4 flex-wrap'>
        <div className='flex-1 min-w-[140px]'><Label className='text-xs text-muted-foreground mb-1 block'>Categoría</Label><Select value={selectedCategory} onValueChange={setSelectedCategory}><SelectTrigger className='h-9 text-sm'><SelectValue /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
        <div className='flex-1 min-w-[120px]'><Label className='text-xs text-muted-foreground mb-1 block'>Grupo (opcional)</Label><Select value={selectedGroup} onValueChange={setSelectedGroup}><SelectTrigger className='h-9 text-sm'><SelectValue placeholder='Sin grupo' /></SelectTrigger><SelectContent><SelectItem value=''>Sin grupo</SelectItem>{gruposLetras.slice(0, 4).map(g => <SelectItem key={g} value={g}><span className='flex items-center gap-2'><span className={'w-2.5 h-2.5 rounded-full ' + (groupColors[g]?.bg?.replace('/10', '/40') || 'bg-muted')} />Grupo {g}</span></SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3'>
        <div><Label className='text-xs text-muted-foreground mb-1.5 block'>Jugador 1{player1 && <span className={'ml-2 text-[10px] px-1.5 py-0.5 rounded-full ' + (player1.isNew ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600')}>{player1.isNew ? 'Nuevo' : 'Existente'}</span>}</Label><PlayerAutocomplete participants={participants} value={player1} onChange={setPlayer1} placeholder='Buscar o crear jugador...' excludedIds={player2 ? [player2.id] : []} /></div>
        <div><Label className='text-xs text-muted-foreground mb-1.5 block'>Jugador 2{player2 && <span className={'ml-2 text-[10px] px-1.5 py-0.5 rounded-full ' + (player2.isNew ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600')}>{player2.isNew ? 'Nuevo' : 'Existente'}</span>}</Label><PlayerAutocomplete participants={participants} value={player2} onChange={setPlayer2} placeholder='Buscar o crear jugador...' excludedIds={player1 ? [player1.id] : []} /></div>
        <div><Label className='text-xs text-muted-foreground mb-1 block'>Nombre del equipo (opcional)</Label><Input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder='Ej: Los poderosos' className='h-9 text-sm' /></div>
      </div>
      <div className='flex justify-end'>
        <motion.button whileTap={{ scale: 0.95 }} onClick={addTeam} disabled={!canAddTeam}
          className={'h-9 px-4 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ' + (canAddTeam ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm' : 'bg-muted text-muted-foreground cursor-not-allowed')}>
          <Plus className='w-4 h-4' /> Añadir
        </motion.button>
      </div>
    </div>
  )
}
