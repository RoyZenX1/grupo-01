import { useState } from 'react';
import { EmptyState } from './components/EmptyState';
import { FilterBar } from './components/FilterBar';
import { Hero } from './components/Hero';
import { InitiativeCard } from './components/InitiativeCard';
import { SummaryPanel } from './components/SummaryPanel';
import { INITIATIVES } from './data/initiatives';
import type { CategoryFilter } from './types/initiative';
import { filterInitiatives, toggleFavorite } from './utils/filterInitiatives';

export default function App() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('Todas');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => new Set());

  const visibleInitiatives = filterInitiatives(
    INITIATIVES,
    { query, category, onlyFavorites },
    favoriteIds,
  );

  function handleToggleFavorite(initiativeId: number) {
    setFavoriteIds((currentIds) => toggleFavorite(currentIds, initiativeId));
  }

  function clearFilters() {
    setQuery('');
    setCategory('Todas');
    setOnlyFavorites(false);
  }

  return (
    <>
      <Hero total={INITIATIVES.length} />
      <main className="container py-5">
        <FilterBar
          query={query}
          category={category}
          onlyFavorites={onlyFavorites}
          onQueryChange={setQuery}
          onCategoryChange={setCategory}
          onOnlyFavoritesChange={setOnlyFavorites}
          onClear={clearFilters}
        />
        <div className="my-4">
          <SummaryPanel
            visibleCount={visibleInitiatives.length}
            totalCount={INITIATIVES.length}
            favoriteCount={favoriteIds.size}
          />
        </div>
        {visibleInitiatives.length === 0 ? (
          <EmptyState onClear={clearFilters} />
        ) : (
          <section className="row g-4" aria-label="Iniciativas disponibles">
            {visibleInitiatives.map((initiative) => (
              <div className="col-md-6 col-xl-4" key={initiative.id}>
                <InitiativeCard
                  initiative={initiative}
                  isFavorite={favoriteIds.has(initiative.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            ))}
          </section>
        )}
      </main>
      <footer className="container pb-5 text-secondary small">
        Datos ficticios para fines educativos JavaScript Avanzado
      </footer>
    </>
  );
}