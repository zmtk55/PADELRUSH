import { render, screen } from '@testing-library/react';
import ToolbarButton from './ToolbarButton';
import { Plus } from 'lucide-react';

describe('ToolbarButton Component', () => {
  it('should render as a button by default', () => {
    render(<ToolbarButton icon={Plus} label="Test Button" />);
    
    expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument();
  });

  it('should render as a link when href is provided', () => {
    render(<ToolbarButton icon={Plus} label="Test Link" href="https://example.com" />);
    
    expect(screen.getByRole('link', { name: /test link/i })).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<ToolbarButton icon={Plus} label="Click Me" onClick={handleClick} />);
    
    screen.getByRole('button', { name: /click me/i }).click();
    expect(handleClick).toHaveBeenCalled();
  });
});