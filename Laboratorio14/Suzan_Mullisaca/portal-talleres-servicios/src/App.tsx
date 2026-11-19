import { useState } from 'react';
import { MODES } from './contract';
import type { Mode } from './contract';
import { axiosClient, fetchClient, kyClient, xhrClient } from './http';
import { ManualPanel } from './ManualPanel';
import { AlovaPanel } from './AlovaPanel';
import { QueryPanel } from './QueryPanel';
import { SwrPanel } from './SwrPanel';

const manual = {
  'Fetch API': fetchClient,
  Axios: axiosClient,
  Ky: kyClient,
  XMLHttpRequest: xhrClient,
};

const tools = [
  'Fetch API', 'Axios', 'XMLHttpRequest', 'Ky', 'Alova', 'TanStack Query', 'SWR',
] as const;

type Tool = (typeof tools)[number];

function Station({ tool, mode }: { tool: Tool; mode: Mode }) {
  if (tool === 'Alova') return <AlovaPanel mode={mode} />;
  if (tool === 'TanStack Query') return <QueryPanel mode={mode} />;
  if (tool === 'SWR') return <SwrPanel mode={mode} />;
  return <ManualPanel mode={mode} client={manual[tool]} />;
}

export function App() {
  const [tool, setTool] = useState<Tool>('Fetch API');
  const [mode, setMode] = useState<Mode>('normal');

  return <main>
    <h1>Portal de talleres</h1>
    <p>Semana 14 · Servicios en React · Datos de práctica</p>

    <nav aria-label="Herramientas" className="actions">
      {tools.map((name) => (
        <button
          key={name}
          aria-pressed={name === tool}
          onClick={() => setTool(name)}
        >
          {name}
        </button>
      ))}
    </nav>

    <label>
      Escenario de la API
      <select value={mode} onChange={(e) => {
        const next = MODES.find((m) => m.id === e.target.value);
        if (next) setMode(next.id);
      }}>
        {MODES.map((m) => (
          <option key={m.id} value={m.id}>{m.label}</option>
        ))}
      </select>
    </label>

    <Station key={tool + ':' + mode} tool={tool} mode={mode} />
  </main>;
}
