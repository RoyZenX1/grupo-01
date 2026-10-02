import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('crea la aplicación', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra el título y los seis estudiantes iniciales', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const vista = fixture.nativeElement as HTMLElement;
    expect(vista.querySelector('h1')?.textContent).toContain('Panel de seguimiento académico');
    expect(vista.querySelectorAll('.tarjeta-estudiante')).toHaveLength(6);
  });

  it('filtra los estudiantes en riesgo mediante un evento', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const vista = fixture.nativeElement as HTMLElement;
    const boton = [...vista.querySelectorAll('button')].find(
      (elemento) => elemento.textContent?.trim() === 'En riesgo',
    );
    boton?.click();
    await fixture.whenStable();
    expect(vista.querySelectorAll('.tarjeta-estudiante')).toHaveLength(2);
  });

  it('presenta el estado vacío y permite restaurar los datos', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const vista = fixture.nativeElement as HTMLElement;
    const buscarBoton = (texto: string) =>
      [...vista.querySelectorAll('button')].find(
        (elemento) => elemento.textContent?.trim() === texto,
      );
    buscarBoton('Simular lista vacía')?.click();
    await fixture.whenStable();
    expect(vista.textContent).toContain('No hay estudiantes que coincidan');
    buscarBoton('Restaurar datos')?.click();
    await fixture.whenStable();
    expect(vista.querySelectorAll('.tarjeta-estudiante')).toHaveLength(6);
  });
});