
import { useMemo, useState } from 'react'
import type { EstadoOrden, Orden, OrdenOrdenamiento } from './reportes.types'
import type { CotizacionParaOrden } from '../ordenes/ordenes.types'
import type { Vehiculo } from '../../integrante3/vehiculos/vehiculo.types'
import {ESTADOS_ORDEN,calcularTarifaPromedio,calcularTotalTarifas,contarCotizacionesVinculadas,contarOrdenesEnCurso,contarRutasUnicas,filtrarOrdenes,ordenarOrdenes,resumirCotizaciones,resumirEstados,resumirRutas,} from './reportes.calculations'
import { ReportesGraficos } from './ReportesGraficos'
import './Reportes.css'



interface ReportesPageProps {
  ordenes: Orden[]
  cotizaciones: CotizacionParaOrden[]
  vehiculos: Vehiculo[]
  cargando: boolean
  error: string | null
  onReintentar: () => void
}



const formatoMoneda = (valor: number) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(valor)

export function ReportesPage({
  ordenes,
  cotizaciones,
  vehiculos,
  cargando,
  error,
  onReintentar,
}: ReportesPageProps) {
  const [texto, setTexto] = useState('')
  const [montoMin, setMontoMin] = useState('')
  const [montoMax, setMontoMax] = useState('')
  const [ordenamiento, setOrdenamiento] =
    useState<OrdenOrdenamiento>('codigo-desc')

  const [estadosSeleccionados, setEstadosSeleccionados] =
    useState<EstadoOrden[]>([])

  const ordenesFiltradas = useMemo(() => {
    const filtradas = filtrarOrdenes(
      ordenes,
      texto,
      montoMin === '' ? null : Number(montoMin),
      montoMax === '' ? null : Number(montoMax),
      estadosSeleccionados,
    )

    return ordenarOrdenes(filtradas, ordenamiento)
  }, [
    ordenes,
    texto,
    montoMin,
    montoMax,
    estadosSeleccionados,
    ordenamiento,
  ])

  const totalTarifas = calcularTotalTarifas(ordenesFiltradas)
  const tarifaPromedio = calcularTarifaPromedio(ordenesFiltradas)
  const cotizacionesVinculadas =
    contarCotizacionesVinculadas(ordenesFiltradas)
  const rutasUnicas = contarRutasUnicas(ordenesFiltradas)
  const enCurso = contarOrdenesEnCurso(ordenesFiltradas)

  const resumenEstados = resumirEstados(ordenesFiltradas)
  const resumenRutas = resumirRutas(ordenesFiltradas)
  const cotizacionesFrecuentes =
    resumirCotizaciones(ordenesFiltradas)

  function alternarEstado(estado: EstadoOrden) {
    setEstadosSeleccionados((actuales) =>
      actuales.includes(estado)
        ? actuales.filter((item) => item !== estado)
        : [...actuales, estado],
    )
  }

  function limpiarFiltros() {
    setTexto('')
    setMontoMin('')
    setMontoMax('')
    setOrdenamiento('codigo-desc')
    setEstadosSeleccionados([])
  }

  return (
    <main className="reportes-page">
      <header className="reportes-header">
        <div>
          <span className="reportes-eyebrow">NEXOCARGO / ANALÍTICA</span>
          <h1>Reportes, métricas y rutas</h1>
          <p>
            Resumen calculado con las órdenes compartidas por la API.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={limpiarFiltros}
        >
          Limpiar filtros
        </button>
      </header>

      {cargando && (
        <div className="alert alert-info">
          Cargando información de las órdenes...
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={onReintentar}
          >
            Reintentar
          </button>
        </div>
      )}

      <section className="reportes-filtros">
        <div className="reportes-seccion-titulo">
          <div>
            <h2>Filtros de búsqueda</h2>
            <p>Personaliza la información que deseas consultar.</p>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <label htmlFor="buscar-orden" className="form-label">
              Buscar orden
            </label>
            <input
              id="buscar-orden"
              className="form-control"
              placeholder="Código, cotización, vehículo u origen..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </div>

          <div className="col-6 col-lg-2">
            <label htmlFor="monto-min" className="form-label">
              Tarifa mínima
            </label>
            <input
              id="monto-min"
              type="number"
              min="0"
              className="form-control"
              placeholder="S/ 0"
              value={montoMin}
              onChange={(e) => setMontoMin(e.target.value)}
            />
          </div>

          <div className="col-6 col-lg-2">
            <label htmlFor="monto-max" className="form-label">
              Tarifa máxima
            </label>
            <input
              id="monto-max"
              type="number"
              min="0"
              className="form-control"
              placeholder="S/ 1000"
              value={montoMax}
              onChange={(e) => setMontoMax(e.target.value)}
            />
          </div>

          <div className="col-12 col-lg-2">
            <label htmlFor="ordenamiento" className="form-label">
              Ordenar por
            </label>
            <select
              id="ordenamiento"
              className="form-select"
              value={ordenamiento}
              onChange={(e) =>
                setOrdenamiento(
                  e.target.value as OrdenOrdenamiento,
                )
              }
            >
              <option value="codigo-desc">Código descendente</option>
              <option value="codigo-asc">Código ascendente</option>
              <option value="tarifa-desc">Mayor tarifa</option>
              <option value="tarifa-asc">Menor tarifa</option>
              <option value="origen-asc">Origen A-Z</option>
              <option value="estado-asc">Estado A-Z</option>
            </select>
          </div>
        </div>

        <div className="reportes-estados-filtro">
          <span>Filtrar por estado:</span>

          {ESTADOS_ORDEN.map((estado) => (
            <button
              key={estado}
              type="button"
              className={`reportes-estado-chip ${
                estadosSeleccionados.includes(estado)
                  ? 'activo'
                  : ''
              }`}
              aria-pressed={estadosSeleccionados.includes(estado)}
              onClick={() => alternarEstado(estado)}
            >
              {estado}
            </button>
          ))}
        </div>
      </section>

      <section className="reportes-metricas">
        <article className="reporte-metrica">
          <span>Órdenes filtradas</span>
          <strong>{ordenesFiltradas.length}</strong>
          <small>Registros encontrados</small>
        </article>

        <article className="reporte-metrica">
          <span>Total de tarifas</span>
          <strong>{formatoMoneda(totalTarifas)}</strong>
          <small>Suma de las órdenes</small>
        </article>

        <article className="reporte-metrica">
          <span>Tarifa promedio</span>
          <strong>{formatoMoneda(tarifaPromedio)}</strong>
          <small>Promedio por orden</small>
        </article>

        <article className="reporte-metrica">
          <span>Cotizaciones vinculadas</span>
          <strong>{cotizacionesVinculadas}</strong>
          <small>Cotizaciones únicas</small>
        </article>

        <article className="reporte-metrica">
          <span>Rutas distintas</span>
          <strong>{rutasUnicas}</strong>
          <small>Origen y destino</small>
        </article>

        <article className="reporte-metrica">
          <span>Programadas o en ruta</span>
          <strong>{enCurso}</strong>
          <small>Órdenes en proceso</small>
        </article>
      </section>

      <ReportesGraficos ordenes={ordenesFiltradas} />

      <section className="reportes-tabla-seccion">
        <div className="reportes-seccion-titulo">
          <div>
            <h2>Detalle de órdenes</h2>
            <p>Información de las órdenes según los filtros aplicados.</p>
          </div>
          <span className="badge text-bg-primary">
            {ordenesFiltradas.length} resultados
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Código</th>
                <th>Cotización</th>
                <th>Vehículo</th>
                <th>Ruta</th>
                <th>Distancia</th>
                <th>Peso</th>
                <th>Tarifa</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {ordenesFiltradas.map((orden) => {
                const cotizacion = cotizaciones.find(
                  (item) => item.id === orden.cotizacionId,
                )
                const vehiculo = vehiculos.find(
                  (item) => item.id === orden.vehiculoId,
                )

                return (
                  <tr key={orden.id}>
                  <td>{orden.codigo}</td>
                  <td>
                    {cotizacion?.codigo || orden.cotizacionId}
                    {cotizacion && (
                  <small className="d-block text-secondary">
                    {cotizacion.estado}
                  </small>
                )}
                </td>
                    <td>
                      {vehiculo
                        ? `${vehiculo.codigo} · ${vehiculo.placa}`
                        : orden.vehiculoId}
                    </td>
                    <td>
                      {orden.origen} → {orden.destino}
                    </td>
                    <td>{orden.distancia} km</td>
                    <td>{orden.peso} t</td>
                    <td>{formatoMoneda(orden.tarifa)}</td>
                    <td>
                      <span className={`estado-orden estado-${orden.estado.toLowerCase().replaceAll(' ', '-')}`}>
                        {orden.estado}
                      </span>
                    </td>
                  </tr>
                )
              })}

              {ordenesFiltradas.length === 0 && !cargando && (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    No se encontraron órdenes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="reportes-resumen-grid">
        <article className="reportes-panel">
          <h2>Resumen por estado</h2>

          {resumenEstados.map((item) => (
            <div className="resumen-estado" key={item.estado}>
              <div className="d-flex justify-content-between">
                <span>{item.estado}</span>
                <strong>{item.cantidad}</strong>
              </div>

              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${item.porcentaje}%` }}
                  aria-valuenow={item.porcentaje}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>

              <small>{formatoMoneda(item.monto)}</small>
            </div>
          ))}
        </article>

        <article className="reportes-panel">
          <h2>Resumen por ruta</h2>

          {resumenRutas.length === 0 ? (
            <p>No hay rutas para mostrar.</p>
          ) : (
            resumenRutas.map((item) => (
              <div className="resumen-fila" key={item.ruta}>
                <div>
                  <strong>{item.ruta}</strong>
                  <small>{item.cantidad} órdenes</small>
                </div>
                <span>{formatoMoneda(item.monto)}</span>
              </div>
            ))
          )}
        </article>

        <article className="reportes-panel">
          <h2>Top 5 cotizaciones</h2>

          {cotizacionesFrecuentes.length === 0 ? (
            <p>No hay cotizaciones vinculadas.</p>
          ) : (
            cotizacionesFrecuentes.map((item) => (
              <div
                className="resumen-fila"
                key={item.cotizacion}
              >
                <div>
                  <strong>{item.cotizacion}</strong>
                  <small>{item.cantidad} órdenes</small>
                </div>
                <span>{formatoMoneda(item.monto)}</span>
              </div>
            ))
          )}
        </article>
      </section>

      <footer className="reportes-nota">
        Los reportes se calculan con los datos disponibles en las órdenes.
        No se muestran fechas de creación, nombres de clientes ni niveles
        de urgencia porque esos campos no forman parte del modelo actual.
      </footer>
    </main>
  )
}
