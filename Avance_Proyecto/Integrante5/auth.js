// Evita comportamientos inesperados por usar variables no declaradas.
"use strict";

// Nombre con el que la sesión se guarda dentro de localStorage.
const CLAVE_SESION = "nexocargo_sesion";

// Única cuenta permitida actualmente en la aplicación.
const USUARIOS_INICIALES = [
    {
        // Identificador interno de la cuenta.
        id: "U001",
        // Nombre que se mostrará en el dashboard.
        nombre: "Roy",
        // Correo que el usuario debe escribir en el login.
        email: "admin@nexocargo.pe",
        // Clave que se compara al iniciar sesión.
        clave: "admin123",
        // Rol utilizado para proteger las páginas administrativas.
        rol: "administrador"
    }
];

// Copia en memoria de los usuarios disponibles para iniciar sesión.
let usuarios = [];


// Convierte el rol a un formato único para las comparaciones.
function normalizarRol(rol) {
    // Convierte cualquier valor a texto, elimina espacios y pasa a minúsculas.
    const rolNormalizado = String(rol)
        .trim()
        .toLocaleLowerCase("es-PE");

    // Permite usar "admin" como alias, pero internamente conserva "administrador".
    return rolNormalizado === "admin"
        ? "administrador"
        : rolNormalizado;
}


// Limpia los datos de un usuario antes de usarlo en el sistema.
function normalizarUsuario(usuario) {
    return {
        ...usuario,

        // El correo se compara sin distinguir mayúsculas ni espacios exteriores.
        email: String(usuario.email)
            .trim()
            .toLocaleLowerCase("es-PE"),

        // La clave se conserva para validar el login con el valor original.
        clave: String(usuario.clave).trim(),

        // El rol queda preparado para las validaciones de acceso.
        rol: normalizarRol(usuario.rol)
    };
}


// Indica si una sesión pertenece a un administrador.
function esAdministrador(usuario) {
    // El operador ?. evita un error si el usuario no existe.
    return normalizarRol(usuario?.rol) === "administrador";
}


// Carga la única cuenta definida en la configuración.
function cargarUsuarios() {
    // map aplica la normalización a cada usuario inicial.
    usuarios = USUARIOS_INICIALES.map(normalizarUsuario);
    // Devuelve la lista para que otros módulos puedan consultar su cantidad.
    return usuarios;
}


// Comprueba el correo y la clave enviados desde el formulario de login.
function iniciarSesion(email, clave) {

    // Limpia el correo para que " ADMIN@... " también sea válido.
    const emailLimpio = String(email)
        .trim()
        .toLocaleLowerCase("es-PE");

    // La clave se convierte a texto, pero no se modifica.
    const claveLimpia = String(clave);

    // Impide continuar si falta alguno de los dos datos obligatorios.
    if (emailLimpio === "" || claveLimpia === "") {
        throw new Error(
            "Ingresa el correo y la clave."
        );
    }

    // Busca una cuenta cuyo correo y clave coincidan exactamente.
    const usuario = usuarios.find(
        usuario =>
            usuario.email === emailLimpio &&
            usuario.clave === claveLimpia
    );

    // Si no hay coincidencia, el acceso se rechaza.
    if (!usuario) {
        throw new Error(
            "Credenciales incorrectas. Verifica tu correo y clave."
        );
    }

    // Crea una sesión sin exponer la clave dentro de localStorage.
    const sesion = {
        nombre: usuario.nombre,
        email: usuario.email,
        rol: normalizarRol(usuario.rol)
    };

    // JSON.stringify convierte el objeto en texto para poder guardarlo.
    localStorage.setItem(
        CLAVE_SESION,
        JSON.stringify(sesion)
    );

    // Devuelve la sesión para que login.js decida a qué página redirigir.
    return sesion;
}


// Recupera y valida la sesión existente en el navegador.
function obtenerSesion() {

    try {

        // Lee el texto guardado con la clave de sesión.
        const datos =
            localStorage.getItem(CLAVE_SESION);

        // Si no existe una sesión, el usuario debe iniciar sesión.
        if (!datos) {
            return null;
        }

        // JSON.parse convierte el texto almacenado nuevamente en objeto.
        const sesion = JSON.parse(datos);

        // Comprueba que el correo de la sesión pertenezca a una cuenta válida.
        const usuario = usuarios.find(
            usuario => usuario.email === sesion?.email
        );

        // Una sesión incompleta o desconocida se elimina inmediatamente.
        if (!sesion || !sesion.email || !sesion.rol || !usuario) {
            cerrarSesion();
            return null;
        }

        // Reconstruye la sesión con los datos actuales del usuario configurado.
        const sesionActualizada = {
            nombre: usuario.nombre,
            email: usuario.email,
            rol: normalizarRol(usuario.rol)
        };

        // Actualiza sesiones antiguas para que reflejen el nombre actual.
        localStorage.setItem(
            CLAVE_SESION,
            JSON.stringify(sesionActualizada)
        );

        // Entrega la sesión validada al módulo que la necesite.
        return sesionActualizada;

    } catch (error) {

        // JSON inválido o localStorage inaccesible se trata como sesión corrupta.
        console.error(
            "Sesión corrupta:",
            error
        );

        // Elimina la sesión dañada para obligar a iniciar sesión nuevamente.
        cerrarSesion();

        return null;
    }
}


// Elimina la sesión actual del navegador.
function cerrarSesion() {

    localStorage.removeItem(CLAVE_SESION);
}


// Calcula la ruta hacia la raíz según la carpeta desde la que se llama.
function rutaRaiz() {

    // Las páginas dentro de una carpeta necesitan subir un nivel con "../".
    return /\/integrante/i.test(
        window.location.pathname
    )
        ? "../"
        : "";
}


// Conecta el botón de cierre de sesión cuando el HTML ya está cargado.
document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Busca el botón; en login.html no existe y por eso se hace esta comprobación.
        const btnCerrarSesion =
            document.getElementById(
                "btnCerrarSesion"
            );

        // Si la página no tiene botón, auth.js termina esta parte sin error.
        if (!btnCerrarSesion) {
            return;
        }

        // Ejecuta el cierre de sesión cuando el administrador hace clic.
        btnCerrarSesion.addEventListener(
            "click",
            () => {

                // Borra la sesión guardada.
                cerrarSesion();

                // Devuelve al usuario al formulario de login.
                window.location.replace(
                    rutaRaiz() + "login.html"
                );
            }
        );
    }
);


// Inicializa la lista de usuarios antes de cualquier intento de login.
cargarUsuarios();
