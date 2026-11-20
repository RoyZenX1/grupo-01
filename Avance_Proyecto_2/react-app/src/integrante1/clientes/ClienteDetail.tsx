import type { Cliente } from './cliente.types'

interface ClienteDetailProps {
  cliente: Cliente
  onCerrar: () => void
}

export function ClienteDetail({ cliente, onCerrar }: ClienteDetailProps) {
  return (
    <section className="workspace-card" aria-label={`Detalle de ${cliente.nombre}`}>
      <div className="d-flex justify-content-between align-items-start gap-3">
        <h2>Detalle del cliente</h2>
        <button className="btn btn-sm btn-outline-secondary" type="button" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
      <dl className="detail-list">
        <dt>Nombre</dt>
        <dd>{cliente.nombre}</dd>
        <dt>DNI / RUC</dt>
        <dd>{cliente.identificacion}</dd>
        <dt>Correo electrónico</dt>
        <dd>{cliente.email}</dd>
        <dt>Teléfono</dt>
        <dd>{cliente.telefono}</dd>
      </dl>
    </section>
  )
}
