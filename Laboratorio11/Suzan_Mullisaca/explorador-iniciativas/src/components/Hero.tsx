interface HeroProps {
  readonly total: number;
}

export function Hero({ total }: HeroProps) {
  return (
    <header className="hero py-5 text-center">
      <div className="container">
        <p className="eyebrow text-uppercase mb-2">JavaScript Avanzado</p>
        <h1 className="display-4 fw-bold">Explorador de Iniciativas</h1>
        <p className="lead">Descubre y guarda tus proyectos académicos favoritos. Actualmente hay {total} iniciativas.</p>
      </div>
    </header>
  );
}