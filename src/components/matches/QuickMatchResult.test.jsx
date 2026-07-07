import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuickMatchResult from './QuickMatchResult';

describe('QuickMatchResult Component', () => {
  const matchId = 1;

  it('should render with empty form', () => {
    // Mock the useMatches hook
    jest.mock('@/hooks/useMatches', () => ({
      useMatches: () => ({
        updateMatch: { mutateAsync: jest.fn().mockResolvedValue({}) }
      )
    }));
    
    render(<QuickMatchResult matchId={matchId} />);
    
    expect(screen.getByLabelText(/Sets Ganados - Equipo 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sets Ganados - Equipo 2/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Estado del Partido/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar Resultado/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
  });

  it('should show validation error when sets are negative', async () => {
    // Mock the useMatches hook
    jest.mock('@/hooks/useMatches', () => ({
      useMatches: () => ({
        updateMatch: { mutateAsync: jest.fn() }
      )
    }));
    
    render(<QuickMatchResult matchId={matchId} />);
    
    const team1Input = screen.getByLabelText(/Sets Ganados - Equipo 1/i);
    await userEvent.clear(team1Input);
    await userEvent.type(team1Input, '-1');
    
    const submitButton = screen.getByRole('button', { name: /Guardar Resultado/i });
    await userEvent.click(submitButton);
    
    expect(screen.getByText(/Los sets no pueden ser negativos/i)).toBeInTheDocument();
  });

  it('should show validation error when both teams have zero sets', async () => {
    // Mock the useMatches hook
    jest.mock('@/hooks/useMatches', () => ({
      useMatches: () => ({
        updateMatch: { mutateAsync: jest.fn() }
      )
    }));
    
    render(<QuickMatchResult matchId={matchId} />);
    
    const team1Input = screen.getByLabelText(/Sets Ganados - Equipo 1/i);
    await userEvent.clear(team1Input);
    await userEvent.type(team1Input, '0');
    
    const team2Input = screen.getByLabelText(/Sets Ganados - Equipo 2/i);
    await userEvent.clear(team2Input);
    await userEvent.type(team2Input, '0');
    
    const submitButton = screen.getByRole('button', { name: /Guardar Resultado/i });
    await userEvent.click(submitButton);
    
    expect(screen.getByText(/Al menos un equipo debe ganar sets/i)).toBeInTheDocument();
  });

  it('should update match result with valid data', async () => {
    // Mock the useMatches hook
    const updateMatchMock = { mutateAsync: jest.fn().mockResolvedValue({}) };
    jest.mock('@/hooks/useMatches', () => ({
      useMatches: () => ({
        updateMatch: updateMatchMock
      )
    }));
    
    render(<QuickMatchResult matchId={matchId} />);
    
    // Fill in the form
    const team1Input = screen.getByLabelText(/Sets Ganados - Equipo 1/i);
    await userEvent.clear(team1Input);
    await userEvent.type(team1Input, '2');
    
    const team2Input = screen.getByLabelText(/Sets Ganados - Equipo 2/i);
    await userEvent.clear(team2Input);
    await userEvent.type(team2Input, '1');
    
    // Select status
    const statusSelect = screen.getByLabelText(/Estado del Partido/i);
    await userEvent.click(statusSelect);
    await userEvent.click(screen.getByText(/Jugado/i));
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Guardar Resultado/i });
    await userEvent.click(submitButton);
    
    // Wait for loading state
    expect(screen.getByText(/Guardando/i)).toBeInTheDocument();
    
    // Verify the updateMatch mutation was called with correct data
    expect(updateMatchMock.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        id: matchId,
        sets_won_team1: 2,
        sets_won_team2: 1,
        status: 'jugado'
      })
    );
    
    // Verify success message
    expect(screen.getByText(/Resultado registrado exitosamente/i)).toBeInTheDocument();
  });
});