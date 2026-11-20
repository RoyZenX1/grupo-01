import { useQuery } from '@tanstack/react-query'
import { listarOrdenes } from '../../integrante4/ordenes/ordenes.api'
import { ReportesPage } from '../../integrante4/reportes/reportesPage'
import { useAuth } from '../auth/auth.context'
import { mensajeError } from '../../shared/api/http'

const ORDENES_QUERY_KEY = ['ordenes'] as const

/**
 * Conecta la página de reportes (integrante 4) con los datos reales
 * de órdenes de la API. ReportesPage es un componente de presentación
 * que recibe los datos por props.
 */
export function ReportesContainer() {
  const { tieneRol } = useAuth()
  const ordenesQuery = useQuery({
    queryKey: ORDENES_QUERY_KEY,
    queryFn: listarOrdenes,
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

  return (
    <ReportesPage
      ordenes={ordenesQuery.data ?? []}
      cargando={ordenesQuery.isLoading}
      error={ordenesQuery.error ? mensajeError(ordenesQuery.error) : null}
      onReintentar={() => void ordenesQuery.refetch()}
    />
  )
}
