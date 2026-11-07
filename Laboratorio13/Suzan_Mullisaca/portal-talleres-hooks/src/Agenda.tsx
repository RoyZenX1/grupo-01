import { useReducer, useState } from 'react';
import { Orientation } from './preferences';
import { WORKSHOPS } from './workshops';
import type { WorkshopId } from './workshops';

type AgendaState = {
  seats: Record<WorkshopId, number>;
  message: string;
};

type Change =
  | { type: 'add' | 'remove'; id: WorkshopId }
  | { type: 'clear' };

const EMPTY: AgendaState = {
  seats: { react: 0, accesibilidad: 0, pruebas: 0 },
  message: 'Aún no has reservado plazas.',
};

export function agendaReducer(state: AgendaState, action: Change): AgendaState {
  if (action.type === 'clear') return EMPTY;
  const current = state.seats[action.id];
  const total = Object.values(state.seats).reduce((a, b) => a + b, 0);

  if (action.type === 'add' && total >= 4) {
    return { ...state, message: 'Máximo de cuatro plazas por equipo.' };
  }
  if (action.type === 'remove' && current === 0) {
    return { ...state, message: 'Este taller no tiene plazas que quitar.' };
  }
  const next = current + (action.type === 'add' ? 1 : -1);
  return {
    seats: { ...state.seats, [action.id]: next },
    message: 'Agenda actualizada.',
  };
}

export function Agenda() {
  const [workshop, setWorkshop] = useState<WorkshopId>('react');
  const [state, dispatch] = useReducer(agendaReducer, EMPTY);
  const total = Object.values(state.seats).reduce((a, b) => a + b, 0);

  return (
    <section aria-labelledby="agenda-title">
      <h2 id="agenda-title">Agenda del equipo</h2>
      <Orientation />
      <label>
        Taller de la agenda
        <select
          value={workshop}
          onChange={(e) => setWorkshop(e.target.value as WorkshopId)}
        >
          {WORKSHOPS.map(({ id, title }) => (
            <option key={id} value={id}>{title}</option>
          ))}
        </select>
      </label>
      <p role="status">Total: {total}. {state.message}</p>
      <div className="buttons">
        <button onClick={() => dispatch({ type: 'add', id: workshop })}>
          Añadir plaza
        </button>
        <button onClick={() => dispatch({ type: 'remove', id: workshop })}>
          Quitar plaza
        </button>
        <button onClick={() => dispatch({ type: 'clear' })}>Vaciar</button>
      </div>
    </section>
  );
}