import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  useDeferredValue,
  useMemo,
  useState,
} from 'react'

import { mensajeError } from '../../shared/api/http'
import { Encabezado } from '../../shared/components/Encabezado'
import { EstadoConsulta } from '../../shared/components/EstadoConsulta'

import { ClienteDetail } from './ClienteDetail'
import { ClientesForm } from './ClientesForm'
import { ClientesTable } from './ClientesTable'

import type { ClienteFormValues } from './cliente.schema'
import type { Cliente, ClienteWrite } from './cliente.types'

import {
  actualizarCliente,
  CLIENTES_QUERY_KEY,
  crearCliente,
  eliminarCliente,
  listarClientes,
} from './clientes.api'

import './clientes.css'

function normalizar(texto: string): string {
  return texto
    .toLocaleLowerCase('es-PE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function ClientesPage() {
  const queryClient = useQueryClient()

  const [enEdicion, setEnEdicion] = useState<Cliente>()
  const [seleccionadoId, setSeleccionadoId] = useState<string>()

  const [busqueda, setBusqueda] = useState('')
  const [tipoIdentificacion, setTipoIdentificacion] = useState('todos')
  const [orden, setOrden] = useState('nombre-asc')
  const [pagina, setPagina] = useState(1)

  const clientesPorPagina = 6

  // React puede posponer el filtrado cuando la lista sea grande.
  const busquedaDiferida = useDeferredValue(busqueda)

  const clientesQuery = useQuery({
    queryKey: CLIENTES_QUERY_KEY,
    queryFn: listarClientes,
  })

  const clientes = useMemo(
    () => clientesQuery.data ?? [],
    [clientesQuery.data],
  )

  // Búsqueda y filtros.
  const filtrados = useMemo(() => {
    const texto = normalizar(busquedaDiferida.trim())

    return clientes.filter((cliente) => {
      const informacion = normalizar(
        `${cliente.nombre} ${cliente.identificacion} ${cliente.email} ${cliente.telefono}`,
      )

      const coincideBusqueda =
        !texto || informacion.includes(texto)

      const coincideTipo =
        tipoIdentificacion === 'todos' ||
        (tipoIdentificacion === 'dni' &&
          cliente.identificacion.length === 8) ||
        (tipoIdentificacion === 'ruc' &&
          cliente.identificacion.length === 11)

      return coincideBusqueda && coincideTipo
    })
  }, [clientes, busquedaDiferida, tipoIdentificacion])

  // Ordenamiento.
  const ordenados = useMemo(() => {
    const copia = [...filtrados]

    copia.sort((a, b) => {
      switch (orden) {
        case 'nombre-desc':
          return b.nombre.localeCompare(a.nombre, 'es')

        case 'identificacion':
          return a.identificacion.localeCompare(b.identificacion)

        case 'email':
          return a.email.localeCompare(b.email)

        default:
          return a.nombre.localeCompare(b.nombre, 'es')
      }
    })

    return copia
  }, [filtrados, orden])

  // Paginación.
  const totalPaginas = Math.max(
    1,
    Math.ceil(ordenados.length / clientesPorPagina),
  )

  const paginaActual = Math.min(pagina, totalPaginas)

  const clientesVisibles = useMemo(() => {
    const inicio = (paginaActual - 1) * clientesPorPagina

    return ordenados.slice(
      inicio,
      inicio + clientesPorPagina,
    )
  }, [ordenados, paginaActual])


  const crearMutation = useMutation({
    mutationFn: crearCliente,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: CLIENTES_QUERY_KEY,
      })
      setEnEdicion(undefined)
    },
  })

  const editarMutation = useMutation({
    mutationFn: ({
      id,
      cambios,
    }: {
      id: string
      cambios: ClienteWrite
    }) => actualizarCliente(id, cambios),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: CLIENTES_QUERY_KEY,
      })
      setEnEdicion(undefined)
    },
  })

  const eliminarMutation = useMutation({
    mutationFn: eliminarCliente,

    onSuccess: (_dato, id) => {
      if (id === seleccionadoId) {
        setSeleccionadoId(undefined)
      }

      void queryClient.invalidateQueries({
        queryKey: CLIENTES_QUERY_KEY,
      })
    },
  })

  function guardar(values: ClienteFormValues) {
    const datos: ClienteWrite = {
      nombre: values.nombre.trim(),
      identificacion: values.identificacion.trim(),
      email: values.email.trim().toLocaleLowerCase('es-PE'),
      telefono: values.telefono.trim(),
    }

    if (enEdicion) {
      editarMutation.mutate({
        id: enEdicion.id,
        cambios: datos,
      })
    } else {
      crearMutation.mutate(datos)
    }
  }

  function limpiarFiltros() {
    setBusqueda('')
    setTipoIdentificacion('todos')
    setOrden('nombre-asc')
    setPagina(1)
  }

  const seleccionado = clientes.find(
    (cliente) => cliente.id === seleccionadoId,
  )

  const errorMutacion =
    crearMutation.error ??
    editarMutation.error ??
    eliminarMutation.error

  const hayFiltros =
    busqueda !== '' || tipoIdentificacion !== 'todos'

  return (
    <main className="workspace-page clientes-page">

      <Encabezado
        titulo="Gestión de clientes"
        descripcion="Administra y consulta la información de los clientes de NexoCargo."
      />

      <EstadoConsulta
        cargando={clientesQuery.isLoading}
        error={clientesQuery.error}
        onReintentar={() => void clientesQuery.refetch()}
      >
        <section className="kpi-grid" aria-label="Resumen de clientes">
          <article className="kpi-card">
            <h2>Total de clientes</h2>
            <p className="kpi-value">{clientes.length}</p>
          </article>

          <article className="kpi-card">
            <h2>Resultados visibles</h2>
            <p className="kpi-value">{filtrados.length}</p>
          </article>
        </section>


        {errorMutacion && (
          <div className="alert alert-danger" role="alert">
            No se pudo completar la operación:{' '}
            {mensajeError(errorMutacion)}
          </div>
        )}

        <div className="clientes-layout">

          <section className="clientes-form-panel">
            <ClientesForm
              key={enEdicion?.id ?? 'nuevo'}
              cliente={enEdicion}
              clientes={clientes}
              guardando={
                crearMutation.isPending ||
                editarMutation.isPending
              }
              onGuardar={guardar}
              onCancelarEdicion={() => setEnEdicion(undefined)}
            />
          </section>

          <section className="clientes-list-panel">

            <div className="clientes-toolbar">
              <div>
                <h2>Directorio de clientes</h2>
                <p>
                  Consulta y administra los clientes registrados.
                </p>
              </div>

              <span className="clientes-total">
                {clientes.length} registrados
              </span>
            </div>

            <div className="clientes-filtros">

              <div className="clientes-buscador">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Buscar por nombre, DNI, RUC, correo..."
                  value={busqueda}
                  onChange={(event) => {
                    setBusqueda(event.currentTarget.value)
                    setPagina(1)
                  }}
                  aria-label="Buscar clientes"
                />
              </div>

              <div className="clientes-filtros-secundarios">

                <select
                  className="form-select"
                  value={tipoIdentificacion}
                  onChange={(event) => {
                    setTipoIdentificacion(event.currentTarget.value)
                    setPagina(1)
                  }}
                  aria-label="Filtrar por tipo de identificación"
                >
                  <option value="todos">Todos los clientes</option>
                  <option value="dni">Personas (DNI)</option>
                  <option value="ruc">Empresas (RUC)</option>
                </select>

                <select
                  className="form-select"
                  value={orden}
                  onChange={(event) => {
                    setOrden(event.currentTarget.value)
                    setPagina(1)
                  }}
                  aria-label="Ordenar clientes"
                >
                  <option value="nombre-asc">Nombre: A - Z</option>
                  <option value="nombre-desc">Nombre: Z - A</option>
                  <option value="identificacion">Identificación</option>
                  <option value="email">Correo electrónico</option>
                </select>

                {hayFiltros && (
                  <button
                    type="button"
                    className="btn-limpiar-filtros"
                    onClick={limpiarFiltros}
                  >
                    Limpiar
                  </button>
                )}

              </div>
            </div>

            <div className="clientes-resultados">
              <span>
                {ordenados.length} resultados encontrados
              </span>

              {isPendingPlaceholder(busqueda, busquedaDiferida) && (
                <span>Actualizando búsqueda...</span>
              )}
            </div>

            {seleccionado && (
              <ClienteDetail
                cliente={seleccionado}
                onCerrar={() => setSeleccionadoId(undefined)}
              />
            )}

            <ClientesTable
              clientes={clientesVisibles}
              sinResultados={clientes.length > 0}
              eliminandoId={
                eliminarMutation.isPending
                  ? eliminarMutation.variables
                  : null
              }
              onVer={(cliente) => setSeleccionadoId(cliente.id)}
              onEditar={(cliente) => {
                setEnEdicion(cliente)
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                })
              }}
              onEliminar={(id) => eliminarMutation.mutate(id)}
            />

            {ordenados.length > 0 && (
              <div className="clientes-paginacion">

                <span>
                  Página {paginaActual} de {totalPaginas}
                </span>

                <div className="clientes-paginacion-botones">
                  <button
                    type="button"
                    disabled={paginaActual === 1}
                    onClick={() => setPagina((actual) => actual - 1)}
                  >
                    Anterior
                  </button>

                  <button
                    type="button"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPagina((actual) => actual + 1)}
                  >
                    Siguiente
                  </button>
                </div>

              </div>
            )}

          </section>
        </div>

      </EstadoConsulta>
    </main>
  )
}

// Compara la búsqueda inmediata con la diferida.
function isPendingPlaceholder(actual: string, diferida: string) {
  return actual !== diferida
}
