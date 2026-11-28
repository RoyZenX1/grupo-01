'use client';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { reserve } from '../lib/http.mjs';

export default function Catalog({ items, readError }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [pending, startTransition] = useTransition();
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const [quantities, setQuantities] = useState({});

  const visible = items.filter(w =>
    w.title.toLowerCase().includes(search.toLowerCase().trim())
  );

  async function book(id, maxSeats) {
    const qty = Number(quantities[id] ?? 1);
    if (!Number.isInteger(qty) || qty < 1 || qty > 4 || qty > maxSeats) {
      setError('Cantidad inválida o supera los cupos disponibles.');
      return;
    }
    if (lock.current || pending) return;
    lock.current = true;
    setSaving(true);
    setError('');
    setConfirmation(null);
    try {
      setConfirmation(await reserve({ workshopId: id, seats: qty }));
    } catch (e) {
      setError(`${e.message}. Consulta antes de repetir.`);
    } finally {
      startTransition(() => router.refresh());
      setSaving(false);
      lock.current = false;
    }
  }

  return <>
    <label>Buscar <input type="search" value={search}
      onChange={e => setSearch(e.target.value)} /></label>
    {!readError && <p>Cupos totales: {items.reduce((n, w) => n + w.seats, 0)}</p>}
    <button disabled={saving || pending}
      onClick={() => startTransition(() => router.refresh())}>Actualizar</button>
    {readError && <p role="alert">Lectura fallida: {readError}</p>}
    {!readError && visible.length === 0 && <p>Sin resultados</p>}
    <div className="tiles">{visible.map(w => {
      const qty = quantities[w.id] ?? 1;
      const invalidQty = !Number.isInteger(qty) || qty < 1 || qty > 4 || qty > w.seats;
      return (
        <article className="tile" key={w.id}>
          <h2>{w.title}</h2>
          <p>{w.seats} cupos disponibles</p>
          <label>
            Cupos (1–4):{' '}
            <input
              type="number"
              min={1}
              max={4}
              step={1}
              value={qty}
              disabled={saving || pending || w.seats === 0}
              onChange={e => setQuantities(prev => ({ ...prev, [w.id]: Number(e.target.value) }))}
            />
          </label>
          <button
            disabled={saving || pending || w.seats === 0 || invalidQty}
            onClick={() => book(w.id, w.seats)}
          >
            Reservar {qty} cupo(s)
          </button>
        </article>
      );
    })}</div>
    {(saving || pending) && <p role="status">Procesando...</p>}
    {error && <p role="alert">{error}</p>}
    {confirmation && <p role="status">Reserva {confirmation.id}.
      Saldo al confirmar: {confirmation.remaining}.</p>}
  </>;
}
