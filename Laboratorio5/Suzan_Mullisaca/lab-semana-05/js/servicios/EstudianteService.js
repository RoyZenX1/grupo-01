import { Estudiante } from "../modelos/Estudiante.js";
import { normalizarDatos, validarDatosEstudiante } from "../utilidades/validadores.js";
const CLAVE_ALMACENAMIENTO = "js-avanzado-semana5-estudiantes-v1";
const comparadorTexto = new Intl.Collator("es-PE", { sensitivity: "base" });
export class EstudianteService {
    #estudiantes = [];
    #indicePorCodigo = new Map();
    #almacenamiento;
    constructor(datosIniciales = [], almacenamiento = globalThis.localStorage) {
        this.#almacenamiento = almacenamiento;
        this.reemplazarTodos(datosIniciales, { guardar: false });
    }
    listar() {
        return [...this.#estudiantes];
    }
    obtenerPorCodigo(codigo) {
        return this.#indicePorCodigo.get(codigo);
    }
    obtenerProgramas() {
        return [...new Set(this.#estudiantes.map(estudiante => estudiante.programa))]
            .toSorted(comparadorTexto.compare);
    }
    agregar(datos) {
        const normalizados = normalizarDatos(datos);
        const errores = validarDatosEstudiante(normalizados);
        if (this.#indicePorCodigo.has(normalizados.codigo)) {
            errores.push("El código ya se encuentra registrado.");
        }
        if (errores.length > 0) {
            throw new TypeError(errores.join(" "));
        }
        this.#estudiantes = [...this.#estudiantes, new Estudiante(normalizados)];
        this.#sincronizarIndice();
        this.guardarLocal();
    }
    eliminar(codigo) {
        if (!this.#indicePorCodigo.has(codigo)) return false;
        this.#estudiantes = this.#estudiantes.filter(estudiante => estudiante.codigo !== codigo);
        this.#sincronizarIndice();
        this.guardarLocal();
        return true;
    }
    buscar({ texto = "", programa = "", estado = "", orden = "nombre" } = {}) {
        const termino = String(texto).trim().toLocaleLowerCase("es-PE");
        const filtrados = this.#estudiantes.filter(estudiante => {
            const coincideTexto = termino === "" ||
                estudiante.codigo.toLocaleLowerCase("es-PE").includes(termino) ||
                estudiante.nombre.toLocaleLowerCase("es-PE").includes(termino) ||
                estudiante.correo.toLocaleLowerCase("es-PE").includes(termino);
            const coincidePrograma = programa === "" || estudiante.programa === programa;
            const coincideEstado = estado === "" || estudiante.estado === estado;
            return coincideTexto && coincidePrograma && coincideEstado;
        });
        const comparadores = {
            "promedio-desc": (a, b) => b.promedio - a.promedio,
            "promedio-asc": (a, b) => a.promedio - b.promedio,
            nombre: (a, b) => comparadorTexto.compare(a.nombre, b.nombre)
        };
        return filtrados.toSorted(comparadores[orden] ?? comparadores.nombre);
    }
    obtenerResumen() {
        const base = this.#estudiantes.reduce((resumen, estudiante) => ({
            total: resumen.total + 1,
            aprobados: resumen.aprobados + (estudiante.estado === "Aprobado" ? 1 : 0),
            riesgo: resumen.riesgo + (estudiante.estado === "En riesgo" ? 1 : 0),
            sumaPromedios: resumen.sumaPromedios + estudiante.promedio
        }), { total: 0, aprobados: 0, riesgo: 0, sumaPromedios: 0 });
        return {
            ...base,
            promedioGrupal: base.total === 0 ? 0 : base.sumaPromedios / base.total
        };
    }
    exportarJson() {
        return JSON.stringify(this.#estudiantes, null, 2);
    }
    importarJson(texto) {
        const datos = JSON.parse(texto);
        this.reemplazarTodos(datos, { guardar: true });
    }
    reemplazarTodos(datos, { guardar = true } = {}) {
        if (!Array.isArray(datos)) {
            throw new TypeError("Los datos deben contener un arreglo de estudiantes.");
        }
        const candidatos = datos.map((dato, indice) => {
            const normalizados = normalizarDatos(dato);
            const errores = validarDatosEstudiante(normalizados);
            if (errores.length > 0) {
                throw new TypeError(`Elemento ${indice + 1}: ${errores.join(" ")}`);
            }
            return new Estudiante(normalizados);
        });
        const codigos = candidatos.map(estudiante => estudiante.codigo);
        if (new Set(codigos).size !== codigos.length) {
            throw new TypeError("Los códigos no pueden repetirse.");
        }
        this.#estudiantes = candidatos;
        this.#sincronizarIndice();
        if (guardar) this.guardarLocal();
    }
    guardarLocal() {
        if (!this.#almacenamiento) return;
        this.#almacenamiento.setItem(CLAVE_ALMACENAMIENTO, this.exportarJson());
    }
    cargarLocal() {
        if (!this.#almacenamiento) return false;
        const texto = this.#almacenamiento.getItem(CLAVE_ALMACENAMIENTO);
        if (texto === null) return false;
        this.reemplazarTodos(JSON.parse(texto), { guardar: false });
        return true;
    }
    limpiarLocal() {
        this.#almacenamiento?.removeItem(CLAVE_ALMACENAMIENTO);
    }
    #sincronizarIndice() {
        this.#indicePorCodigo = new Map(
            this.#estudiantes.map(estudiante => [estudiante.codigo, estudiante])
        );
    }
}