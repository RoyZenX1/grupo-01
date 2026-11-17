import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import type { EstadoVehiculo } from './vehiculo.types'
import { obtenerVehiculoPorCodigo } from './vehiculos.api'
import './vehiculos.css'

const ESTADO_BADGE: Record<EstadoVehiculo, string> = {
  Disponible: 'text-bg-success',
  Ocupado: 'text-bg-primary',
  Mantenimiento: 'text-bg-warning',
  Reservado: 'text-bg-secondary',
}

export function VehiculoDetallePage() {
  const { codigo } = useParams()
  const navigate = useNavigate()
  const vehiculoQuery = useQuery({
    queryKey: ['vehiculos', 'detalle', codigo],
    queryFn: () => {
      if (!codigo) {
        throw new Error('No se indicó el código del vehículo.')
      }
      return obtenerVehiculoPorCodigo(codigo)
    },
    enabled: Boolean(codigo),
  })

  function volverAlListado() {
    navigate('/vehiculos')
  }

  if (vehiculoQuery.isLoading) {
    return (
      <main className="vehiculos-page container py-4">
        <button className="btn btn-link px-0" type="button" onClick={volverAlListado}>
          Volver a vehículos
        </button>
        <p role="status">Cargando el detalle del vehículo…</p>
      </main>
    )
  }

  if (vehiculoQuery.isError || !vehiculoQuery.data) {
    const mensaje = vehiculoQuery.error instanceof Error
      ? vehiculoQuery.error.message
      : 'No se pudo cargar el vehículo.'

    return (
      <main className="vehiculos-page container py-4">
        <button className="btn btn-link px-0" type="button" onClick={volverAlListado}>
          Volver a vehículos
        </button>
        <div className="alert alert-danger" role="alert">
          {mensaje}
        </div>
      </main>
    )
  }

  const vehiculo = vehiculoQuery.data
  const detalles = [
    { etiqueta: 'Código visible', valor: vehiculo.codigo },
    { etiqueta: 'Placa', valor: vehiculo.placa },
    { etiqueta: 'Modelo', valor: vehiculo.modelo || '—' },
    { etiqueta: 'Tipo', valor: vehiculo.tipo },
    { etiqueta: 'Capacidad', valor: `${vehiculo.capacidad} toneladas` },
  ]

  return (
    <main className="vehiculos-page container py-4 py-lg-5">
      <header className="vehiculos-header mb-4">
        <div>
          <h1>Detalle del vehículo</h1>
          <p>Información registrada para {vehiculo.codigo}.</p>
        </div>
        <button className="btn btn-outline-primary" type="button" onClick={volverAlListado}>
          Volver a vehículos
        </button>
      </header>

      <section className="card shadow-sm">
        <div className="card-body">
          <h2 className="h5 mb-4">Características</h2>
          <div className="row g-4">
            {detalles.map(({ etiqueta, valor }) => (
              <div className="col-12 col-sm-6 col-lg-4" key={etiqueta}>
                <p className="small text-secondary mb-1">{etiqueta}</p>
                <p className="fw-semibold mb-0">{valor}</p>
              </div>
            ))}
            <div className="col-12 col-sm-6 col-lg-4">
              <p className="small text-secondary mb-1">Estado</p>
              <span className={`badge ${ESTADO_BADGE[vehiculo.estado]}`}>
                {vehiculo.estado}
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
