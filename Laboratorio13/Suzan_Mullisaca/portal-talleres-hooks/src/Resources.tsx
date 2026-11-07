import { Component, Suspense, use, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { DetailsContext } from './preferences';
import { WORKSHOPS } from './workshops';

export type Report = readonly { id: string; title: string; seats: number }[];
type Request = { id: number; promise: Promise<Report> };
type Load = (fail: boolean) => Promise<Report>;

function defaultLoad(fail: boolean): Promise<Report> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) {
        reject(new Error('Simulación de recurso no disponible.'));
        return;
      }
      resolve(WORKSHOPS.map((item, i) => ({ ...item, seats: i + 2 })));
    }, 400);
  });
}

class ReportBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return <p role="alert">No se pudo leer. Solicita el informe otra vez.</p>;
    }
    return this.props.children;
  }
}

function Availability({ promise }: { promise: Promise<Report> }) {
  const rows = use(promise);
  return (
    <ul aria-label="Disponibilidad de talleres">
      {rows.map(({ id, title, seats }) => (
        <li key={id}>{title}: {seats} plazas</li>
      ))}
    </ul>
  );
}

export function Resources({ load = defaultLoad }: { load?: Load }) {
  const [request, setRequest] = useState<Request | null>(null);
  const [counter, setCounter] = useState(0);
  const [showNote, setShowNote] = useState(false);
  const details = useContext(DetailsContext);

  const requestReport = (fail: boolean) => {
    const nextId = counter + 1;
    setCounter(nextId);
    setRequest({ id: nextId, promise: load(fail) });
  };

  return (
    <section aria-labelledby="resources-title">
      <h2 id="resources-title">Recursos</h2>
      <label>
        <input
          type="checkbox"
          checked={showNote}
          onChange={(e) => setShowNote(e.target.checked)}
        />
        Mostrar nota del informe
      </label>
      {showNote && (
        <p>El informe tiene plazas ficticias. {details ? 'Datos de práctica.' : ''}</p>
      )}
      <div className="buttons">
        <button onClick={() => requestReport(false)}>Leer disponibilidad</button>
        <button onClick={() => requestReport(true)}>Simular error</button>
      </div>
      {request && (
        <ReportBoundary key={request.id}>
          <Suspense fallback={<p role="status">Cargando informe...</p>}>
            <Availability promise={request.promise} />
          </Suspense>
        </ReportBoundary>
      )}
    </section>
  );
}