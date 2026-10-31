import { Link } from 'react-router';
import type { Receipt } from '../model/registration';

export function ConfirmationPage({ receipt }: { readonly receipt: Receipt | null }) {
  return (
    <>
      <h1>Confirmación de laboratorio</h1>
      {receipt ? (
        <>
          <p role="status">
            Solicitud simulada procesada. Referencia {receipt.reference}.
          </p>
          <p>Se recibió un equipo de {receipt.payload.participants.length} persona(s).</p>
          <h2 className="h4">Objeto preparado para un futuro servicio</h2>
          <pre className="payload">{JSON.stringify(receipt.payload, null, 2)}</pre>
        </>
      ) : (
        <p>No hay una solicitud en memoria. La recarga elimina la confirmación local.</p>
      )}
      <Link className="btn btn-outline-primary" to="/">Volver al catálogo</Link>
    </>
  );
}