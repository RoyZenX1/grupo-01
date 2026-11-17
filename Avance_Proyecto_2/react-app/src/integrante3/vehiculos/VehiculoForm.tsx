import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { vehiculoFormSchema } from './vehiculo.schema'
import type { VehiculoFormValues } from './vehiculo.schema'
import { ESTADOS_VEHICULO, TIPOS_VEHICULO } from './vehiculo.types'
import type { Vehiculo } from './vehiculo.types'
import { esPlacaDuplicada } from './vehiculos-filtros'

interface VehiculoFormProps {
  codigo: string
  vehiculo?: Vehiculo
  vehiculos: Vehiculo[]
  guardando: boolean
  onGuardar: (values: VehiculoFormValues) => void
  onCancelarEdicion: () => void
}

export function VehiculoForm({
  codigo,
  vehiculo,
  vehiculos,
  guardando,
  onGuardar,
  onCancelarEdicion,
}: VehiculoFormProps) {
  const {
    clearErrors,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VehiculoFormValues>({
    resolver: zodResolver(vehiculoFormSchema),
    defaultValues: {
      codigo: vehiculo?.codigo ?? codigo,
      placa: vehiculo?.placa ?? '',
      modelo: vehiculo?.modelo ?? '',
      tipo: vehiculo?.tipo,
      capacidad: vehiculo?.capacidad ?? 0,
      estado: vehiculo?.estado ?? 'Disponible',
    },
  })

  function validarYGuardar(values: VehiculoFormValues) {
    clearErrors('placa')
    if (esPlacaDuplicada(vehiculos, values.placa, vehiculo?.id)) {
      setError('placa', {
        type: 'validate',
        message: 'Ya existe un vehículo registrado con esa placa.',
      })
      return
    }

    onGuardar(values)
  }

  return (
    <section className="card shadow-sm">
      <div className="card-body">
        <h2 className="h4 mb-3">
          {vehiculo ? 'Editar vehículo' : 'Registrar vehículo'}
        </h2>
        <form className="vehiculo-form-grid" onSubmit={handleSubmit(validarYGuardar)} noValidate>
          <div>
            <label className="form-label" htmlFor="vehiculo-codigo">
              Código visible
            </label>
            <input
              className="form-control"
              id="vehiculo-codigo"
              readOnly
              {...register('codigo')}
            />
            {errors.codigo && (
              <p className="field-error" role="alert">{errors.codigo.message}</p>
            )}
          </div>

          <div>
            <label className="form-label" htmlFor="vehiculo-placa">Placa</label>
            <input
              className={`form-control${errors.placa ? ' is-invalid' : ''}`}
              id="vehiculo-placa"
              placeholder="ABC-123"
              autoComplete="off"
              aria-invalid={Boolean(errors.placa)}
              {...register('placa')}
            />
            {errors.placa && (
              <p className="field-error" role="alert">{errors.placa.message}</p>
            )}
          </div>

          <div>
            <label className="form-label" htmlFor="vehiculo-modelo">Modelo</label>
            <input
              className={`form-control${errors.modelo ? ' is-invalid' : ''}`}
              id="vehiculo-modelo"
              autoComplete="off"
              aria-invalid={Boolean(errors.modelo)}
              {...register('modelo')}
            />
            {errors.modelo && (
              <p className="field-error" role="alert">{errors.modelo.message}</p>
            )}
          </div>

          <div>
            <label className="form-label" htmlFor="vehiculo-tipo">Tipo</label>
            <select
              className={`form-select${errors.tipo ? ' is-invalid' : ''}`}
              id="vehiculo-tipo"
              aria-invalid={Boolean(errors.tipo)}
              {...register('tipo')}
            >
              <option value="">Selecciona un tipo</option>
              {TIPOS_VEHICULO.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            {errors.tipo && (
              <p className="field-error" role="alert">{errors.tipo.message}</p>
            )}
          </div>

          <div>
            <label className="form-label" htmlFor="vehiculo-capacidad">
              Capacidad (toneladas)
            </label>
            <input
              className={`form-control${errors.capacidad ? ' is-invalid' : ''}`}
              id="vehiculo-capacidad"
              type="number"
              min="0.1"
              max="100"
              step="any"
              aria-invalid={Boolean(errors.capacidad)}
              {...register('capacidad', { valueAsNumber: true })}
            />
            {errors.capacidad && (
              <p className="field-error" role="alert">{errors.capacidad.message}</p>
            )}
          </div>

          <div>
            <label className="form-label" htmlFor="vehiculo-estado">Estado</label>
            <select
              className="form-select"
              id="vehiculo-estado"
              {...register('estado')}
            >
              {ESTADOS_VEHICULO.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>

          <div className="vehiculo-form-actions">
            <button className="btn btn-primary" type="submit" disabled={guardando}>
              {guardando
                ? 'Guardando…'
                : vehiculo
                  ? 'Guardar cambios'
                  : 'Registrar vehículo'}
            </button>
            {vehiculo && (
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
      </div>
    </section>
  )
}