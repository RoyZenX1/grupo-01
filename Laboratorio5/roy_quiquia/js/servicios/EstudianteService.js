/**
 * SERVICIO: EstudianteService
 * Gestiona reglas de negocio, la colección, el índice por código, JSON y persistencia.
 * No construye HTML: de eso se encarga app.js.
 */
import { Estudiante } from "../modelos/Estudiante.js";
import { normalizarDatos, validarDatosEstudiante } from "../utilidades/validadores.js";

// Clave bajo la que se guarda el respaldo en localStorage.
// El sufijo "v1" permite distinguir versiones del formato de datos.
const CLAVE_ALMACENAMIENTO = "js-avanzado-semana5-estudiantes-v1";

// Comparador de texto en español: ignora mayúsculas y tildes al ordenar
const comparadorTexto = new Intl.Collator("es-PE", { sensitivity: "base" });

export class EstudianteService {
  // Campos privados (#): solo el servicio puede leerlos o reemplazarlos
  #estudiantes = [];            // ESTADO FUENTE: única fuente de verdad
  #indicePorCodigo = new Map(); // ÍNDICE DERIVADO: código → estudiante
  #almacenamiento;              // Se inyecta para poder usar uno alternativo en pruebas

  // Invariante: tras cada operación exitosa, #estudiantes y el Map
  // contienen exactamente los mismos códigos.
  constructor(datosIniciales = [], almacenamiento = globalThis.localStorage) {
    this.#almacenamiento = almacenamiento;
    // guardar:false → al arrancar no se sobrescribe el respaldo existente
    this.reemplazarTodos(datosIniciales, { guardar: false });
  }

  // Devuelve una copia superficial: quien la reciba no puede alterar el arreglo interno
  listar() {
    return [...this.#estudiantes];
  }

  // Búsqueda directa por código gracias al Map (más eficiente que recorrer el arreglo)
  obtenerPorCodigo(codigo) {
    return this.#indicePorCodigo.get(codigo);
  }

  // Programas únicos: map() extrae, Set elimina repetidos, toSorted() ordena una copia
  obtenerProgramas() {
    return [...new Set(this.#estudiantes.map(estudiante => estudiante.programa))]
      .toSorted(comparadorTexto.compare);
  }

  /**
   * Registra un estudiante. Flujo: normalizar → validar → comprobar unicidad → crear → persistir.
   * Si algo falla lanza TypeError y NO modifica el estado.
   */
  agregar(datos) {
    const normalizados = normalizarDatos(datos);
    const errores = validarDatosEstudiante(normalizados);

    // Unicidad: Map.has() comprueba si el código ya existe
    if (this.#indicePorCodigo.has(normalizados.codigo)) {
      errores.push("El código ya se encuentra registrado.");
    }
    if (errores.length > 0) {
      throw new TypeError(errores.join(" "));
    }

    // Inmutabilidad del contenedor: se crea un arreglo nuevo con spread
    this.#estudiantes = [...this.#estudiantes, new Estudiante(normalizados)];
    this.#sincronizarIndice(); // reconstruye el Map
    this.guardarLocal();       // guarda en localStorage
  }

  // Elimina por código. Devuelve true si hubo cambio y false si el código no existía
  eliminar(codigo) {
    if (!this.#indicePorCodigo.has(codigo)) return false;

    // filter() produce un arreglo nuevo sin el estudiante eliminado
    this.#estudiantes = this.#estudiantes.filter(estudiante => estudiante.codigo !== codigo);
    this.#sincronizarIndice();
    this.guardarLocal();
    return true;
  }

  /**
   * Devuelve la vista filtrada y ordenada. No modifica el estado fuente.
   * Todos los criterios son opcionales; los que están vacíos no filtran.
   */
  buscar({ texto = "", programa = "", estado = "", orden = "nombre" } = {}) {
    const termino = String(texto).trim().toLocaleLowerCase("es-PE");

    const filtrados = this.#estudiantes.filter(estudiante => {
      // Coincide si el texto aparece en código, nombre o correo (sin distinguir mayúsculas)
      const coincideTexto = termino === "" ||
        estudiante.codigo.toLocaleLowerCase("es-PE").includes(termino) ||
        estudiante.nombre.toLocaleLowerCase("es-PE").includes(termino) ||
        estudiante.correo.toLocaleLowerCase("es-PE").includes(termino);
      const coincidePrograma = programa === "" || estudiante.programa === programa;
      const coincideEstado = estado === "" || estudiante.estado === estado;
      // Deben cumplirse las tres condiciones a la vez (AND)
      return coincideTexto && coincidePrograma && coincideEstado;
    });

    // Patrón "estrategia": cada criterio de orden es una función comparadora
    const comparadores = {
      "promedio-desc": (a, b) => b.promedio - a.promedio,
      "promedio-asc": (a, b) => a.promedio - b.promedio,
      nombre: (a, b) => comparadorTexto.compare(a.nombre, b.nombre)
    };

    // toSorted() ordena una COPIA; si el criterio no existe se usa "nombre"
    return filtrados.toSorted(comparadores[orden] ?? comparadores.nombre);
  }

  /**
   * Calcula las métricas del grupo en una sola pasada con reduce().
   * El acumulador es un objeto explícito con cuatro contadores.
   */
  obtenerResumen() {
    const base = this.#estudiantes.reduce((resumen, estudiante) => ({
      total: resumen.total + 1,
      aprobados: resumen.aprobados + (estudiante.estado === "Aprobado" ? 1 : 0),
      riesgo: resumen.riesgo + (estudiante.estado === "En riesgo" ? 1 : 0),
      sumaPromedios: resumen.sumaPromedios + estudiante.promedio
    }), { total: 0, aprobados: 0, riesgo: 0, sumaPromedios: 0 }); // valor inicial

    return {
      ...base,
      // Evita dividir entre cero cuando no hay estudiantes
      promedioGrupal: base.total === 0 ? 0 : base.sumaPromedios / base.total
    };
  }

  // Serializa el arreglo a texto JSON con sangría de 2 espacios.
  // Cada Estudiante usa su método toJSON().
  exportarJson() {
    return JSON.stringify(this.#estudiantes, null, 2);
  }

  // JSON.parse puede lanzar SyntaxError si el texto está mal formado;
  // el error sube hasta app.js, que lo muestra al usuario.
  importarJson(texto) {
    const datos = JSON.parse(texto);
    this.reemplazarTodos(datos, { guardar: true });
  }

  /**
   * Reemplaza TODOS los estudiantes de forma atómica:
   * primero valida y construye candidatos; solo si todo es correcto,
   * asigna al estado. Si algo falla, el estado anterior queda intacto.
   */
  reemplazarTodos(datos, { guardar = true } = {}) {
    // Un JSON válido puede tener estructura incorrecta (ej.: un objeto en vez de un arreglo)
    if (!Array.isArray(datos)) {
      throw new TypeError("Los datos deben contener un arreglo de estudiantes.");
    }

    // Se crean instancias nuevas de Estudiante (JSON.parse solo da objetos planos)
    const candidatos = datos.map((dato, indice) => {
      const normalizados = normalizarDatos(dato);
      const errores = validarDatosEstudiante(normalizados);
      if (errores.length > 0) {
        // indice + 1: numeración legible para el usuario (empieza en 1)
        throw new TypeError(`Elemento ${indice + 1}: ${errores.join(" ")}`);
      }
      return new Estudiante(normalizados);
    });

    // Unicidad dentro del lote: un Set no admite repetidos,
    // así que si su tamaño es menor hay códigos duplicados
    const codigos = candidatos.map(estudiante => estudiante.codigo);
    if (new Set(codigos).size !== codigos.length) {
      throw new TypeError("Los códigos no pueden repetirse.");
    }

    // Asignación solo al final: aquí ya no puede fallar la validación
    this.#estudiantes = candidatos;
    this.#sincronizarIndice();
    if (guardar) this.guardarLocal();
  }

  // Guarda el estado actual en localStorage (que solo almacena texto)
  guardarLocal() {
    if (!this.#almacenamiento) return; // sin almacenamiento disponible, no hace nada
    this.#almacenamiento.setItem(CLAVE_ALMACENAMIENTO, this.exportarJson());
  }

  // Carga el respaldo. Devuelve true si había datos y false si no.
  // Los datos guardados NO son confiables: se revalidan al cargar.
  cargarLocal() {
    if (!this.#almacenamiento) return false;
    const texto = this.#almacenamiento.getItem(CLAVE_ALMACENAMIENTO); // texto o null
    if (texto === null) return false;

    this.reemplazarTodos(JSON.parse(texto), { guardar: false });
    return true;
  }

  // Elimina el respaldo (útil si está dañado o es de otra versión).
  // El operador ?. evita error si no hay almacenamiento.
  limpiarLocal() {
    this.#almacenamiento?.removeItem(CLAVE_ALMACENAMIENTO);
  }

  // Método privado: reconstruye el Map a partir del arreglo.
  // Se llama después de agregar, eliminar o reemplazar.
  #sincronizarIndice() {
    this.#indicePorCodigo = new Map(
      this.#estudiantes.map(estudiante => [estudiante.codigo, estudiante])
    );
  }
}