import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the six initiatives and the initial summary', () => {
    render(<App />);
    expect(screen.getAllByRole('article')).toHaveLength(6);
    expect(screen.getByText(/mostrando/i)).toHaveTextContent('Mostrando 6 de 6 iniciativas');
  });

  it('filters initiatives while the user writes', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: /buscar/i }), 'React');
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.queryByText('Observatorio de empleabilidad')).not.toBeInTheDocument();
  });

  it('filters by category', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByRole('combobox', { name: /categoría/i }), 'Datos');
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('adds and removes a favorite', async () => {
    const user = userEvent.setup();
    render(<App />);
    const card = screen.getByRole('heading', { name: /portal de bienestar/i }).closest('article');
    await user.click(within(card as HTMLElement).getByRole('button', { name: /agregar a favoritas/i }));
    expect(screen.getByText(/mostrando/i)).toHaveTextContent('1 favorita');
    await user.click(within(card as HTMLElement).getByRole('button', { name: /quitar de favoritas/i }));
    expect(screen.getByText(/mostrando/i)).toHaveTextContent('0 favoritas');
  });

  it('shows only the initiatives selected as favorites', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: /agregar a favoritas/i })[0]);
    await user.click(screen.getByRole('checkbox', { name: /solo favoritas/i }));
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });

  it('shows an empty state and restores every initiative', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: /buscar/i }), 'sin coincidencias');
    expect(screen.getByRole('heading', { name: /no encontramos/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /mostrar todas/i }));
    expect(screen.getAllByRole('article')).toHaveLength(6);
  });

  it('clears combined filters without removing favorites', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: /agregar a favoritas/i })[0]);
    await user.type(screen.getByRole('searchbox', { name: /buscar/i }), 'portal');
    await user.selectOptions(screen.getByRole('combobox', { name: /categoría/i }), 'Desarrollo web');
    await user.click(screen.getByRole('button', { name: /limpiar filtros/i }));
    expect(screen.getAllByRole('article')).toHaveLength(6);
    expect(screen.getByText(/mostrando/i)).toHaveTextContent('1 favorita');
  });
});