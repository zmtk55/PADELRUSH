import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeagueCard from './LeagueCard';

describe('LeagueCard Component', () => {
  const league = {
    id: 1,
    name: 'Liga de Prueba',
    sport: 'padel',
    gender: 'femenil',
    season: '2026-1',
    status: 'activa',
    categories: ['5TA', '4TA']
  };

  it('should display league information correctly', () => {
    const onDelete = jest.fn();
    const onEdit = jest.fn();
    
    render(<LeagueCard league={league} onDelete={onDelete} onEdit={onEdit} />);
    
    // Check basic info
    expect(screen.getByText(/Liga de Prueba/i)).toBeInTheDocument();
    expect(screen.getByText(/Pádel · Femenil/i)).toBeInTheDocument();
    expect(screen.getByText(/2026-1/i)).toBeInTheDocument();
    expect(screen.getByText(/Activa/i)).toBeInTheDocument();
    expect(screen.getByText(/5TA/i)).toBeInTheDocument();
    expect(screen.getByText(/4TA/i)).toBeInTheDocument();
    
    // Check action buttons
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument();
  });

  it('should handle delete button click', async () => {
    const onDelete = jest.fn();
    const onEdit = jest.fn();
    
    render(<LeagueCard league={league} onDelete={onDelete} onEdit={onEdit} />);
    
    const deleteButton = screen.getByRole('button', { name: /eliminar/i });
    await userEvent.click(deleteButton);
    
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('should handle edit button click', async () => {
    const onDelete = jest.fn();
    const onEdit = jest.fn();
    
    render(<LeagueCard league={league} onDelete={onDelete} onEdit={onEdit} />);
    
    const editButton = screen.getByRole('button', { name: /editar/i });
    await userEvent.click(editButton);
    
    expect(onEdit).toHaveBeenCalledWith(1);
  });

  it('should display status with appropriate colors', () => {
    const testCases = [
      { status: 'activa', expectedColor: 'text-success' },
      { status: 'proxima', expectedColor: 'text-warning' }, 
      { status: 'finalizada', expectedColor: 'text-destructive' }
    ];
    
    testCases.forEach(({ status, expectedColor }) => {
      const testLeague = { ...league, status };
      const { getByText } = render(<LeagueCard league={testLeague} onDelete={() => {}} onEdit={() => {}} />);
      
      const statusElement = getByText(status === 'activa' ? 'Activa' : status === 'proxima' ? 'Próxima' : 'Finalizada');
      expect(statusElement).toHaveClass(expectedColor);
    });
  });
});