import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
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

  const clientesQuery = useQuery({
    queryKey: CLIENTES_QUERY_KEY,
    queryFn: listarClientes,
  })
  const clientes = useMemo(() => clientesQuery.data ?? [], [clientesQuery.data])
  const filtrados = useMemo(() => {
    const texto = normalizar(busqueda.trim())
    if (!texto) return clientes
    return clientes.filter((cliente) =>
      normalizar(
        `${cliente.nombre} ${cliente.identificacion} ${cliente.email} ${cliente.telefono}`,
      ).includes(texto),
    )
  }, [clientes, busqueda])

  const crearMutation = useMutation({
    mutationFn: crearCliente,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLIENTES_QUERY_KEY })
      setEnEdicion(undefined)
    },
  })
  const editarMutation = useMutation({
    mutationFn: ({ id, cambios }: { id: string; cambios: ClienteWrite }) =>
      actualizarCliente(id, cambios),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLIENTES_QUERY_KEY })
      setEnEdicion(undefined)
    },
  })
  const eliminarMutation = useMutation({
    mutationFn: eliminarCliente,
    onSuccess: (_dato, id) => {
      if (id === seleccionadoId) setSeleccionadoId(undefined)
      void queryClient.invalidateQueries({ queryKey: CLIENTES_QUERY_KEY })
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
      editarMutation.mutate({ id: enEdicion.id, cambios: datos })
    } else {
      crearMutation.mutate(datos)
    }
  }

  const seleccionado = clientes.find((cliente) => cliente.id === seleccionadoId)
  const errorMutacion =
    crearMutation.error ?? editarMutation.error ?? eliminarMutation.error

  return (
    <main className="workspace-page clientes-page">
      <Encabezado
        titulo="Clientes"
        descripcion="Registra, consulta y administra los clientes de NexoCargo."
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
            No se pudo completar la operación: {mensajeError(errorMutacion)}
          </div>
        )}

        <div className="module-grid mb-3">
          <ClientesForm
            key={enEdicion?.id ?? 'nuevo'}
            cliente={enEdicion}
            clientes={clientes}
            guardando={crearMutation.isPending || editarMutation.isPending}
            onGuardar={guardar}
            onCancelarEdicion={() => setEnEdicion(undefined)}
          />

          <section className="workspace-card" aria-label="Buscar clientes">
            <h2>Buscar y filtrar</h2>
            <label className="form-label" htmlFor="filtro-cliente">
              Nombre, DNI/RUC, correo o teléfono
            </label>
            <input
              className="form-control"
              id="filtro-cliente"
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.currentTarget.value)}
            />
            <p className="small text-secondary mt-3 mb-0" aria-live="polite">
              Mostrando {filtrados.length} de {clientes.length} clientes
            </p>
          </section>
        </div>

        {seleccionado && (
          <ClienteDetail
            cliente={seleccionado}
            onCerrar={() => setSeleccionadoId(undefined)}
          />
        )}

        <ClientesTable
          clientes={filtrados}
          sinResultados={clientes.length > 0}
          eliminandoId={
            eliminarMutation.isPending ? eliminarMutation.variables : null
          }
          onVer={(cliente) => setSeleccionadoId(cliente.id)}
          onEditar={(cliente) => {
            setEnEdicion(cliente)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onEliminar={(id) => eliminarMutation.mutate(id)}
        />
      </EstadoConsulta>
    </main>
  )
}
