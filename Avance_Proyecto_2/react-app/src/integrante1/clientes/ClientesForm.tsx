import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { clienteFormSchema } from './cliente.schema'
import type { ClienteFormValues } from './cliente.schema'
import type { Cliente } from './cliente.types'

interface ClientesFormProps {
  cliente?: Cliente
  clientes: Cliente[]
  guardando: boolean
  onGuardar: (values: ClienteFormValues) => void
  onCancelarEdicion: () => void
}

export function ClientesForm({
  cliente,
  clientes,
  guardando,
  onGuardar,
  onCancelarEdicion,
}: ClientesFormProps) {
  const {
    clearErrors,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: {
      nombre: cliente?.nombre ?? '',
      identificacion: cliente?.identificacion ?? '',
      email: cliente?.email ?? '',
      telefono: cliente?.telefono ?? '',
    },
  })

  function validarYGuardar(values: ClienteFormValues) {
    clearErrors(['identificacion', 'email'])
    const identificacionDuplicada = clientes.some(
      (item) =>
        item.id !== cliente?.id &&
        item.identificacion === values.identificacion,
    )
    const emailDuplicado = clientes.some(
      (item) =>
        item.id !== cliente?.id &&
        item.email.toLocaleLowerCase('es-PE') ===
          values.email.toLocaleLowerCase('es-PE'),
    )

    if (identificacionDuplicada) {
      setError('identificacion', {
        type: 'validate',
        message: 'Ya existe un cliente con esta identificación.',
      })
      return
    }
    if (emailDuplicado) {
      setError('email', {
        type: 'validate',
        message: 'Ya existe un cliente con este correo.',
      })
      return
    }
    onGuardar(values)
  }

  return (
    <section className="workspace-card">
      <h2>{cliente ? 'Editar cliente' : 'Registrar cliente'}</h2>
      <form className="d-grid gap-3" onSubmit={handleSubmit(validarYGuardar)} noValidate>
        <div>
          <label className="form-label" htmlFor="cliente-nombre">Nombre o razón social</label>
          <input
            className={`form-control${errors.nombre ? ' is-invalid' : ''}`}
            id="cliente-nombre"
            autoComplete="name"
            aria-invalid={Boolean(errors.nombre)}
            {...register('nombre')}
          />
          {errors.nombre && <p className="field-error" role="alert">{errors.nombre.message}</p>}
        </div>
        <div>
          <label className="form-label" htmlFor="cliente-identificacion">DNI / RUC</label>
          <input
            className={`form-control${errors.identificacion ? ' is-invalid' : ''}`}
            id="cliente-identificacion"
            inputMode="numeric"
            aria-invalid={Boolean(errors.identificacion)}
            {...register('identificacion')}
          />
          {errors.identificacion && (
            <p className="field-error" role="alert">{errors.identificacion.message}</p>
          )}
        </div>
        <div>
          <label className="form-label" htmlFor="cliente-email">Correo electrónico</label>
          <input
            className={`form-control${errors.email ? ' is-invalid' : ''}`}
            id="cliente-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email && <p className="field-error" role="alert">{errors.email.message}</p>}
        </div>
        <div>
          <label className="form-label" htmlFor="cliente-telefono">Teléfono</label>
          <input
            className={`form-control${errors.telefono ? ' is-invalid' : ''}`}
            id="cliente-telefono"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.telefono)}
            {...register('telefono')}
          />
          {errors.telefono && (
            <p className="field-error" role="alert">{errors.telefono.message}</p>
          )}
        </div>
        <div className="table-actions">
          <button className="btn btn-primary" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : cliente ? 'Guardar cambios' : 'Registrar cliente'}
          </button>
          {cliente && (
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={guardando}
              onClick={onCancelarEdicion}
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
