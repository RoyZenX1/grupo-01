import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export const DetailsContext = createContext(true);

export function Preferences({ children }: { children: ReactNode }) {
  const [details, setDetails] = useState(true);

  return (
    <DetailsContext value={details}>
      <label>
        <input
          type="checkbox"
          checked={details}
          onChange={(event) => setDetails(event.target.checked)}
        />
        Mostrar orientación detallada
      </label>
      {children}
    </DetailsContext>
  );
}

export function Orientation() {
  const details = useContext(DetailsContext);

  return (
    <p>
      {details
        ? 'Orientación detallada: ensaya el límite de cuatro plazas.'
        : 'Orientación breve.'}
    </p>
  );
}