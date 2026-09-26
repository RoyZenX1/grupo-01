import type {
  EstudianteEntrada,
  ResultadoValidacion
} from "../tipos.js";

const PATRON_CODIGO = /^U\d{8}$/u;
const PATRON_NOMBRE = /^[\p{L}\p{M}]+(?:[ '\-][\p{L}\p{M}]+)+$/u;

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function textoNormalizado(valor: unknown): string {
  return typeof valor === "string"
    ? valor.trim().replace(/\s+/gu, " ")
    : "";
}

export function validarEstudiante(
  valor: unknown,
  posicion: number
): ResultadoValidacion<EstudianteEntrada> {
  if (!esObjeto(valor)) {
    return {
      ok: false,
      errores: [`Registro ${posicion}: debe ser un objeto.`]
    };
  }

  const codigo = textoNormalizado(valor.codigo).toUpperCase();
  const nombre = textoNormalizado(valor.nombre);
  const programa = textoNormalizado(valor.programa);
  const notas = valor.notas;

  const errores: string[] = [];

  if (!PATRON_CODIGO.test(codigo)) {
    errores.push(`Registro ${posicion}: código inválido.`);
  }

  if (!PATRON_NOMBRE.test(nombre) || nombre.length > 80) {
    errores.push(`Registro ${posicion}: nombre inválido.`);
  }

  if (programa.length < 3 || programa.length > 60) {
    errores.push(`Registro ${posicion}: programa inválido.`);
  }

  if (
    !Array.isArray(notas) ||
    notas.length !== 3 ||
    !notas.every(
      nota =>
        typeof nota === "number" &&
        Number.isFinite(nota) &&
        nota >= 0 &&
        nota <= 20
    )
  ) {
    errores.push(
      `Registro ${posicion}: se requieren tres notas entre 0 y 20.`
    );
  }

  if (errores.length > 0) {
    return {
      ok: false,
      errores
    };
  }

  return {
    ok: true,
    valor: {
      codigo,
      nombre,
      programa,
      notas: [...(notas as number[])]
    }
  };
}