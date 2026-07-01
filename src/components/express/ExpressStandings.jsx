import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Share2, Medal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import RoundRobinStandings from '@/components/roundrobin/RoundRobinStandings'

export function ExpressStandings({ standings, allRoundsPlayed, knockout, onAdvanceToKnockout, onShowStandings, onShare }) {
  return (
    <motion.div key="standings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Clasificación Final</h2>
          <p className="text-sm text-muted-foreground">Todos los partidos completados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onShowStandings}>
            <BarChart3 className="w-4 h-4 mr-1" /> Vista detallada
          </Button>
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="w-4 h-4 mr-1" /> Compartir
          </Button>
        </div>
      </div>
      <RoundRobinStandings stats={standings} />
      {allRoundsPlayed && knockout === null && (
        <Button onClick={onAdvanceToKnockout} className="w-full mt-4">
          <Medal className="w-4 h-4 mr-2" /> Avanzar a Eliminatorias
        </Button>
      )}
    </motion.div>
  )
}

export function StandingsModal({ open, onClose, standings, onShare }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card border rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-10">
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Clasificación</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share2 className="w-4 h-4 mr-1" /> Compartir
                </Button>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <RoundRobinStandings stats={standings} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
