import { DATOS_INICIALES } from "./datos/datosIniciales.js";
import { EstudianteService } from "./servicios/EstudianteService.js";
const formulario = document.querySelector("#formEstudiante");
const cuerpoEstudiantes = document.querySelector("#cuerpoEstudiantes");
const mensajes = document.querySelector("#mensajes");
const busqueda = document.querySelector("#busqueda");
const filtroPrograma = document.querySelector("#filtroPrograma");
const filtroEstado = document.querySelector("#filtroEstado");
const selectorOrden = document.querySelector("#orden");
const estadoVacio = document.querySelector("#estadoVacio");
const areaJson = document.querySelector("#areaJson");
const servicio = new EstudianteService(DATOS_INICIALES);
const formateadorPromedio = new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});
function mostrarMensaje(texto, tipo = "error") {
    mensajes.textContent = texto;
    mensajes.classList.toggle("exito", tipo === "exito");
    mensajes.hidden = false;
}
function ocultarMensaje() {
    mensajes.hidden = true;
    mensajes.textContent = "";
}
function crearCelda() {
    return document.createElement("td");
}
function crearFila(estudiante) {
    const fila = document.createElement("tr");
    const celdaEstudiante = crearCelda();
    const nombre = document.createElement("strong");
    const datos = document.createElement("div");
    nombre.textContent = `${estudiante.iniciales} · ${estudiante.nombre}`;
    datos.className = "secundario-texto";
    datos.textContent = `${estudiante.codigo} · ${estudiante.correo}`;
    celdaEstudiante.append(nombre, datos);
    const celdaPrograma = crearCelda();
    celdaPrograma.textContent = estudiante.programa;
    const celdaNotas = crearCelda();
    celdaNotas.textContent = estudiante.notas.join(" · ");
    const celdaPromedio = crearCelda();
    celdaPromedio.className = "numero";
    celdaPromedio.textContent = formateadorPromedio.format(estudiante.promedio);
    const celdaEstado = crearCelda();
    const etiquetaEstado = document.createElement("span");
    etiquetaEstado.className = `estado ${estudiante.estado === "Aprobado" ? "aprobado" : "riesgo"}`;
    etiquetaEstado.textContent = estudiante.estado;
    celdaEstado.append(etiquetaEstado);
    const celdaAccion = crearCelda();
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "peligro";
    boton.dataset.codigo = estudiante.codigo;
    boton.textContent = "Eliminar";
    celdaAccion.append(boton);
    fila.append(
        celdaEstudiante,
        celdaPrograma,
        celdaNotas,
        celdaPromedio,
        celdaEstado,
        celdaAccion
    );
    return fila;
}
function actualizarProgramas() {
    const seleccion = filtroPrograma.value;
    filtroPrograma.replaceChildren(new Option("Todos", ""));
    servicio.obtenerProgramas().forEach(programa => {
        filtroPrograma.add(new Option(programa, programa));
    });
    filtroPrograma.value = servicio.obtenerProgramas().includes(seleccion) ? seleccion : "";
}
function actualizarIndicadores() {
    const resumen = servicio.obtenerResumen();
    document.querySelector("#totalEstudiantes").textContent = resumen.total;
    document.querySelector("#totalAprobados").textContent = resumen.aprobados;
    document.querySelector("#totalRiesgo").textContent = resumen.riesgo;
    document.querySelector("#promedioGrupal").textContent =
        formateadorPromedio.format(resumen.promedioGrupal);
    document.querySelector("#mensajeRiesgo").textContent = resumen.riesgo > 0
        ? `${resumen.riesgo} estudiante${resumen.riesgo === 1 ? " requiere" : "s requieren"}
acompañamiento.`
        : "No existen estudiantes en riesgo.";
}
function renderizar() {
    const visibles = servicio.buscar({
        texto: busqueda.value,
        programa: filtroPrograma.value,
        estado: filtroEstado.value,
        orden: selectorOrden.value
    });
    cuerpoEstudiantes.replaceChildren(...visibles.map(crearFila));
    estadoVacio.hidden = visibles.length > 0;
    document.querySelector("#resumenVisible").textContent =
        `${visibles.length} estudiante${visibles.length === 1 ? "" : "s"}`;
    actualizarIndicadores();
}
function sincronizarVista() {
    actualizarProgramas();
    renderizar();
}
function leerFormulario() {
    return {
        codigo: formulario.elements.codigo.value,
        nombre: formulario.elements.nombre.value,
        correo: formulario.elements.correo.value,
        programa: formulario.elements.programa.value,
        notas: [
            formulario.elements.nota1.value,
            formulario.elements.nota2.value,
            formulario.elements.nota3.value
        ]
    };
}
function manejarRegistro(evento) {
    evento.preventDefault();
    ocultarMensaje();
    try {
        servicio.agregar(leerFormulario());
        formulario.reset();
        sincronizarVista();
        mostrarMensaje("Estudiante registrado correctamente.", "exito");
    } catch (error) {
        mostrarMensaje(error.message);
    }
}
function manejarEliminacion(evento) {
    const boton = evento.target.closest("button[data-codigo]");
    if (!boton) return;
    const estudiante = servicio.obtenerPorCodigo(boton.dataset.codigo);
    if (!estudiante) return;
    servicio.eliminar(estudiante.codigo);
    sincronizarVista();
    mostrarMensaje(`${estudiante.nombre} fue eliminado.`, "exito");
}
function exportarJson() {
    areaJson.value = servicio.exportarJson();
    mostrarMensaje("Respaldo JSON generado.", "exito");
}
function importarJson() {
    try {
        servicio.importarJson(areaJson.value);
        sincronizarVista();
        mostrarMensaje("Datos importados correctamente.", "exito");
    } catch (error) {
        mostrarMensaje(`No se pudo importar: ${error.message}`);
    }
}
function restaurarEjemplo() {
    servicio.reemplazarTodos(DATOS_INICIALES);
    areaJson.value = "";
    ocultarMensaje();
    sincronizarVista();
}
formulario.addEventListener("submit", manejarRegistro);
cuerpoEstudiantes.addEventListener("click", manejarEliminacion);
busqueda.addEventListener("input", renderizar);
filtroPrograma.addEventListener("change", renderizar);
filtroEstado.addEventListener("change", renderizar);
selectorOrden.addEventListener("change", renderizar);
document.querySelector("#btnExportar").addEventListener("click", exportarJson);
document.querySelector("#btnImportar").addEventListener("click", importarJson);
document.querySelector("#btnRestaurar").addEventListener("click", restaurarEjemplo);
try {
    servicio.cargarLocal();
} catch (error) {
    servicio.limpiarLocal();
    mostrarMensaje(`El respaldo local estaba dañado y fue descartado: ${error.message}`);
}
sincronizarVista();