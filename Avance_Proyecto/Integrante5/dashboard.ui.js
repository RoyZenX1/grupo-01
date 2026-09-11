// Evita comportamientos inesperados por usar variables no declaradas.
"use strict";

// Elemento donde se mostrará "Hola, Roy".
const salidaBienvenida = document.getElementById("bienvenida");
// Elemento donde se mostrará el rol de la sesión.
const salidaRol = document.getElementById("rolUsuario");

// Elemento que muestra la cantidad total de clientes.
const totalClientesDash = document.getElementById("totalClientesDash");
// Elemento que muestra la cantidad total de usuarios.
const totalUsuariosDash = document.getElementById("totalUsuariosDash");

// Cuerpo de la tabla donde se insertarán los clientes.
const tablaClientesDash = document.getElementById("tablaClientesDash");
// Mensaje que se mostrará cuando no existan clientes.
const mensajeVacioDash = document.getElementById("mensajeVacioDash");

// ENCABEZADO DE SESIÓN

// Coloca en el encabezado los datos de la sesión activa.
function mostrarSesionActual() {

    // auth.js recupera y valida la sesión guardada.
    const sesion = obtenerSesion();

    // Sin sesión no se deben mostrar datos privados.
    if (!sesion) {
        return;
    }

    // Inserta el nombre de la sesión dentro del span con id="bienvenida".
    salidaBienvenida.textContent = `Hola, ${sesion.nombre}`;
    // Muestra un texto según el rol validado.
    salidaRol.textContent = esAdministrador(sesion) ? "Administrador" : "Cliente";
}


// TARJETAS

// Actualiza las tarjetas con las métricas calculadas.
function renderizarTarjetas(metricas) {
    // Escribe la cantidad de clientes en su tarjeta.
    totalClientesDash.textContent = metricas.totalClientes;
    // Escribe la cantidad de usuarios en su tarjeta.
    totalUsuariosDash.textContent = metricas.totalUsuarios;
}


// TABLA DE CLIENTES

// Construye una fila HTML para un cliente.
function crearFilaClienteDash(cliente) {

    // Crea la fila principal de la tabla.
    const fila = document.createElement("tr");

    // Crea y completa la celda del nombre.
    const celdaNombre = document.createElement("td");
    celdaNombre.textContent = cliente.nombre;

    // Crea y completa la celda del documento.
    const celdaIdentificacion = document.createElement("td");
    celdaIdentificacion.textContent = cliente.identificacion;

    // Crea y completa la celda del correo.
    const celdaEmail = document.createElement("td");
    celdaEmail.textContent = cliente.email;

    // Agrega las tres celdas dentro de la fila.
    fila.append(celdaNombre, celdaIdentificacion, celdaEmail);

    // Devuelve la fila lista para insertarse en la tabla.
    return fila;
}


// Dibuja en pantalla la lista de los últimos clientes.
function renderizarTablaClientesDash(clientes) {

    // Elimina filas anteriores para evitar duplicados al volver a renderizar.
    tablaClientesDash.replaceChildren();

    // Obtiene como máximo los cinco clientes más recientes.
    const ultimos = ultimosClientes(clientes);

    // Crea una fila HTML por cada cliente.
    ultimos.forEach(cliente => {
        tablaClientesDash.appendChild(crearFilaClienteDash(cliente));
    });

    // El mensaje solo se muestra cuando no hay clientes para listar.
    mensajeVacioDash.hidden = ultimos.length > 0;
}


// INICIO

// Carga los clientes antes de calcular y mostrar las métricas.
const clientes = cargarClientesDashboard();

// Muestra el nombre y rol de la sesión activa.
mostrarSesionActual();
// Actualiza las tarjetas del dashboard.
renderizarTarjetas(calcularMetricasDashboard(clientes));
// Actualiza la tabla de últimos clientes.
renderizarTablaClientesDash(clientes);
