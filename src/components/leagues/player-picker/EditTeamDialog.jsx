import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlayerAutocomplete } from './PlayerAutocomplete'

export function EditTeamDialog({ team, participants, onSave, onClose }) {
  const [p1, setP1] = useState({ id: team.player1_id, name: team.player1_name, isNew: team.player1_isNew })
  const [p2, setP2] = useState({ id: team.player2_id, name: team.player2_name, isNew: team.player2_isNew })
  const [tName, setTName] = useState(team.team_name || '')
  const handleSave = () => {
    onSave({
      ...team,
      player1_name: p1.name, player2_name: p2.name,
      player1_id: p1.isNew ? ('new-' + Date.now() + '-1') : p1.id,
      player2_id: p2.isNew ? ('new-' + Date.now() + '-2') : p2.id,
      player1_isNew: p1.isNew, player2_isNew: p2.isNew,
      team_name: tName.trim() || team.team_name,
    })
  }
  return (
    <div className='space-y-4 py-4'>
      <div><Label className='text-sm font-medium'>Nombre del equipo</Label><Input value={tName} onChange={e => setTName(e.target.value)} className='mt-1' placeholder={team.team_name || 'Nombre del equipo'} /></div>
      <div className='grid grid-cols-2 gap-3'>
        <div><Label className='text-sm font-medium'>Jugador 1</Label><PlayerAutocomplete participants={participants} value={p1} onChange={setP1} placeholder='Jugador 1...' excludedIds={p2 ? [p2.id] : []} /></div>
        <div><Label className='text-sm font-medium'>Jugador 2</Label><PlayerAutocomplete participants={participants} value={p2} onChange={setP2} placeholder='Jugador 2...' excludedIds={p1 ? [p1.id] : []} /></div>
      </div>
      <div className='flex justify-end gap-2 pt-2'>
        <Button variant='outline' onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} disabled={!p1 || !p2 || p1.name === p2.name}><Check className='w-4 h-4 mr-1.5' />Guardar</Button>
      </div>
    </div>
  )
}
