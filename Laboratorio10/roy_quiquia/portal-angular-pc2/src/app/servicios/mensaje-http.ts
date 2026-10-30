import { HttpErrorResponse } from '@angular/common/http';

export function mensajeHttp(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado. Revisa la consola de desarrollo.';
  }
  if (error.status === 0) {
    return 'No se pudo contactar la API. Comprueba el servidor, la URL y CORS.';
  }
  if (error.status === 404) return 'El registro solicitado ya no existe.';
  if (error.status >= 500) return 'La API falló. Intenta la operación más tarde.';
  return `La API rechazó la solicitud con estado ${error.status}.`;
}
