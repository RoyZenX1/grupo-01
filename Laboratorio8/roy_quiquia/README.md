# Guía paso a paso: Portal Académico en VS Code (Windows 11)

## Paso 1: Instalar lo necesario

1. **Node.js 24 LTS**: descárgalo de https://nodejs.org (el instalador LTS) y acepta las opciones por defecto.
2. **Visual Studio Code**: https://code.visualstudio.com
3. Cierra y vuelve a abrir VS Code para que reconozca Node.

## Paso 2: Abrir una terminal y verificar

1. Abre VS Code y luego el menú **Terminal → Nueva terminal** (o `Ctrl + Ñ` en teclado español).
2. Si PowerShell bloquea `npm` o `npx` con un error de "scripts deshabilitados", ejecuta una sola vez:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

3. Verifica las versiones (la guía usa Node 24.19.0 y npm 11.9.0):

```powershell
node --version
npm --version
```

## Paso 3: Crear el proyecto

Elige una carpeta de trabajo, por ejemplo `C:\Proyectos`, y ejecuta (todo en **una sola línea**):

```powershell
cd C:\Proyectos
npx --yes @angular/cli@22.1.8 new portal-academico --standalone --routing --style=css --skip-git --skip-install --ssr=false --defaults
cd portal-academico
code .
```

`code .` abre la carpeta del proyecto en VS Code. Abre una terminal nueva dentro de esa ventana (`Ctrl + Ñ`).

## Paso 4: Crear las subcarpetas

En la terminal de VS Code, dentro de `portal-academico`:

```powershell
mkdir src\app\modelos, src\app\datos, src\app\estado, src\app\pipes, src\app\componentes, src\app\paginas
```

## Paso 5: Reemplazar `package.json` e instalar

Abre `package.json`, borra todo su contenido y pega esto:

```json
{
  "name": "portal-academico",
  "version": "0.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "test:ci": "ng test --watch=false",
    "verify": "ng build && ng test --watch=false"
  },
  "private": true,
  "packageManager": "npm@11.9.0",
  "dependencies": {
    "@angular/common": "22.1.7",
    "@angular/compiler": "22.1.7",
    "@angular/core": "22.1.7",
    "@angular/forms": "22.1.7",
    "@angular/platform-browser": "22.1.7",
    "@angular/router": "22.1.7",
    "bootstrap": "5.3.8",
    "rxjs": "7.8.2",
    "tslib": "2.8.1"
  },
  "devDependencies": {
    "@angular/build": "22.1.8",
    "@angular/cli": "22.1.8",
    "@angular/compiler-cli": "22.1.7",
    "jsdom": "28.1.0",
    "prettier": "3.8.1",
    "typescript": "6.0.3",
    "vitest": "4.1.11"
  }
}
```

Luego instala:

```powershell
npm install
npm ls @angular/core @angular/cli typescript bootstrap vitest --depth=0
```

## Paso 6: Reemplazar `tsconfig.json`

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "ES2022",
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "strictTemplates": true,
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true
  },
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.spec.json" }
  ]
}
```

No toques `tsconfig.app.json`, `tsconfig.spec.json` ni `angular.json`.

## Paso 7: Modelo, datos, estado y pipe

Para crear cada archivo: clic derecho en la carpeta del explorador → **Nuevo archivo**, escribe el nombre y pega el contenido. Guarda con `Ctrl + S`.

**`src/app/modelos/estudiante.ts`**

```ts
export type Programa = 'Software' | 'Sistemas';
export type EstadoAcademico = 'Destacado' | 'Aprobado' | 'En riesgo';

export interface Estudiante {
  readonly id: number;
  readonly nombre: string;
  readonly programa: Programa;
  readonly promedio: number;
  readonly asistencia: number;
}

export type BorradorEstudiante = Omit<Estudiante, 'id'>;

export function estadoAcademico(promedio: number): EstadoAcademico {
  if (promedio >= 14) return 'Destacado';
  return promedio >= 11 ? 'Aprobado' : 'En riesgo';
}
```

**`src/app/datos/estudiantes.ts`**

```ts
import type { Estudiante } from '../modelos/estudiante';

export const ESTUDIANTES: readonly Estudiante[] = [
  { id: 101, nombre: 'Ana Torres', programa: 'Software', promedio: 17.2, asistencia: 94 },
  { id: 102, nombre: 'Luis Ramírez', programa: 'Sistemas', promedio: 10.4, asistencia: 72 },
  { id: 103, nombre: 'María Paredes', programa: 'Software', promedio: 13.5, asistencia: 88 },
  { id: 104, nombre: 'Carlos Vega', programa: 'Sistemas', promedio: 8.9, asistencia: 66 },
  { id: 105, nombre: 'Sofía Medina', programa: 'Software', promedio: 18.1, asistencia: 97 },
  { id: 106, nombre: 'Diego Salas', programa: 'Sistemas', promedio: 11.8, asistencia: 81 },
];
```

**`src/app/estado/estudiantes-store.ts`**

```ts
import { computed, Injectable, signal } from '@angular/core';
import { ESTUDIANTES } from '../datos/estudiantes';
import type { BorradorEstudiante, Estudiante } from '../modelos/estudiante';

@Injectable({ providedIn: 'root' })
export class EstudiantesStore {
  private readonly registros = signal<readonly Estudiante[]>([...ESTUDIANTES]);
  readonly estudiantes = this.registros.asReadonly();
  readonly total = computed(() => this.estudiantes().length);
  readonly promedio = computed(() => {
    const lista = this.estudiantes();
    return lista.length
      ? lista.reduce((suma, e) => suma + e.promedio, 0) / lista.length
      : 0;
  });
  private siguienteId = 107;

  agregar(datos: BorradorEstudiante): Estudiante {
    const nombre = datos.nombre.trim();
    if (
      nombre.length < 3 ||
      nombre.length > 80 ||
      !['Software', 'Sistemas'].includes(datos.programa) ||
      !Number.isFinite(datos.promedio) ||
      datos.promedio < 0 ||
      datos.promedio > 20 ||
      !Number.isFinite(datos.asistencia) ||
      datos.asistencia < 0 ||
      datos.asistencia > 100
    ) {
      throw new Error('Los datos del estudiante no son válidos.');
    }
    const estudiante: Estudiante = { ...datos, nombre, id: this.siguienteId++ };
    this.registros.update((lista) => [...lista, estudiante]);
    return estudiante;
  }
}
```

**`src/app/pipes/estado-academico.pipe.ts`**

```ts
import { Pipe, PipeTransform } from '@angular/core';
import { estadoAcademico, EstadoAcademico } from '../modelos/estudiante';

@Pipe({ name: 'estadoAcademico', standalone: true })
export class EstadoAcademicoPipe implements PipeTransform {
  transform(promedio: number): EstadoAcademico {
    return estadoAcademico(promedio);
  }
}
```

## Paso 8: Componente tarjeta

**`src/app/componentes/tarjeta-estudiante.ts`**

```ts
import { DecimalPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Estudiante } from '../modelos/estudiante';
import { EstadoAcademicoPipe } from '../pipes/estado-academico.pipe';

@Component({
  selector: 'app-tarjeta-estudiante',
  standalone: true,
  imports: [DecimalPipe, PercentPipe, EstadoAcademicoPipe],
  templateUrl: './tarjeta-estudiante.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetaEstudiante {
  readonly estudiante = input.required<Estudiante>();
  readonly seleccionado = input(false);
  readonly seleccionar = output<Estudiante>();
}
```

**`src/app/componentes/tarjeta-estudiante.html`**

```html
<article class="card h-100" [class.border-primary]="seleccionado()">
  <div class="card-body">
    <h2 class="h5">{{ estudiante().nombre }}</h2>
    <p class="text-body-secondary">{{ estudiante().programa }}</p>
    <dl>
      <dt>Promedio</dt>
      <dd>{{ estudiante().promedio | number: '1.2-2' }}</dd>
      <dt>Asistencia</dt>
      <dd>{{ estudiante().asistencia / 100 | percent: '1.0-0' }}</dd>
      <dt>Estado académico</dt>
      <dd>{{ estudiante().promedio | estadoAcademico }}</dd>
    </dl>
    <button
      type="button"
      class="btn btn-outline-primary"
      [attr.aria-pressed]="seleccionado()"
      [attr.aria-label]="'Seleccionar a ' + estudiante().nombre"
      (click)="seleccionar.emit(estudiante())"
    >
      {{ seleccionado() ? 'Seleccionado' : 'Seleccionar' }}
    </button>
  </div>
</article>
```

## Paso 9: Las páginas

**`src/app/paginas/resumen.ts`**

```ts
import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EstudiantesStore } from '../estado/estudiantes-store';

@Component({
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './resumen.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Resumen {
  readonly store = inject(EstudiantesStore);
  readonly fecha = new Date();
}
```

**`src/app/paginas/resumen.html`**

```html
<h1>Resumen académico</h1>
<p class="text-body-secondary">
  Consulta local del {{ fecha | date: 'dd/MM/yyyy' }}.
</p>
<div class="row g-3 my-3">
  <div class="col-md-6">
    <section class="panel" aria-labelledby="total-titulo">
      <h2 id="total-titulo" class="h5">Estudiantes registrados</h2>
      <p class="display-6">{{ store.total() }}</p>
    </section>
  </div>
  <div class="col-md-6">
    <section class="panel" aria-labelledby="promedio-titulo">
      <h2 id="promedio-titulo" class="h5">Promedio general</h2>
      <p class="display-6">{{ store.promedio() | number: '1.2-2' }}</p>
    </section>
  </div>
</div>
<p>Los registros se conservan al navegar y se reinician al recargar.</p>
<a routerLink="/estudiantes" class="btn btn-primary">Consultar estudiantes</a>
```

**`src/app/paginas/estudiantes.ts`**

```ts
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TarjetaEstudiante } from '../componentes/tarjeta-estudiante';
import { EstudiantesStore } from '../estado/estudiantes-store';
import type { Estudiante } from '../modelos/estudiante';

@Component({
  standalone: true,
  imports: [RouterLink, TarjetaEstudiante],
  templateUrl: './estudiantes.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Estudiantes {
  readonly store = inject(EstudiantesStore);
  readonly seleccionado = signal<Estudiante | null>(null);

  seleccionar(estudiante: Estudiante): void {
    this.seleccionado.set(estudiante);
  }
}
```

**`src/app/paginas/estudiantes.html`**

```html
<h1>Estudiantes</h1>
<p>Selecciona una tarjeta para comprobar la comunicación entre componentes.</p>
<a routerLink="/registro" class="btn btn-primary mb-3">Registrar estudiante</a>
<p role="status" aria-live="polite">
  @if (seleccionado(); as e) {
    Estudiante seleccionado {{ e.nombre }} con identificador {{ e.id }}.
  } @else {
    No hay una selección activa.
  }
</p>
<div class="row g-3">
  @for (e of store.estudiantes(); track e.id) {
    <div class="col-md-6 col-xl-4">
      <app-tarjeta-estudiante
        [estudiante]="e"
        [seleccionado]="seleccionado()?.id === e.id"
        (seleccionar)="seleccionar($event)"
      />
    </div>
  } @empty {
    <p>No hay estudiantes registrados.</p>
  }
</div>
```

**`src/app/paginas/registro.ts`**

```ts
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EstudiantesStore } from '../estado/estudiantes-store';
import type { Programa } from '../modelos/estudiante';

function nombreValido(control: AbstractControl) {
  const texto = String(control.value ?? '').trim();
  return texto.length >= 3 && texto.length <= 80 ? null : { nombre: true };
}

function numeroFinito(control: AbstractControl) {
  return control.value === null || Number.isFinite(control.value)
    ? null
    : { finito: true };
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(EstudiantesStore);
  readonly enviado = signal(false);
  readonly mensaje = signal('');

  readonly form = this.fb.group({
    nombre: this.fb.nonNullable.control('', [nombreValido]),
    programa: this.fb.nonNullable.control<Programa>('Software', [
      Validators.required,
    ]),
    promedio: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(20),
      numeroFinito,
    ]),
    asistencia: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
      numeroFinito,
    ]),
  });

  invalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || this.enviado());
  }

  guardar(): void {
    this.enviado.set(true);
    this.mensaje.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const datos = this.form.getRawValue();
    if (datos.promedio === null || datos.asistencia === null) return;
    try {
      const nuevo = this.store.agregar({
        ...datos,
        promedio: datos.promedio,
        asistencia: datos.asistencia,
      });
      this.mensaje.set(
        `Se registró a ${nuevo.nombre} con identificador ${nuevo.id}.`,
      );
      this.form.reset();
      this.enviado.set(false);
    } catch (error) {
      this.mensaje.set(
        error instanceof Error ? error.message : 'No se pudo registrar.',
      );
    }
  }
}
```

**`src/app/paginas/registro.html`**

```html
<h1>Registrar estudiante</h1>
<p>Completa los cuatro campos. El registro se guarda solo en memoria.</p>
<form
  [formGroup]="form"
  (ngSubmit)="guardar()"
  novalidate
  class="panel formulario"
>
  <div class="mb-3">
    <label for="nombre" class="form-label">Nombre completo</label>
    <input
      id="nombre"
      formControlName="nombre"
      type="text"
      autocomplete="name"
      class="form-control"
      [class.is-invalid]="invalido('nombre')"
      [attr.aria-invalid]="invalido('nombre')"
      aria-describedby="nombre-ayuda nombre-error"
    />
    <p id="nombre-ayuda" class="form-text">
      Entre 3 y 80 caracteres después de quitar espacios exteriores.
    </p>
    <p id="nombre-error" class="text-danger">
      @if (invalido('nombre')) {
        Escribe un nombre de 3 a 80 caracteres.
      }
    </p>
  </div>

  <div class="mb-3">
    <label for="programa" class="form-label">Programa</label>
    <select
      id="programa"
      formControlName="programa"
      class="form-select"
      [attr.aria-invalid]="invalido('programa')"
      aria-describedby="programa-error"
    >
      <option value="Software">Ingeniería de Software</option>
      <option value="Sistemas">Ingeniería de Sistemas</option>
    </select>
    <p id="programa-error" class="text-danger">
      @if (invalido('programa')) {
        Selecciona un programa.
      }
    </p>
  </div>

  <div class="mb-3">
    <label for="promedio" class="form-label">Promedio de 0 a 20</label>
    <input
      id="promedio"
      formControlName="promedio"
      type="number"
      min="0"
      max="20"
      step="any"
      class="form-control"
      [class.is-invalid]="invalido('promedio')"
      [attr.aria-invalid]="invalido('promedio')"
      aria-describedby="promedio-error"
    />
    <p id="promedio-error" class="text-danger">
      @if (invalido('promedio')) {
        Ingresa un número entre 0 y 20.
      }
    </p>
  </div>

  <div class="mb-3">
    <label for="asistencia" class="form-label"
      >Asistencia de 0 a 100 por ciento</label
    >
    <input
      id="asistencia"
      formControlName="asistencia"
      type="number"
      min="0"
      max="100"
      step="any"
      class="form-control"
      [class.is-invalid]="invalido('asistencia')"
      [attr.aria-invalid]="invalido('asistencia')"
      aria-describedby="asistencia-error"
    />
    <p id="asistencia-error" class="text-danger">
      @if (invalido('asistencia')) {
        Ingresa un número entre 0 y 100.
      }
    </p>
  </div>

  @if (enviado() && form.invalid) {
    <p role="alert" class="text-danger">
      Revisa los campos señalados antes de guardar.
    </p>
  }
  <div class="d-flex flex-wrap gap-2">
    <button type="submit" class="btn btn-primary">Guardar estudiante</button>
    <a routerLink="/estudiantes" class="btn btn-outline-secondary"
      >Ver estudiantes</a
    >
  </div>
</form>
<p role="status" aria-live="polite" class="mt-3">{{ mensaje() }}</p>
```

**`src/app/paginas/no-encontrada.ts`**

```ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Página no encontrada</h1>
    <p>La dirección solicitada no corresponde a una vista del portal.</p>
    <a routerLink="/resumen" class="btn btn-primary">Volver al resumen</a>
  `,
})
export class NoEncontrada {}
```

## Paso 10: Rutas, configuración y arranque

Estos archivos **ya existen** (los generó la CLI). Reemplaza todo su contenido.

**`src/app/app.routes.ts`**

```ts
import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'resumen', pathMatch: 'full' },
  {
    path: 'resumen',
    title: 'Resumen académico',
    loadComponent: () => import('./paginas/resumen').then((m) => m.Resumen),
  },
  {
    path: 'estudiantes',
    title: 'Estudiantes',
    loadComponent: () =>
      import('./paginas/estudiantes').then((m) => m.Estudiantes),
  },
  {
    path: 'registro',
    title: 'Registrar estudiante',
    loadComponent: () => import('./paginas/registro').then((m) => m.Registro),
  },
  {
    path: '**',
    title: 'Página no encontrada',
    loadComponent: () =>
      import('./paginas/no-encontrada').then((m) => m.NoEncontrada),
  },
];
```

**`src/app/app.config.ts`**

```ts
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

registerLocaleData(localeEsPe);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: 'es-PE' },
  ],
};
```

**`src/main.ts`**

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

**`src/index.html`**

```html
<!doctype html>
<html lang="es-PE">
  <head>
    <meta charset="utf-8" />
    <title>Portal académico</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

## Paso 11: Estructura principal y estilos

**`src/app/app.ts`**

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
```

**`src/app/app.html`**

```html
<a href="#contenido" class="saltar">Saltar al contenido</a>
<header class="cabecera">
  <div class="container py-4">
    <p class="h4 mb-3">Portal académico</p>
    <nav aria-label="Navegación principal" class="d-flex flex-wrap gap-2">
      <a
        routerLink="/resumen"
        routerLinkActive="activo"
        [routerLinkActiveOptions]="{ exact: true }"
        ariaCurrentWhenActive="page"
        >Resumen</a
      >
      <a
        routerLink="/estudiantes"
        routerLinkActive="activo"
        [routerLinkActiveOptions]="{ exact: true }"
        ariaCurrentWhenActive="page"
        >Estudiantes</a
      >
      <a
        routerLink="/registro"
        routerLinkActive="activo"
        [routerLinkActiveOptions]="{ exact: true }"
        ariaCurrentWhenActive="page"
        >Registro</a
      >
    </nav>
  </div>
</header>
<main id="contenido" tabindex="-1" class="container py-4">
  <router-outlet />
</main>
<footer class="container pb-4 text-body-secondary">
  Laboratorio de Angular con datos ficticios sin conexión a un servidor.
</footer>
```

**`src/app/app.css`**

```css
:host {
  display: block;
}
.cabecera {
  background: #172e4d;
  color: #fff;
}
nav a {
  color: #fff;
  padding: 0.5rem 0.8rem;
  border-radius: 0.4rem;
}
nav a.activo {
  background: #fff;
  color: #172e4d;
  font-weight: 700;
}
.saltar {
  position: absolute;
  top: -5rem;
  left: 1rem;
  padding: 0.8rem;
  background: #fff;
  z-index: 10;
}
.saltar:focus {
  top: 0.5rem;
}
```

**`src/styles.css`**

```css
@import 'bootstrap/dist/css/bootstrap.min.css';

body {
  background: #f4f6f9;
  color: #172e4d;
}
.panel {
  background: #fff;
  padding: 1.5rem;
  border: 1px solid #d7dee8;
  border-radius: 0.8rem;
}
.formulario {
  max-width: 42rem;
}
.card {
  border-radius: 0.8rem;
}
a:focus-visible,
button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 3px solid #8b4e00;
  outline-offset: 3px;
}
```

## Paso 12: Ejecutar la aplicación

```powershell
npm start
```

Abre http://localhost:4200 en el navegador. Debe redirigir a `/resumen` y mostrar **6 estudiantes** y promedio **13,32**. Deja esta terminal abierta y detenla con `Ctrl + C` cuando termines.

## Paso 13: Pruebas automatizadas

Abre una **segunda terminal** (icono `+` en el panel de terminal) para no detener el servidor.

**`src/app/app.spec.ts`** (reemplaza el generado)

```ts
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
```

**`src/app/portal.spec.ts`** (archivo nuevo)

```ts
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
      nombre: '   ',
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
```

En el PDF, el nombre de la prueba de espacios usa `' '`; yo puse tres espacios, que prueban lo mismo.

Ejecuta en la segunda terminal:

```powershell
npm run build
npm run test:ci
npm run verify
```

Esperado: el build termina sin errores y las pruebas muestran **2 archivos y 13 pruebas aprobadas**.

## Paso 14: Prueba manual en el navegador

| Acción | Resultado esperado |
|---|---|
| Abrir `/` | Redirige a `/resumen`, total 6 |
| Ir a Estudiantes | 6 tarjetas; seleccionar Ana y luego Luis cambia el mensaje |
| Guardar el formulario vacío | Errores visibles, total sin cambios |
| Nombre de espacios o promedio 21 | Registro rechazado |
| Elena Ruiz, Software, 16, 90 | Confirmación con id 107 |
| Ir a Estudiantes y luego a Resumen | 7 tarjetas, total 7, promedio 13,70 |
| Abrir `/direccion-inexistente` | Página no encontrada con enlace de regreso |
| Recargar (F5) | Vuelve a los 6 datos iniciales |

## Problemas frecuentes en Windows

- **"npm.ps1 no se puede cargar"**: ejecuta el comando de `Set-ExecutionPolicy` del Paso 2.
- **El puerto 4200 está ocupado**: acepta el puerto alternativo que propone Angular.
- **Errores de versión de Node**: instala Node 24 LTS; no uses `--force` ni `--legacy-peer-deps`.
- **Error de tipos**: corrige el código, no desactives `strict` ni uses `any`.
- **Tras modificar archivos no cambia nada**: confirma que guardaste (`Ctrl + S`) y revisa que el nombre y la carpeta coincidan exactamente (sin tildes ni espacios).
- **Pegado con formato extraño**: si copias desde el PDF, usa comillas rectas y revisa la indentación.

Si quieres, puedo ayudarte con los ejercicios de consolidación (el experimento de porcentaje, la prueba de reinicio del formulario o el reto de búsqueda) o con cualquier error que te aparezca al compilar.