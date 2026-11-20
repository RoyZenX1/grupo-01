export function EstadoPill({ estado }: { estado: string }) {
  return <span className={`estado-pill estado-${estado.toLocaleLowerCase('es-PE')}`}>{estado}</span>
}
