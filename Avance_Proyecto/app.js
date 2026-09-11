(() => {
  const layout = document.querySelector(".layout");
  const toggle = document.querySelector(".menu-toggle");
  const mobileToggle = document.querySelector(".mobile-menu-toggle");

  if (!layout || !toggle || !mobileToggle) {
    return;
  }

  const storageKey = "nexocargo-sidebar-collapsed";
  const isMobile = () => window.matchMedia("(max-width: 700px)").matches;

  const setMenuState = (collapsed) => {
    layout.classList.toggle("sidebar-collapsed", collapsed);
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute(
      "aria-label",
      collapsed ? "Expandir menú" : "Contraer menú",
    );
  };

  const savedState = localStorage.getItem(storageKey) === "true";
  setMenuState(!isMobile() && savedState);

  toggle.addEventListener("click", () => {
    const collapsed = !layout.classList.contains("sidebar-collapsed");
    setMenuState(collapsed);

    if (!isMobile()) {
      localStorage.setItem(storageKey, String(collapsed));
    }
  });

  mobileToggle.addEventListener("click", () => {
    setMenuState(false);
  });

  window.addEventListener("resize", () => {
    if (isMobile()) {
      setMenuState(false);
    } else {
      setMenuState(localStorage.getItem(storageKey) === "true");
    }
  });
})();

// Bloque de protección de acceso: valida si la página exige autenticación o permisos de administrador.
// Si el atributo data-proteger está presente, verifica que exista una sesión activa y, en el caso
// de páginas administrativas, que el usuario tenga el rol correspondiente antes de permitir el acceso.
// En caso contrario, redirige al login o a la página de inicio según corresponda.

(() => {
  const modoProteccion = document.body.dataset.proteger;

  if (!modoProteccion) {
    return;
  }

  if (typeof obtenerSesion !== "function") {
    return;
  }

  const enSubcarpeta = /\/integrante/i.test(window.location.pathname);
  const rutaLogin = (enSubcarpeta ? "../" : "") + "login.html";
  const rutaInicio = (enSubcarpeta ? "../" : "") + "index.html";

  const sesion = obtenerSesion();

  if (!sesion) {
    window.location.replace(rutaLogin);
    return;
  }

  if (modoProteccion === "administrador" && !esAdministrador(sesion)) {
    window.location.replace(rutaInicio);
  }
})();
