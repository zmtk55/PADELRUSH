import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ExpressConfig({ tournamentName, setTournamentName, courts, setCourts, pointsPerWin, setPointsPerWin }) {
  return (
    <motion.div key="config" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <Trophy className="w-12 h-12 mx-auto text-primary/60" />
        <h2 className="text-2xl font-bold">Nuevo Torneo Express</h2>
        <p className="text-muted-foreground">Configura los detalles del torneo</p>
      </div>
      <div className="space-y-2">
        <Label>Nombre del torneo</Label>
        <Input
          value={tournamentName}
          onChange={e => setTournamentName(e.target.value)}
          placeholder="Ej: Viernes de Padel"
          className="text-lg"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Canchas disponibles</Label>
          <Input
            type="number" min="1" max="10"
            value={courts}
            onChange={e => setCourts(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>Puntos por victoria</Label>
          <Input
            type="number" min="1" max="10"
            value={pointsPerWin}
            onChange={e => setPointsPerWin(Number(e.target.value))}
          />
        </div>
      </div>
    </motion.div>
  )
}
