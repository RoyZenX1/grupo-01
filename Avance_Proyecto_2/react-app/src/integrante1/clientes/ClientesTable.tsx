import { useState } from 'react'
import { useAuth } from '../../integrante5/auth/auth.context'
import type { Cliente } from './cliente.types'

interface ClientesTableProps {
  clientes: Cliente[]
  sinResultados: boolean
  eliminandoId: string | null
  onVer: (cliente: Cliente) => void
  onEditar: (cliente: Cliente) => void
  onEliminar: (id: string) => void
}

function obtenerIniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('')
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

  const esAdministrador = useAuth().tieneRol('Administrador')

  return (
    <section className="workspace-card clientes-tabla-card">
      <div className="clientes-tabla-encabezado">
        <div>
          <h3>Clientes registrados</h3>
          <p>Información general de tus clientes.</p>
        </div>
      </div>

      {clientes.length === 0 ? (
        <div className="clientes-vacio">
          <div className="clientes-vacio-icono">♧</div>
          <h4>No se encontraron clientes</h4>
          <p>
            {sinResultados
              ? 'Intenta cambiar los criterios de búsqueda.'
              : 'Todavía no hay clientes registrados.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table clientes-table align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Identificación</th>
                <th scope="col">Correo electrónico</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>
                    <div className="cliente-identidad">
                      <span className="cliente-avatar">
                        {obtenerIniciales(cliente.nombre)}
                      </span>

                      <div>
                        <strong>{cliente.nombre}</strong>
                        <small>
                          {cliente.identificacion.length === 11
                            ? 'Empresa'
                            : 'Persona'}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="cliente-documento">
                      {cliente.identificacion}
                    </span>
                  </td>

                  <td>{cliente.email}</td>

                  <td>{cliente.telefono}</td>

                  <td>
                    {confirmacionId === cliente.id ? (
                      <div className="cliente-confirmacion">
                        <span>¿Eliminar?</span>

                        <button
                          className="btn btn-sm btn-danger"
                          type="button"
                          disabled={eliminandoId === cliente.id}
                          onClick={() => {
                            onEliminar(cliente.id)
                            setConfirmacionId(null)
                          }}
                        >
                          {eliminandoId === cliente.id
                            ? 'Eliminando...'
                            : 'Sí'}
                        </button>

                        <button
                          className="btn btn-sm btn-light"
                          type="button"
                          onClick={() => setConfirmacionId(null)}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="cliente-acciones">
                        <button
                          className="cliente-btn-ver"
                          type="button"
                          title="Ver detalle"
                          onClick={() => onVer(cliente)}
                        >
                          Ver
                        </button>

                        <button
                          className="cliente-btn-editar"
                          type="button"
                          title="Editar cliente"
                          onClick={() => onEditar(cliente)}
                        >
                          Editar
                        </button>

                        {esAdministrador && (
                          <button
                            className="cliente-btn-eliminar"
                            type="button"
                            title="Eliminar cliente"
                            disabled={eliminandoId === cliente.id}
                            onClick={() => setConfirmacionId(cliente.id)}
                          >
                            Eliminar
                          </button>
                        )}
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
