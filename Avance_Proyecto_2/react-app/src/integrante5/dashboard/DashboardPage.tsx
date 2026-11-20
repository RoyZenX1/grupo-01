import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { listarClientes, CLIENTES_QUERY_KEY } from '../../integrante1/clientes/clientes.api'
import { estadoEfectivo, formatearMoneda } from '../../integrante2/cotizaciones/cotizacion.calculations'
import { ESTADOS_COTIZACION, type EstadoCotizacion } from '../../integrante2/cotizaciones/cotizacion.types'
import { listarVehiculos } from '../../integrante3/vehiculos/vehiculos.api'
import { listarOrdenes } from '../../integrante4/ordenes/ordenes.api'
import {
  calcularTotalTarifas,
  contarOrdenesEnCurso,
  resumirEstados,
} from '../../integrante4/reportes/reportes.calculations'
import { Encabezado } from '../../shared/components/Encabezado'
import { EstadoConsulta } from '../../shared/components/EstadoConsulta'
import {
  COTIZACIONES_RESUMEN_QUERY_KEY,
  listarResumenCotizaciones,
} from './dashboard.api'
import './dashboard.css'

const ORDENES_QUERY_KEY = ['ordenes'] as const
const VEHICULOS_QUERY_KEY = ['vehiculos'] as const

export function DashboardPage() {
  const clientesQuery = useQuery({
    queryKey: CLIENTES_QUERY_KEY,
    queryFn: listarClientes,
  })
  const cotizacionesQuery = useQuery({
    queryKey: COTIZACIONES_RESUMEN_QUERY_KEY,
    queryFn: listarResumenCotizaciones,
  })
  const ordenesQuery = useQuery({
    queryKey: ORDENES_QUERY_KEY,
    queryFn: listarOrdenes,
  })
  const vehiculosQuery = useQuery({
    queryKey: VEHICULOS_QUERY_KEY,
    queryFn: listarVehiculos,
  })

  const consultas = [
    clientesQuery,
    cotizacionesQuery,
    ordenesQuery,
    vehiculosQuery,
  ]
  const cargando = consultas.some((consulta) => consulta.isLoading)
  const error = consultas.find((consulta) => consulta.error)?.error ?? null

  function reintentar() {
    for (const consulta of consultas) void consulta.refetch()
  }

  const clientes = useMemo(() => clientesQuery.data ?? [], [clientesQuery.data])
  const cotizaciones = useMemo(
    () => cotizacionesQuery.data ?? [],
    [cotizacionesQuery.data],
  )
  const ordenes = useMemo(() => ordenesQuery.data ?? [], [ordenesQuery.data])
  const vehiculos = useMemo(() => vehiculosQuery.data ?? [], [vehiculosQuery.data])

  const resumenCotizaciones = useMemo(() => {
    const contar = (estado: EstadoCotizacion) =>
      cotizaciones.filter((c) => estadoEfectivo(c) === estado).length
    const aprobadas = cotizaciones.filter(
      (c) => estadoEfectivo(c) === 'Aprobada',
    )
    return {
      total: cotizaciones.length,
      pendientes: contar('Pendiente'),
      aprobadas: aprobadas.length,
      montoAprobado: aprobadas.reduce((suma, c) => suma + c.total, 0),
    }
  }, [cotizaciones])

  const resumenOrdenes = useMemo(() => {
    const contar = (estado: string) =>
      ordenes.filter((o) => o.estado === estado).length
    return {
      total: ordenes.length,
      enCurso: contarOrdenesEnCurso(ordenes),
      completadas: contar('Completada'),
      canceladas: contar('Cancelada'),
      ingresos: calcularTotalTarifas(ordenes),
    }
  }, [ordenes])

  const vehiculosDisponibles = useMemo(
    () => vehiculos.filter((v) => v.estado === 'Disponible').length,
    [vehiculos],
  )

  const estadosOrden = useMemo(() => resumirEstados(ordenes), [ordenes])

  const estadosCotizacion = useMemo(
    () =>
      ESTADOS_COTIZACION.map((estado) => ({
        estado,
        cantidad: cotizaciones.filter((c) => estadoEfectivo(c) === estado)
          .length,
      })),
    [cotizaciones],
  )

  return (
    <main className="workspace-page dashboard-page">
      <Encabezado
        titulo="Dashboard"
        descripcion="Indicadores generales de NexoCargo calculados con los datos de la API."
      />

      <EstadoConsulta cargando={cargando} error={error} onReintentar={reintentar}>
        <section className="kpi-grid" aria-label="Indicadores generales">
          <article className="kpi-card">
            <h2>Clientes registrados</h2>
            <p className="kpi-value">{clientes.length}</p>
          </article>
          <article className="kpi-card">
            <h2>Cotizaciones pendientes</h2>
            <p className="kpi-value">{resumenCotizaciones.pendientes}</p>
          </article>
          <article className="kpi-card">
            <h2>Cotizaciones aprobadas</h2>
            <p className="kpi-value">{resumenCotizaciones.aprobadas}</p>
          </article>
          <article className="kpi-card">
            <h2>Órdenes registradas</h2>
            <p className="kpi-value">{resumenOrdenes.total}</p>
          </article>
          <article className="kpi-card">
            <h2>Órdenes en curso</h2>
            <p className="kpi-value">{resumenOrdenes.enCurso}</p>
          </article>
          <article className="kpi-card">
            <h2>Órdenes completadas</h2>
            <p className="kpi-value">{resumenOrdenes.completadas}</p>
          </article>
          <article className="kpi-card">
            <h2>Ingresos por órdenes</h2>
            <p className="kpi-value">{formatearMoneda(resumenOrdenes.ingresos)}</p>
          </article>
          <article className="kpi-card">
            <h2>Vehículos disponibles</h2>
            <p className="kpi-value">{vehiculosDisponibles}</p>
          </article>
        </section>

        <div className="dashboard-grid">
          <section className="workspace-card" aria-labelledby="dashboard-cotizaciones">
            <h2 id="dashboard-cotizaciones">Cotizaciones por estado</h2>
            {estadosCotizacion.map(({ estado, cantidad }) => (
              <div className="dashboard-fila" key={estado}>
                <span>{estado}</span>
                <strong>{cantidad}</strong>
              </div>
            ))}
            <p className="dashboard-nota">
              Monto de cotizaciones aprobadas:{' '}
              {formatearMoneda(resumenCotizaciones.montoAprobado)}
            </p>
          </section>

          <section className="workspace-card" aria-labelledby="dashboard-ordenes">
            <h2 id="dashboard-ordenes">Órdenes por estado</h2>
            {estadosOrden.map((item) => (
              <div className="dashboard-fila" key={item.estado}>
                <span>{item.estado}</span>
                <strong>
                  {item.cantidad} · {formatearMoneda(item.monto)}
                </strong>
              </div>
            ))}
            <p className="dashboard-nota">
              {resumenOrdenes.canceladas} órdenes canceladas de un total de{' '}
              {resumenOrdenes.total}.
            </p>
          </section>
        </div>
      </EstadoConsulta>
    </main>
  )
}
