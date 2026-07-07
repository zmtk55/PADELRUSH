import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuickLeagueCreate from './QuickLeagueCreate';

describe('QuickLeagueCreate Component', () => {
  it('should render with empty form', () => {
    // Mock the useLeagues hook
    jest.mock('@/hooks/useLeagues', () => ({
      useLeagues: () => ({
        createLeague: { mutateAsync: jest.fn().mockResolvedValue({ id: 1 }) }
      })
    }));
    // Mock the useAuth hook
    jest.mock('@/hooks/useAuth', () => ({
      useAuth: () => ({
        user: { id: 1 },
        profile: { display_name: 'Test User' }
      })
    }));
    
    render(<QuickLeagueCreate />);
    
    expect(screen.getByLabelText(/Nombre de la Liga \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Deporte/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Género/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Temporada/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Estado Inicial/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Liga/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
  });

  it('should show validation error when name is empty', async () => {
    // Mock the useLeagues hook
    jest.mock('@/hooks/useLeagues', () => ({
      useLeagues: () => ({
        createLeague: { mutateAsync: jest.fn() }
      })
    }));
    // Mock the useAuth hook
    jest.mock('@/hooks/useAuth', () => ({
      useAuth: () => ({
        user: { id: 1 },
        profile: { display_name: 'Test User' }
      })
    }));
    
    render(<QuickLeagueCreate />);
    
    const submitButton = screen.getByRole('button', { name: /Crear Liga/i });
    await userEvent.click(submitButton);
    
    expect(screen.getByText(/El nombre de la liga es obligatorio/i)).toBeInTheDocument();
  });

  it('should create a league with valid data', async () => {
    // Mock the useLeagues hook
    const createLeagueMock = { mutateAsync: jest.fn().mockResolvedValue({ id: 123 }) };
    jest.mock('@/hooks/useLeagues', () => ({
      useLeagues: () => ({
        createLeague: createLeagueMock
      })
    }));
    // Mock the useAuth hook
    jest.mock('@/hooks/useAuth', () => ({
      useAuth: () => ({
        user: { id: 1 },
        profile: { display_name: 'Test User' }
      })
    }));
    // Mock useNavigate
    const navigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => navigate
    }));
    
    render(<QuickLeagueCreate />);
    
    // Fill in the form
    const nameInput = screen.getByLabelText(/Nombre de la Liga \*/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Liga de Prueba');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Crear Liga/i });
    await userEvent.click(submitButton);
    
    // Wait for loading state
    expect(screen.getByText(/Creando/i)).toBeInTheDocument();
    
    // Verify the createLeague mutation was called with correct data
    expect(createLeagueMock.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Liga de Prueba',
        slug: 'liga-de-prueba',
        sport: 'padel',
        gender: 'femenil',
        season: expect.stringMatching(/\\d{4}-\\d/),
        status: 'proxima',
        organizer_id: 1,
        organizer_name: 'Test User'
      })
    );
    
    // Verify navigation after success
    expect(navigate).toHaveBeenCalledWith('/ligas/123');
  });
});