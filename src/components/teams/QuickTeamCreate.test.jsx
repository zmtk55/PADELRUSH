import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuickTeamCreate from './QuickTeamCreate';

describe('QuickTeamCreate Component', () => {
  const leagueId = 1;

  it('should render with empty form', () => {
    // Mock the useTeams hook
    jest.mock('@/hooks/useTeams', () => ({
      useTeams: () => ({
        createTeam: { mutateAsync: jest.fn().mockResolvedValue({ id: 1 }) }
      )
    }));
    // Mock the useParticipants hook
    jest.mock('@/hooks/useParticipants', () => ({
      useParticipants: () => ({
        data: [
          { id: 1, name: 'Juan Pérez' },
          { id: 2, name: 'María García' }
        ]
      })
    }));
    
    render(<QuickTeamCreate leagueId={leagueId} />);
    
    expect(screen.getByLabelText(/Nombre del Equipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Categoría/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número de Equipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Jugador 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Jugador 2/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Equipo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
  });

  it('should show validation error when required fields are missing', async () => {
    // Mock the useTeams hook
    jest.mock('@/hooks/useTeams', () => ({
      useTeams: () => ({
        createTeam: { mutateAsync: jest.fn() }
      )
    }));
    // Mock the useParticipants hook
    jest.mock('@/hooks/useParticipants', () => ({
      useParticipants: () => ({
        data: [
          { id: 1, name: 'Juan Pérez' },
          { id: 2, name: 'María García' }
        ]
      })
    }));
    
    render(<QuickTeamCreate leagueId={leagueId} />);
    
    const submitButton = screen.getByRole('button', { name: /Crear Equipo/i });
    await userEvent.click(submitButton);
    
    expect(screen.getByText(/Por favor complete todos los campos/i)).toBeInTheDocument();
  });

  it('should create a team with valid data', async () => {
    // Mock the useTeams hook
    const createTeamMock = { mutateAsync: jest.fn().mockResolvedValue({ id: 456 }) };
    jest.mock('@/hooks/useTeams', () => ({
      useTeams: () => ({
        createTeam: createTeamMock
      )
    }));
    // Mock the useParticipants hook
    jest.mock('@/hooks/useParticipants', () => ({
      useParticipants: () => ({
        data: [
          { id: 1, name: 'Juan Pérez' },
          { id: 2, name: 'María García' }
        ]
      })
    }));
    
    render(<QuickTeamCreate leagueId={leagueId} />);
    
    // Fill in the form
    const teamNameInput = screen.getByLabelText(/Nombre del Equipo/i);
    await userEvent.clear(teamNameInput);
    await userEvent.type(teamNameInput, 'Los Campeones');
    
    const categoryInput = screen.getByLabelText(/Categoría/i);
    await userEvent.clear(categoryInput);
    await userEvent.type(categoryInput, '5TA');
    
    const teamNumberInput = screen.getByLabelText(/Número de Equipo/i);
    await userEvent.clear(teamNumberInput);
    await userEvent.type(teamNumberInput, '1');
    
    // Select players
    const player1Select = screen.getByLabelText(/Jugador 1/i);
    await userEvent.click(player1Select);
    await userEvent.click(screen.getByText(/Juan Pérez/i));
    
    const player2Select = screen.getByLabelText(/Jugador 2/i);
    await userEvent.click(player2Select);
    await userEvent.click(screen.getByText(/María García/i));
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Crear Equipo/i });
    await userEvent.click(submitButton);
    
    // Wait for loading state
    expect(screen.getByText(/Creando/i)).toBeInTheDocument();
    
    // Verify the createTeam mutation was called with correct data
    expect(createTeamMock.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        league_id: leagueId,
        team_number: 1,
        category: '5TA',
        player1_id: 1,
        player2_id: 2,
        team_name: 'Los Campeones'
      })
    );
    
    // Verify success message
    expect(screen.getByText(/Equipo creado exitosamente/i)).toBeInTheDocument();
  });
});