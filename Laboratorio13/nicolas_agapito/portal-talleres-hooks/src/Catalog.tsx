import {
  memo,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { WORKSHOPS } from './workshops';

type Entry = { id: number; title: string };

const CATALOG: Entry[] = Array.from({ length: 6000 }, (_, i) => {
  const base = WORKSHOPS[i % WORKSHOPS.length];
  return { id: i + 1, title: base.title + ' ' + (i + 1) };
});

const collator = new Intl.Collator('es-PE', { numeric: true });

const Results = memo(function Results({
  rows,
  onPick,
}: {
  rows: readonly Entry[];
  onPick: (title: string) => void;
}) {
  return (
    <ul>
      {rows.map((row) => (
        <li key={row.id}>
          <button onClick={() => onPick(row.title)}>
            {row.title}
          </button>
        </li>
      ))}
    </ul>
  );
});

export function Catalog() {
  const [query, setQuery] = useState('');
  const [reverse, setReverse] = useState(false);
  const [selected, setSelected] = useState('');
  const [isPending, startTransition] = useTransition();
  const deferred = useDeferredValue(query);

  const { rows, count } = useMemo(() => {
    const q = deferred.trim().toLocaleLowerCase('es-PE');

    const found = CATALOG.filter((row) =>
      row.title.toLocaleLowerCase('es-PE').includes(q),
    );

    found.sort((a, b) => {
      const order = collator.compare(a.title, b.title);
      return reverse ? -order : order;
    });

    return { rows: found.slice(0, 12), count: found.length };
  }, [deferred, reverse]);

  const pick = useCallback((title: string) => setSelected(title), []);

  return (
    <section aria-labelledby="catalog-title">
      <h2 id="catalog-title">Catálogo con prioridades</h2>

      <label>
        Buscar talleres
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Escribe el nombre del taller"
        />
      </label>

      <div className="buttons">
        <button
          aria-pressed={reverse}
          onClick={() => startTransition(() => setReverse((x) => !x))}
        >
          Orden inverso
        </button>
      </div>

      <p role="status">
        {deferred !== query || isPending
          ? 'Actualizando resultados…'
          : count + ' coincidencias. Se muestran hasta 12.'}
      </p>

      <p>Selección: {selected || 'ninguna'}.</p>

      {count === 0 ? (
        <p>Sin coincidencias.</p>
      ) : (
        <Results rows={rows} onPick={pick} />
      )}
    </section>
  );
}
