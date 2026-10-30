interface EmptyStateProps {
  readonly onClear: () => void;
}

export function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <div className="empty-state text-center" role="status">
      <p className="display-6 mb-2" aria-hidden="true">∅</p>
      <h2 className="h4">No encontramos coincidencias</h2>
      <p className="text-secondary">Prueba otra palabra o restablece los filtros.</p>
      <button className="btn btn-primary" type="button" onClick={onClear}>
        Mostrar todas
      </button>
    </div>
  );
}