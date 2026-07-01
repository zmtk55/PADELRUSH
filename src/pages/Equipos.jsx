import { useNavigate } from 'react-router-dom'
import { Swords } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useLeagues } from '@/hooks/useLeagues'

export default function Equipos() {
  const navigate = useNavigate()
  const { leaguesQuery } = useLeagues()
  return (
    <div>
      <PageHeader title="Equipos" description="Selecciona una liga para ver sus equipos" />
      {leaguesQuery.isLoading && <p className="text-muted-foreground">Cargando...</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(leaguesQuery.data || []).map((l) => (
          <div key={l.id} onClick={() => navigate(`/ligas/${l.id}/equipos`)}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: l.color || 'hsl(var(--primary))' }}>{l.name.charAt(0)}</div>
              <div><p className="font-medium">{l.name}</p><p className="text-xs text-muted-foreground">{l.gender} · {l.season || '—'}</p></div>
            </div>
          </div>
        ))}
        {!leaguesQuery.isLoading && (leaguesQuery.data || []).length === 0 && <div className="text-center py-20 col-span-full"><Swords className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No hay ligas disponibles</p></div>}
      </div>
    </div>
  )
}
