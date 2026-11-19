
import { useState } from 'react'
import type { CotizacionParaOrden } from './ordenes.types'
import type { Vehiculo } from '../../integrante3/vehiculos/vehiculo.types'
import { buscarTarifa } from '../../integrante3/vehiculos/tarifas'
import { prepararBorradorOrden } from './ordenes.calculations'
import type { OrdenBorrador, OrdenWrite } from './ordenes.types'

interface OrdenFormProps {
  cotizaciones: CotizacionParaOrden[]
  vehiculos: Vehiculo[]
  onGuardar: (orden: OrdenWrite) => void
  onCancelar: () => void
}

export function OrdenForm({
  cotizaciones,
  vehiculos,
  onGuardar,
  onCancelar,
}: OrdenFormProps) {
  const cotizacionesAprobadas = cotizaciones.filter(
    (cotizacion) => cotizacion.estado === 'Aprobada',
  )

  const vehiculosDisponibles = vehiculos.filter(
    (vehiculo) => vehiculo.estado === 'Disponible',
  )

  const [datos, setDatos] = useState<OrdenBorrador>({
    cotizacionId: '',
    vehiculoId: '',
    origen: '',
    destino: '',
    distancia: 0,
    peso: 0,
  })

  const [error, setError] = useState('')
  const [tarifa, setTarifa] = useState<number | null>(null)

  function actualizarCampo(
    campo: keyof OrdenBorrador,
    valor: string | number,
  ) {
    const nuevosDatos = {
      ...datos,
      [campo]: valor,
    }

    setDatos(nuevosDatos)
    setError('')

    const nuevaTarifa = buscarTarifa(
      Number(nuevosDatos.distancia),
      Number(nuevosDatos.peso),
    )

    setTarifa(nuevaTarifa?.precio ?? null)
  }

  function seleccionarCotizacion(id: string) {
    const cotizacion = cotizacionesAprobadas.find(
      (item) => item.id === id,
    )

    setDatos((actuales) => ({
      ...actuales,
      cotizacionId: id,
      origen: cotizacion?.origen ?? '',
      destino: cotizacion?.destino ?? '',
      distancia: cotizacion?.distancia ?? 0,
      peso: cotizacion?.peso ?? 0,
    }))

    setTarifa(
      cotizacion
        ? buscarTarifa(cotizacion.distancia, cotizacion.peso)?.precio ?? null
        : null,
    )

    setError('')
  }

  function guardar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    try {
      const resultado = prepararBorradorOrden(
        datos,
        cotizaciones,
        vehiculos,
      )

      const orden: OrdenWrite = {
        ...resultado.borrador,
        codigo: '',
        tarifa: resultado.tarifaCalculada,
        estado: 'Pendiente',
      }

      onGuardar(orden)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al validar la orden.',
      )
    }
  }

  return (
    <form className="ordenes-formulario" onSubmit={guardar}>
      <h2>Nueva orden de transporte</h2>

      <div className="mb-3">
        <label className="form-label">
          Cotización aprobada
        </label>

        <select
          className="form-select"
          value={datos.cotizacionId}
          onChange={(event) =>
            seleccionarCotizacion(event.target.value)
          }
          required
        >
          <option value="">Selecciona una cotización</option>

          {cotizacionesAprobadas.map((cotizacion) => (
            <option key={cotizacion.id} value={cotizacion.id}>
              {cotizacion.id} - {cotizacion.origen} a {cotizacion.destino}
            </option>
          ))}
        </select>

        {cotizacionesAprobadas.length === 0 && (
          <small className="text-muted">
            No hay cotizaciones aprobadas disponibles.
          </small>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">
          Vehículo disponible
        </label>

        <select
          className="form-select"
          value={datos.vehiculoId}
          onChange={(event) =>
            actualizarCampo('vehiculoId', event.target.value)
          }
          required
        >
          <option value="">Selecciona un vehículo</option>

          {vehiculosDisponibles.map((vehiculo) => (
            <option key={vehiculo.id} value={vehiculo.id}>
              {vehiculo.placa} - {vehiculo.tipo} - Capacidad: {vehiculo.capacidad} t
            </option>
          ))}
        </select>

        {vehiculosDisponibles.length === 0 && (
          <small className="text-muted">
            No hay vehículos disponibles.
          </small>
        )}
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Origen</label>
          <input
            className="form-control"
            type="text"
            minLength={3}
            maxLength={80}
            value={datos.origen}
            onChange={(event) =>
              actualizarCampo('origen', event.target.value)
            }
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Destino</label>
          <input
            className="form-control"
            type="text"
            minLength={3}
            maxLength={80}
            value={datos.destino}
            onChange={(event) =>
              actualizarCampo('destino', event.target.value)
            }
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Distancia (km)</label>
          <input
            className="form-control"
            type="number"
            min="0.01"
            max="200"
            step="any"
            value={datos.distancia || ''}
            onChange={(event) =>
              actualizarCampo('distancia', Number(event.target.value))
            }
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Peso (toneladas)</label>
          <input
            className="form-control"
            type="number"
            min="0.01"
            max="10"
            step="any"
            value={datos.peso || ''}
            onChange={(event) =>
              actualizarCampo('peso', Number(event.target.value))
            }
            required
          />
        </div>
      </div>

      <div className="ordenes-tarifa">
        <span>Tarifa calculada</span>
        <strong>
          {tarifa !== null
            ? `S/ ${tarifa.toFixed(2)}`
            : 'Ingresa una distancia y un peso válidos'}
        </strong>
      </div>

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancelar}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            cotizacionesAprobadas.length === 0 ||
            vehiculosDisponibles.length === 0
          }
        >
          Registrar orden
        </button>
      </div>
    </form>
  )
}
