import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import type { Cliente } from '../clientes/cliente.types'
import { buscarTarifa } from '../vehiculos/tarifas'
import { calcularTotales, formatearMoneda } from './cotizacion.calculations'
import { cotizacionFormSchema } from './cotizacion.schema'
import type { CotizacionFormValues } from './cotizacion.schema'
import type { Cotizacion } from './cotizacion.types'

interface CotizacionFormProps {
  clientes: Cliente[]
  cotizacion?: Cotizacion
  guardando: boolean
  onGuardar: (values: CotizacionFormValues) => void
  onCancelarEdicion: () => void
}

export function CotizacionForm({
  clientes,
  cotizacion,
  guardando,
  onGuardar,
  onCancelarEdicion,
}: CotizacionFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CotizacionFormValues>({
    resolver: zodResolver(cotizacionFormSchema),
    defaultValues: {
      clienteId: cotizacion?.clienteId ?? '',
      origen: cotizacion?.origen ?? '',
      destino: cotizacion?.destino ?? '',
      distancia: cotizacion?.distancia ?? 0,
      peso: cotizacion?.peso ?? 0,
      cantidad: cotizacion?.cantidad ?? 1,
      descuentoPorcentaje: cotizacion?.descuentoPorcentaje ?? 0,
    },
  })

  const distancia = useWatch({ control, name: 'distancia' })
  const peso = useWatch({ control, name: 'peso' })
  const cantidad = useWatch({ control, name: 'cantidad' })
  const descuento = useWatch({ control, name: 'descuentoPorcentaje' })

  // Vista previa: misma tarifa y mismo cálculo que se guardarán.
  const tarifa = buscarTarifa(distancia, peso)
  const totales =
    tarifa && Number.isFinite(cantidad) && Number.isFinite(descuento)
      ? calcularTotales(tarifa.precio, cantidad, descuento)
      : undefined

  return (
    <section className="workspace-card">
      <h2>{cotizacion ? `Editar cotización ${cotizacion.id}` : 'Registrar cotización'}</h2>
      <form onSubmit={handleSubmit(onGuardar)} noValidate className="d-grid gap-3">
        <div>
          <label className="form-label" htmlFor="cot-cliente">Cliente</label>
          <select className="form-select" id="cot-cliente" {...register('clienteId')}>
            <option value="">Selecciona un cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.identificacion})
              </option>
            ))}
          </select>
          {errors.clienteId && <p className="field-error" role="alert">{errors.clienteId.message}</p>}
        </div>

        <div className="row g-3">
          <div className="col-6">
            <label className="form-label" htmlFor="cot-origen">Origen</label>
            <input className="form-control" id="cot-origen" {...register('origen')} />
            {errors.origen && <p className="field-error" role="alert">{errors.origen.message}</p>}
          </div>
          <div className="col-6">
            <label className="form-label" htmlFor="cot-destino">Destino</label>
            <input className="form-control" id="cot-destino" {...register('destino')} />
            {errors.destino && <p className="field-error" role="alert">{errors.destino.message}</p>}
          </div>
          <div className="col-6">
            <label className="form-label" htmlFor="cot-distancia">Distancia (km)</label>
            <input
              className="form-control"
              id="cot-distancia"
              type="number"
              step="any"
              {...register('distancia', { valueAsNumber: true })}
            />
            {errors.distancia && <p className="field-error" role="alert">{errors.distancia.message}</p>}
          </div>
          <div className="col-6">
            <label className="form-label" htmlFor="cot-peso">Peso (t)</label>
            <input
              className="form-control"
              id="cot-peso"
              type="number"
              step="any"
              {...register('peso', { valueAsNumber: true })}
            />
            {errors.peso && <p className="field-error" role="alert">{errors.peso.message}</p>}
          </div>
          <div className="col-6">
            <label className="form-label" htmlFor="cot-cantidad">Cantidad de servicios</label>
            <input
              className="form-control"
              id="cot-cantidad"
              type="number"
              {...register('cantidad', { valueAsNumber: true })}
            />
            {errors.cantidad && <p className="field-error" role="alert">{errors.cantidad.message}</p>}
          </div>
          <div className="col-6">
            <label className="form-label" htmlFor="cot-descuento">Descuento (%)</label>
            <input
              className="form-control"
              id="cot-descuento"
              type="number"
              step="any"
              {...register('descuentoPorcentaje', { valueAsNumber: true })}
            />
            {errors.descuentoPorcentaje && (
              <p className="field-error" role="alert">{errors.descuentoPorcentaje.message}</p>
            )}
          </div>
        </div>

        <div className="border rounded p-3 bg-light" aria-live="polite">
          {totales && tarifa ? (
            <dl className="detail-list mb-0">
              <dt>Tarifa por servicio</dt>
              <dd>{formatearMoneda(tarifa.precio)}</dd>
              <dt>Subtotal</dt>
              <dd>{formatearMoneda(totales.subtotal)}</dd>
              <dt>Descuento</dt>
              <dd>− {formatearMoneda(totales.descuento)}</dd>
              <dt>IGV (18 %)</dt>
              <dd>{formatearMoneda(totales.igv)}</dd>
              <dt>Total</dt>
              <dd><strong>{formatearMoneda(totales.total)}</strong></dd>
            </dl>
          ) : (
            <p className="text-secondary mb-0">
              Indica distancia (hasta 200 km) y peso (hasta 10 t) para calcular la tarifa.
            </p>
          )}
        </div>

        <div className="table-actions">
          <button className="btn btn-primary" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : cotizacion ? 'Guardar cambios' : 'Registrar cotización'}
          </button>
          {cotizacion && (
            <button className="btn btn-outline-secondary" type="button" onClick={onCancelarEdicion}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
