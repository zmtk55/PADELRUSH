import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import { PlayerBadge } from './PlayerBadge'
import { groupColors, gruposLetras } from './constants'

export function TeamCard({ team, onMove, onDelete, onAssignGroup, onEdit }) {
  const colors = groupColors[team.group] || {}
  return (
    <motion.div
      layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className={'bg-background border rounded-lg p-3 hover:shadow-sm transition-all group ' + (colors.border || 'border-border')}
    >
      <div className='flex items-center gap-2.5'>
        <div className={'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ' + (team.group ? colors.accent + ' ' + colors.bg : 'bg-primary/10 text-primary')}>
          {team.team_number}
        </div>
        <div className='flex-1 min-w-0'>
          <p className='font-medium text-xs truncate'>{team.team_name || 'Equipo ' + team.team_number}</p>
          <div className='flex items-center gap-1 mt-0.5'><PlayerBadge name={team.player1_name} isNew={team.player1_isNew} /></div>
          <div className='flex items-center gap-1 mt-0.5'><PlayerBadge name={team.player2_name} isNew={team.player2_isNew} /></div>
        </div>
      </div>
      <div className='flex items-center gap-1 mt-2.5 pt-2 border-t border-border/50'>
        <div className='flex-1'>
          <select value={team.group || ''} onChange={e => onAssignGroup(team.id, e.target.value || null)}
            className={'text-[10px] w-full rounded border px-1.5 py-1 bg-transparent ' + (team.group ? 'font-medium' : 'text-muted-foreground')}
            style={{ borderColor: team.group ? (colors.border?.replace('/40', '/20') || '#e5e7eb') : undefined }}>
            <option value=''>Sin grupo</option>
            {gruposLetras.slice(0, 8).map(g => <option key={g} value={g}>Grupo {g}</option>)}
          </select>
        </div>
        <button onClick={() => onEdit(team)} className='p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100' title='Editar'>
          <Pencil className='w-3 h-3' />
        </button>
        <button onClick={() => onDelete(team.id)} className='p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100' title='Eliminar'>
          <Trash2 className='w-3 h-3' />
        </button>
      </div>
    </motion.div>
  )
}
