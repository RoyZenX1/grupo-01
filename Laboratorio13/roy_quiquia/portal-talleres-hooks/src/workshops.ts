export const WORKSHOPS = [
  { id: 'react', title: 'Interfaces con React' },
  { id: 'accesibilidad', title: 'Accesibilidad web' },
  { id: 'pruebas', title: 'Pruebas de interfaces' },
] as const;

export type WorkshopId = (typeof WORKSHOPS)[number]['id'];