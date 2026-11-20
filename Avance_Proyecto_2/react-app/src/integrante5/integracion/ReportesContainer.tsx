import { useQuery } from '@tanstack/react-query'
import { listarOrdenes } from '../../integrante4/ordenes/ordenes.api'
import { ReportesPage } from '../../integrante4/reportes/reportesPage'
import { mensajeError } from '../../shared/api/http'

const ORDENES_QUERY_KEY = ['ordenes'] as const

/**
 * Conecta la página de reportes (integrante 4) con los datos reales
 * de órdenes de la API. ReportesPage es un componente de presentación
 * que recibe los datos por props.
 */
export function ReportesContainer() {
  const ordenesQuery = useQuery({
    queryKey: ORDENES_QUERY_KEY,
    queryFn: listarOrdenes,
  })

  return (
    <ReportesPage
      ordenes={ordenesQuery.data ?? []}
      cargando={ordenesQuery.isLoading}
      error={ordenesQuery.error ? mensajeError(ordenesQuery.error) : null}
      onReintentar={() => void ordenesQuery.refetch()}
    />
  )
}
