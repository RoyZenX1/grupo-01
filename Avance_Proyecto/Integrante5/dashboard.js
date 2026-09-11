// Evita comportamientos inesperados por usar variables no declaradas.
"use strict";

// Clave usada por el módulo de clientes para guardar sus registros.
const CLAVE_CLIENTES_DASH = "nexocargo_clientes";


// Lee los clientes almacenados para mostrarlos en el dashboard.
function cargarClientesDashboard() {

    try {

        // Obtiene del navegador la lista guardada por el módulo de clientes.
        const datos = localStorage.getItem(CLAVE_CLIENTES_DASH);

        // Convierte el texto JSON en una lista; si no hay datos, devuelve una lista vacía.
        return datos ? JSON.parse(datos) : [];

    } catch (error) {

        // Si los datos están dañados, registra el problema y evita romper el dashboard.
        console.error("Error al leer clientes:", error);

        // El dashboard puede seguir funcionando sin registros de clientes.
        return [];
    }
}


// Calcula los números que se mostrarán en las tarjetas superiores.
function calcularMetricasDashboard(clientes) {

    return {
        // Cantidad total de clientes cargados.
        totalClientes: clientes.length,
        // Cantidad de cuentas disponibles en memoria, actualmente una.
        totalUsuarios: usuarios.length
    };
}


// Devuelve los últimos clientes, colocando el más reciente primero.
function ultimosClientes(clientes, cantidad = 5) {

    // slice limita la cantidad y reverse cambia el orden sin modificar la lista original.
    return clientes.slice(-cantidad).reverse();
}
