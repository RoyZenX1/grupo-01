import { useActionState, useOptimistic, useState } from 'react';
import { useFormStatus } from 'react-dom';

type Receipt = {
  confirmed: number;
  message: string;
  failed: boolean;
};

type Save = (fail: boolean) => Promise<boolean>;

const INITIAL: Receipt = {
  confirmed: 0,
  message: '',
  failed: false,
};

async function simulateSave(fail: boolean) {
  await new Promise<void>((resolve) => setTimeout(resolve, 750));
  return !fail;
}

function SubmitBooking() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Reservando…' : 'Reservar plazas'}
    </button>
  );
}

export function Booking({ save = simulateSave }: { save?: Save }) {
  const [simulateFailure, setSimulateFailure] = useState(false);

  const [receipt, reserve, pending] = useActionState<Receipt, FormData>(
    async (previous, data) => {
      const raw = data.get('quantity');

      const amount =
        raw === '1' || raw === '2' || raw === '3'
          ? Number(raw)
          : 0;

      if (!amount || previous.confirmed + amount > 4) {
        return {
          ...previous,
          failed: true,
          message: 'Máximo de cuatro plazas.',
        };
      }

      addOptimistic(amount);

      try {
        if (await save(simulateFailure)) {
          return {
            confirmed: previous.confirmed + amount,
            message: 'Reserva simulada confirmada.',
            failed: false,
          };
        }
      } catch {
        // El fallo de la operación se traduce a un resultado recuperable.
      }

      return {
        ...previous,
        failed: true,
        message: 'No se confirmó la reserva. Reintenta.',
      };
    },
    INITIAL,
  );

  const [visible, addOptimistic] = useOptimistic<number, number>(
    receipt.confirmed,
    (current, amount) => current + amount,
  );

  return (
    <section aria-labelledby="booking-title">
      <h2 id="booking-title">Reserva asíncrona simulada</h2>

      <p>
        Confirmadas: {receipt.confirmed}. Visibles: {visible}.
      </p>

      <label>
        <input
          type="checkbox"
          checked={simulateFailure}
          disabled={pending}
          onChange={(e) => setSimulateFailure(e.target.checked)}
        />
        Simular fallo de reserva
      </label>

      <form action={reserve}>
        <fieldset disabled={pending}>
          <legend>Plazas del equipo</legend>

          <label>
            Cantidad
            <select name="quantity" defaultValue="1">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </label>

          <SubmitBooking />
        </fieldset>
      </form>

      {receipt.failed ? (
        <p role="alert">{receipt.message}</p>
      ) : (
        <p role="status">{receipt.message}</p>
      )}
    </section>
  );
}
