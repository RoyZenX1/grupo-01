import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from './App';
import { fillValidForm } from './test/helpers';

function open(path = '/') {
  render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
}

describe('routes', () => {
  it('navigates from catalog to detail and registration', async () => {
    const user = userEvent.setup();
    open();
    await user.click(screen.getByRole('link', { name: 'Ver Interfaces con React' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Interfaces con React');
    await user.click(screen.getByRole('link', { name: 'Inscribir equipo' }));
    expect(screen.getByLabelText('Nombre de coordinación')).toBeInTheDocument();
  });

  it.each(['/no-existe', '/talleres/desconocido', '/inscripcion/desconocido'])(
    'handles the unknown resource %s', (path) => {
      open(path);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Recurso no encontrado');
    },
  );

  it('handles direct confirmation without data', () => {
    open('/confirmacion');
    expect(screen.getByText(/no hay una solicitud en memoria/i)).toBeInTheDocument();
  });

  it('completes a real simulated submission and displays the payload', async () => {
    const user = userEvent.setup();
    open('/inscripcion/react');
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }));
    expect(await screen.findByRole('heading', { name: 'Confirmación de laboratorio' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('LAB-');
    expect(screen.getByText(/"workshopId": "react"/)).toBeInTheDocument();
  });
});