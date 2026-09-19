/**
 * DATOS INICIALES
 * Objetos planos de demostración: representan datos transportables, no comportamiento.
 * Sirven para arrancar la aplicación y para "Restaurar ejemplo".
 * Resultado esperado: 2 aprobados, 2 en riesgo, promedio grupal 12.58.
 */
export const DATOS_INICIALES = [
  {
    codigo: "U20260001",
    nombre: "Ana María Pérez",
    correo: "ana.perez@utp.edu.pe",
    programa: "Ingeniería de Software",
    notas: [16, 15, 17]   // promedio 16.00 → Aprobado
  },
  {
    codigo: "U20260002",
    nombre: "Luis Alberto Rojas",
    correo: "luis.rojas@utp.edu.pe",
    programa: "Ingeniería de Sistemas",
    notas: [11, 10, 12]   // promedio 11.00 → En riesgo
  },
  {
    codigo: "U20260003",
    nombre: "María José Salas",
    correo: "maria.salas@utp.edu.pe",
    programa: "Ingeniería de Software",
    notas: [14, 13, 15]   // promedio 14.00 → Aprobado
  },
  {
    codigo: "U20260004",
    nombre: "Diego Núñez Torres",
    correo: "diego.nunez@utp.edu.pe",
    programa: "Ingeniería de Sistemas",
    notas: [8, 11, 9]     // promedio 9.33 → En riesgo
  }
];