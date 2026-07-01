import { motion } from 'framer-motion'
import { Users, UserPlus, Trash2, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function ExpressPlayers({ players, newPlayerName, setNewPlayerName, addPlayer, removePlayer, handleGenerateRounds }) {
  return (
    <motion.div key="players" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2 mb-4">
        <Users className="w-10 h-10 mx-auto text-primary/60" />
        <h2 className="text-xl font-bold">Jugadores</h2>
        <p className="text-sm text-muted-foreground">Mínimo 4 jugadores para generar las jornadas</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={newPlayerName}
          onChange={e => setNewPlayerName(e.target.value)}
          placeholder="Nombre del jugador"
          onKeyDown={e => { if (e.key === 'Enter') addPlayer() }}
        />
        <Button onClick={addPlayer} disabled={!newPlayerName.trim()}>
          <UserPlus className="w-4 h-4 mr-1" /> Añadir
        </Button>
      </div>

      {players.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {players.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2 group animate-in fade-in duration-200"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium flex-1 truncate">{p.name}</span>
              <button
                onClick={() => removePlayer(p.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {players.length >= 4 && (
        <Button onClick={handleGenerateRounds} className="w-full">
          <Zap className="w-4 h-4 mr-2" /> Generar Jornadas
        </Button>
      )}
    </motion.div>
  )
}
