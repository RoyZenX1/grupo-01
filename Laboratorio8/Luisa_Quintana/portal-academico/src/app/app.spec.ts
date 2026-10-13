import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { appConfig } from './app.config';
describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...appConfig.providers],
    }).compileComponents();
  });
  it('crea la estructura principal', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
  it('ofrece tres enlaces y un contenedor de rutas', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('nav a')).toHaveLength(3);
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });
});