import { HttpErrorResponse } from '@angular/common/http';

export function mensajeHttp(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
        if (error.status === 0) return 'No se pudo contactar la API. Verifica que esté encendida.';
        if (error.status === 404) return 'El recurso ya no existe.';
        if (error.status >= 500) return 'El servidor falló. Intenta nuevamente.';
        return `Error ${error.status}: ${error.statusText}`;
    }
    if (error instanceof Error) return error.message;
    return 'Ocurrió un error inesperado.';
}