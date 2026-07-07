import { render, screen } from '@testing-library/react';
import LeagueCardGrid from './LeagueCardGrid';

describe('LeagueCardGrid Component', () => {
  it('should render loading state when leagues is empty and loading', () => {
    const leaguesQuery = { data: [], isLoading: true, error: null };
    
    // Mock the useLeagues hook
    jest.mock('@/hooks/useLeagues', () => ({
      useLeagues: () => ({
        leaguesQuery: { data: [], isLoading: true, error: null },
      })
    }));
    
    render(<LeagueCardGrid />);
    
    expect(screen.getByText(/Cargando/i)).toBeInTheDocument();
  });

  it('should render error state when there is an error', () => {
    // Mock the useLeagues hook
    jest.mock('@/hooks/useLeagues', () => ({
      useLeagues: () => ({
        leaguesQuery: { data: [], isLoading: false, error: new Error('Error loading') },
      })
    }));
    
    render(<LeagueCardGrid />);
    
    expect(screen.getByText(/Error cargando/i)).toBeInTheDocument();
  });

  it('should render league cards when leagues are present', () => {
    const leagues = [
      { id: 1, name: 'Liga 1', sport: 'padel', gender: 'femenil', season: '2026-1', status: 'activa', categories: ['5TA'] },
      { id: 2, name: 'Liga 2', sport: 'padel', gender: 'varonil', season: '2026-1', status: 'proxima', categories: ['4TA'] }
    ];
    
    // Mock the useLeagues hook
    jest.mock('@/hooks/useLeagues', () => ({
      useLeagues: () => ({
        leaguesQuery: { data: leagues, isLoading: false, error: null },
      })
    }));
    
    render(<LeagueCardGrid />);
    
    expect(screen.getByText(/Liga 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Liga 2/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /editar/i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /eliminar/i })).toHaveLength(2);
  });
});