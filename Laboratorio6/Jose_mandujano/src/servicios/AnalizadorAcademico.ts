import { Estudiante } from "../modelos/Estudiante.js";
import type {
  FiltrosEstudiantes,
  ResumenAcademico
} from "../tipos.js";
import { redondearDos } from "../utilidades/numeros.js";

const comparador = new Intl.Collator("es-PE", {
  sensitivity: "base"
});

function normalizarBusqueda(valor: string): string {
  return valor.trim().toLocaleLowerCase("es-PE");
}

export class AnalizadorAcademico {
  readonly #estudiantes: readonly Estudiante[];

  constructor(estudiantes: readonly Estudiante[]) {
    this.#estudiantes = [...estudiantes];
  }

  filtrar(
    filtros: FiltrosEstudiantes = {}
  ): Estudiante[] {
    const programa = filtros.programa
      ? normalizarBusqueda(filtros.programa)
      : undefined;

    const encontrados = this.#estudiantes.filter(
      estudiante => {
        const coincideEstado =
          filtros.estado === undefined ||
          estudiante.estado === filtros.estado;

        const coincidePrograma =
          programa === undefined ||
          normalizarBusqueda(estudiante.programa).includes(
            programa
          );

        return coincideEstado && coincidePrograma;
      }
    );

    const ordenados = encontrados.toSorted(
      (a, b) =>
        b.promedio - a.promedio ||
        comparador.compare(a.nombre, b.nombre)
    );

    return filtros.top === undefined
      ? ordenados
      : ordenados.slice(0, filtros.top);
  }

  resumir(
    estudiantes: readonly Estudiante[] = this.#estudiantes
  ): ResumenAcademico {
    const base = estudiantes.reduce(
      (acumulado, estudiante) => ({
        total: acumulado.total + 1,
        aprobados:
          acumulado.aprobados +
          (estudiante.estado === "aprobado" ? 1 : 0),
        riesgo:
          acumulado.riesgo +
          (estudiante.estado === "riesgo" ? 1 : 0),
        sumaPromedios:
          acumulado.sumaPromedios + estudiante.promedio
      }),
      {
        total: 0,
        aprobados: 0,
        riesgo: 0,
        sumaPromedios: 0
      }
    );

    return {
      total: base.total,
      aprobados: base.aprobados,
      riesgo: base.riesgo,
      promedioGrupal:
        base.total === 0
          ? 0
          : redondearDos(
              base.sumaPromedios / base.total
            )
    };
  }

  programas(): string[] {
    return [
      ...new Set(
        this.#estudiantes.map(
          estudiante => estudiante.programa
        )
      )
    ].toSorted(comparador.compare);
  }
}