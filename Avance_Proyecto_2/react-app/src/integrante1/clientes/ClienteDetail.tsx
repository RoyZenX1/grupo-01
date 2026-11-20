import type { Cliente } from './cliente.types'

interface ClienteDetailProps {
  cliente: Cliente
  onCerrar: () => void
}

export function ClienteDetail({
  cliente,
  onCerrar,
}: ClienteDetailProps) {
  const iniciales = cliente.nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('')

  return (
    <section className="workspace-card cliente-detail-card">

      <div className="cliente-detail-heading">
        <div>
          <span className="cliente-detail-etiqueta">
            INFORMACIÓN DEL CLIENTE
          </span>
          <h3>Detalle del cliente</h3>
        </div>

        <button
          type="button"
          className="cliente-detail-cerrar"
          onClick={onCerrar}
        >
          Cerrar ×
        </button>
      </div>

      <div className="cliente-detail-identidad">
        <span className="cliente-detail-avatar">
          {iniciales}
        </span>

        <div>
          <h4>{cliente.nombre}</h4>
          <span>
            {cliente.identificacion.length === 11
              ? 'Empresa · RUC'
              : 'Persona · DNI'}
          </span>
        </div>
      </div>

      <div className="cliente-detail-datos">

        <div>
          <span>Documento de identidad</span>
          <strong>{cliente.identificacion}</strong>
        </div>

        <div>
          <span>Correo electrónico</span>
          <strong>{cliente.email}</strong>
        </div>

        <div>
          <span>Teléfono</span>
          <strong>{cliente.telefono}</strong>
        </div>

      </div>
    </section>
  )
}
