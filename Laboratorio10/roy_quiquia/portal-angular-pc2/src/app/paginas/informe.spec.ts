import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Estudiante } from '../modelos/estudiante';
import { API_URL } from '../servicios/estudiantes-api';
import { Informe } from './informe';

const datos: Estudiante[] = [
  {
    id: '101',
    nombre: 'Ana Torres',
    programa: 'Software',
    promedio: 18,
    asistencia: 90,
  },
  {
    id: '102',
    nombre: 'Luis Ramos',
    programa: 'Software',
    promedio: 10,
    asistencia: 70,
  },
  {
    id: '103',
    nombre: 'María Vega',
    programa: 'Sistemas',
    promedio: 14,
    asistencia: 80,
  },
];

describe('Informe', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('agrupa la colección y calcula indicadores por programa', () => {
    const fixture = TestBed.createComponent(Informe);
    fixture.detectChanges();
    http.expectOne(API_URL).flush(datos);
    const [software, sistemas] = fixture.componentInstance.filas();
    expect(software).toEqual({
      programa: 'Software',
      total: 2,
      promedio: 14,
      asistencia: 80,
      enRiesgo: 1,
    });
    expect(sistemas.total).toBe(1);
    expect(sistemas.promedio).toBe(14);
  });

  it('representa grupos sin registros con valores cero', () => {
    const fixture = TestBed.createComponent(Informe);
    fixture.detectChanges();
    http.expectOne(API_URL).flush([datos[0]]);
    expect(fixture.componentInstance.filas()[1]).toEqual({
      programa: 'Sistemas',
      total: 0,
      promedio: 0,
      asistencia: 0,
      enRiesgo: 0,
    });
  });

  it('muestra el estado vacío sin fabricar filas de estudiantes', () => {
    const fixture = TestBed.createComponent(Informe);
    fixture.detectChanges();
    http.expectOne(API_URL).flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'No hay estudiantes para elaborar el informe',
    );
  });

  it('permite reintentar después de un fallo de red', () => {
    const fixture = TestBed.createComponent(Informe);
    fixture.detectChanges();
    http.expectOne(API_URL).error(new ProgressEvent('error'));
    expect(fixture.componentInstance.error()).toContain('No se pudo contactar');
    fixture.componentInstance.cargar();
    http.expectOne(API_URL).flush(datos);
    expect(fixture.componentInstance.lista()).toHaveLength(3);
  });
});
