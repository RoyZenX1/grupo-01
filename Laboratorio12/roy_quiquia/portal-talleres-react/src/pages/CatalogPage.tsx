import { Link } from 'react-router';
import { WORKSHOPS } from '../data/workshops';

export function CatalogPage() {
  return (
    <>
      <p className="eyebrow">APRENDE EN EQUIPO</p>
      <h1>Catálogo de talleres</h1>
      <p className="lead">Elige un taller e inscribe un equipo de 1 a 4 personas.</p>
      <div className="row g-4 mt-2">
        {WORKSHOPS.map((workshop) => (
          <div className="col-md-4" key={workshop.id}>
            <article className="card h-100 p-4">
              <h2 className="h4">{workshop.title}</h2>
              <p>{workshop.description}</p>
              <p>{workshop.hours} horas</p>
              <Link className="btn btn-outline-primary mt-auto"
                to={`/talleres/${workshop.id}`}>Ver {workshop.title}</Link>
            </article>
          </div>
        ))}
      </div>
    </>
  );
}