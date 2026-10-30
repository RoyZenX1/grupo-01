import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import type { Estudiante } from '../models/estudiante';
import { API_URL } from '../services/estudiantes-api';
import { Estudiantes } from './estudiantes';
import { Registro } from './registro';

const ana: Estudiante = {
  id: '101',
  nombre: 'Ana Torres',
  programa: 'Software',
  promedio: 17.2,
  asistencia: 94,
};

const luis: Estudiante = {
  id: '102',
  nombre: 'Luis Ramírez',
  programa: 'Sistemas',
  promedio: 10.4,
  asistencia: 72,
};

const maria: Estudiante = {
  id: '103',
  nombre: 'María Paredes',
  programa: 'Software',
  promedio: 13.5,
  asistencia: 88,
};

function configurar(conId: string | null = null) {
  const params = new BehaviorSubject(convertToParamMap(conId ? { id: conId } : {}));

  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: ActivatedRoute,
        useValue: { paramMap: params.asObservable() },
      },
    ],
  });

  return { params };
}

describe('Estudiantes (página)', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    configurar();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carga la lista con un GET al iniciar', () => {
    const f = TestBed.createComponent(Estudiantes);
    f.detectChanges();
    http.expectOne(API_URL).flush([ana]);
    expect(f.componentInstance.lista()).toEqual([ana]);
  });

  it('muestra error de red y permite reintentar', () => {
    const f = TestBed.createComponent(Estudiantes);
    f.detectChanges();
    http.expectOne(API_URL).error(new ProgressEvent('error'));
    expect(f.componentInstance.errorCarga()).toContain('No se pudo contactar');

    f.componentInstance.cargar();
    http.expectOne(API_URL).flush([ana]);
    expect(f.componentInstance.lista()).toHaveLength(1);
  });

  it('retira un registro solo después de confirmar el DELETE', () => {
    const f = TestBed.createComponent(Estudiantes);
    f.detectChanges();
    http.expectOne(API_URL).flush([ana]);

    f.componentInstance.pendiente.set(ana);
    f.componentInstance.confirmarEliminacion();
    expect(f.componentInstance.lista()).toHaveLength(1);

    http.expectOne(`${API_URL}/101`).flush(null);
    expect(f.componentInstance.lista()).toHaveLength(0);
    expect(f.componentInstance.eliminando()).toBe(false);
  });

  it('conserva la tarjeta cuando falla DELETE', () => {
    const f = TestBed.createComponent(Estudiantes);
    f.detectChanges();
    http.expectOne(API_URL).flush([ana]);

    f.componentInstance.pendiente.set(ana);
    f.componentInstance.confirmarEliminacion();
    http
      .expectOne(`${API_URL}/101`)
      .flush(null, { status: 500, statusText: 'Error' });

    expect(f.componentInstance.lista()).toHaveLength(1);
    expect(f.componentInstance.errorAccion()).toContain('La API falló');
  });

  it('filtra localmente sin emitir un segundo GET', () => {
    const f = TestBed.createComponent(Estudiantes);
    f.detectChanges();
    http.expectOne(API_URL).flush([ana, luis, maria]);

    f.componentInstance.filtros.patchValue({
      termino: 'maría',
      programa: 'Software',
    });
    expect(f.componentInstance.visibles().map((e) => e.id)).toEqual(['103']);
    http.expectNone(API_URL);
  });

  it('combina estado y orden descendente', () => {
    const f = TestBed.createComponent(Estudiantes);
    f.detectChanges();
    http.expectOne(API_URL).flush([ana, luis, maria]);

    f.componentInstance.filtros.patchValue({
      estado: 'Destacado',
      orden: 'promedio-desc',
    });
    expect(f.componentInstance.visibles().map((e) => e.id)).toEqual(['101']);
  });

  it('restaura todos los registros al limpiar los filtros', () => {
    const f = TestBed.createComponent(Estudiantes);
    f.detectChanges();
    http.expectOne(API_URL).flush([ana, luis, maria]);

    f.componentInstance.filtros.patchValue({ programa: 'Sistemas' });
    expect(f.componentInstance.visibles()).toHaveLength(1);

    f.componentInstance.limpiarFiltros();
    expect(f.componentInstance.visibles()).toHaveLength(3);
    expect(f.componentInstance.hayFiltros()).toBe(false);
  });
});

describe('Registro (página)', () => {
  let http: HttpTestingController;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(() => {
    const cfg = configurar();
    params = cfg.params;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('rechaza un formulario vacío sin emitir POST', () => {
    const f = TestBed.createComponent(Registro);
    f.detectChanges();
    f.componentInstance.guardar();
    expect(f.componentInstance.form.invalid).toBe(true);
    http.expectNone(API_URL);
  });

  it('acepta cero y bloquea envíos duplicados durante POST', () => {
    const f = TestBed.createComponent(Registro);
    f.detectChanges();
    f.componentInstance.form.setValue({
      nombre: 'Elena Ruiz',
      programa: 'Software',
      promedio: 0,
      asistencia: 0,
    });

    f.componentInstance.guardar();
    f.componentInstance.guardar();

    const req = http.expectOne(API_URL);
    expect(req.request.body.nombre).toBe('Elena Ruiz');
    expect(req.request.body.promedio).toBe(0);
    expect(f.componentInstance.guardando()).toBe(true);

    req.flush({ ...req.request.body, id: 'nuevo-id' });
    expect(f.componentInstance.mensaje()).toContain('nuevo-id');
    expect(f.componentInstance.form.controls.promedio.value).toBeNull();
    expect(f.componentInstance.guardando()).toBe(false);
  });

  it('conserva los valores y habilita el formulario si falla POST', () => {
    const f = TestBed.createComponent(Registro);
    f.detectChanges();
    f.componentInstance.form.setValue({
      nombre: 'Elena Ruiz',
      programa: 'Software',
      promedio: 16,
      asistencia: 90,
    });

    f.componentInstance.guardar();
    http
      .expectOne(API_URL)
      .flush(null, { status: 500, statusText: 'Error' });

    expect(f.componentInstance.form.controls.nombre.value).toBe('Elena Ruiz');
    expect(f.componentInstance.form.enabled).toBe(true);
    expect(f.componentInstance.errorGuardado()).toContain('La API falló');
  });

  it('carga para editar y envía PATCH sin cambiar el id', () => {
    params.next(convertToParamMap({ id: '101' }));

    const f = TestBed.createComponent(Registro);
    f.detectChanges();
    http.expectOne(`${API_URL}/101`).flush(ana);

    f.componentInstance.form.controls.promedio.setValue(18);
    f.componentInstance.guardar();

    const req = http.expectOne(`${API_URL}/101`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.id).toBeUndefined();
    expect(req.request.body.promedio).toBe(18);
    req.flush({ ...ana, promedio: 18 });
  });

  it('impide guardar un id inexistente', () => {
    params.next(convertToParamMap({ id: 'inexistente' }));

    const f = TestBed.createComponent(Registro);
    f.detectChanges();
    http.expectOne(`${API_URL}/inexistente`).flush(null, {
      status: 404,
      statusText: 'Not Found',
    });

    f.componentInstance.guardar();
    expect(f.componentInstance.form.disabled).toBe(true);
    http.expectNone(
      (req) => req.method === 'POST' || req.method === 'PATCH',
    );
  });
});