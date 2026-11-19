import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { failureText } from './contract';
import type { Receipt, Reservation, Workshop } from './contract';

type Props = {
  data?: Workshop[];
  error?: unknown;
  loading: boolean;
  refreshing?: boolean;
  canReserve: boolean;
  refresh: () => void;
  cancel?: () => void;
  reserve: (input: Reservation) => Promise<Receipt>;
};

export function Panel(props: Props) {
  const { data, error, loading, refreshing, canReserve } = props;

  const [selected, setSelected] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [receipt, setReceipt] = useState<Receipt>();
  const [writeError, setWriteError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const lock = useRef(false);
  const titleId = useId();

  const workshopId = data?.some((item) => item.id === selected)
    ? selected
    : data?.[0]?.id ?? '';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (lock.current || !canReserve || !workshopId) return;

    lock.current = true;
    setSaving(true);
    setReceipt(undefined);
    setWriteError(undefined);

    try {
      setReceipt(
        await props.reserve({
          workshopId,
          seats: Number(quantity),
        }),
      );
    } catch (cause) {
      setWriteError(failureText(cause));
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby={titleId}>
      <h2 id={titleId}>Disponibilidad de talleres</h2>

      <div className="actions">
        <button
          onClick={props.refresh}
          disabled={loading || refreshing}
        >
          Actualizar
        </button>

        {props.cancel && (
          <button
            onClick={props.cancel}
            disabled={!loading && !refreshing}
          >
            Cancelar consulta
          </button>
        )}
      </div>

      <p role="status">
        {loading
          ? 'Cargando talleres…'
          : refreshing
            ? 'Actualizando talleres…'
            : data
              ? data.length
                ? 'Catálogo disponible.'
                : 'No hay talleres.'
              : error == null
                ? 'Sin consulta activa. Pulsa Actualizar.'
                : ''}
      </p>

      {error != null && (
        <p role="alert">{failureText(error)}</p>
      )}

      {data && data.length > 0 && (
        <ul aria-label="Cupos por taller">
          {data.map((item) => (
            <li key={item.id}>
              {item.title}: {item.seats} plazas
            </li>
          ))}
        </ul>
      )}

      {canReserve && data && data.length > 0 && (
        <form onSubmit={submit}>
          <fieldset disabled={saving}>
            <legend>Reserva de práctica</legend>

            <label>
              Taller para reservar
              <select
                value={workshopId}
                onChange={(e) => setSelected(e.target.value)}
              >
                {data.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Cantidad de plazas
              <select
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>

            <button type="submit">
              {saving ? 'Reservando…' : 'Reservar'}
            </button>
          </fieldset>
        </form>
      )}

      {receipt && (
        <p role="status">
          Reserva confirmada. Quedan {receipt.remaining} plazas en ese taller.
        </p>
      )}

      {writeError && <p role="alert">{writeError}</p>}
    </section>
  );
}
