/**
 * VALIDADORES
 * Normalizan y validan datos sin efectos externos:
 * no muestran mensajes ni tocan el DOM; solo devuelven objetos y listas de errores.
 * Orden recomendado: normalizar → validar → construir → persistir → renderizar.
 */

// Se declaran una sola vez. La bandera "u" activa el modo Unicode.

// Código: la letra U seguida de exactamente 8 dígitos (ej.: U20260001)
const PATRON_CODIGO = /^U\d{8}$/u;

// Nombre: palabras de letras Unicode (\p{L}) con marcas/tildes (\p{M}),
// separadas por espacio, apóstrofo o guion (ej.: "Ángela Núñez-Soto")
const PATRON_NOMBRE = /^[\p{L}\p{M}]+(?:[ '\-][\p{L}\p{M}]+)*$/u;

// Correo: regla práctica → algo@algo.xx (sin espacios ni @ extra).
// No implementa todo el estándar de correo.
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

/**
 * Recorta los extremos y colapsa espacios repetidos en uno solo.
 * Ejemplo: "  Ana   María " → "Ana María"
 */
export function normalizarTexto(texto) {
  return String(texto).trim().replace(/\s+/gu, " ");
}

/**
 * Convierte una nota a número. OJO: Number("") devuelve 0, lo que haría que
 * una nota vacía se aceptara en silencio como cero. Por eso una cadena vacía
 * se convierte explícitamente en NaN, y la validación posterior la rechaza.
 */
function convertirNota(nota) {
  return String(nota).trim() === "" ? NaN : Number(nota);
}

/**
 * Devuelve un objeto NUEVO con los datos normalizados (no modifica el original).
 */
export function normalizarDatos(datos) {
  return {
    codigo: normalizarTexto(datos.codigo).toUpperCase(),
    nombre: normalizarTexto(datos.nombre),
    correo: normalizarTexto(datos.correo).toLocaleLowerCase("es-PE"),
    programa: normalizarTexto(datos.programa),
    notas: datos.notas.map(convertirNota)
  };
}

/**
 * Comprueba las reglas y devuelve un arreglo con los mensajes de error.
 * Arreglo vacío = datos válidos.
 */
export function validarDatosEstudiante(datos) {
  const errores = [];

  // Regla 1: formato del código
  if (!PATRON_CODIGO.test(datos.codigo)) {
    errores.push("El código debe tener el formato U seguido de 8 dígitos.");
  }
  // Regla 2: caracteres permitidos en el nombre
  if (!PATRON_NOMBRE.test(datos.nombre)) {
    errores.push("El nombre solo puede contener letras, espacios, apóstrofes o guiones.");
  }
  // Regla 3: estructura básica del correo
  if (!PATRON_CORREO.test(datos.correo)) {
    errores.push("El correo no tiene una estructura válida.");
  }
  // Regla 4: longitud mínima del programa (una regex comprueba forma, no longitud)
  if (datos.programa.length < 3) {
    errores.push("El programa debe tener al menos 3 caracteres.");
  }
  // Regla 5: exactamente 3 notas
  if (!Array.isArray(datos.notas) || datos.notas.length !== 3) {
    errores.push("Se requieren exactamente 3 notas.");
  // Regla 6: cada nota debe ser un número finito entre 0 y 20
  } else if (datos.notas.some(nota => !Number.isFinite(nota) || nota < 0 || nota > 20)) {
    errores.push("Cada nota debe ser un número entre 0 y 20.");
  }

  return errores;
}