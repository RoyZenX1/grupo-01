"use strict"; 
 
const formulario = document.querySelector("#formPerfil"); 
const campoNombre = document.querySelector("#nombre"); 
const campoCorreo = document.querySelector("#correo"); 
const campoTelefono = document.querySelector("#telefono"); 
const campoBiografia = document.querySelector("#biografia"); 
const contadorCaracteres = document.querySelector("#contadorCaracteres"); 
const mensajes = document.querySelector("#mensajes"); 
const tarjetaPerfil = document.querySelector("#tarjetaPerfil"); 
 
// \\p{L} representa cualquier letra Unicode. La bandera u activa Unicode. 
const PATRON_NOMBRE = /^[\p{L}\p{M}]+(?:[ '\-][\p{L}\p{M}]+)*$/u; 
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u; 
const PATRON_TELEFONO = /^9\d{8}$/u; 
const PATRON_ETIQUETA = /#[\p{L}\p{N}_]+/gu; 
const PATRON_PALABRA = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu; 
 
function colapsarEspacios(texto) { 
  return texto.trim().replace(/\s+/gu, " "); 
}

function capitalizarNombre(texto) { 
  return colapsarEspacios(texto) 
    .toLocaleLowerCase("es-PE") 
    .replace(/(^|[ '\-])\p{L}/gu, coincidencia => 
      coincidencia.toLocaleUpperCase("es-PE") 
    ); 
} 
 
function limpiarTelefono(texto) { 
  return texto.replace(/[\s-]/gu, ""); 
} 
 
function contarPuntosUnicode(texto) { 
  return [...texto].length; 
} 
 
function contarPalabras(texto) { 
  return texto.match(PATRON_PALABRA)?.length ?? 0; 
} 
 
function extraerEtiquetas(texto) { 
  const encontradas = texto.match(PATRON_ETIQUETA) ?? []; 
  return [...new Set(encontradas.map(etiqueta => 
    etiqueta.toLocaleLowerCase("es-PE") 
  ))]; 
} 
 
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
 
function mostrarErrores(errores) { 
  mensajes.replaceChildren(); 
  
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
 
function manejarEnvio(evento) { 
  evento.preventDefault(); 
   const perfil = { 
    nombre: capitalizarNombre(campoNombre.value), 
    correo: campoCorreo.value.trim().toLocaleLowerCase("es-PE"), 
    telefono: limpiarTelefono(campoTelefono.value), 
    biografia: colapsarEspacios(campoBiografia.value) 
  }; 
 
  const errores = validarPerfil(perfil); 
  if (errores.length > 0) { 
    mostrarErrores(errores); 
    return; 
  } 
 
  perfil.palabras = contarPalabras(perfil.biografia); 
  perfil.puntosUnicode = contarPuntosUnicode(perfil.biografia); 
  perfil.etiquetas = extraerEtiquetas(perfil.biografia); 
  mostrarPerfil(perfil); 
} 
 
function actualizarContador() { 
  contadorCaracteres.textContent = campoBiografia.value.length; 
}

function reiniciarInterfaz() { 
  contadorCaracteres.textContent = "0"; 
  mensajes.hidden = true; 
  mensajes.replaceChildren(); 
  tarjetaPerfil.hidden = true; 
} 
 
campoBiografia.addEventListener("input", actualizarContador); 
formulario.addEventListener("submit", manejarEnvio); 
formulario.addEventListener("reset", () => { 
  // reset modifica los controles después de disparar el evento. 
  queueMicrotask(reiniciarInterfaz); 
}); 
