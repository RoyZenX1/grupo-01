import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDeferredValue, useMemo, useReducer, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import {
  buscarTarifa,
  calcularTarifa,
  MATRIZ_TARIFAS,
  RANGOS_DISTANCIA,
  RANGOS_PESO,
} from './tarifas'
import { VehiculoForm } from './VehiculoForm'
import { VehiculosTable } from './VehiculosTable'
import type { VehiculoFormValues } from './vehiculo.schema'
import {
  ESTADOS_VEHICULO,
  TIPOS_VEHICULO,
} from './vehiculo.types'
import type { EstadoVehiculo, Vehiculo, VehiculoWrite } from './vehiculo.types'
import {
  actualizarVehiculo,
  crearVehiculo,
  eliminarVehiculo,
  listarVehiculos,
} from './vehiculos.api'
import {
  filtrarVehiculos,
  type FiltrosVehiculos,
} from './vehiculos-filtros'
import './vehiculos.css'

const VEHICULOS_QUERY_KEY = ['vehiculos'] as const
const VEHICULOS_VACIOS: Vehiculo[] = []

type AccionFiltros =
  | { tipo: 'busqueda'; valor: string }
  | { tipo: 'estado'; valor: string }
  | { tipo: 'tipo'; valor: string }
  | { tipo: 'limpiar' }

const FILTROS_INICIALES: FiltrosVehiculos = {
  busqueda: '',
  estado: '',
  tipo: '',
}

function reducirFiltros(
  filtros: FiltrosVehiculos,
  accion: AccionFiltros,
): FiltrosVehiculos {
  switch (accion.tipo) {
    case 'busqueda':
      return { ...filtros, busqueda: accion.valor }
    case 'estado':
      return { ...filtros, estado: accion.valor }
    case 'tipo':
      return { ...filtros, tipo: accion.valor }
    case 'limpiar':
      return FILTROS_INICIALES
  }
}

interface FormularioTarifa {
  distancia: number
  peso: number
}

function siguienteCodigoVehiculo(vehiculos: Vehiculo[]): string {
  const codigos = vehiculos
    .map(({ codigo }) => /^VEH-(\d+)$/.exec(codigo))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => Number(match[1]))
  const siguiente = codigos.length > 0 ? Math.max(...codigos) + 1 : 1
  return `VEH-${String(siguiente).padStart(3, '0')}`
}

function mensajeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}

export function VehiculosPage() {
  const queryClient = useQueryClient()
  const [vehiculoEnEdicion, setVehiculoEnEdicion] = useState<Vehiculo | undefined>()
  const [tarifa, setTarifa] = useState<{ precio: number; distancia: number; peso: number }>()
  const [errorTarifa, setErrorTarifa] = useState('')
  const [filtros, dispatchFiltros] = useReducer(reducirFiltros, FILTROS_INICIALES)
  const busquedaDiferida = useDeferredValue(filtros.busqueda)
  const { control, register, handleSubmit, formState: { errors } } =
    useForm<FormularioTarifa>({
      defaultValues: { distancia: 0, peso: 0 },
    })
  const distanciaIngresada = useWatch({ control, name: 'distancia' })
  const pesoIngresado = useWatch({ control, name: 'peso' })
  const tarifaSeleccionada = buscarTarifa(distanciaIngresada, pesoIngresado)

  const vehiculosQuery = useQuery({
    queryKey: VEHICULOS_QUERY_KEY,
    queryFn: listarVehiculos,
  })
  const vehiculos = vehiculosQuery.data ?? VEHICULOS_VACIOS
  const vehiculosFiltrados = useMemo(
    () =>
      filtrarVehiculos(vehiculos, {
        ...filtros,
        busqueda: busquedaDiferida,
      }),
    [vehiculos, filtros, busquedaDiferida],
  )

  const actualizarLista = () =>
    queryClient.invalidateQueries({ queryKey: VEHICULOS_QUERY_KEY })

  const crearMutation = useMutation({
    mutationFn: crearVehiculo,
    onSuccess: async () => {
      await actualizarLista()
      setVehiculoEnEdicion(undefined)
    },
  })
  const editarMutation = useMutation({
    mutationFn: ({ id, cambios }: { id: string; cambios: VehiculoWrite }) =>
      actualizarVehiculo(id, cambios),
    onSuccess: async () => {
      await actualizarLista()
      setVehiculoEnEdicion(undefined)
    },
  })
  const eliminarMutation = useMutation({
    mutationFn: eliminarVehiculo,
    onSuccess: actualizarLista,
  })
  const estadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoVehiculo }) =>
      actualizarVehiculo(id, { estado }),
    onSuccess: actualizarLista,
  })

  function guardarVehiculo(values: VehiculoFormValues) {
    const datos: VehiculoWrite = {
      ...values,
      placa: values.placa.trim().toUpperCase(),
      modelo: values.modelo.trim(),
    }

    if (vehiculoEnEdicion) {
      editarMutation.mutate({ id: vehiculoEnEdicion.id, cambios: datos })
    } else {
      crearMutation.mutate(datos)
    }
  }

  function calcularTarifaFormulario(values: FormularioTarifa) {
    setTarifa(undefined)
    setErrorTarifa('')
    try {
      setTarifa(calcularTarifa(values.distancia, values.peso))
    } catch (error) {
      setErrorTarifa(mensajeError(error))
    }
  }

  const errorMutacion =
    crearMutation.error ??
    editarMutation.error ??
    eliminarMutation.error ??
    estadoMutation.error

  if (vehiculosQuery.isLoading) {
    return (
      <main className="vehiculos-page container py-4">
        <h1 className="h2">Gestión de vehículos</h1>
        <p role="status">Cargando vehículos…</p>
      </main>
    )
  }

  if (vehiculosQuery.isError) {
    return (
      <main className="vehiculos-page container py-4">
        <h1 className="h2">Gestión de vehículos</h1>
        <div className="alert alert-danger" role="alert">
          No se pudieron cargar los vehículos: {mensajeError(vehiculosQuery.error)}
        </div>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => void vehiculosQuery.refetch()}
        >
          Reintentar
        </button>
      </main>
    )
  }

  if (!vehiculosQuery.data) {
    return (
      <main className="vehiculos-page container py-4">
        <h1 className="h2">Gestión de vehículos</h1>
        <p role="status">Cargando vehículos…</p>
      </main>
    )
  }

  const codigoSiguiente = siguienteCodigoVehiculo(vehiculos)
  const disponibleCount = vehiculos.filter(
    ({ estado }) => estado === 'Disponible',
  ).length
  const hayFiltrosActivos = Boolean(
    filtros.busqueda || filtros.estado || filtros.tipo,
  )

  return (
    <main className="vehiculos-page container py-4 py-lg-5">
      <header className="vehiculos-header mb-4">
        <div>
          <h1>Gestión de Vehículos</h1>
          <p>
            Registra y administra los vehículos disponibles.
          </p>
        </div>
        <button
          className="btn-restaurar"
          type="button"
          disabled={vehiculosQuery.isFetching}
          onClick={() => void vehiculosQuery.refetch()}
        >
          {vehiculosQuery.isFetching ? 'Actualizando…' : 'Actualizar lista'}
        </button>
      </header>

      <section className="vehiculos-summary mb-4" aria-label="Resumen de vehículos">
        <article className="card shadow-sm">
          <div className="card-body">
            <h2 className="h6 text-secondary">Total de vehículos</h2>
            <p className="vehiculos-summary-value">{vehiculos.length}</p>
          </div>
        </article>
        <article className="card shadow-sm">
          <div className="card-body">
            <h2 className="h6 text-secondary">Disponibles</h2>
            <p className="vehiculos-summary-value">{disponibleCount}</p>
          </div>
        </article>
        <article className="card shadow-sm">
          <div className="card-body">
            <h2 className="h6 text-secondary">Siguiente código</h2>
            <p className="vehiculos-summary-value">{codigoSiguiente}</p>
          </div>
        </article>
      </section>

      {errorMutacion && (
        <div className="alert alert-danger" role="alert">
          No se pudo completar la operación: {mensajeError(errorMutacion)}
        </div>
      )}

      <div className="vehiculos-content-grid mb-4">
        <VehiculoForm
          key={vehiculoEnEdicion?.id ?? codigoSiguiente}
          codigo={codigoSiguiente}
          vehiculo={vehiculoEnEdicion}
          vehiculos={vehiculos}
          guardando={crearMutation.isPending || editarMutation.isPending}
          onGuardar={guardarVehiculo}
          onCancelarEdicion={() => setVehiculoEnEdicion(undefined)}
        />
        <section className="card shadow-sm" aria-label="Buscar y filtrar vehículos">
          <div className="card-body">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <h2 className="h5 mb-0">Buscar y filtrar vehículos</h2>
              <p className="small text-secondary mb-0" aria-live="polite">
                Mostrando {vehiculosFiltrados.length} de {vehiculos.length} vehículos
              </p>
            </div>
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="filtro-busqueda">
                  Buscar por código, placa o modelo
                </label>
                <input
                  className="form-control"
                  id="filtro-busqueda"
                  type="search"
                  value={filtros.busqueda}
                  onChange={(event) =>
                    dispatchFiltros({
                      tipo: 'busqueda',
                      valor: event.currentTarget.value,
                    })
                  }
                />
              </div>
              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label" htmlFor="filtro-tipo">
                  Tipo
                </label>
                <select
                  className="form-select"
                  id="filtro-tipo"
                  value={filtros.tipo}
                  onChange={(event) =>
                    dispatchFiltros({ tipo: 'tipo', valor: event.currentTarget.value })
                  }
                >
                  <option value="">Todos los tipos</option>
                  {TIPOS_VEHICULO.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label" htmlFor="filtro-estado">
                  Estado
                </label>
                <select
                  className="form-select"
                  id="filtro-estado"
                  value={filtros.estado}
                  onChange={(event) =>
                    dispatchFiltros({ tipo: 'estado', valor: event.currentTarget.value })
                  }
                >
                  <option value="">Todos los estados</option>
                  {ESTADOS_VEHICULO.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-2">
                <button
                  className="btn btn-outline-secondary w-100"
                  type="button"
                  disabled={!hayFiltrosActivos}
                  onClick={() => dispatchFiltros({ tipo: 'limpiar' })}
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </section>
        <VehiculosTable
          vehiculos={vehiculosFiltrados}
          sinResultados={vehiculos.length > 0}
          eliminandoId={eliminarMutation.isPending ? eliminarMutation.variables : null}
          onEditar={setVehiculoEnEdicion}
          onCambiarEstado={(id, estado) => estadoMutation.mutate({ id, estado })}
          onEliminar={(id) => eliminarMutation.mutate(id)}
        />
        <section className="card shadow-sm">
          <div className="card-body">
            <header className="mb-4">
              <h2 className="h4 mb-2">Calculadora de tarifas</h2>
              <p className="text-secondary mb-0">
                El precio depende de la distancia recorrida y del peso transportado.
                Ingresa ambos valores para consultar la tarifa.
              </p>
            </header>
            <h3 className="h6 mb-3">Datos del traslado</h3>
            <form
              className="row g-3 align-items-end"
              onSubmit={handleSubmit(calcularTarifaFormulario)}
              noValidate
            >
              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="tarifa-distancia">
                  Distancia (km)
                </label>
                <input
                  className={`form-control${errors.distancia ? ' is-invalid' : ''}`}
                  id="tarifa-distancia"
                  type="number"
                  min="1"
                  step="any"
                  aria-invalid={Boolean(errors.distancia)}
                  {...register('distancia', {
                    valueAsNumber: true,
                    required: 'La distancia es obligatoria.',
                    min: { value: 1, message: 'La distancia debe ser mayor que 0.' },
                  })}
                />
                {errors.distancia && (
                  <p className="field-error" role="alert">{errors.distancia.message}</p>
                )}
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="tarifa-peso">
                  Peso (toneladas)
                </label>
                <input
                  className={`form-control${errors.peso ? ' is-invalid' : ''}`}
                  id="tarifa-peso"
                  type="number"
                  min="0.1"
                  step="any"
                  aria-invalid={Boolean(errors.peso)}
                  {...register('peso', {
                    valueAsNumber: true,
                    required: 'El peso es obligatorio.',
                    min: { value: 0.1, message: 'El peso debe ser mayor que 0.' },
                  })}
                />
                {errors.peso && (
                  <p className="field-error" role="alert">{errors.peso.message}</p>
                )}
              </div>
              <div className="col-12 col-md-4">
                <button className="btn btn-primary w-100" type="submit">
                  Calcular tarifa
                </button>
              </div>
            </form>

            <div className="mt-4">
              <h3 className="h6 mb-2">Tarifas referenciales (S/)</h3>
              <p className="small text-secondary">
                Al ingresar distancia y peso, se resalta la tarifa que corresponde.
              </p>
              <div className="table-responsive tarifa-tabla-wrapper">
                <table className="table table-bordered align-middle text-center tarifa-tabla mb-0">
                  <caption className="visually-hidden">
                    Tarifas en soles por distancia recorrida y peso transportado.
                  </caption>
                  <colgroup>
                    <col className="tarifa-columna-distancia" />
                    <col />
                    <col />
                    <col />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col">Distancia</th>
                      {RANGOS_PESO.map(({ etiqueta }) => (
                        <th key={etiqueta} scope="col">{etiqueta}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RANGOS_DISTANCIA.map(({ etiqueta }, fila) => (
                      <tr key={etiqueta}>
                        <th scope="row">{etiqueta}</th>
                        {MATRIZ_TARIFAS[fila].map((precio, columna) => {
                          const seleccionada =
                            tarifaSeleccionada?.fila === fila &&
                            tarifaSeleccionada.columna === columna

                          return (
                            <td
                              aria-current={seleccionada ? 'true' : undefined}
                              className={seleccionada ? 'tarifa-celda-seleccionada' : undefined}
                              key={`${fila}-${columna}`}
                            >
                              <strong>S/ {precio}</strong>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {errorTarifa && !tarifaSeleccionada ? (
              <div className="alert alert-warning mt-3 mb-0" role="alert">
                {errorTarifa}
              </div>
              ) : tarifa &&
              tarifa.distancia === distanciaIngresada &&
              tarifa.peso === pesoIngresado ? (
              <div className="tarifa-resumen tarifa-resumen-calculada" role="status">
                <div>
                  <span className="tarifa-resumen-etiqueta">Cálculo realizado</span>
                  <span className="tarifa-resumen-detalle">
                    {tarifa.distancia} km · {tarifa.peso} toneladas
                  </span>
                </div>
                <strong>S/ {tarifa.precio.toFixed(2)}</strong>
              </div>
              ) : tarifaSeleccionada ? (
              <div className="tarifa-resumen" aria-live="polite">
                <div>
                  <span className="tarifa-resumen-etiqueta">Tramos seleccionados</span>
                  <span className="tarifa-resumen-detalle">
                    {RANGOS_DISTANCIA[tarifaSeleccionada.fila].etiqueta}
                    {' · '}
                    {RANGOS_PESO[tarifaSeleccionada.columna].etiqueta}
                  </span>
                </div>
                <strong>S/ {tarifaSeleccionada.precio}</strong>
              </div>
              ) : (
              <div className="tarifa-resumen" aria-live="polite">
                <span>
                  Ingresa distancia y peso para identificar la tarifa aplicable.
                </span>
                <span className="tarifa-resumen-detalle">
                  Ejemplo: 60 km y 4 toneladas corresponde a S/ 230.
                </span>
              </div>
              )}
              <p className="small text-secondary mb-0">
                La calculadora acepta hasta 200 km y 10 toneladas. Los valores
                fuera de esos rangos no se pueden cotizar con esta tabla.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}