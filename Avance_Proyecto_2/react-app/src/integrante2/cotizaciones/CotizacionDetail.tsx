import { Link } from 'react-router-dom'
import { EstadoPill } from '../../shared/components/EstadoPill'
import type { Cliente } from '../../integrante1/clientes/cliente.types'
import { estadoEfectivo, formatearMoneda, textoFecha } from './cotizacion.calculations'
import type { Cotizacion } from './cotizacion.types'

interface CotizacionDetailProps {
  cotizacion: Cotizacion
  cliente?: Cliente
  orden?: { id: string; codigo: string }
  onCerrar: () => void
}

export function CotizacionDetail({ cotizacion: c, cliente, orden, onCerrar }: CotizacionDetailProps) {
  const estado = estadoEfectivo(c)
  const descuento = c.subtotal - c.baseImponible

  return (
    <section className="workspace-card" aria-label={`Detalle de la cotización ${c.id}`}>
      <div className="d-flex justify-content-between align-items-start gap-2">
        <h2>
          Cotización {c.id} <EstadoPill estado={estado} />
        </h2>
        <button className="btn btn-sm btn-outline-secondary" type="button" onClick={onCerrar}>
          Cerrar
        </button>
      </div>

      <div className="row">
        <dl className="detail-list col-12 col-lg-6">
          <dt>Cliente</dt>
          <dd>{cliente ? `${cliente.nombre} (${cliente.identificacion})` : (c.clienteNombre ?? `Cliente ${c.clienteId}`)}</dd>
          <dt>Servicio</dt>
          <dd>{c.servicio}</dd>
          <dt>Ruta</dt>
          <dd>{c.origen} → {c.destino} ({c.distancia} km)</dd>
          <dt>Carga</dt>
          <dd>{c.peso} t</dd>
          <dt>Emisión</dt>
          <dd>{textoFecha(c.fechaEmision)}</dd>
          <dt>Vence</dt>
          <dd>{textoFecha(c.fechaVencimiento)}</dd>
        </dl>
        <dl className="detail-list col-12 col-lg-6">
          <dt>Tarifa unitaria</dt>
          <dd>{formatearMoneda(c.precioUnitario)} × {c.cantidad}</dd>
          <dt>Subtotal</dt>
          <dd>{formatearMoneda(c.subtotal)}</dd>
          <dt>Descuento ({c.descuentoPorcentaje} %)</dt>
          <dd>− {formatearMoneda(descuento)}</dd>
          <dt>Base imponible</dt>
          <dd>{formatearMoneda(c.baseImponible)}</dd>
          <dt>IGV (18 %)</dt>
          <dd>{formatearMoneda(c.igv)}</dd>
          <dt>Total</dt>
          <dd><strong>{formatearMoneda(c.total)}</strong></dd>
        </dl>
      </div>

      {estado === 'Aprobada' && !orden && (
        <Link className="btn btn-primary" to={`/ordenes?cotizacionId=${encodeURIComponent(c.id)}`}>
          Convertir en orden
        </Link>
      )}
      {orden && (
        <Link className="btn btn-outline-primary" to={`/ordenes?orden=${encodeURIComponent(orden.id)}`}>
          Ver orden {orden.codigo}
        </Link>
      )}
    </section>
  )
}
