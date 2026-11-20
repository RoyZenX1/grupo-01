import { useQuery } from '@tanstack/react-query'
import {
  CLIENTES_QUERY_KEY,
  listarClientes,
} from '../../integrante1/clientes/clientes.api.ts'
import {
  COTIZACIONES_QUERY_KEY,
  listarCotizaciones,
} from '../../integrante2/cotizaciones/cotizaciones.api.ts'
import type { Vehiculo } from '../../integrante3/vehiculos/vehiculo.types.ts'
import {
  ETAPAS_ORDEN,
  esEstadoFinal,
  estadosSiguientes,
  fechaDeEstado,
} from './ordenes.estados.ts'
import type { EstadoOrden, Orden } from './ordenes.types.ts'

interface OrdenDetailProps {
  orden: Orden
  vehiculo?: Vehiculo
  puedeCancelar: boolean
  cambiando: boolean
  onCambiarEstado: (orden: Orden, estado: EstadoOrden) => void
  onCerrar: () => void
}

const formatoMoneda = (valor: number) => `S/ ${valor.toFixed(2)}`

function formatoFecha(iso?: string) {
  if (!iso) return null
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return null
  return fecha.toLocaleString('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function OrdenDetail({
  orden,
  vehiculo,
  puedeCancelar,
  cambiando,
  onCambiarEstado,
  onCerrar,
}: OrdenDetailProps) {
  const cotizacionesQuery = useQuery({
    queryKey: COTIZACIONES_QUERY_KEY,
    queryFn: listarCotizaciones,
  })
  const clientesQuery = useQuery({
    queryKey: CLIENTES_QUERY_KEY,
    queryFn: listarClientes,
  })

  const cotizacion = cotizacionesQuery.data?.find(
    (item) => item.id === orden.cotizacionId,
  )
  const cliente = clientesQuery.data?.find(
    (item) => item.id === cotizacion?.clienteId,
  )

  const cargandoRelacion =
    cotizacionesQuery.isLoading || clientesQuery.isLoading

  const cancelada = orden.estado === 'Cancelada'
  const indiceActual = ETAPAS_ORDEN.indexOf(orden.estado)
  const siguientes = estadosSiguientes(orden.estado)
  const avance = siguientes.find((estado) => estado !== 'Cancelada')
  const puedeCancelarAhora =
    siguientes.includes('Cancelada') && puedeCancelar

  return (
    <section
      className="ordenes-detalle"
      aria-label={`Detalle de la orden ${orden.codigo}`}
    >
      <div className="ordenes-detalle-cabecera">
        <h2>
          Orden {orden.codigo}{' '}
          <span
            className={`ordenes-estado ordenes-estado-${orden.estado
              .toLowerCase()
              .replaceAll(' ', '-')}`}
          >
            {orden.estado}
          </span>
        </h2>

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={onCerrar}
        >
          Cerrar
        </button>
      </div>

      {/* Seguimiento */}
      <ol className="ordenes-seguimiento" aria-label="Seguimiento de la orden">
        {ETAPAS_ORDEN.map((etapa, indice) => {
          const alcanzada = !cancelada && indice <= indiceActual
          const fecha = formatoFecha(fechaDeEstado(orden, etapa))
          return (
            <li
              key={etapa}
              className={alcanzada ? 'alcanzada' : undefined}
              aria-current={etapa === orden.estado ? 'step' : undefined}
            >
              <span className="ordenes-seguimiento-punto" aria-hidden="true">
                {alcanzada ? '✓' : indice + 1}
              </span>
              <strong>{etapa}</strong>
              <small>{fecha ?? (alcanzada ? 'Sin fecha' : 'Pendiente')}</small>
            </li>
          )
        })}
      </ol>

      {cancelada && (
        <div className="alert alert-secondary" role="status">
          Orden cancelada
          {formatoFecha(fechaDeEstado(orden, 'Cancelada'))
            ? ` el ${formatoFecha(fechaDeEstado(orden, 'Cancelada'))}`
            : ''}
          . El vehículo quedó liberado.
        </div>
      )}

      <div className="row">
        <dl className="ordenes-datos col-12 col-lg-4">
          <h3>Cliente</h3>
          {cargandoRelacion ? (
            <dd>Cargando…</dd>
          ) : cliente ? (
            <>
              <dt>Nombre</dt>
              <dd>{cliente.nombre}</dd>
              <dt>Documento</dt>
              <dd>{cliente.identificacion}</dd>
              <dt>Correo</dt>
              <dd>{cliente.email}</dd>
              <dt>Teléfono</dt>
              <dd>{cliente.telefono}</dd>
            </>
          ) : (
            <>
              <dt>Nombre</dt>
              <dd>
                {cotizacion?.clienteNombre ??
                  'No se encontró el cliente de la cotización.'}
              </dd>
            </>
          )}
        </dl>

        <dl className="ordenes-datos col-12 col-lg-4">
          <h3>Servicio</h3>
          <dt>Cotización</dt>
          <dd>
            {orden.cotizacionId}
            {cotizacion ? ` · Total ${formatoMoneda(cotizacion.total)}` : ''}
          </dd>
          <dt>Ruta</dt>
          <dd>
            {orden.origen} → {orden.destino}
          </dd>
          <dt>Distancia / carga</dt>
          <dd>
            {orden.distancia} km · {orden.peso} t
          </dd>
          <dt>Tarifa</dt>
          <dd>
            <strong>{formatoMoneda(orden.tarifa)}</strong>
          </dd>
        </dl>

        <dl className="ordenes-datos col-12 col-lg-4">
          <h3>Vehículo</h3>
          {vehiculo ? (
            <>
              <dt>Placa</dt>
              <dd>
                {vehiculo.placa} ({vehiculo.codigo})
              </dd>
              <dt>Tipo</dt>
              <dd>
                {vehiculo.tipo}
                {vehiculo.modelo ? ` · ${vehiculo.modelo}` : ''}
              </dd>
              <dt>Capacidad</dt>
              <dd>{vehiculo.capacidad} t</dd>
              <dt>Estado actual</dt>
              <dd>{vehiculo.estado}</dd>
            </>
          ) : (
            <dd>Vehículo {orden.vehiculoId} no encontrado.</dd>
          )}
        </dl>
      </div>

      {!esEstadoFinal(orden.estado) && (
        <div className="d-flex flex-wrap gap-2 mt-3">
          {avance && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={cambiando}
              onClick={() => onCambiarEstado(orden, avance)}
            >
              Pasar a «{avance}»
            </button>
          )}
          {puedeCancelarAhora && (
            <button
              type="button"
              className="btn btn-outline-danger"
              disabled={cambiando}
              onClick={() => onCambiarEstado(orden, 'Cancelada')}
            >
              Cancelar orden
            </button>
          )}
        </div>
      )}
    </section>
  )
}
