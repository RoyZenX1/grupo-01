
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listarVehiculos } from '../../integrante3/vehiculos/vehiculos.api'
import { listarCotizacionesParaOrden } from './cotizaciones.ordenes.api'
import { OrdenForm } from './OrdenForm'
import { siguienteCodigoOrden } from './ordenes.calculations'
import { listarOrdenes, crearOrden } from './ordenes.api'
import type { Orden, OrdenWrite } from './ordenes.types'
import './ordenes.css'

export function OrdenesPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  // Cargar vehículos desde la API.
  const { data: vehiculosAPI = [] } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: listarVehiculos,
  })

  // Cargar cotizaciones desde la API.
  const { data: cotizacionesAPI = [] } = useQuery({
    queryKey: ['cotizaciones-para-orden'],
    queryFn: listarCotizacionesParaOrden,
  })

  // Cargar las órdenes existentes desde la API.
  async function cargarOrdenes() {
    try {
      setCargando(true)
      setError('')

      const datos = await listarOrdenes()
      setOrdenes(datos)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las órdenes.',
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarOrdenes()
  }, [])

  // Registrar una nueva orden en JSON Server.
  async function registrarOrden(datos: OrdenWrite) {
    try {
      setGuardando(true)
      setError('')

      const nuevaOrden = await crearOrden({
        ...datos,
        codigo: siguienteCodigoOrden(ordenes),
      })

      setOrdenes((actuales) => [...actuales, nuevaOrden])
      setMostrarFormulario(false)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar la orden.',
      )
    } finally {
      setGuardando(false)
    }
  }

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
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          disabled={guardando}
        >
          {mostrarFormulario ? 'Cerrar formulario' : '+ Nueva orden'}
        </button>
      </header>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => void cargarOrdenes()}
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
        <OrdenForm
          cotizaciones={cotizacionesAPI}
          vehiculos={vehiculosAPI}
          onGuardar={registrarOrden}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}

      {/* Listado de órdenes */}
      <section className="ordenes-listado">
        <h2>Listado de órdenes</h2>

        {cargando ? (
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
                </tr>
              </thead>

              <tbody>
                {ordenes.map((orden) => (
                  <tr key={orden.id}>
                    <td>{orden.codigo}</td>
                    <td>{orden.origen}</td>
                    <td>{orden.destino}</td>
                    <td>{orden.distancia} km</td>
                    <td>{orden.peso} t</td>
                    <td>S/ {orden.tarifa.toFixed(2)}</td>
                    <td>{orden.estado}</td>
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
