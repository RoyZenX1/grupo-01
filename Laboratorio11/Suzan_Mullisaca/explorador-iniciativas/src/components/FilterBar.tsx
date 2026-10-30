import { CATEGORIES } from '../types/initiative';
import type { CategoryFilter } from '../types/initiative';

interface FilterBarProps {
  readonly query: string;
  readonly category: CategoryFilter;
  readonly onlyFavorites: boolean;
  readonly onQueryChange: (query: string) => void;
  readonly onCategoryChange: (category: CategoryFilter) => void;
  readonly onOnlyFavoritesChange: (onlyFavorites: boolean) => void;
  readonly onClear: () => void;
}

export function FilterBar({
  query,
  category,
  onlyFavorites,
  onQueryChange,
  onCategoryChange,
  onOnlyFavoritesChange,
  onClear,
}: FilterBarProps) {
  return (
    <section className="filter-panel" aria-labelledby="filter-title">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 id="filter-title" className="h4 mb-0">Encuentra una iniciativa</h2>
        <button className="btn btn-link px-0" type="button" onClick={onClear}>
          Limpiar filtros
        </button>
      </div>

      <div className="row g-3 align-items-end">
        <div className="col-lg-6">
          <label className="form-label fw-semibold" htmlFor="search">Buscar</label>
          <input
            id="search"
            className="form-control"
            type="search"
            value={query}
            placeholder="Título, habilidad o palabra clave"
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>

        <div className="col-md-7 col-lg-4">
          <label className="form-label fw-semibold" htmlFor="category">Categoría</label>
          <select
            id="category"
            className="form-select"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value as CategoryFilter)}
          >
            <option value="Todas">Todas</option>
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="col-md-5 col-lg-2 pb-2">
          <div className="form-check">
            <input
              id="favorites"
              className="form-check-input"
              type="checkbox"
              checked={onlyFavorites}
              onChange={(event) => onOnlyFavoritesChange(event.target.checked)}
            />
            <label className="form-check-label" htmlFor="favorites">Solo favoritas</label>
          </div>
        </div>
      </div>
    </section>
  );
}