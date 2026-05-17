import { useNavigate } from 'react-router-dom'
import { Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useAuth } from '@/hooks/useAuth'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

const weekDays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function DashboardHeader({ leagues, selectedLeagueId, onLeagueChange }) {
  const navigate = useNavigate()
  const { user, isOrganizer } = useAuth()
  const now = new Date()
  const dateStr = `${capitalize(weekDays[now.getDay()])}, ${now.getDate()} de ${now.toLocaleDateString('es-MX', { month: 'long' })} de ${now.getFullYear()}`

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">
          {getGreeting()}, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'usuario'}
        </h1>
        <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-1">
          <Calendar className="w-3.5 h-3.5" />
          {dateStr}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {leagues.length > 0 && (
          <Select value={selectedLeagueId || ''} onValueChange={onLeagueChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas las ligas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ligas</SelectItem>
              {leagues.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {isOrganizer && (
          <Button onClick={() => navigate('/ligas/nueva')}>
            <Plus className="w-4 h-4" />
            Nueva Liga
          </Button>
        )}
      </div>
    </div>
  )
}
