import { useState } from 'react'
import { Link } from 'react-router-dom'
import { esEstadoVehiculo, ESTADOS_VEHICULO } from './vehiculo.types'
import type { EstadoVehiculo, Vehiculo } from './vehiculo.types'

interface VehiculosTableProps {
  vehiculos: Vehiculo[]
  sinResultados: boolean
  eliminandoId: string | null
  onEditar: (vehiculo: Vehiculo) => void
  onCambiarEstado: (id: string, estado: EstadoVehiculo) => void
  onEliminar: (id: string) => void
}

export function VehiculosTable({
  vehiculos,
  sinResultados,
  eliminandoId,
  onEditar,
  onCambiarEstado,
  onEliminar,
}: VehiculosTableProps) {
  const [confirmacionId, setConfirmacionId] = useState<string | null>(null)

  function confirmarEliminacion(id: string) {
    onEliminar(id)
    setConfirmacionId(null)
  }

  return (
    <section className="card shadow-sm">
      <div className="card-body">
        <h2 className="h4 mb-3">Vehículos registrados</h2>
        {vehiculos.length === 0 ? (
          <p className="text-secondary mb-0">
            {sinResultados
              ? 'Ningún vehículo coincide con la búsqueda y los filtros.'
              : 'No hay vehículos registrados.'}
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Placa</th>
                  <th scope="col">Modelo</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Capacidad</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.map((vehiculo) => (
                  <tr key={vehiculo.id}>
                    <th scope="row">
                      <Link
                        className="vehiculo-code-link"
                        to={`/vehiculos/${encodeURIComponent(vehiculo.codigo)}`}
                      >
                        {vehiculo.codigo}
                      </Link>
                    </th>
                    <td>{vehiculo.placa}</td>
                    <td>{vehiculo.modelo || '—'}</td>
                    <td>{vehiculo.tipo}</td>
                    <td>{vehiculo.capacidad} t</td>
                    <td>
                      <label className="visually-hidden" htmlFor={`estado-${vehiculo.id}`}>
                        Estado del vehículo {vehiculo.codigo}
                      </label>
                      <select
                        className="form-select form-select-sm"
                        data-estado={vehiculo.estado}
                        id={`estado-${vehiculo.id}`}
                        value={vehiculo.estado}
                        onChange={(event) => {
                          const estado = event.currentTarget.value
                          if (esEstadoVehiculo(estado)) {
                            onCambiarEstado(vehiculo.id, estado)
                          }
                        }}
                      >
                        {ESTADOS_VEHICULO.map((estado) => (
                          <option key={estado} value={estado}>{estado}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {confirmacionId === vehiculo.id ? (
                        <div className="vehiculo-action-group">
                          <span className="small">
                            ¿Eliminar {vehiculo.codigo}?
                          </span>
                          <button
                            className="btn btn-sm btn-danger"
                            type="button"
                            disabled={eliminandoId === vehiculo.id}
                            onClick={() => confirmarEliminacion(vehiculo.id)}
                          >
                            Confirmar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            type="button"
                            onClick={() => setConfirmacionId(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="vehiculo-action-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            type="button"
                            onClick={() => onEditar(vehiculo)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            type="button"
                            disabled={eliminandoId === vehiculo.id}
                            onClick={() => setConfirmacionId(vehiculo.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}