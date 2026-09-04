import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Import the page component
import NuevoCensoPage from '../app/(dashboard)/censos/nuevo/page';

describe('NuevoCensoPage - Multi-step Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render step 1 with basic info form', () => {
    render(<NuevoCensoPage />);

    expect(screen.getByText('Nuevo Censo')).toBeInTheDocument();
    expect(screen.getByText('Información Básica')).toBeInTheDocument();
    expect(screen.getByLabelText('Placa del Vehículo')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de Vehículo')).toBeInTheDocument();
  });

  it('should show progress indicator with 3 steps', () => {
    render(<NuevoCensoPage />);

    expect(screen.getByText('Básico')).toBeInTheDocument();
    expect(screen.getByText('Detalles')).toBeInTheDocument();
    expect(screen.getByText('Revisión')).toBeInTheDocument();
  });

  it('should show actividad field when MOTOCICLETA is selected', async () => {
    const user = userEvent.setup();
    render(<NuevoCensoPage />);

    const tipoSelect = screen.getByLabelText('Tipo de Vehículo');
    await user.selectOptions(tipoSelect, 'MOTOCICLETA');

    expect(screen.getByLabelText('Actividad')).toBeInTheDocument();
  });

  it('should not show actividad field when MOTOCARRO is selected', async () => {
    const user = userEvent.setup();
    render(<NuevoCensoPage />);

    const tipoSelect = screen.getByLabelText('Tipo de Vehículo');
    await user.selectOptions(tipoSelect, 'MOTOCARRO');

    expect(screen.queryByLabelText('Actividad')).not.toBeInTheDocument();
  });

  it('should validate placa format on step 1', async () => {
    const user = userEvent.setup();
    render(<NuevoCensoPage />);

    const placaInput = screen.getByLabelText('Placa del Vehículo');
    await user.type(placaInput, 'ab');

    const submitButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('La placa debe tener al menos 3 caracteres')).toBeInTheDocument();
    });
  });

  it('should uppercase placa input automatically', async () => {
    const user = userEvent.setup();
    render(<NuevoCensoPage />);

    const placaInput = screen.getByLabelText('Placa del Vehículo');
    await user.type(placaInput, 'abc123');

    expect(placaInput).toHaveValue('ABC123');
  });

  it('should validate required fields on step 1', async () => {
    const user = userEvent.setup();
    render(<NuevoCensoPage />);

    const submitButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Seleccione un tipo de vehículo')).toBeInTheDocument();
    });
  });
});
