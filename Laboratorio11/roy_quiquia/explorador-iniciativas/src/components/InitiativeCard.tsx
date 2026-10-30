import type { Initiative } from '../types/initiative';

interface InitiativeCardProps {
  readonly initiative: Initiative;
  readonly isFavorite: boolean;
  readonly onToggleFavorite: (initiativeId: number) => void;
}

export function InitiativeCard({
  initiative,
  isFavorite,
  onToggleFavorite,
}: InitiativeCardProps) {
  return (
    <article className="card initiative-card h-100 border-0 shadow-sm">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between gap-3 align-items-start">
          <span className="badge category-badge">{initiative.category}</span>
          <button
            className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
            type="button"
            aria-pressed={isFavorite}
            aria-label={`${isFavorite ? 'Quitar de' : 'Agregar a'} favoritas: ${initiative.title}`}
            onClick={() => onToggleFavorite(initiative.id)}
          >
            <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
          </button>
        </div>
        <h3 className="h5 mt-3">{initiative.title}</h3>
        <p className="text-secondary flex-grow-1">{initiative.description}</p>
        <dl className="row small mb-3">
          <dt className="col-5">Nivel</dt>
          <dd className="col-7">{initiative.level}</dd>
          <dt className="col-5">Duración</dt>
          <dd className="col-7 mb-0">{initiative.durationHours} horas</dd>
        </dl>
        <ul className="skill-list" aria-label={`Habilidades de ${initiative.title}`}>
          {initiative.skills.map((skill) => <li key={skill}>{skill}</li>)}
        </ul>
      </div>
    </article>
  );
}