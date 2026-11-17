import { Link } from 'react-router-dom'

interface PlaceholderPageProps {
  title: string
  description: string
}

export function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <main className="workspace-page">
      <header className="workspace-heading">
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <section className="workspace-card placeholder-card">
        <span className="placeholder-badge">En desarrollo</span>
        <h2>{title}</h2>
        <p className="mb-0">
          Esta sección ya tiene un espacio en la navegación. Su contenido se
          agregará cuando esté implementado el módulo correspondiente.
        </p>
      </section>
    </main>
  )
}

export function NotFoundPage() {
  return (
    <main className="workspace-page">
      <header className="workspace-heading">
        <h1>Página no encontrada</h1>
        <p>La sección que buscas no existe.</p>
      </header>
      <Link className="btn btn-primary" to="/dashboard">
        Volver al Dashboard
      </Link>
    </main>
  )
}
