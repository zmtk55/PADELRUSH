import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'

export default function LeagueTableView({ leagues, onDelete }) {
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta liga?')) return
    try {
      await onDelete(id)
    } catch (err) {
      console.error('Error deleting league:', err)
    }
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground text-xs font-medium bg-muted/10">
            <th className="text-left px-4 py-3">Nombre</th>
            <th className="text-left px-4 py-3 hidden sm:table-cell">Género</th>
            <th className="text-left px-4 py-3 hidden md:table-cell">Deporte</th>
            <th className="text-left px-4 py-3">Estado</th>
            {isOrganizer && <th className="text-right px-4 py-3">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {leagues.map((league) => (
            <tr
              key={league.id}
              className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate(`/ligas/${league.id}`)}
            >
              <td className="px-4 py-3 font-medium">{league.name}</td>
              <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{league.gender}</td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{league.sport}</td>
              <td className="px-4 py-3">
                <span className="text-xs border border-border px-2 py-0.5">{league.status}</span>
              </td>
              {isOrganizer && (
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate(`/ligas/${league.id}/editar`)}>
                      <Edit className="w-3 h-3" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-600 h-7 text-xs" onClick={() => handleDelete(league.id)}>
                      <Trash2 className="w-3 h-3" /> Eliminar
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
