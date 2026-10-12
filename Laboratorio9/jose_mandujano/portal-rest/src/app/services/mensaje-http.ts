import { HttpErrorResponse } from '@angular/common/http';

export function mensajeHttp(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se pudo contactar la API. Revisa que el servidor esté en ejecución.';
    }
    if (error.status === 404) {
      return 'El recurso solicitado ya no existe.';
    }
    if (error.status >= 500) {
      return 'El servidor reportó un error. Intenta nuevamente.';
    }
    return `Error HTTP ${error.status}: ${error.statusText}`;
  }
  return 'Ocurrió un error inesperado.';
}
