import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { computeStandings } from '@/components/roundrobin/RoundRobinStandings';
import { ScoreCell } from './ScoreCell';
import { getPlayerStats } from './expressUtils';

export function ExpressRounds({ rounds, players, pointsPerWin, activeRound, setActiveRound, handleSaveScore, onShowStandings, onShare }) {
  const currentStandings = useMemo(() => computeStandings(getPlayerStats(players, rounds, pointsPerWin)), [players, rounds, pointsPerWin]);
  const posMap = {};
  currentStandings.forEach((p, i) => { posMap[p.id] = i + 1 });
  const totalMatches = rounds.reduce((s, r) => s + r.matches.length, 0);
  const playedMatches = rounds.reduce((s, r) => s + r.matches.filter(m => m.played).length, 0);
  return (
    <motion.div key="rounds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Jornadas</h2>
          {totalMatches > 0 && <p className="text-xs text-muted-foreground mt-0.5">{playedMatches} de {totalMatches} partidos jugados</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onShowStandings}><BarChart3 className="w-4 h-4 mr-1" /> Clasificacion</Button>
          <Button variant="outline" size="sm" onClick={onShare}><Share2 className="w-4 h-4 mr-1" /> Compartir</Button>
        </div>
      </div>
      {totalMatches > 0 && (
        <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${(playedMatches / totalMatches) * 100}%` }} transition={{ duration: 0.5, ease: "easeOut" }} className="h-full bg-primary rounded-full" />
        </div>
      )}
      <Tabs value={activeRound} onValueChange={setActiveRound} className="w-full">
        <TabsList className="w-full flex-wrap h-auto">
          {rounds.map((r, idx) => <TabsTrigger key={r.number} value={String(idx)} className="flex-1 min-w-[60px]">J{idx + 1}</TabsTrigger>)}
        </TabsList>
        {rounds.map((round, roundIdx) => (
          <TabsContent key={round.number} value={String(roundIdx)} className="mt-4 space-y-3">
            {round.matches.map((match, matchIdx) => {
              const pA1 = players.find(p => p.id === match.pairA[0]?.id);
              const pA2 = players.find(p => p.id === match.pairA[1]?.id);
              const pB1 = players.find(p => p.id === match.pairB[0]?.id);
              const pB2 = players.find(p => p.id === match.pairB[1]?.id);
              return (
                <motion.div key={match.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: matchIdx * 0.05 }} className="bg-card border border-border/50 rounded-xl hover:shadow-sm hover:border-border/80 transition-all duration-200">
                  <div className="flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-4 pb-2 border-b border-border/50">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="font-medium">Cancha {match.court}</span></div>
                    {match.played ? <Badge variant="secondary" className="text-[10px] h-5 bg-green-500/10 text-green-600 border-green-500/20">Completado</Badge> : <Badge variant="outline" className="text-[10px] h-5 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800">Pendiente</Badge>}
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 flex items-center gap-1.5">{[pA1, pA2].map((player, pi) => {
                        if (!player) return null;
                        const pos = posMap[player.id] || "-";
                        return <div key={pi} className="flex-1 flex items-center gap-1.5 sm:gap-2 bg-muted/50 rounded-md px-2.5 py-2 min-w-0">
                          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-muted-foreground/20 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-muted-foreground shrink-0">{player.name.charAt(0).toUpperCase()}</div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold truncate leading-tight">{player.name}</div>
                            <div className="text-[8px] sm:text-[10px] text-muted-foreground/60">#{pos}</div>
                          </div>
                        </div>;
                      })}</div>
                    </div>
                    <div className="flex items-center gap-3 my-2 sm:my-3">
                      <div className="flex-1 h-px bg-border/50" />
                      <span className="text-[11px] sm:text-xs font-semibold tracking-widest text-muted-foreground/30">VS</span>
                      <div className="flex-1 h-px bg-border/50" />
                    </div>
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="flex-1 flex items-center gap-1.5">{[pB1, pB2].map((player, pi) => {
                        if (!player) return null;
                        const pos = posMap[player.id] || "-";
                        return <div key={pi} className="flex-1 flex items-center gap-1.5 sm:gap-2 bg-muted/50 rounded-md px-2.5 py-2 min-w-0">
                          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-muted-foreground/20 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-muted-foreground shrink-0">{player.name.charAt(0).toUpperCase()}</div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold truncate leading-tight">{player.name}</div>
                            <div className="text-[8px] sm:text-[10px] text-muted-foreground/60">#{pos}</div>
                          </div>
                        </div>;
                      })}</div>
                    </div>
                    <div className="bg-muted/40 rounded-xl p-2 sm:p-3 border border-border/50">
                      <div className="flex items-center justify-center gap-2 sm:gap-4">
                        <div className="flex-1 text-center">
                          <div className="w-full max-w-[65px] sm:max-w-[90px] mx-auto aspect-square">
                            <ScoreCell value={match.score?.a ?? 0} onChange={v => handleSaveScore(roundIdx, matchIdx, v, match.score?.b ?? 0)} isWinner={match.played && match.winner === 1} />
                          </div>
                          <span className="block text-[8px] sm:text-[10px] font-medium text-muted-foreground/50 mt-0.5">EQ. A</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5"><span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground/30">VS</span></div>
                        <div className="flex-1 text-center">
                          <div className="w-full max-w-[65px] sm:max-w-[90px] mx-auto aspect-square">
                            <ScoreCell value={match.score?.b ?? 0} onChange={v => handleSaveScore(roundIdx, matchIdx, match.score?.a ?? 0, v)} isWinner={match.played && match.winner === 2} />
                          </div>
                          <span className="block text-[8px] sm:text-[10px] font-medium text-muted-foreground/50 mt-0.5">EQ. B</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
}
