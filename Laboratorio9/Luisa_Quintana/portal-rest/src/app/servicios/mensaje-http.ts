import { HttpErrorResponse } from '@angular/common/http';

export function mensajeHttp(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que la API esté iniciada.';
    }

    if (error.status === 404) {
      return 'No se encontró el estudiante solicitado.';
    }

    if (error.status >= 500) {
      return 'El servidor presentó un problema. Inténtalo nuevamente.';
    }

    return `Ocurrió un error en la solicitud (código ${error.status}).`;
  }

  return 'Ocurrió un error inesperado. Inténtalo nuevamente.';
}