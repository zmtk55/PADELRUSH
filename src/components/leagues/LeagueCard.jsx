import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Trophy, Edit, Trash2, ChevronRight } from 'lucide-react'

export default function LeagueCard({ league, onDelete, onEdit }) {
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const leagueName = league?.name || ''
  const leagueId = league?.id

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta liga?')) return
    try { await onDelete(leagueId) }
    catch (err) { console.error('Error deleting league:', err) }
  }

  const handleEdit = () => {
    if (onEdit) onEdit(leagueId)
    else navigate(`/ligas/${leagueId}/editar`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => leagueId && navigate(`/ligas/${leagueId}`)}
      className="card-highlight"
      style={{ borderLeft: '3px solid hsl(var(--court))' }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-[44px] h-[44px] flex items-center justify-center bg-court text-white text-base font-bold font-heading shrink-0">
              {(leagueName || '?').charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-sm tracking-wider truncate">
                {leagueName || 'SIN NOMBRE'}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-fg-muted uppercase tracking-wider">
                  {league?.gender || '—'} · {league?.sport || '—'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] pill">
              {league?.status === 'activa' && 'Activa'}
              {league?.status === 'proxima' && 'Próxima'}
              {league?.status === 'finalizada' && 'Finalizada'}
              {!league?.status && '—'}
            </span>
            <ChevronRight className="w-[14px] h-[14px] text-fg-muted" />
          </div>
        </div>

        {(league?.categories?.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(league.categories || []).map(cat => (
              <span key={cat} className="text-[10px] font-semibold uppercase tracking-wider pill">
                {cat}
              </span>
            ))}
          </div>
        )}

        {league?.season && (
          <div className="mt-2">
            <span className="text-[11px] text-fg-muted uppercase tracking-wider">
              {league.season}
            </span>
          </div>
        )}

        {isOrganizer && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border-subtle">
            <button onClick={(e) => { e.stopPropagation(); handleEdit() }} className="btn-ghost h-7 px-2 text-[11px]">
              <Edit className="w-[12px] h-[12px]" /> Editar
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDelete() }} className="btn-ghost h-7 px-2 text-[11px] text-destructive hover:text-destructive">
              <Trash2 className="w-[12px] h-[12px]" /> Eliminar
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
