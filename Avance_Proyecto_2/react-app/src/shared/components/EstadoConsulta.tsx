import type { ReactNode } from 'react'
import { mensajeError } from '../api/http'

interface EstadoConsultaProps {
  cargando: boolean
  error: unknown
  onReintentar: () => void
  children: ReactNode
}

export function EstadoConsulta({
  cargando,
  error,
  onReintentar,
  children,
}: EstadoConsultaProps) {
  if (cargando) {
    return (
      <div className="workspace-card" role="status">
        Cargando información…
      </div>
    )
  }
  if (error) {
    return (
      <div className="workspace-card">
        <div className="alert alert-danger" role="alert">
          No se pudo cargar la información: {mensajeError(error)}
        </div>
        <button className="btn btn-primary" type="button" onClick={onReintentar}>
          Reintentar
        </button>
      </div>
    )
  }
  return <>{children}</>
}
