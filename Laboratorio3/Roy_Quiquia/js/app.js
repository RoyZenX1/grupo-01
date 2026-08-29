"use strict";

/* =========================================================
   1. REFERENCIAS AL DOM
   Se consultan una sola vez y se guardan en constantes.
   ========================================================= */
const formulario          = document.querySelector("#formPerfil");
const campoNombre         = document.querySelector("#nombre");
const campoCorreo         = document.querySelector("#correo");
const campoTelefono       = document.querySelector("#telefono");
const campoBiografia      = document.querySelector("#biografia");
const contadorCaracteres  = document.querySelector("#contadorCaracteres");
const mensajes            = document.querySelector("#mensajes");
const tarjetaPerfil       = document.querySelector("#tarjetaPerfil");

/* =========================================================
   2. PATRONES DE EXPRESIONES REGULARES
   Todas usan la bandera "u" (Unicode) para que \p{L} y \p{N}
   funcionen por punto de código, no por unidad UTF-16.
   ========================================================= */

// Nombre: una o más letras/marcas Unicode, seguidas de cero o más
// segmentos separados por espacio, apóstrofe o guion (para "O'Connor", "María-José")
const PATRON_NOMBRE = /^[\p{L}\p{M}]+(?:[ '\-][\p{L}\p{M}]+)*$/u;

// Correo: estructura práctica (no exhaustiva) -> algo@algo.algo(2+)
// Válido para el formulario; el servidor debe volver a validar.
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

// Teléfono peruano normalizado: empieza en 9 y le siguen 8 dígitos más (9 en total)
const PATRON_TELEFONO = /^9\d{8}$/u;

// Etiquetas tipo #JavaScript, #ux_2026 (letras, números o guion bajo Unicode)
// Bandera "g": necesitamos TODAS las coincidencias, no solo la primera.
const PATRON_ETIQUETA = /#[\p{L}\p{N}_]+/gu;

// Palabras Unicode; admite apóstrofe o guion interno ("O'Connor" cuenta como una palabra)
const PATRON_PALABRA = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

/* =========================================================
   3. FUNCIONES PURAS DE NORMALIZACIÓN
   No tocan el DOM: reciben texto y devuelven texto o números.
   ========================================================= */

// Recorta bordes y colapsa espacios internos múltiples en uno solo
function colapsarEspacios(texto) {
  return texto.trim().replace(/\s+/gu, " ");
}

// "  ana maría pérez " -> "Ana María Pérez"
function capitalizarNombre(texto) {
  return colapsarEspacios(texto)
    .toLocaleLowerCase("es-PE")
    .replace(/(^|[ '\-])\p{L}/gu, coincidencia =>
      coincidencia.toLocaleUpperCase("es-PE")
    );
}

// "987 654-321" -> "987654321"
function limpiarTelefono(texto) {
  return texto.replace(/[\s-]/gu, "");
}

// Cuenta puntos de código reales (no unidades UTF-16) usando el spread operator
function contarPuntosUnicode(texto) {
  return [...texto].length;
}

// match() con "g" y sin coincidencias devuelve null -> ?? 0 evita el error
function contarPalabras(texto) {
  return texto.match(PATRON_PALABRA)?.length ?? 0;
}

// Extrae etiquetas, las pasa a minúscula y elimina duplicados con Set
function extraerEtiquetas(texto) {
  const encontradas = texto.match(PATRON_ETIQUETA) ?? [];
  return [...new Set(encontradas.map(etiqueta =>
    etiqueta.toLocaleLowerCase("es-PE")
  ))];
}

/* =========================================================
   4. VALIDACIÓN
   ========================================================= */

// Recibe el perfil ya normalizado y acumula TODOS los errores
// (así el usuario corrige todo en un solo intento, no uno por uno)
function validarPerfil({ nombre, correo, telefono }) {
  const errores = [];

  if (!PATRON_NOMBRE.test(nombre)) {
    errores.push("El nombre solo puede contener letras, espacios, apóstrofes o guiones.");
  }
  if (!PATRON_CORREO.test(correo)) {
    errores.push("El correo no tiene una estructura válida.");
  }
  if (!PATRON_TELEFONO.test(telefono)) {
    errores.push("El teléfono debe comenzar con 9 y contener exactamente 9 dígitos.");
  }

  return errores;
}

/* =========================================================
   5. RENDERIZADO (DOM)
   Siempre con textContent / createElement, NUNCA innerHTML,
   para no interpretar como HTML lo que escribió el usuario.
   ========================================================= */

function mostrarErrores(errores) {
  mensajes.replaceChildren(); // limpia el contenido anterior

  const titulo = document.createElement("strong");
  titulo.textContent = "Revisa los siguientes datos:";

  const lista = document.createElement("ul");
  errores.forEach(error => {
    const elemento = document.createElement("li");
    elemento.textContent = error;
    lista.append(elemento);
  });

  mensajes.append(titulo, lista);
  mensajes.hidden = false;
  tarjetaPerfil.hidden = true;
}

function mostrarEtiquetas(etiquetas) {
  const lista = document.querySelector("#listaEtiquetas");
  lista.replaceChildren();

  const valores = etiquetas.length > 0 ? etiquetas : ["Sin etiquetas"];
  valores.forEach(etiqueta => {
    const elemento = document.createElement("li");
    elemento.textContent = etiqueta;
    lista.append(elemento);
  });
}

function mostrarPerfil(perfil) {
  document.querySelector("#salidaNombre").textContent = perfil.nombre;
  document.querySelector("#salidaContacto").textContent =
    `${perfil.correo} · ${perfil.telefono}`;
  document.querySelector("#salidaBiografia").textContent =
    perfil.biografia || "Sin biografía registrada.";

  document.querySelector("#totalPalabras").textContent = perfil.palabras;
  document.querySelector("#totalPuntos").textContent = perfil.puntosUnicode;
  document.querySelector("#totalEtiquetas").textContent = perfil.etiquetas.length;

  mostrarEtiquetas(perfil.etiquetas);

  mensajes.hidden = true;
  tarjetaPerfil.hidden = false;
}

/* =========================================================
   6. MANEJADORES DE EVENTOS
   ========================================================= */

function manejarEnvio(evento) {
  evento.preventDefault(); // evita que el formulario recargue la página

  // Paso 1: normalizar primero (siempre antes de validar)
  const perfil = {
    nombre: capitalizarNombre(campoNombre.value),
    correo: campoCorreo.value.trim().toLocaleLowerCase("es-PE"),
    telefono: limpiarTelefono(campoTelefono.value),
    biografia: colapsarEspacios(campoBiografia.value)
  };

  // Paso 2: validar el perfil ya normalizado
  const errores = validarPerfil(perfil);
  if (errores.length > 0) {
    mostrarErrores(errores);
    return;
  }

  // Paso 3: solo si es válido, calcular métricas y mostrar el resultado
  perfil.palabras = contarPalabras(perfil.biografia);
  perfil.puntosUnicode = contarPuntosUnicode(perfil.biografia);
  perfil.etiquetas = extraerEtiquetas(perfil.biografia);

  mostrarPerfil(perfil);
}

function actualizarContador() {
  // .length cuenta unidades UTF-16, igual que el atributo maxlength del textarea
  contadorCaracteres.textContent = campoBiografia.value.length;
}

function reiniciarInterfaz() {
  contadorCaracteres.textContent = "0";
  mensajes.hidden = true;
  mensajes.replaceChildren();
  tarjetaPerfil.hidden = true;
}

/* =========================================================
   7. REGISTRO DE LISTENERS (punto de entrada de la app)
   ========================================================= */

campoBiografia.addEventListener("input", actualizarContador);
formulario.addEventListener("submit", manejarEnvio);

formulario.addEventListener("reset", () => {
  // El evento "reset" se dispara ANTES de que el navegador vacíe los campos,
  // así que esperamos al siguiente microtask para leer el estado ya reiniciado.
  queueMicrotask(reiniciarInterfaz);
});