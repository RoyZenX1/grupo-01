/**
 * CONTROLADOR Y VISTA (app.js)
 * Conecta los controles del HTML, los eventos y el servicio,
 * y dibuja la interfaz. No duplica reglas de negocio: esas viven en el servicio.
 */
import { DATOS_INICIALES } from "./datos/datosIniciales.js";
import { EstudianteService } from "./servicios/EstudianteService.js";

/* ==========================================================
   REFERENCIAS AL DOM
   Se obtienen una sola vez y se reutilizan.
   ========================================================== */
const formulario = document.querySelector("#formEstudiante");
const cuerpoEstudiantes = document.querySelector("#cuerpoEstudiantes");
const mensajes = document.querySelector("#mensajes");
const busqueda = document.querySelector("#busqueda");
const filtroPrograma = document.querySelector("#filtroPrograma");
const filtroEstado = document.querySelector("#filtroEstado");
const selectorOrden = document.querySelector("#orden");
const estadoVacio = document.querySelector("#estadoVacio");
const areaJson = document.querySelector("#areaJson");

// Instancia única del servicio, con los datos de ejemplo como punto de partida
const servicio = new EstudianteService(DATOS_INICIALES);

// Formatea números con exactamente 2 decimales (solo presentación, no cambia el valor)
const formateadorPromedio = new Intl.NumberFormat("es-PE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

/* ==========================================================
   MENSAJES DE RETROALIMENTACIÓN
   ========================================================== */

// Muestra un mensaje; tipo "exito" lo pinta de verde, cualquier otro de rojo
function mostrarMensaje(texto, tipo = "error") {
  mensajes.textContent = texto; // textContent: no interpreta HTML
  mensajes.classList.toggle("exito", tipo === "exito");
  mensajes.hidden = false;
}

function ocultarMensaje() {
  mensajes.hidden = true;
  mensajes.textContent = "";
}

/* ==========================================================
   CONSTRUCCIÓN DE FILAS (DOM seguro)
   Se crean nodos con createElement y se rellenan con textContent,
   nunca con innerHTML, para que los datos del usuario no se interpreten como HTML.
   ========================================================== */

function crearCelda() {
  return document.createElement("td");
}

// Construye una fila <tr> completa para un estudiante
function crearFila(estudiante) {
  const fila = document.createElement("tr");

  // Celda 1: iniciales + nombre, y debajo código y correo
  const celdaEstudiante = crearCelda();
  const nombre = document.createElement("strong");
  const datos = document.createElement("div");
  nombre.textContent = `${estudiante.iniciales} · ${estudiante.nombre}`;
  datos.className = "secundario-texto";
  datos.textContent = `${estudiante.codigo} · ${estudiante.correo}`;
  celdaEstudiante.append(nombre, datos);

  // Celda 2: programa
  const celdaPrograma = crearCelda();
  celdaPrograma.textContent = estudiante.programa;

  // Celda 3: notas separadas por puntos medios
  const celdaNotas = crearCelda();
  celdaNotas.textContent = estudiante.notas.join(" · ");

  // Celda 4: promedio formateado y alineado a la derecha
  const celdaPromedio = crearCelda();
  celdaPromedio.className = "numero";
  celdaPromedio.textContent = formateadorPromedio.format(estudiante.promedio);

  // Celda 5: etiqueta de estado (la clase CSS depende del estado)
  const celdaEstado = crearCelda();
  const etiquetaEstado = document.createElement("span");
  etiquetaEstado.className = `estado ${estudiante.estado === "Aprobado" ? "aprobado" : "riesgo"}`;
  etiquetaEstado.textContent = estudiante.estado;
  celdaEstado.append(etiquetaEstado);

  // Celda 6: botón Eliminar. dataset.codigo guarda el código en data-codigo,
  // que luego usa la delegación de eventos para saber qué eliminar.
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

/* ==========================================================
   ACTUALIZACIÓN DE LA VISTA
   ========================================================== */

// Reconstruye las opciones del filtro de programas desde el servicio
function actualizarProgramas() {
  const seleccion = filtroPrograma.value; // recuerda la selección actual
  filtroPrograma.replaceChildren(new Option("Todos", ""));
  servicio.obtenerProgramas().forEach(programa => {
    filtroPrograma.add(new Option(programa, programa));
  });
  // Restaura la selección solo si esa opción todavía existe
  filtroPrograma.value = servicio.obtenerProgramas().includes(seleccion) ? seleccion : "";
}

// Muestra las métricas usando el resumen del servicio (sin repetir cálculos aquí)
function actualizarIndicadores() {
  const resumen = servicio.obtenerResumen();
  document.querySelector("#totalEstudiantes").textContent = resumen.total;
  document.querySelector("#totalAprobados").textContent = resumen.aprobados;
  document.querySelector("#totalRiesgo").textContent = resumen.riesgo;
  document.querySelector("#promedioGrupal").textContent =
    formateadorPromedio.format(resumen.promedioGrupal);
  // Singular o plural según la cantidad de estudiantes en riesgo
  document.querySelector("#mensajeRiesgo").textContent = resumen.riesgo > 0
    ? `${resumen.riesgo} estudiante${resumen.riesgo === 1 ? " requiere" : "s requieren"} acompañamiento.`
    : "No existen estudiantes en riesgo.";
}

// Dibuja la tabla: consulta al servicio con los 4 controles y reemplaza todas las filas de una vez
function renderizar() {
  const visibles = servicio.buscar({
    texto: busqueda.value,
    programa: filtroPrograma.value,
    estado: filtroEstado.value,
    orden: selectorOrden.value
  });

  // replaceChildren(...) sustituye el contenido; visibles.map(crearFila) genera las filas
  cuerpoEstudiantes.replaceChildren(...visibles.map(crearFila));
  // Muestra "No se encontraron estudiantes" solo si no hay filas
  estadoVacio.hidden = visibles.length > 0;
  document.querySelector("#resumenVisible").textContent =
    `${visibles.length} estudiante${visibles.length === 1 ? "" : "s"}`;
  actualizarIndicadores();
}

// Se llama después de cambiar los datos: primero programas, luego la tabla
function sincronizarVista() {
  actualizarProgramas();
  renderizar();
}

/* ==========================================================
   MANEJADORES DE EVENTOS
   ========================================================== */

// Lee los controles como TEXTO; la conversión y validación las hace el servicio
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

// Envío del formulario
function manejarRegistro(evento) {
  evento.preventDefault(); // evita que la página se recargue
  ocultarMensaje();

  // try...catch porque agregar() lanza TypeError si los datos son inválidos
  try {
    servicio.agregar(leerFormulario());
    formulario.reset();      // limpia el formulario solo si tuvo éxito
    sincronizarVista();
    mostrarMensaje("Estudiante registrado correctamente.", "exito");
  } catch (error) {
    mostrarMensaje(error.message); // el estado anterior queda intacto
  }
}

// DELEGACIÓN DE EVENTOS: un solo listener en el <tbody> atiende los botones
// "Eliminar", incluso los creados dinámicamente después.
function manejarEliminacion(evento) {
  // closest() sube desde el elemento clicado hasta encontrar el botón con data-codigo
  const boton = evento.target.closest("button[data-codigo]");
  if (!boton) return; // el clic no fue en un botón Eliminar

  const estudiante = servicio.obtenerPorCodigo(boton.dataset.codigo);
  if (!estudiante) return;

  servicio.eliminar(estudiante.codigo);
  sincronizarVista();
  mostrarMensaje(`${estudiante.nombre} fue eliminado.`, "exito");
}

// Vuelca el JSON actual en el textarea
function exportarJson() {
  areaJson.value = servicio.exportarJson();
  mostrarMensaje("Respaldo JSON generado.", "exito");
}

// Importación atómica: si el JSON está roto o es inválido, no cambia nada
function importarJson() {
  try {
    servicio.importarJson(areaJson.value);
    sincronizarVista();
    mostrarMensaje("Datos importados correctamente.", "exito");
  } catch (error) {
    mostrarMensaje(`No se pudo importar: ${error.message}`);
  }
}

// Vuelve a los cuatro estudiantes de ejemplo
function restaurarEjemplo() {
  servicio.reemplazarTodos(DATOS_INICIALES);
  areaJson.value = "";
  ocultarMensaje();
  sincronizarVista();
}

/* ==========================================================
   REGISTRO DE EVENTOS
   addEventListener separa el comportamiento del HTML.
   ========================================================== */
formulario.addEventListener("submit", manejarRegistro);
cuerpoEstudiantes.addEventListener("click", manejarEliminacion);
busqueda.addEventListener("input", renderizar);          // en cada tecla
filtroPrograma.addEventListener("change", renderizar);   // al elegir una opción
filtroEstado.addEventListener("change", renderizar);
selectorOrden.addEventListener("change", renderizar);
document.querySelector("#btnExportar").addEventListener("click", exportarJson);
document.querySelector("#btnImportar").addEventListener("click", importarJson);
document.querySelector("#btnRestaurar").addEventListener("click", restaurarEjemplo);

/* ==========================================================
   ARRANQUE
   ========================================================== */

// Intenta recuperar el respaldo de localStorage. Si está dañado, se descarta
// y se informa, en lugar de dejar la aplicación rota.
try {
  servicio.cargarLocal();
} catch (error) {
  servicio.limpiarLocal();
  mostrarMensaje(`El respaldo local estaba dañado y fue descartado: ${error.message}`);
}

// Primer dibujo de la interfaz
sincronizarVista();