import { motion } from 'framer-motion'
import { Users, ArrowRight, Pencil, Trash2 } from 'lucide-react'
import { PlayerBadge } from './PlayerBadge'
import { groupColors, gruposLetras } from './constants'

export function ListView({ teams, onAssignGroup, onEdit, onDelete }) {
  if (teams.length === 0) {
    return (
      <motion.div key='lista' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='bg-card border border-border rounded-xl overflow-hidden'>
        <div className='flex flex-col items-center gap-2 py-12 text-muted-foreground'><Users className='w-8 h-8 opacity-30' /><p className='text-sm'>Crear equipos usando el formulario de arriba</p></div>
      </motion.div>
    )
  }
  return (
    <motion.div key='lista' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='bg-card border border-border rounded-xl overflow-hidden'>
      <table className='w-full text-sm'>
        <thead><tr className='bg-muted/50 border-b border-border'>
          <th className='text-left px-4 py-3 font-medium text-xs uppercase tracking-wide'>#</th>
          <th className='text-left px-4 py-3 font-medium text-xs uppercase tracking-wide'>Equipo</th>
          <th className='text-left px-4 py-3 font-medium text-xs uppercase tracking-wide'>Jugadores</th>
          <th className='text-left px-4 py-3 font-medium text-xs uppercase tracking-wide'>Categoria</th>
          <th className='text-center px-4 py-3 font-medium text-xs uppercase tracking-wide'>Grupo</th>
          <th className='text-right px-4 py-3 font-medium text-xs uppercase tracking-wide'>Acciones</th>
        </tr></thead>
        <tbody>
          {teams.map((team, i) => (
            <motion.tr key={team.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }} className='border-b border-border/50 hover:bg-muted/30 transition-colors'>
              <td className='px-4 py-3 font-mono text-xs text-muted-foreground'>{team.team_number}</td>
              <td className='px-4 py-3'><span className='font-medium'>{team.team_name || 'Equipo ' + team.team_number}</span></td>
              <td className='px-4 py-3'><div className='flex items-center gap-2'><PlayerBadge name={team.player1_name} isNew={team.player1_isNew} /><ArrowRight className='w-3 h-3 text-muted-foreground' /><PlayerBadge name={team.player2_name} isNew={team.player2_isNew} /></div></td>
              <td className='px-4 py-3 text-muted-foreground text-xs'>{team.category}</td>
              <td className='px-4 py-3 text-center'>
                <select value={team.group || ''} onChange={e => onAssignGroup(team.id, e.target.value || null)}
                  className={'text-xs rounded-md border px-2 py-1 bg-transparent ' + (team.group ? 'font-medium' : 'text-muted-foreground')}
                  style={{ borderColor: team.group ? (groupColors[team.group]?.border || '#e5e7eb').replace('/40', '') : undefined, color: team.group ? (groupColors[team.group]?.accent || 'inherit').replace('text-', '') : undefined }}>
                  <option value=''>Sin grupo</option>
                  {gruposLetras.slice(0, 8).map(g => <option key={g} value={g}>Grupo {g}</option>)}
                </select>
              </td>
              <td className='px-4 py-3 text-right'><div className='flex items-center justify-end gap-1'>
                <button onClick={() => onEdit(team)} className='p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors' title='Editar'><Pencil className='w-3.5 h-3.5' /></button>
                <button onClick={() => onDelete(team.id)} className='p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors' title='Eliminar'><Trash2 className='w-3.5 h-3.5' /></button>
              </div></td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}
