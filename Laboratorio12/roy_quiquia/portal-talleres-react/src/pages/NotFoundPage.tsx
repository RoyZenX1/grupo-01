import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <>
      <h1>Recurso no encontrado</h1>
      <p>La ruta o el taller no existe en este laboratorio.</p>
      <Link to="/">Volver al catálogo</Link>
    </>
  );
}