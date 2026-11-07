import { useState } from 'react';
import { Agenda } from './Agenda';
import { Notices } from './Notices';
import { FocusAndLayout } from './FocusAndLayout';
import { Catalog } from './Catalog';
import { Platform } from './Platform';
import { Booking } from './Booking';
import { Resources } from './Resources';
import { Preferences } from './preferences';

const STATIONS = [
  { id: 'agenda', label: '1 Agenda', View: Agenda },
  { id: 'avisos', label: '2 Avisos', View: Notices },
  { id: 'referencias', label: '3 Referencias', View: FocusAndLayout },
  { id: 'catalogo', label: '4 Catálogo', View: Catalog },
  { id: 'plataforma', label: '5 Plataforma', View: Platform },
  { id: 'reserva', label: '6 Reserva', View: Booking },
  { id: 'recursos', label: '7 Recursos', View: Resources },
] as const;

export function App() {
  const [station, setStation] = useState<(typeof STATIONS)[number]>(STATIONS[0]);
  const View = station.View;

  return (
    <main>
      <h1>Laboratorio de Hooks del portal de talleres</h1>
      <p>Semana 13 · Los cupos y las reservas son ficticios.</p>
      <Preferences>
        <nav className="buttons" aria-label="Estaciones del laboratorio">
          {STATIONS.map((item) => (
            <button
              key={item.id}
              aria-pressed={item.id === station.id}
              onClick={() => setStation(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <View />
      </Preferences>
    </main>
  );
}