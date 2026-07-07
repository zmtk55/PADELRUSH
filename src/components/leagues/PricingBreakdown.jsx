import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PricingBreakdown({ league }) {
  const {
    inscriptionFee = 0,
    arbitrationCostPerMatch = 0,
    prizePool = 0,
    operationalCosts = 0,
    revenueProjection = 0,
    // Assuming we have teams and matches data passed in or calculated elsewhere
    numTeams = 0,
    numMatches = 0
  } = league

  // Calculate derived values
  const totalInscriptionRevenue = inscriptionFee * numTeams
  const totalArbitrationCost = arbitrationCostPerMatch * numMatches
  const totalCosts = totalArbitrationCost + operationalCosts
  const netProfit = totalInscriptionRevenue + prizePool - totalCosts
  const roiPercentage = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant="secondary">💰</Badge>
          Desglose de Costos e Ingresos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-medium mb-2">Ingresos</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Inscripción ({numTeams} equipos)</span>
                <span className="font-mono">${totalInscriptionRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Proyección de ingresos</span>
                <span className="font-mono">${revenueProjection.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span>Total Ingresos</span>
                <span className="font-mono">${(totalInscriptionRevenue + revenueProjection).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-medium mb-2">Costos</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Árbitros ({numMatches} partidos)</span>
                <span className="font-mono">${totalArbitrationCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Operacionales</span>
                <span className="font-mono">${operationalCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span>Total Costos</span>
                <span className="font-mono">${totalCosts.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Utilidad Neta</span>
            <span className={`font-mono ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${netProfit.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-lg font-semibold mt-2">
            <span>ROI</span>
            <span className={`font-mono ${roiPercentage >= 0 ? 'text-success' : 'text-destructive'}`}>
              {roiPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}