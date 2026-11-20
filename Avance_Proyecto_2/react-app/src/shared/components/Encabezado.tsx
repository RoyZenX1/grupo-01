interface EncabezadoProps {
  titulo: string
  descripcion: string
}

export function Encabezado({ titulo, descripcion }: EncabezadoProps) {
  return (
    <header className="workspace-heading">
      <h1>{titulo}</h1>
      <p>{descripcion}</p>
    </header>
  )
}
