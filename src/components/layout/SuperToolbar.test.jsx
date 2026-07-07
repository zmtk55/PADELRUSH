import { render, screen } from '@testing-library/react';
import SuperToolbar from './SuperToolbar';

describe('SuperToolbar Component', () => {
  it('should display default action buttons', () => {
    render(<SuperToolbar />);
    
    expect(screen.getByRole('button', { name: /nueva liga/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ver equipos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ver partidos/i })).toBeInTheDocument();
  });

  it('should show context-specific actions when provided', () => {
    render(<SuperToolbar context="league-detail" leagueId={1} />);
    
    expect(screen.getByRole('button', { name: /agregar equipo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /programar partido/i })).toBeInTheDocument();
  });

  it('should handle button clicks and call callbacks', () => {
    const handleNewLeague = jest.fn();
    render(<SuperToolbar onNewLeague={handleNewLeague} />);
    
    screen.getByRole('button', { name: /nueva liga/i }).click();
    expect(handleNewLeague).toHaveBeenCalled();
  });
});