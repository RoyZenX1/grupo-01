import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { appConfig } from './app.config';
import { EstudiantesStore } from './estado/estudiantes-store';
import { EstadoAcademicoPipe } from './pipes/estado-academico.pipe';
import { Estudiantes } from './paginas/estudiantes';
import { Registro } from './paginas/registro';
import { Resumen } from './paginas/resumen';
describe('Pipe académico', () => {
    it.each([
        [10.99, 'En riesgo'],
        [11, 'Aprobado'],
        [13.99, 'Aprobado'],
        [14, 'Destacado'],
    ])('clasifica el promedio %s', (promedio, esperado) => {
        expect(new EstadoAcademicoPipe().transform(Number(promedio))).toBe(
            esperado,
        );
    });
});
describe('Estado compartido', () => {
    it('agrega sin mutar la lista anterior', () => {
        const store = new EstudiantesStore();
        const anterior = store.estudiantes();
        const nuevo = store.agregar({
            nombre: ' Elena Ruiz ',
            programa: 'Software',
            promedio: 16,
            asistencia: 90,
        });
        expect(anterior).toHaveLength(6);
        expect(store.total()).toBe(7);
        expect(nuevo.nombre).toBe('Elena Ruiz');
        expect(nuevo.id).toBe(107);
    });
    it('rechaza un promedio fuera de rango', () => {
        const store = new EstudiantesStore();
        expect(() =>
            store.agregar({
                nombre: 'Elena Ruiz',
                programa: 'Software',
                promedio: 21,
                asistencia: 90,
            }),
        ).toThrow();
        expect(store.total()).toBe(6);
    });
});
describe('Formulario y rutas', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            providers: [...appConfig.providers],
        }),
    );
    it('no guarda un formulario vacío y muestra errores al enviarlo', async () => {
        const harness = await RouterTestingHarness.create();
        const pagina = await harness.navigateByUrl('/registro', Registro);
        const vista = harness.routeNativeElement!;
        vista.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
        await harness.fixture.whenStable();
        expect(pagina.form.invalid).toBe(true);
        expect(vista.textContent).toContain('Revisa los campos');
        expect(TestBed.inject(EstudiantesStore).total()).toBe(6);
    });
    it('acepta cero y conserva el registro al cambiar de ruta', async () => {
        const harness = await RouterTestingHarness.create();
        const pagina = await harness.navigateByUrl('/registro', Registro);
        pagina.form.setValue({
            nombre: 'Elena Ruiz',
            programa: 'Software',
            promedio: 0,
            asistencia: 0,
        });
        pagina.guardar();
        await harness.fixture.whenStable();
        expect(pagina.mensaje()).toContain('107');
        const resumen = await harness.navigateByUrl('/resumen', Resumen);
        expect(resumen.store.total()).toBe(7);
    });
    it('rechaza espacios y promedios mayores que veinte', async () => {
        const harness = await RouterTestingHarness.create();
        const pagina = await harness.navigateByUrl('/registro', Registro);
        pagina.form.setValue({
            nombre: ' ',
            programa: 'Sistemas',
            promedio: 21,
            asistencia: 90,
        });
        pagina.guardar();
        expect(pagina.form.controls.nombre.invalid).toBe(true);
        expect(pagina.form.controls.promedio.invalid).toBe(true);
        expect(TestBed.inject(EstudiantesStore).total()).toBe(6);
    });
    it('selecciona una tarjeta a través del evento del hijo', async () => {
        const harness = await RouterTestingHarness.create();
        const pagina = await harness.navigateByUrl('/estudiantes', Estudiantes);
        const vista = harness.routeNativeElement!;
        expect(vista.querySelectorAll('app-tarjeta-estudiante')).toHaveLength(6);
        vista.querySelector<HTMLButtonElement>('button')!.click();
        await harness.fixture.whenStable();
        expect(pagina.seleccionado()?.nombre).toBe('Ana Torres');
        expect(vista.querySelector('button')?.getAttribute('aria-pressed')).toBe(
            'true',
        );
    });
    it('redirige la raíz y muestra la página de ruta desconocida', async () => {
        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/');
        expect(harness.routeNativeElement?.textContent).toContain(
            'Resumen académico',
        );
        await harness.navigateByUrl('/direccion-inexistente');
        expect(harness.routeNativeElement?.textContent).toContain(
            'Página no encontrada',
        );
    });
});
