
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
    <section className="workspace-card clientes-form-card">

      <div className="clientes-form-heading">
        <span className="clientes-form-icono">＋</span>

        <div>
          <h2>
            {cliente ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <p>
            {cliente
              ? 'Actualiza la información del cliente.'
              : 'Completa los datos para registrar un cliente.'}
          </p>
        </div>
      </div>

      <form
        className="clientes-form"
        onSubmit={handleSubmit(validarYGuardar)}
        noValidate
      >

        <div className="clientes-campo">
          <label htmlFor="cliente-nombre">
            Nombre o razón social
          </label>

          <input
            className={`form-control${errors.nombre ? ' is-invalid' : ''}`}
            id="cliente-nombre"
            placeholder="Ej. Transportes del Norte"
            autoComplete="name"
            aria-invalid={Boolean(errors.nombre)}
            {...register('nombre')}
          />

          {errors.nombre && (
            <p className="field-error" role="alert">
              {errors.nombre.message}
            </p>
          )}
        </div>

        <div className="clientes-campo">
          <label htmlFor="cliente-identificacion">
            DNI / RUC
          </label>

          <input
            className={`form-control${errors.identificacion ? ' is-invalid' : ''}`}
            id="cliente-identificacion"
            placeholder="Ingresa el número de documento"
            inputMode="numeric"
            aria-invalid={Boolean(errors.identificacion)}
            {...register('identificacion')}
          />

          {errors.identificacion && (
            <p className="field-error" role="alert">
              {errors.identificacion.message}
            </p>
          )}
        </div>

        <div className="clientes-campo">
          <label htmlFor="cliente-email">
            Correo electrónico
          </label>

          <input
            className={`form-control${errors.email ? ' is-invalid' : ''}`}
            id="cliente-email"
            type="email"
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />

          {errors.email && (
            <p className="field-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="clientes-campo">
          <label htmlFor="cliente-telefono">
            Teléfono
          </label>

          <input
            className={`form-control${errors.telefono ? ' is-invalid' : ''}`}
            id="cliente-telefono"
            placeholder="Ej. 987654321"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.telefono)}
            {...register('telefono')}
          />

          {errors.telefono && (
            <p className="field-error" role="alert">
              {errors.telefono.message}
            </p>
          )}
        </div>

        <div className="clientes-form-acciones">

          <button
            className="clientes-btn-guardar"
            type="submit"
            disabled={guardando}
          >
            {guardando
              ? 'Guardando...'
              : cliente
                ? 'Guardar cambios'
                : 'Registrar cliente'}
          </button>

          {cliente && (
            <button
              className="clientes-btn-cancelar"
              type="button"
              disabled={guardando}
              onClick={onCancelarEdicion}
            >
              Cancelar
            </button>
          )}

        </div>

      </form>
    </section>
  )
}
