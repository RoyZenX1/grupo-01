
import { useQuery } from '@tanstack/react-query'
import { listarOrdenes } from '../../integrante4/ordenes/ordenes.api'
import { listarCotizacionesParaOrden } from '../../integrante4/ordenes/cotizaciones.ordenes.api'
import { listarVehiculos } from '../../integrante3/vehiculos/vehiculos.api'
import { ReportesPage } from '../../integrante4/reportes/reportesPage'
import { useAuth } from '../auth/auth.context'
import { mensajeError } from '../../shared/api/http'

export function ReportesContainer() {
  const { tieneRol } = useAuth()

  const ordenesQuery = useQuery({
    queryKey: ['ordenes'],
    queryFn: listarOrdenes,
  })

  const cotizacionesQuery = useQuery({
    queryKey: ['cotizaciones-para-orden'],
    queryFn: listarCotizacionesParaOrden,
  })

  const vehiculosQuery = useQuery({
    queryKey: ['vehiculos'],
    queryFn: listarVehiculos,
  })

  if (!tieneRol('Administrador')) {
    return (
      <main className="workspace-page">
        <section className="workspace-card">
          <h2>Acceso restringido</h2>
          <p className="text-secondary mb-0">
            Los reportes solo están disponibles para el rol Administrador.
          </p>
        </section>
      </main>
    )
  }

  const cargando =
    ordenesQuery.isLoading ||
    cotizacionesQuery.isLoading ||
    vehiculosQuery.isLoading

  const error =
    ordenesQuery.error ||
    cotizacionesQuery.error ||
    vehiculosQuery.error

  return (
    <ReportesPage
      ordenes={ordenesQuery.data ?? []}
      cotizaciones={cotizacionesQuery.data ?? []}
      vehiculos={vehiculosQuery.data ?? []}
      cargando={cargando}
      error={error ? mensajeError(error) : null}
      onReintentar={() => {
        void ordenesQuery.refetch()
        void cotizacionesQuery.refetch()
        void vehiculosQuery.refetch()
      }}
    />
  )
}
