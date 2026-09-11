// Activa el modo estricto para detectar errores comunes de JavaScript.
"use strict";

// Espera a que el HTML esté disponible antes de buscar sus elementos.
document.addEventListener("DOMContentLoaded", () => {

    // Obtiene el formulario donde se escriben las credenciales.
    const formulario = document.getElementById("formLogin");
    // Obtiene el párrafo donde se mostrarán los errores de acceso.
    const mensaje = document.getElementById("mensaje");

    // Evita errores si este archivo se carga en una página sin formulario de login.
    if (!formulario || !mensaje) {
        return;
    }

    // Escucha el envío del formulario.
    formulario.addEventListener("submit", (event) => {

        // Evita que el navegador recargue la página automáticamente.
        event.preventDefault();

        // Oculta el error anterior antes de intentar un nuevo acceso.
        mensaje.hidden = true;
        // Quita la clase visual de error anterior.
        mensaje.classList.remove("error");

        // Lee el correo escrito por el usuario.
        const email = document.getElementById("email").value;
        // Lee la clave escrita por el usuario.
        const clave = document.getElementById("clave").value;

        try {

            // auth.js valida las credenciales y guarda la sesión.
            const sesion = iniciarSesion(email, clave);

            // Redirige según el rol recibido en la sesión.
            if (esAdministrador(sesion)) {
                // El administrador entra al panel de control.
                window.location.replace("Integrante5/dashboard.html");
            } else {
                // Otros roles entrarían a la página pública o general.
                window.location.replace("index.html");
            }

        } catch (error) {

            // Muestra al usuario el motivo por el que falló el acceso.
            mensaje.textContent = error.message;
            // Hace visible el mensaje de error.
            mensaje.hidden = false;
            // Aplica el estilo definido para los errores.
            mensaje.classList.add("error");
        }
    });
});
