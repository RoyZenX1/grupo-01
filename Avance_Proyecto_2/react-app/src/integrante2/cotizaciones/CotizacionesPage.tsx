import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { mensajeError } from '../../shared/api/http'
import { Encabezado } from '../../shared/components/Encabezado'
import { EstadoConsulta } from '../../shared/components/EstadoConsulta'
import type { Cliente } from '../../integrante1/clientes/cliente.types'
import { CLIENTES_QUERY_KEY, listarClientes } from '../../integrante1/clientes/clientes.api'
import { listarOrdenes } from '../../integrante4/ordenes/ordenes.api'
import { estadoEfectivo, formatearMoneda } from './cotizacion.calculations'
import type { CotizacionFormValues } from './cotizacion.schema'
import { ESTADOS_COTIZACION } from './cotizacion.types'
import type { Cotizacion, EstadoCotizacion } from './cotizacion.types'
import { CotizacionDetail } from './CotizacionDetail'
import { CotizacionForm } from './CotizacionForm'
import { CotizacionesTable } from './CotizacionesTable'
import {
  actualizarCotizacion,
  cambiarEstadoCotizacion,
  construirCotizacion,
  COTIZACIONES_QUERY_KEY,
  crearCotizacion,
  eliminarCotizacion,
  listarCotizaciones,
  siguienteCodigoCotizacion,
} from './cotizaciones.api'
import './cotizaciones.css'

const ORDENES_QUERY_KEY = ['ordenes'] as const

/** Nombre del cliente: el registrado en Clientes; si no existe, el que guardó la cotización antigua. */
function nombreCotizacion(clientes: Cliente[], c: Cotizacion): string {
  return (
    clientes.find((cliente) => cliente.id === c.clienteId)?.nombre ??
    c.clienteNombre ??
    (c.clienteId ? `Cliente ${c.clienteId}` : 'Sin cliente')
  )
}

function normalizar(texto: string): string {
  return texto.toLocaleLowerCase('es-PE').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function CotizacionesPage() {
  const queryClient = useQueryClient()
  const [enEdicion, setEnEdicion] = useState<Cotizacion | undefined>()
  const [seleccionadaId, setSeleccionadaId] = useState<string | undefined>()
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('')
  const [clienteId, setClienteId] = useState('')

  const cotizacionesQuery = useQuery({ queryKey: COTIZACIONES_QUERY_KEY, queryFn: listarCotizaciones })
  const clientesQuery = useQuery({ queryKey: CLIENTES_QUERY_KEY, queryFn: listarClientes })
  const ordenesQuery = useQuery({ queryKey: ORDENES_QUERY_KEY, queryFn: listarOrdenes })

  const cotizaciones = useMemo(() => cotizacionesQuery.data ?? [], [cotizacionesQuery.data])
  const clientes = useMemo(() => clientesQuery.data ?? [], [clientesQuery.data])
  const ordenes = useMemo(() => ordenesQuery.data ?? [], [ordenesQuery.data])

  const nombreCliente = (c: Cotizacion) => nombreCotizacion(clientes, c)

  const ordenPorCotizacion = useMemo(() => {
    const mapa = new Map<string, { id: string; codigo: string }>()
    for (const o of ordenes) {
      if (o.estado !== 'Cancelada') mapa.set(o.cotizacionId, { id: o.id, codigo: o.codigo })
    }
    return mapa
  }, [ordenes])

  const filtradas = useMemo(() => {
    const texto = normalizar(busqueda.trim())
    return cotizaciones.filter((c) => {
      const coincideTexto =
        !texto ||
        normalizar(`${c.id} ${c.servicio} ${c.origen} ${c.destino} ${nombreCotizacion(clientes, c)}`).includes(texto)
      return (
        coincideTexto &&
        (!estado || estadoEfectivo(c) === estado) &&
        (!clienteId || c.clienteId === clienteId)
      )
    })
  }, [cotizaciones, clientes, busqueda, estado, clienteId])

  const resumen = useMemo(() => {
    const porEstado = (e: EstadoCotizacion) => cotizaciones.filter((c) => estadoEfectivo(c) === e)
    const aprobadas = porEstado('Aprobada')
    return {
      total: cotizaciones.length,
      pendientes: porEstado('Pendiente').length,
      aprobadas: aprobadas.length,
      montoAprobado: aprobadas.reduce((suma, c) => suma + c.total, 0),
    }
  }, [cotizaciones])

  const seleccionada = cotizaciones.find((c) => c.id === seleccionadaId)

  // Cotizaciones y órdenes comparten datos: al cambiar una, se refrescan ambas listas.
  const actualizarListas = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: COTIZACIONES_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: ORDENES_QUERY_KEY }),
    ])

  const crearMutation = useMutation({
    mutationFn: (values: CotizacionFormValues) =>
      crearCotizacion({
        id: siguienteCodigoCotizacion(cotizaciones),
        ...construirCotizacion(values),
      }),
    onSuccess: actualizarListas,
  })
  const editarMutation = useMutation({
    mutationFn: ({ original, values }: { original: Cotizacion; values: CotizacionFormValues }) =>
      actualizarCotizacion(original.id, construirCotizacion(values, original.fechaEmision)),
    onSuccess: async () => {
      await actualizarListas()
      setEnEdicion(undefined)
    },
  })
  const estadoMutation = useMutation({
    mutationFn: ({ id, nuevo }: { id: string; nuevo: EstadoCotizacion }) =>
      cambiarEstadoCotizacion(id, nuevo),
    onSuccess: actualizarListas,
  })
  const eliminarMutation = useMutation({
    mutationFn: eliminarCotizacion,
    onSuccess: async (_dato, id) => {
      if (id === seleccionadaId) setSeleccionadaId(undefined)
      await actualizarListas()
    },
  })

  function guardar(values: CotizacionFormValues) {
    if (enEdicion) editarMutation.mutate({ original: enEdicion, values })
    else crearMutation.mutate(values)
  }

  const errorMutacion =
    crearMutation.error ?? editarMutation.error ?? estadoMutation.error ?? eliminarMutation.error
  // Las órdenes solo sirven para enlazar «Ver orden»: si fallan, la página igual carga.
  const consultaCargando = cotizacionesQuery.isLoading || clientesQuery.isLoading
  const consultaError = cotizacionesQuery.error ?? clientesQuery.error
  const ocupadoId = estadoMutation.isPending
    ? estadoMutation.variables.id
    : eliminarMutation.isPending
      ? eliminarMutation.variables
      : null

  return (
    <main className="workspace-page cotizaciones-page">
      <Encabezado
        titulo="Cotizaciones"
        descripcion="Cotiza servicios de transporte con la tarifa oficial y conviértelos en órdenes."
      />

      <EstadoConsulta
        cargando={consultaCargando}
        error={consultaError}
        onReintentar={() => {
          void cotizacionesQuery.refetch()
          void clientesQuery.refetch()
          void ordenesQuery.refetch()
        }}
      >
        <section className="kpi-grid" aria-label="Resumen de cotizaciones">
          <article className="kpi-card">
            <h2>Total</h2>
            <p className="kpi-value">{resumen.total}</p>
          </article>
          <article className="kpi-card">
            <h2>Pendientes</h2>
            <p className="kpi-value">{resumen.pendientes}</p>
          </article>
          <article className="kpi-card">
            <h2>Aprobadas</h2>
            <p className="kpi-value">{resumen.aprobadas}</p>
          </article>
          <article className="kpi-card">
            <h2>Monto aprobado</h2>
            <p className="kpi-value">{formatearMoneda(resumen.montoAprobado)}</p>
          </article>
        </section>

        {ordenesQuery.isError && (
          <div className="alert alert-warning" role="status">
            No se pudieron cargar las órdenes, por eso no se muestran los enlaces a órdenes ya
            generadas: {mensajeError(ordenesQuery.error)}
          </div>
        )}

        {errorMutacion && (
          <div className="alert alert-danger" role="alert">
            No se pudo completar la operación: {mensajeError(errorMutacion)}
          </div>
        )}

        <div className="module-grid mb-3">
          <CotizacionForm
            key={enEdicion?.id ?? `nueva-${cotizaciones.length}`}
            clientes={clientes}
            cotizacion={enEdicion}
            guardando={crearMutation.isPending || editarMutation.isPending}
            onGuardar={guardar}
            onCancelarEdicion={() => setEnEdicion(undefined)}
          />

          <section className="workspace-card" aria-label="Buscar y filtrar cotizaciones">
            <h2>Buscar y filtrar</h2>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label" htmlFor="filtro-cot-texto">
                  Código, cliente o ruta
                </label>
                <input
                  className="form-control"
                  id="filtro-cot-texto"
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.currentTarget.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="filtro-cot-estado">Estado</label>
                <select
                  className="form-select"
                  id="filtro-cot-estado"
                  value={estado}
                  onChange={(e) => setEstado(e.currentTarget.value)}
                >
                  <option value="">Todos</option>
                  {ESTADOS_COTIZACION.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="filtro-cot-cliente">Cliente</label>
                <select
                  className="form-select"
                  id="filtro-cot-cliente"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.currentTarget.value)}
                >
                  <option value="">Todos</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="small text-secondary mt-3 mb-0" aria-live="polite">
              Mostrando {filtradas.length} de {cotizaciones.length} cotizaciones
            </p>
          </section>
        </div>

        {seleccionada && (
          <CotizacionDetail
            cotizacion={seleccionada}
            cliente={clientes.find((c) => c.id === seleccionada.clienteId)}
            orden={ordenPorCotizacion.get(seleccionada.id)}
            onCerrar={() => setSeleccionadaId(undefined)}
          />
        )}

        <CotizacionesTable
          cotizaciones={filtradas}
          sinResultados={cotizaciones.length > 0}
          nombreCliente={nombreCliente}
          ordenPorCotizacion={ordenPorCotizacion}
          ocupadoId={ocupadoId}
          onVer={(c) => setSeleccionadaId(c.id)}
          onEditar={(c) => {
            setEnEdicion(c)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onCambiarEstado={(id, nuevo) => estadoMutation.mutate({ id, nuevo })}
          onEliminar={(id) => eliminarMutation.mutate(id)}
        />
      </EstadoConsulta>
    </main>
  )
}
