import { useNavigate } from 'react-router-dom'
import { Trophy, Users, Calendar, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { useLeagues } from '@/hooks/useLeagues'
import { useFetch } from '@/lib/data'
import { req } from '@/lib/data'
import { useAuth } from '@/hooks/useAuth'
export default function Dashboard() {
  const navigate = useNavigate()
  const { leaguesQuery } = useLeagues()
  const { isOrganizer } = useAuth()
  const pc = useFetch(() => req('GET', '/participants?select=id').then(r => r?.length || 0))
  const mp = useFetch(() => req('GET', '/matches?select=id&status=eq.jugado').then(r => r?.length || 0))

  const leagues = leaguesQuery.data || []
  const activas = leagues.filter((l) => l.status === 'activa').length
  const totalCategories = [...new Set(leagues.flatMap((l) => l.categories || []))].length

  const stats = [
    { label: 'Ligas activas', icon: Trophy, color: 'text-primary', value: activas },
    { label: 'Participantes', icon: Users, color: 'text-blue-500', value: pc.data ?? 0 },
    { label: 'Partidos jugados', icon: Calendar, color: 'text-emerald-500', value: mp.data ?? 0 },
    { label: 'Categorías', icon: TrendingUp, color: 'text-amber-500', value: totalCategories || '—' },
  ]

  if (leaguesQuery.isLoading) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Resumen general de tus ligas" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="w-9 h-9 rounded-lg bg-muted mb-3" />
              <div className="h-6 w-14 bg-muted rounded mb-1" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Resumen general de tus ligas"
        action={
          isOrganizer && (
            <Button onClick={() => navigate('/ligas/nueva')}>
              <Trophy className="w-4 h-4" />
              Nueva Liga
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, icon: Icon, color, value }, i) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5">
            <div className={`p-2 rounded-lg bg-background w-fit ${color} mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-heading font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-heading font-semibold text-lg mb-4">Ligas recientes</h2>
          {leagues.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aún no hay ligas creadas</p>
              {isOrganizer && (
                <Button className="mt-4" onClick={() => navigate('/ligas/nueva')}>
                  Crear primera liga
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {leagues.slice(0, 8).map((league) => (
                <div
                  key={league.id}
                  onClick={() => navigate(`/ligas/${league.id}`)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: league.color || '#c96442' }}
                    >
                      {league.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{league.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {league.gender} · {league.season || '—'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    league.status === 'activa' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    league.status === 'finalizada' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {league.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-heading font-semibold text-lg mb-4">Acceso rápido</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/participantes')}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors text-left"
            >
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Participantes</p>
                <p className="text-xs text-muted-foreground">{pc.data ?? 0} registrados</p>
              </div>
            </button>

            <button
              onClick={() => leagues.length > 0 && navigate(`/ligas/${leagues[0]?.id}`)}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={leagues.length === 0}
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Última liga</p>
                <p className="text-xs text-muted-foreground">
                  {leagues.length > 0 ? leagues[0].name : 'Crea una liga primero'}
                </p>
              </div>
            </button>

            {isOrganizer && (
              <button
                onClick={() => navigate('/ligas/nueva')}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Nueva liga</p>
                  <p className="text-xs text-muted-foreground">Crear desde cero con el wizard</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
