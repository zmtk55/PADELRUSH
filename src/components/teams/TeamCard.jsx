import { motion } from 'framer-motion'
import { Edit3, Trash2 } from 'lucide-react'

export function TeamCard({ team, index, isOrganizer, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-card border border-border p-4 hover:border-border transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm shrink-0">
            {team.team_number}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{team.team_name || 'Equipo ' + team.team_number}</p>
            <p className="text-xs text-muted-foreground truncate">
              {team.player1_name || team.player1?.name || '?'} / {team.player2_name || team.player2?.name || '?'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-muted-foreground">{team.category}</span>
          {isOrganizer && (
            <>
              <button className="w-7 h-7 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                onClick={() => onEdit(team)} title="Editar equipo">
                <Edit3 className="w-3 h-3" />
              </button>
              <button className="w-7 h-7 hover:bg-red-50 text-muted-foreground hover:text-red-600 flex items-center justify-center transition-colors"
                onClick={() => onDelete(team)} title="Eliminar equipo">
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}