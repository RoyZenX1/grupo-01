import { Link, useParams } from 'react-router';
import { findWorkshop } from '../data/workshops';
import { NotFoundPage } from './NotFoundPage';

export function WorkshopPage() {
  const { id } = useParams();
  const workshop = findWorkshop(id);
  if (!workshop) return <NotFoundPage />;

  return (
    <>
      <h1>{workshop.title}</h1>
      <p className="lead">{workshop.description}</p>
      <p>Duración: {workshop.hours} horas. La inscripción es una simulación local.</p>
      <Link className="btn btn-primary" to={`/inscripcion/${workshop.id}`}>
        Inscribir equipo
      </Link>
    </>
  );
}