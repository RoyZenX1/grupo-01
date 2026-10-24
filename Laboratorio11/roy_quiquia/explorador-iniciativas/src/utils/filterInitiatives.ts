import type { Initiative, InitiativeFilters } from '../types/initiative';

export function filterInitiatives(
  initiatives: readonly Initiative[],
  filters: InitiativeFilters,
  favoriteIds: ReadonlySet<number>,
): Initiative[] {
  const normalizedQuery = filters.query.trim().toLocaleLowerCase('es');
  return initiatives.filter((initiative) => {
    const searchableText = [
      initiative.title,
      initiative.description,
      initiative.category,
      ...initiative.skills,
    ]
      .join('')
      .toLocaleLowerCase('es');

    const matchesQuery =
      normalizedQuery === '' || searchableText.includes(normalizedQuery);
    const matchesCategory =
      filters.category === 'Todas' || initiative.category === filters.category;
    const matchesFavorite =
      !filters.onlyFavorites || favoriteIds.has(initiative.id);

    return matchesQuery && matchesCategory && matchesFavorite;
  });
}

export function toggleFavorite(
  currentIds: ReadonlySet<number>,
  initiativeId: number,
): Set<number> {
  const nextIds = new Set(currentIds);
  if (nextIds.has(initiativeId)) {
    nextIds.delete(initiativeId);
  } else {
    nextIds.add(initiativeId);
  }
  return nextIds;
}