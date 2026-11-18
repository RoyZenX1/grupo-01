export const WORKSHOPS = [
  { id: 'react', title: 'Interfaces con React', hours: 12,
    description: 'Compón una interfaz con componentes, rutas y formularios.' },
  { id: 'accesibilidad', title: 'Accesibilidad web', hours: 8,
    description: 'Evalúa etiquetas, errores y navegación con teclado.' },
  { id: 'pruebas', title: 'Pruebas de interfaces', hours: 10,
    description: 'Comprueba recorridos desde la perspectiva del usuario.' },
] as const;

export type Workshop = (typeof WORKSHOPS)[number];

export function findWorkshop(id: string | undefined) {
  return WORKSHOPS.find((workshop) => workshop.id === id);
}