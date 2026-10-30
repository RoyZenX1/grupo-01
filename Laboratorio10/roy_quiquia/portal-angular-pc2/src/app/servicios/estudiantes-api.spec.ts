import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL, EstudiantesApi } from './estudiantes-api';
import { mensajeHttp } from './mensaje-http';
import type { BorradorEstudiante, Estudiante } from '../modelos/estudiante';

const datos: BorradorEstudiante = {
  nombre: 'Elena Ruiz',
  programa: 'Software',
  promedio: 16,
  asistencia: 90,
};
const estudiante: Estudiante = { ...datos, id: 'nuevo-id' };

describe('EstudiantesApi', () => {
  let api: EstudiantesApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(EstudiantesApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envía GET solo al suscribirse', () => {
    const solicitud = api.listar();
    http.expectNone(API_URL);
    solicitud.subscribe((lista) => expect(lista).toEqual([estudiante]));
    const req = http.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush([estudiante]);
  });

  it('consulta un identificador y codifica su segmento', () => {
    api.obtener('a b').subscribe();
    const req = http.expectOne(`${API_URL}/a%20b`);
    expect(req.request.method).toBe('GET');
    req.flush(estudiante);
  });

  it('crea con POST sin fabricar el id', () => {
    api.crear(datos).subscribe((e) => expect(e.id).toBe('nuevo-id'));
    const req = http.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    expect(req.request.body.id).toBeUndefined();
    req.flush(estudiante, { status: 201, statusText: 'Created' });
  });

  it('envía un cambio parcial con PATCH', () => {
    api.actualizar('101', { asistencia: 95 }).subscribe();
    const req = http.expectOne(`${API_URL}/101`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ asistencia: 95 });
    req.flush({ ...estudiante, asistencia: 95 });
  });

  it('envía la representación completa con PUT', () => {
    api.reemplazar('101', datos).subscribe();
    const req = http.expectOne(`${API_URL}/101`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(datos);
    req.flush({ ...datos, id: '101' });
  });

  it('elimina sin depender del cuerpo de respuesta', () => {
    api.eliminar('101').subscribe();
    const req = http.expectOne(`${API_URL}/101`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('comunica un error 404 por el canal de error', () => {
    api.obtener('inexistente').subscribe({
      next: () => {
        throw new Error('No debe emitir éxito');
      },
      error: (error) => expect(mensajeHttp(error)).toContain('ya no existe'),
    });
    http.expectOne(`${API_URL}/inexistente`).flush(
      {},
      {
        status: 404,
        statusText: 'Not Found',
      },
    );
  });

  it('cancela la solicitud al cerrar la suscripción', () => {
    const sub = api.listar().subscribe();
    const req = http.expectOne(API_URL);
    sub.unsubscribe();
    expect(req.cancelled).toBe(true);
  });
});
