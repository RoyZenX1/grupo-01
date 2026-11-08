import { Component, Suspense, use, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { DetailsContext } from './preferences';
import { WORKSHOPS } from './workshops';

export type Report = readonly {
  id: string;
  title: string;
  seats: number;
}[];

type Request = {
  id: number;
  promise: Promise<Report>;
};

function readAvailability(fail: boolean): Promise<Report> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) {
        reject(new Error('Simulación de recurso no disponible.'));
        return;
      }

      resolve(
        WORKSHOPS.map((item, i) => ({
          ...item,
          seats: i + 2,
        })),
      );
    }, 750);
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
      return (
        <p role="alert">
          No se pudo leer. Solicita el informe otra vez.
        </p>
      );
    }

    return this.props.children;
  }
}

function Availability({ promise }: { promise: Promise<Report> }) {
  const rows = use(promise);

  return (
    <ul aria-label="Disponibilidad de talleres">
      {rows.map(({ id, title, seats }) => (
        <li key={id}>
          {title}: {seats} plazas
        </li>
      ))}
    </ul>
  );
}

function ResourceNote({ visible }: { visible: boolean }) {
  if (!visible) return null;

  const details = use(DetailsContext);

  return (
    <p>
      {details
        ? 'El informe tiene plazas ficticias.'
        : 'Datos de práctica.'}
    </p>
  );
}

export function Resources({
  load = readAvailability,
}: {
  load?: (fail: boolean) => Promise<Report>;
}) {
  const [request, setRequest] = useState<Request | null>(null);
  const [note, setNote] = useState(false);
  const sequence = useRef(0);

  function requestReport(fail: boolean) {
    const promise = load(fail);

    // También observa rechazos de solicitudes que no se lleguen a mostrar.
    void promise.catch(() => {});

    sequence.current += 1;
    setRequest({
      id: sequence.current,
      promise,
    });
  }

  return (
    <section aria-labelledby="resources-title">
      <h2 id="resources-title">Lectura de recursos</h2>

      <label>
        <input
          type="checkbox"
          checked={note}
          onChange={(e) => setNote(e.target.checked)}
        />
        Mostrar nota del informe
      </label>

      <ResourceNote visible={note} />

      <div className="buttons">
        <button onClick={() => requestReport(false)}>
          Leer disponibilidad
        </button>

        <button onClick={() => requestReport(true)}>
          Simular error
        </button>
      </div>

      {request && (
        <ReportBoundary key={request.id}>
          <Suspense fallback={<p role="status">Cargando informe…</p>}>
            <Availability promise={request.promise} />
          </Suspense>
        </ReportBoundary>
      )}
    </section>
  );
}
