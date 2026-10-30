interface HeroProps {
  readonly total: number;
}

export function Hero({ total }: HeroProps) {
  return (
    <header className="hero py-5">
      <div className="container">
        <p className="eyebrow mb-2">LABORATORIO REACT SEMANA 11</p>
        <h1 className="display-5 fw-bold mb-3">Explora iniciativas que generan impacto</h1>
        <p className="lead col-lg-8 mb-0">
          Descubre {total} propuestas académicas ficticias, filtra sus características y
          conserva tus favoritas mientras practicas componentes, props y estado.
        </p>
      </div>
    </header>
  );
}