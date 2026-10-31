
import { useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';

export function Layout() {
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = `Portal de talleres | ${pathname}`;
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      <header className="site-header">
        <div className="container d-flex flex-wrap justify-content-between gap-3">
          <Link className="brand" to="/">
            Talleres UTP
          </Link>
          <nav
            aria-label="Navegación principal"
            className="d-flex gap-4"
          >
            <NavLink to="/" end>
              Catálogo
            </NavLink>
            <NavLink to="/confirmacion">Última confirmación</NavLink>
          </nav>
        </div>
      </header>
      <main
        className="container py-5"
        id="main"
        tabIndex={-1}
        ref={mainRef}
      >
        <Outlet />
      </main>
      <footer className="container pb-4 small text-secondary">
        Semana 12 · Datos ficticios · Sin envío real ni persistencia
      </footer>
    </>
  );
}