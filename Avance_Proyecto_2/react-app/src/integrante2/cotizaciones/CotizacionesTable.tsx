import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EstadoPill } from '../../shared/components/EstadoPill'
import { estadoEfectivo, formatearMoneda } from './cotizacion.calculations'
import type { Cotizacion, EstadoCotizacion } from './cotizacion.types'

interface CotizacionesTableProps {
  cotizaciones: Cotizacion[]
  sinResultados: boolean
  nombreCliente: (clienteId: string) => string
  /** cotizacionId → id de la orden vigente que se generó con ella. */
  ordenPorCotizacion: Map<string, { id: string; codigo: string }>
  ocupadoId: string | null
  onVer: (cotizacion: Cotizacion) => void
  onEditar: (cotizacion: Cotizacion) => void
  onCambiarEstado: (id: string, estado: EstadoCotizacion) => void
  onEliminar: (id: string) => void
}

export function CotizacionesTable({
  cotizaciones,
  sinResultados,
  nombreCliente,
  ordenPorCotizacion,
  ocupadoId,
  onVer,
  onEditar,
  onCambiarEstado,
  onEliminar,
}: CotizacionesTableProps) {
  const [confirmacionId, setConfirmacionId] = useState<string | null>(null)

  return (
    <section className="workspace-card">
      <h2>Cotizaciones registradas</h2>
      {cotizaciones.length === 0 ? (
        <p className="text-secondary mb-0">
          {sinResultados
            ? 'Ninguna cotización coincide con los filtros.'
            : 'Aún no hay cotizaciones registradas.'}
        </p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Cliente</th>
                <th scope="col">Ruta</th>
                <th scope="col">Emisión</th>
                <th scope="col" className="text-end">Total</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.map((c) => {
                const estado = estadoEfectivo(c)
                const orden = ordenPorCotizacion.get(c.id)
                const ocupada = ocupadoId === c.id
                return (
                  <tr key={c.id}>
                    <th scope="row">{c.id}</th>
                    <td>{nombreCliente(c.clienteId)}</td>
                    <td>{c.origen} → {c.destino}</td>
                    <td>{c.fechaEmision}</td>
                    <td className="text-end">{formatearMoneda(c.total)}</td>
                    <td><EstadoPill estado={estado} /></td>
                    <td>
                      {confirmacionId === c.id ? (
                        <div className="table-actions">
                          <span className="small">¿Eliminar {c.id}?</span>
                          <button
                            className="btn btn-sm btn-danger"
                            type="button"
                            disabled={ocupada}
                            onClick={() => {
                              onEliminar(c.id)
                              setConfirmacionId(null)
                            }}
                          >
                            Confirmar
                          </button>
                          <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => setConfirmacionId(null)}>
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="table-actions">
                          <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => onVer(c)}>
                            Ver
                          </button>
                          {estado === 'Pendiente' && (
                            <>
                              <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => onEditar(c)}>
                                Editar
                              </button>
                              <button
                                className="btn btn-sm btn-success"
                                type="button"
                                disabled={ocupada}
                                onClick={() => onCambiarEstado(c.id, 'Aprobada')}
                              >
                                Aprobar
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                type="button"
                                disabled={ocupada}
                                onClick={() => onCambiarEstado(c.id, 'Rechazada')}
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          {estado === 'Aprobada' && !orden && (
                            <Link className="btn btn-sm btn-primary" to={`/ordenes?cotizacionId=${encodeURIComponent(c.id)}`}>
                              Convertir en orden
                            </Link>
                          )}
                          {orden && (
                            <Link className="btn btn-sm btn-outline-primary" to={`/ordenes?orden=${encodeURIComponent(orden.id)}`}>
                              Ver {orden.codigo}
                            </Link>
                          )}
                          <button
                            className="btn btn-sm btn-outline-danger"
                            type="button"
                            disabled={Boolean(orden) || ocupada}
                            title={orden ? 'Ya tiene una orden asociada' : undefined}
                            onClick={() => setConfirmacionId(c.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
