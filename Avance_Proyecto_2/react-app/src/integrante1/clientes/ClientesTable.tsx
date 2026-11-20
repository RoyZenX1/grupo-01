import { useState } from 'react'
import type { Cliente } from './cliente.types'

interface ClientesTableProps {
  clientes: Cliente[]
  sinResultados: boolean
  eliminandoId: string | null
  onVer: (cliente: Cliente) => void
  onEditar: (cliente: Cliente) => void
  onEliminar: (id: string) => void
}

export function ClientesTable({
  clientes,
  sinResultados,
  eliminandoId,
  onVer,
  onEditar,
  onEliminar,
}: ClientesTableProps) {
  const [confirmacionId, setConfirmacionId] = useState<string | null>(null)

  return (
    <section className="workspace-card">
      <h2>Clientes registrados</h2>
      {clientes.length === 0 ? (
        <p className="text-secondary mb-0">
          {sinResultados
            ? 'Ningún cliente coincide con la búsqueda.'
            : 'No hay clientes registrados.'}
        </p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">DNI / RUC</th>
                <th scope="col">Correo</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <th scope="row">{cliente.nombre}</th>
                  <td>{cliente.identificacion}</td>
                  <td>{cliente.email}</td>
                  <td>{cliente.telefono}</td>
                  <td>
                    {confirmacionId === cliente.id ? (
                      <div className="table-actions">
                        <span className="small">¿Eliminar este cliente?</span>
                        <button
                          className="btn btn-sm btn-danger"
                          type="button"
                          disabled={eliminandoId === cliente.id}
                          onClick={() => {
                            onEliminar(cliente.id)
                            setConfirmacionId(null)
                          }}
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
                      <div className="table-actions">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          type="button"
                          onClick={() => onVer(cliente)}
                        >
                          Ver
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          type="button"
                          onClick={() => onEditar(cliente)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          type="button"
                          disabled={eliminandoId === cliente.id}
                          onClick={() => setConfirmacionId(cliente.id)}
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
    </section>
  )
}
