import { render, screen } from '@testing-library/react';
import LeagueTableView from './LeagueTableView';

describe('LeagueTableView Component', () => {
  it('should render loading state when leagues is empty and loading', () => {
    // Mock the useLeagues hook
    jest.mock('@/hooks/useLeagues', () => ({
      useLeagues: () => ({
        leaguesQuery: { data: [], isLoading: true, error: null },
      })
    }));
    
    render(<LeagueTableView />);
    
    expect(screen.getByText(/Cargando/i)).toBeInTheDocument();
  });

  it('should render error state when there is an error', () => {
    // Mock the useLeagues hook
    jest.mock('@/hooks/useLeagues', () => ({
      useLeagues: () => ({
        leaguesQuery: { data: [], isLoading: false, error: new Error('Error loading') },
      })
    }));
    
    render(<LeagueTableView />);
    
    expect(screen.getByText(/Error cargando/i)).toBeInTheDocument();
  });

  it('should render table headers', () => {
    const leagues = [];
    
    // Mock the useLeagues hook
    jest.mock('@/hooks/useLeagues', () => ({
      useLeagues: () => ({
        leaguesQuery: { data: leagues, isLoading: false, error: null },
      })
    }));
    
    render(<LeagueTableView />);
    
    expect(screen.getByHeaderCell(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByHeaderCell(/Deporte\/Género/i)).toBeInTheDocument();
    expect(screen.getByHeaderCell(/Temporada/i)).toBeInTheDocument();
    expect(screen.getByHeaderCell(/Estado/i)).toBeInTheDocument();
    expect(screen.getByHeaderCell(/Categorías/i)).toBeInTheDocument();
  });

  it('should render "No hay ligas todavía" when leagues array is empty', () => {
    const leagues = [];
    
    // Mock the useLeagues hook
    jest.mock('@/hooks/useLeagues', () => ({
      useLeagues: () => ({
        leaguesQuery: { data: leagues, isLoading: false, error: null },
      })
    }));
    
    render(<LeagueTableView />);
    
    expect(screen.getByText(/No hay ligas todavía/i)).toBeInTheDocument();
  });

  it('should render league data in table rows', () => {
    const leagues = [
      { 
        id: 1, 
        name: 'Liga 1', 
        sport: 'padel', 
        gender: 'femenil', 
        season: '2026-1', 
        status: 'activa', 
        categories: ['5TA'] 
      },
      { 
        id: 2, 
        name: 'Liga 2', 
        sport: 'padel', 
        gender: 'varonil', 
        season: '2026-1', 
        status: 'proxima', 
        categories: ['4TA', '3TA'] 
      }
    ];
    
    // Mock the useLeagues hook
    jest.mock('@/hooks/useLeagues', () => ({
      useLeagues: () => ({
        leaguesQuery: { data: leagues, isLoading: false, error: null },
      })
    }));
    
    render(<LeagueTableView />);
    
    // Check first row
    expect(screen.getByCell(/Liga 1/i)).toBeInTheDocument();
    expect(screen.getByCell(/Pádel \· Femenil/i)).toBeInTheDocument();
    expect(screen.getByCell(/2026-1/i)).toBeInTheDocument();
    expect(screen.getByCell(/Activa/i)).toBeInTheDocument();
    expect(screen.getByCell(/5TA/i)).toBeInTheDocument();
    
    // Check second row
    expect(screen.getByAllCells(/Liga 2/i)[1]).toBeInTheDocument();
    expect(screen.getByAllCells(/Pádel \· Varonil/i)[1]).toBeInTheDocument();
    expect(screen.getByAllCells(/2026-1/i)[1]).toBeInTheDocument();
    expect(screen.getByAllCells(/Próxima/i)[1]).toBeInTheDocument();
    expect(screen.getByAllCells(/4TA, 3TA/i)[1]).toBeInTheDocument();
  });
});