export const CATEGORIES = [
  'Desarrollo web',
  'Datos',
  'Experiencia de usuario',
] as const;

export type Category = (typeof CATEGORIES)[number];
export type CategoryFilter = 'Todas' | Category;

export interface Initiative {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly category: Category;
  readonly level: 'Inicial' | 'Intermedio';
  readonly durationHours: number;
  readonly skills: readonly string[];
}

export interface InitiativeFilters {
  readonly query: string;
  readonly category: CategoryFilter;
  readonly onlyFavorites: boolean;
}