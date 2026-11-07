import {
  memo, useCallback, useDeferredValue, useMemo, useState, useTransition,
} from 'react';
import { WORKSHOPS } from './workshops';

type Entry = { id: number; title: string };

const CATALOG: Entry[] = Array.from({ length: 6000 }, (_, i) => {
  const base = WORKSHOPS[i % WORKSHOPS.length];
  return { id: i + 1, title: base.title + ' ' + (i + 1) };
});

const collator = new Intl.Collator('es-PE', { numeric: true });

const Results = memo(function Results({
  rows, onPick,
}: { rows: readonly Entry[]; onPick: (title: string) => void }) {
  return (
    <ul>
      {rows.map((row) => (
        <li key={row.id}>
          <button onClick={() => onPick(row.title)}>{row.title}</button>
        </li>
      ))}
    </ul>
  );
});

export function Catalog() {
  const [query, setQuery] = useState('');
  const [reverse, setReverse] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const pick = useCallback((title: string) => setSelected(title), []);

  const rows = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const filtered = q
      ? CATALOG.filter((e) => e.title.toLowerCase().includes(q))
      : CATALOG;
    const sorted = [...filtered].sort((a, b) =>
      reverse ? collator.compare(b.title, a.title) : collator.compare(a.title, b.title)
    );
    return sorted.slice(0, 12);
  }, [deferredQuery, reverse]);

  const total = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return q
      ? CATALOG.filter((e) => e.title.toLowerCase().includes(q)).length
      : CATALOG.length;
  }, [deferredQuery]);

  return (
    <section aria-labelledby="catalog-title">
      <h2 id="catalog-title">Catálogo de talleres</h2>
      <label>
        Buscar talleres
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div className="buttons">
        <button
          aria-pressed={reverse}
          onClick={() => startTransition(() => setReverse((v) => !v))}
        >
          Orden inverso
        </button>
      </div>
      {isPending && <p role="status">Actualizando resultados...</p>}
      <p role="status">{total} coincidencias</p>
      {rows.length === 0
        ? <p>Sin coincidencias</p>
        : <Results rows={rows} onPick={pick} />}
      {selected && <p>Selección: {selected}.</p>}
    </section>
  );
}