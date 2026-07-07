import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PricingEditor from './PricingEditor';

describe('PricingEditor Component', () => {
  it('should render with initial data', () => {
    const initialData = {
      inscriptionFee: 100,
      arbitrationCostPerMatch: 25,
      prizePool: 1000,
      operationalCosts: 200
    };
    
    render(<PricingEditor initialData={initialData} onChange={() => {}} />);
    
    expect(screen.getByLabelText(/Costo de Inscripción por Equipo/i))
      .toHaveValue('100');
    expect(screen.getByLabelText(/Costo de Árbitro por Partido/i))
      .toHaveValue('25');
    expect(screen.getByLabelText(/Pozo de Premios Total/i))
      .toHaveValue('1000');
    expect(screen.getByLabelText(/Costos Operacionales/i))
      .toHaveValue('200');
  });

  it('should update values when input changes', async () => {
    const handleChange = jest.fn();
    render(<PricingEditor onChange={handleChange} />);
    
    const inscriptionInput = screen.getByLabelText(/Costo de Inscripción por Equipo/i);
    await userEvent.clear(inscriptionInput);
    await userEvent.type(inscriptionInput, '150');
    
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ inscriptionFee: 150 })
    );
  });

  it('should call onChange when values are updated', () => {
    const handleChange = jest.fn();
    const onChange = jest.fn();
    render(<PricingEditor onChange={onChange} />);
    
    const inscriptionInput = screen.getByLabelText(/Costo de Inscripción por Equipo/i);
    userEvent.clear(inscriptionInput);
    userEvent.type(inscriptionInput, '200');
    
    expect(onChange).toHaveBeenCalled();
  });
});