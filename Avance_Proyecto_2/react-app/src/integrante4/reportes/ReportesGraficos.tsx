import { resumirEstados, resumirRutas } from './reportes.calculations'
import type { Orden } from './reportes.types'
import './reportes.graficos.css'

interface ReportesGraficosProps {
  ordenes: Orden[]
}

const COLORES: Record<string, string> = {
  Pendiente: '#6c757d',
  Programada: '#4f46e5',
  'En ruta': '#f59e0b',
  Completada: '#198754',
  Cancelada: '#dc3545',
}

const formatoMoneda = (valor: number) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(valor)

function GraficoBarrasEstado({ ordenes }: ReportesGraficosProps) {
  const datos = resumirEstados(ordenes)
  const maximo = Math.max(1, ...datos.map((item) => item.cantidad))

  const ancho = 420
  const alto = 220
  const margenInferior = 40
  const margenSuperior = 20
  const areaAlto = alto - margenInferior - margenSuperior
  const separacion = ancho / datos.length
  const anchoBarra = separacion * 0.55

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      role="img"
      aria-label={`Órdenes por estado: ${datos
        .map((item) => `${item.estado} ${item.cantidad}`)
        .join(', ')}`}
      className="grafico-svg"
    >
      <line
        x1="0"
        x2={ancho}
        y1={alto - margenInferior}
        y2={alto - margenInferior}
        stroke="#dee2e6"
      />
      {datos.map((item, indice) => {
        const altura = (item.cantidad / maximo) * areaAlto
        const x = indice * separacion + (separacion - anchoBarra) / 2
        const y = alto - margenInferior - altura

        return (
          <g key={item.estado}>
            <rect
              x={x}
              y={y}
              width={anchoBarra}
              height={altura}
              rx="4"
              fill={COLORES[item.estado] ?? '#198754'}
            >
              <title>
                {item.estado}: {item.cantidad} órdenes
              </title>
            </rect>
            <text
              x={x + anchoBarra / 2}
              y={y - 6}
              textAnchor="middle"
              className="grafico-valor"
            >
              {item.cantidad}
            </text>
            <text
              x={x + anchoBarra / 2}
              y={alto - 18}
              textAnchor="middle"
              className="grafico-etiqueta"
            >
              {item.estado}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function GraficoDonaMonto({ ordenes }: ReportesGraficosProps) {
  const datos = resumirEstados(ordenes).filter((item) => item.monto > 0)
  const total = datos.reduce((suma, item) => suma + item.monto, 0)

  const radio = 70
  const grosor = 28
  const circunferencia = 2 * Math.PI * radio

  if (total === 0) {
    return <p className="grafico-vacio">Sin montos para graficar.</p>
  }

  const segmentos = datos.map((item, indice) => ({
    ...item,
    largo: (item.monto / total) * circunferencia,
    inicio: datos
      .slice(0, indice)
      .reduce((suma, previo) => suma + (previo.monto / total) * circunferencia, 0),
  }))

  return (
    <div className="grafico-dona">
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={`Monto por estado: ${datos
          .map((item) => `${item.estado} ${formatoMoneda(item.monto)}`)
          .join(', ')}`}
        className="grafico-svg grafico-svg-dona"
      >
        <g transform="rotate(-90 100 100)">
          {segmentos.map((item) => {
            const { largo, inicio } = item

            return (
              <circle
                key={item.estado}
                cx="100"
                cy="100"
                r={radio}
                fill="none"
                stroke={COLORES[item.estado]}
                strokeWidth={grosor}
                strokeDasharray={`${largo} ${circunferencia - largo}`}
                strokeDashoffset={-inicio}
              >
                <title>
                  {item.estado}: {formatoMoneda(item.monto)}
                </title>
              </circle>
            )
          })}
        </g>
        <text x="100" y="96" textAnchor="middle" className="grafico-dona-titulo">
          Total
        </text>
        <text x="100" y="116" textAnchor="middle" className="grafico-dona-total">
          {formatoMoneda(total)}
        </text>
      </svg>

      <ul className="grafico-leyenda">
        {datos.map((item) => (
          <li key={item.estado}>
            <span
              className="grafico-leyenda-color"
              style={{ background: COLORES[item.estado] }}
              aria-hidden="true"
            />
            <span>{item.estado}</span>
            <strong>{((item.monto / total) * 100).toFixed(0)} %</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

function GraficoRutas({ ordenes }: ReportesGraficosProps) {
  const rutas = resumirRutas(ordenes).slice(0, 5)
  const maximo = Math.max(1, ...rutas.map((item) => item.monto))

  if (rutas.length === 0) {
    return <p className="grafico-vacio">No hay rutas para graficar.</p>
  }

  return (
    <ul
      className="grafico-rutas"
      aria-label="Rutas con mayor monto facturado"
    >
      {rutas.map((item) => (
        <li key={item.ruta}>
          <div className="grafico-rutas-texto">
            <span>{item.ruta}</span>
            <strong>{formatoMoneda(item.monto)}</strong>
          </div>
          <div className="grafico-rutas-pista">
            <div
              className="grafico-rutas-barra"
              style={{ width: `${(item.monto / maximo) * 100}%` }}
              title={`${item.cantidad} órdenes`}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ReportesGraficos({ ordenes }: ReportesGraficosProps) {
  return (
    <section className="reportes-graficos" aria-label="Gráficos de reportes">
      <article className="reportes-panel">
        <h2>Órdenes por estado</h2>
        <GraficoBarrasEstado ordenes={ordenes} />
      </article>

      <article className="reportes-panel">
        <h2>Monto por estado</h2>
        <GraficoDonaMonto ordenes={ordenes} />
      </article>

      <article className="reportes-panel reportes-graficos-ancho">
        <h2>Top 5 rutas por monto</h2>
        <GraficoRutas ordenes={ordenes} />
      </article>
    </section>
  )
}
