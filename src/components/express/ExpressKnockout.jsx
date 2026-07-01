import { motion } from 'framer-motion'
import { BarChart3, Share2, PartyPopper, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import KnockoutBracket from '@/components/roundrobin/KnockoutBracket'

export function ExpressKnockout({ knockout, tournamentComplete, onKnockoutResult, onShare, onNewTournament, onShowStandings }) {
  return (
    <motion.div key="knockout" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Eliminatorias</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onShowStandings}>
            <BarChart3 className="w-4 h-4 mr-1" /> Clasificación
          </Button>
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="w-4 h-4 mr-1" /> Compartir
          </Button>
        </div>
      </div>
      <KnockoutBracket
        semis={knockout?.semis || []}
        finalMatch={knockout?.finalMatch || null}
        thirdPlace={knockout?.thirdPlace || null}
        onResult={onKnockoutResult}
      />
      {tournamentComplete && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-6 text-center space-y-3">
          <PartyPopper className="w-12 h-12 mx-auto text-yellow-500" />
          <h3 className="text-2xl font-bold text-foreground">¡Torneo Completo!</h3>
          <p className="text-muted-foreground">Todos los partidos se han jugado</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={onShare} variant="outline">
              <Share2 className="w-4 h-4 mr-2" /> Compartir resultados
            </Button>
            <Button onClick={onNewTournament} variant="default">
              <RefreshCw className="w-4 h-4 mr-2" /> Nuevo Torneo
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
