import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Filters from '../dashboard/filters';

describe('Filters', () => {
  const mockApply = jest.fn();
  const mockReset = jest.fn();

  beforeEach(() => {
    render(<Filters onApply={mockApply} onReset={mockReset} />);
  });

  it('should render filter inputs', () => {
    expect(screen.getByText(/Fecha inicial/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha final/i)).toBeInTheDocument();
  });

  it('should trigger apply button', () => {
    fireEvent.click(screen.getByText(/Aplicar filtros/i));
    expect(mockApply).toHaveBeenCalled();
  });

  it('should trigger reset button', () => {
    fireEvent.click(screen.getByText(/Limpiar/i));
    expect(mockReset).toHaveBeenCalled();
  });
});