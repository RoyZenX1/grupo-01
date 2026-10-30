import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { INITIATIVES } from '../data/initiatives';
import { InitiativeCard } from './InitiativeCard';

const initiative = INITIATIVES[0];

describe('InitiativeCard', () => {
  it('renders the initiative data received through props', () => {
    render(<InitiativeCard initiative={initiative} isFavorite={false} onToggleFavorite={() => {}} />);
    expect(screen.getByRole('heading', { name: initiative.title })).toBeInTheDocument();
    expect(screen.getByText('12 horas')).toBeInTheDocument();
  });

  it('announces that an unselected initiative can be added', () => {
    render(<InitiativeCard initiative={initiative} isFavorite={false} onToggleFavorite={() => {}} />);
    expect(screen.getByRole('button', { name: /agregar a favoritas/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('announces that a selected initiative can be removed', () => {
    render(<InitiativeCard initiative={initiative} isFavorite onToggleFavorite={() => {}} />);
    expect(screen.getByRole('button', { name: /quitar de favoritas/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('sends the initiative id when the user activates the button', async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    render(<InitiativeCard initiative={initiative} isFavorite={false} onToggleFavorite={onToggleFavorite} />);
    
    await user.click(screen.getByRole('button', { name: /agregar a favoritas/i }));
    expect(onToggleFavorite).toHaveBeenCalledOnce();
    expect(onToggleFavorite).toHaveBeenCalledWith(initiative.id);
  });
});