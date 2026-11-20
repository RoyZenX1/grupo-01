
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { listarVehiculos } from '../../integrante3/vehiculos/vehiculos.api.ts'
import { useAuth } from '../../integrante5/auth/auth.context.tsx'
import { listarCotizacionesParaOrden } from './cotizaciones.ordenes.api.ts'
import { OrdenDetail } from './OrdenDetail.tsx'
import { OrdenForm } from './OrdenForm.tsx'
import { estadosSiguientes } from './ordenes.estados.ts'
import {
  VEHICULOS_QUERY_KEY,
  useCambiarEstadoOrden,
  useCrearOrden,
  useOrdenes,
} from './ordenes.queries.ts'
import { ESTADOS_ORDEN } from './ordenes.types.ts'
import type { EstadoOrden, Orden, OrdenWrite } from './ordenes.types.ts'
import './ordenes.css'

export function OrdenesPage() {
  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [error, setError] = useState('')
  // null = sin elegir todavía (se usa ?orden=), '' = cerrado por el usuario.
  const [idDetalle, setIdDetalle] = useState<string | null>(null)

  const esAdministrador = useAuth().tieneRol('Administrador')

  const [searchParams, setSearchParams] = useSearchParams()
  const cotizacionIdParam = searchParams.get('cotizacionId')
  const ordenIdParam = searchParams.get('orden')

  const mostrarFormulario =
    formularioAbierto || cotizacionIdParam !== null

  // Órdenes con TanStack Query.
  const {
    data: ordenes = [],
    isLoading: cargandoOrdenes,
    isError: errorOrdenes,
    error: detalleErrorOrdenes,
    refetch: recargarOrdenes,
  } = useOrdenes()

  // Vehículos (se refrescan solos cuando una orden los ocupa o libera).
  const { data: vehiculosAPI = [] } = useQuery({
    queryKey: VEHICULOS_QUERY_KEY,
    queryFn: listarVehiculos,
  })

  // Cotizaciones.
  const {
    data: cotizacionesAPI = [],
    isSuccess: cotizacionesCargadas,
  } = useQuery({
    queryKey: ['cotizaciones-para-orden'],
    queryFn: listarCotizacionesParaOrden,
  })

  // Una cotización con una orden vigente no se vuelve a ofrecer.
  const cotizacionesConOrden = new Set(
    ordenes
      .filter((orden) => orden.estado !== 'Cancelada')
      .map((orden) => orden.cotizacionId),
  )
  const cotizacionesDisponibles = cotizacionesAPI.filter(
    (cotizacion) => !cotizacionesConOrden.has(cotizacion.id),
  )

  const cotizacionPreseleccionada = cotizacionIdParam
    ? cotizacionesAPI.find((item) => item.id === cotizacionIdParam)
    : undefined

  const avisoCotizacion =
    !cotizacionIdParam || !cotizacionesCargadas || cargandoOrdenes
      ? ''
      : !cotizacionPreseleccionada
        ? `La cotización ${cotizacionIdParam} no existe.`
        : cotizacionPreseleccionada.estado !== 'Aprobada'
          ? `La cotización ${cotizacionIdParam} no está aprobada.`
          : cotizacionesConOrden.has(cotizacionIdParam)
            ? `La cotización ${cotizacionIdParam} ya tiene una orden registrada.`
            : ''

  const idDetalleActivo =
    idDetalle === null ? ordenIdParam : idDetalle || null
  const ordenDetalle = idDetalleActivo
    ? ordenes.find((orden) => orden.id === idDetalleActivo)
    : undefined

  // Cerrar formulario y limpiar la cotización seleccionada de la URL.
  function cerrarFormulario() {
    setFormularioAbierto(false)

    if (cotizacionIdParam) {
      const siguientes = new URLSearchParams(searchParams)
      siguientes.delete('cotizacionId')
      setSearchParams(siguientes, { replace: true })
    }
  }

  function abrirFormulario() {
    setFormularioAbierto(true)
  }

  function abrirDetalle(id: string) {
    setIdDetalle(id)
  }

  function cerrarDetalle() {
    setIdDetalle('')

    if (ordenIdParam) {
      const siguientes = new URLSearchParams(searchParams)
      siguientes.delete('orden')
      setSearchParams(siguientes, { replace: true })
    }
  }

  // Registrar una orden (también marca el vehículo como Ocupado).
  const crearOrdenMutation = useCrearOrden(ordenes)

  // Cambiar estado (respeta el flujo y libera el vehículo al terminar).
  const actualizarEstadoMutation = useCambiarEstadoOrden()

  // Función que recibe los datos del formulario.
  async function registrarOrden(datos: OrdenWrite) {
    setError('')

    try {
      await crearOrdenMutation.mutateAsync(datos)
      cerrarFormulario()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar la orden.',
      )
    }
  }

  // Cambiar el estado de una orden.
  async function cambiarEstadoOrden(
    orden: Orden,
    estado: EstadoOrden,
  ) {
    setError('')

    if (
      estado === 'Cancelada' &&
      !window.confirm(
        `¿Cancelar la orden ${orden.codigo}? Esta acción no se puede deshacer.`,
      )
    ) {
      return
    }

    try {
      await actualizarEstadoMutation.mutateAsync({ orden, estado })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el estado de la orden.',
      )
    }
  }

  const mensajeError = error || (
    errorOrdenes
      ? detalleErrorOrdenes instanceof Error
        ? detalleErrorOrdenes.message
        : 'No se pudieron cargar las órdenes.'
      : ''
  )

  return (
    <main className="ordenes-page">
      <header className="ordenes-header">
        <div>
          <h1>Gestión de órdenes</h1>
          <p>Administra y consulta las órdenes de transporte.</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={mostrarFormulario ? cerrarFormulario : abrirFormulario}
          disabled={crearOrdenMutation.isPending}
        >
          {mostrarFormulario ? 'Cerrar formulario' : '+ Nueva orden'}
        </button>
      </header>

      {mensajeError && (
        <div className="alert alert-danger" role="alert">
          {mensajeError}

          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => {
              setError('')
              void recargarOrdenes()
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Resumen de órdenes */}
      <section className="ordenes-resumen">
        <article className="ordenes-card">
          <span>Total de órdenes</span>
          <strong>{ordenes.length}</strong>
        </article>

        <article className="ordenes-card">
          <span>Pendientes</span>
          <strong>
            {ordenes.filter((orden) => orden.estado === 'Pendiente').length}
          </strong>
        </article>

        <article className="ordenes-card">
          <span>En ruta</span>
          <strong>
            {ordenes.filter((orden) => orden.estado === 'En ruta').length}
          </strong>
        </article>

        <article className="ordenes-card">
          <span>Completadas</span>
          <strong>
            {ordenes.filter((orden) => orden.estado === 'Completada').length}
          </strong>
        </article>
      </section>

      {/* Formulario de registro */}
      {mostrarFormulario && (
        <>
          {avisoCotizacion && (
            <div
              className="alert alert-warning ordenes-aviso-cotizacion"
              role="alert"
            >
              {avisoCotizacion}
            </div>
          )}
          {cotizacionPreseleccionada && !avisoCotizacion && (
            <div
              className="alert alert-info ordenes-aviso-cotizacion"
              role="status"
            >
              Cotización {cotizacionPreseleccionada.id} cargada desde
              Cotizaciones. Elige un vehículo para registrar la orden.
            </div>
          )}
        <OrdenForm
          cotizaciones={cotizacionesDisponibles}
          vehiculos={vehiculosAPI}
          cotizacionInicialId={cotizacionIdParam}
          onGuardar={registrarOrden}
          onCancelar={cerrarFormulario}
        />
        </>
      )}

      {/* Detalle de la orden */}
      {ordenDetalle && (
        <OrdenDetail
          orden={ordenDetalle}
          vehiculo={vehiculosAPI.find(
            (vehiculo) => vehiculo.id === ordenDetalle.vehiculoId,
          )}
          puedeCancelar={esAdministrador}
          cambiando={actualizarEstadoMutation.isPending}
          onCambiarEstado={(orden, estado) =>
            void cambiarEstadoOrden(orden, estado)
          }
          onCerrar={cerrarDetalle}
        />
      )}

      {/* Listado de órdenes */}
      <section className="ordenes-listado">
        <h2>Listado de órdenes</h2>

        {cargandoOrdenes ? (
          <p>Cargando órdenes...</p>
        ) : ordenes.length === 0 ? (
          <div className="ordenes-vacio">
            <h3>No hay órdenes registradas</h3>
            <p>
              Cuando registres una orden, aparecerá aquí toda su información.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Distancia</th>
                  <th>Peso</th>
                  <th>Tarifa</th>
                  <th>Estado</th>
                  <th>Detalle</th>
                </tr>
              </thead>

              <tbody>
                {ordenes.map((orden) => (
                  <tr
                    key={orden.id}
                    className={
                      orden.id === ordenIdParam
                        ? 'table-warning'
                        : undefined
                    }
                  >
                    <td>{orden.codigo}</td>
                    <td>{orden.origen}</td>
                    <td>{orden.destino}</td>
                    <td>{orden.distancia} km</td>
                    <td>{orden.peso} t</td>
                    <td>S/ {orden.tarifa.toFixed(2)}</td>
                    <td>
                      <label
                        className="visually-hidden"
                        htmlFor={`estado-orden-${orden.id}`}
                      >
                        Estado de la orden {orden.codigo}
                      </label>

                      <select
                        className="form-select form-select-sm"
                        id={`estado-orden-${orden.id}`}
                        value={orden.estado}
                        disabled={
                          (actualizarEstadoMutation.isPending &&
                            actualizarEstadoMutation.variables?.orden.id === orden.id) ||
                          orden.estado === 'Cancelada' ||
                          orden.estado === 'Completada'
                        }
                        onChange={(event) => {
                          const estado = event.currentTarget.value

                          if (
                            (ESTADOS_ORDEN as readonly string[]).includes(
                              estado,
                            )
                          ) {
                            void cambiarEstadoOrden(
                              orden,
                              estado as EstadoOrden,
                            )
                          }
                        }}
                      >
                        {ESTADOS_ORDEN.filter(
                          (estado) =>
                            estado === orden.estado ||
                            estadosSiguientes(orden.estado).includes(estado),
                        ).map((estado) => (
                          <option
                            key={estado}
                            value={estado}
                            disabled={
                              estado === 'Cancelada' && !esAdministrador
                            }
                          >
                            {estado}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => abrirDetalle(orden.id)}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
