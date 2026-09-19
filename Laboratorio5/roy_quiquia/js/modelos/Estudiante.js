/**
 * MODELO: Estudiante
 * Representa una entidad y calcula valores propios (promedio, estado, iniciales).
 * No accede al DOM ni a localStorage: solo maneja datos.
 */
export class Estudiante {
  // Recibe un objeto y lo "desestructura" en sus cinco propiedades
  constructor({ codigo, nombre, correo, programa, notas }) {
    // Se convierte a texto, se recortan espacios y el código se pasa a mayúsculas
    this.codigo = String(codigo).trim().toUpperCase();
    this.nombre = String(nombre).trim();
    // Correo en minúsculas según las reglas del español de Perú
    this.correo = String(correo).trim().toLocaleLowerCase("es-PE");
    this.programa = String(programa).trim();
    // map() crea un arreglo nuevo: no se conserva el arreglo recibido como alias
    this.notas = notas.map(Number);
  }

  // GETTER: promedio calculado a partir de las notas actuales.
  // No se almacena, así nunca queda desactualizado.
  get promedio() {
    // reduce() acumula la suma de todas las notas (empieza en 0)
    const suma = this.notas.reduce((total, nota) => total + nota, 0);
    // Redondeo a 2 decimales; Number.EPSILON corrige errores de coma flotante
    return Math.round((suma / this.notas.length + Number.EPSILON) * 100) / 100;
  }

  // GETTER: regla de negocio. 12 o más aprueba (la frontera 12 es Aprobado)
  get estado() {
    return this.promedio >= 12 ? "Aprobado" : "En riesgo";
  }

  // GETTER: iniciales de las dos primeras palabras del nombre
  get iniciales() {
    return this.nombre
      .split(/\s+/u)          // separa por uno o más espacios
      .slice(0, 2)            // toma solo las dos primeras partes
      .map(parte => parte.at(0)?.toLocaleUpperCase("es-PE") ?? "") // primera letra en mayúscula
      .join("");              // une las iniciales
  }

  // JSON.stringify() llama a este método automáticamente.
  // Solo se serializan datos fuente; promedio y estado se recalculan al cargar.
  toJSON() {
    return {
      codigo: this.codigo,
      nombre: this.nombre,
      correo: this.correo,
      programa: this.programa,
      notas: [...this.notas] // copia del arreglo
    };
  }

  // Método estático: crea una instancia desde un objeto plano (por ejemplo, tras JSON.parse)
  static desdeObjeto(datos) {
    return new Estudiante(datos);
  }
}