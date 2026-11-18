import type { Initiative } from '../types/initiative';

export const INITIATIVES: readonly Initiative[] = [
  {
    id: 1,
    title: 'Portal de bienestar estudiantil',
    description: 'Organiza recursos y actividades de acompañamiento en una interfaz clara.',
    category: 'Desarrollo web',
    level: 'Inicial',
    durationHours: 12,
    skills: ['HTML semántico', 'React', 'Accesibilidad'],
  },
  {
    id: 2,
    title: 'Tablero de progreso académico',
    description: 'Presenta indicadores ficticios y ayuda a interpretar tendencias de estudio.',
    category: 'Datos',
    level: 'Intermedio',
    durationHours: 16,
    skills: ['TypeScript', 'Visualización', 'Pruebas'],
  },
  {
    id: 3,
    title: 'Mapa de espacios colaborativos',
    description: 'Facilita la consulta de laboratorios y salas mediante tarjetas reutilizables.',
    category: 'Experiencia de usuario',
    level: 'Inicial',
    durationHours: 10,
    skills: ['Investigación UX', 'Componentes', 'Diseño adaptable'],
  },
  {
    id: 4,
    title: 'Catálogo de retos de programación',
    description: 'Clasifica ejercicios por nivel y presenta objetivos de aprendizaje concretos.',
    category: 'Desarrollo web',
    level: 'Intermedio',
    durationHours: 18,
    skills: ['React', 'Estado', 'Eventos'],
  },
  {
    id: 5,
    title: 'Observatorio de empleabilidad',
    description: 'Resume datos ficticios sobre habilidades solicitadas en ofertas laborales.',
    category: 'Datos',
    level: 'Intermedio',
    durationHours: 15,
    skills: ['Análisis de datos', 'Estadística'],
  },
  {
    id: 6,
    title: 'Guía de accesibilidad digital',
    description: 'Promueve buenas prácticas de navegación con teclado y lectores de pantalla.',
    category: 'Experiencia de usuario',
    level: 'Inicial',
    durationHours: 14,
    skills: ['Accesibilidad', 'Teclado', 'ARIA'],
  }
];