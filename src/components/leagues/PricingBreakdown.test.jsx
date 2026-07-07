import { render, screen } from '@testing-library/react';
import PricingBreakdown from './PricingBreakdown';

describe('PricingBreakdown Component', () => {
  it('should display pricing breakdown section', () => {
    const league = {
      inscriptionFee: 500,
      arbitrationCostPerMatch: 50,
      prizePool: 2000,
      operationalCosts: 300,
      revenueProjection: 3500,
      numTeams: 10,
      numMatches: 45
    };
    
    render(<PricingBreakdown league={league} />);
    
    // Expect to see pricing elements
    expect(screen.getByText(/Desglose de Costos e Ingresos/i)).toBeInTheDocument();
    expect(screen.getByText(/Inscripción/i)).toBeInTheDocument();
    expect(screen.getByText(/5,000/i)).toBeInTheDocument(); // 10 teams * 500
    expect(screen.getByText(/3,500/i)).toBeInTheDocument(); // revenue projection
    expect(screen.getByText(/Árbitros/i)).toBeInTheDocument();
    expect(screen.getByText(/2,250/i)).toBeInTheDocument(); // 45 matches * 50
    expect(screen.getByText(/Operacionales/i)).toBeInTheDocument();
    expect(screen.getByText(/300/i)).toBeInTheDocument(); // operational costs
    expect(screen.getByText(/Utilidad Neta/i)).toBeInTheDocument();
    expect(screen.getByText(/ROI/i)).toBeInTheDocument();
  });

  it('should handle zero values gracefully', () => {
    const league = {
      inscriptionFee: 0,
      arbitrationCostPerMatch: 0,
      prizePool: 0,
      operationalCosts: 0,
      revenueProjection: 0,
      numTeams: 0,
      numMatches: 0
    };
    
    render(<PricingBreakdown league={league} />);
    
    expect(screen.getByText(/Desglose de Costos e Ingresos/i)).toBeInTheDocument();
    expect(screen.getByText(/0/i)).toBeInTheDocument();
  });
});