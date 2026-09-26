# Guía de Laboratorio 07
## Creación de una aplicación Angular con componentes standalone

**UTP | JavaScript Avanzado | Recurso de aprendizaje**

Angular CLI, componentes standalone, señales, enlaces de plantilla, directivas, control de flujo, Bootstrap y pruebas.

| Semana | Sesiones | Duración | Unidad |
|---|---|---|---|
| 07 | 13 y 14 | 4 horas | Angular |

---

## Caso práctico: Panel de seguimiento académico

Construirás una aplicación web que presenta indicadores académicos, filtra estudiantes por estado, resalta visualmente los casos de riesgo y maneja vistas vacías. El proyecto transforma los fundamentos de Node.js y TypeScript de la semana 6 en una interfaz Angular reactiva, accesible y verificada mediante pruebas.

---

## Ruta del laboratorio

La práctica parte de un proyecto generado por Angular CLI y termina con una aplicación compilada, probada y capaz de responder a cambios de estado sin manipular el DOM de forma manual.

| Bloque | Actividad | Evidencia |
|---|---|---|
| A | Comprender Angular y su modelo de componentes | Mapa conceptual explicado |
| B | Instalar CLI y crear el proyecto | Aplicación inicial ejecutándose |
| C | Practicar enlaces, señales y control de flujo | Ejemplos verificados |
| D | Implementar el panel académico | Interfaz funcional y adaptable |
| E | Integrar Bootstrap y accesibilidad | Diseño consistente y operable |
| F | Compilar, probar, depurar y ampliar | Build y cuatro pruebas aprobadas |

### Ficha del laboratorio

| Elemento | Descripción |
|---|---|
| Tema del sílabo | Angular: concepto, instalación, creación de proyectos, directivas de atributos, directivas estructurales, instalación de Bootstrap e implementación de un proyecto web. |
| Actualización técnica | Se usan componentes standalone y bloques de control `@if`, `@for`, `@empty` y `@switch`. Se explica su relación con las directivas estructurales tradicionales. |
| Logro | Crea una aplicación Angular que enlaza datos y eventos, administra estado reactivo, aplica una directiva de atributo y representa colecciones de forma segura. |
| Producto | Panel de seguimiento académico adaptable con indicadores, filtros y estados vacíos. |
| Versiones verificadas | Node.js 24 LTS, npm 11.9, Angular 22.1.7, Angular CLI 22.1.8, TypeScript 6.0.3 y Bootstrap 5.3.8. |
| Requisitos | Visual Studio Code, terminal, Node.js compatible y acceso inicial a Internet. |

### Resultados de aprendizaje observables

- Diferencia Angular, Angular CLI, Node.js, TypeScript y Bootstrap por su responsabilidad.
- Crea y ejecuta un proyecto Angular standalone mediante comandos reproducibles.
- Reconoce los archivos principales y evita modificar dependencias o salida generada.
- Explica componente, plantilla, selector, metadatos, señal y valor calculado.
- Usa interpolación y enlaces de propiedades, atributos, clases, estilos y eventos.
- Representa decisiones y colecciones con `@if`, `@for`, `@empty` y `@switch`.
- Implementa una directiva de atributo con una entrada requerida y clases del elemento host.
- Integra Bootstrap como dependencia local sin usar un CDN.
- Construye la aplicación de producción y ejecuta cuatro pruebas automatizadas.

> **Continuidad:** La semana 6 preparó Node.js, npm, módulos y TypeScript. Esta semana Angular utiliza esas herramientas para generar, comprobar, compilar y ejecutar una interfaz web.

---

## 1. Qué es Angular

Angular es un framework para crear aplicaciones web. Proporciona componentes, plantillas, inyección de dependencias, herramientas de construcción, pruebas y convenciones de proyecto. La aplicación se programa principalmente con TypeScript y se ejecuta como JavaScript en el navegador.

| Tecnología | Tipo | Responsabilidad en el laboratorio |
|---|---|---|
| Node.js | Entorno de ejecución | Ejecuta Angular CLI y las herramientas de construcción. |
| npm | Gestor de paquetes | Instala versiones y ejecuta scripts del proyecto. |
| TypeScript | Lenguaje | Modela datos y comprueba el código antes de generar JavaScript. |
| Angular | Framework web | Organiza componentes, plantillas, estado y actualización de la vista. |
| Angular CLI | Herramienta de consola | Crea, sirve, compila y prueba el proyecto. |
| Bootstrap | Biblioteca de estilos | Aporta utilidades y componentes visuales CSS. |

> **Precisión:** Angular no reemplaza a Node.js. Node.js ejecuta las herramientas durante el desarrollo; la aplicación compilada se ejecuta en el navegador.

### 1.1 Modelo mental de una aplicación

Un componente reúne una clase TypeScript, una plantilla HTML y estilos. La clase expone estado; la plantilla declara cómo representarlo; Angular mantiene la vista sincronizada cuando una señal cambia. No se buscan elementos con `querySelector` para actualizar su contenido.

| Parte | Archivo del caso | Pregunta que responde |
|---|---|---|
| Entrada | `datos/estudiantes.ts` | Qué datos recibe la aplicación |
| Estado | `app.ts` | Qué valores pueden cambiar y qué se deriva de ellos |
| Presentación | `app.html` | Cómo se muestran condiciones, colecciones y eventos |
| Comportamiento visual | directiva y `app.css` | Cómo se adapta el elemento al estado |
| Verificación | `app.spec.ts` | Qué comportamiento debe mantenerse |

**Código 1. Flujo reactivo básico**
```
estado cambia mediante una señal
    ↓
computed vuelve a calcular los valores dependientes
    ↓
la plantilla evalúa enlaces y bloques de control
    ↓
Angular actualiza únicamente la parte necesaria de la vista
```

---

## 2. Compatibilidad e instalación

Angular 22 requiere Node.js 22.22.3, 24.15.0 o 26.0.0 en adelante y TypeScript 6.0.x. Para el aula se mantiene Node.js 24 LTS porque ofrece estabilidad y coincide con la semana 6.

| Componente | Versión del laboratorio | Criterio |
|---|---|---|
| Node.js | 24 LTS | Compatible con Angular 22 y apropiado para trabajo estable. |
| Angular | 22.1.7 | Versión instalada y comprobada en el proyecto. |
| Angular CLI | 22.1.8 | Generador y comandos usados para la guía. |
| TypeScript | 6.0.3 | Dentro del intervalo compatible: mayor o igual a 6.0 y menor que 6.1. |
| Bootstrap | 5.3.8 | Dependencia CSS instalada localmente. |

**Código 2. Diagnóstico del entorno**
```bash
node --version
npm --version
npx -y @angular/cli@22.1.8 version
```

> **Alternativa global:** La documentación oficial permite `npm install -g @angular/cli`. Para evitar que una CLI global antigua afecte la práctica, la guía invoca una versión explícita mediante `npx`.

---

## 3. Creación del proyecto

Ejecuta el comando en la carpeta donde deseas crear el laboratorio. Las opciones fijan el nombre, la carpeta, el estilo CSS, el modelo standalone, la ausencia de enrutamiento y SSR, y npm como gestor.

**Código 3. Creación reproducible**
```bash
npx -y @angular/cli@22.1.8 new panel-academico --directory lab-semana-07 --standalone --routing=false --style=css --ssr=false --skip-git --package-manager=npm --defaults
cd lab-semana-07
npm install bootstrap@5.3.8 --save-exact
npm start
```

> **Resultado:** El servidor de desarrollo informa la dirección `http://localhost:4200`. Mantén la terminal abierta y detén el proceso con `Ctrl+C` cuando termines.

### 3.1 Estructura generada

| Ruta | Responsabilidad | Acción del estudiante |
|---|---|---|
| `package.json` | Dependencias y scripts npm | Conservar y añadir scripts de verificación |
| `package-lock.json` | Árbol exacto instalado | Conservar sin editar manualmente |
| `angular.json` | Configuración de build, serve, test y assets | Conservar en esta práctica |
| `src/main.ts` | Punto de arranque del navegador | Revisar y conservar |
| `src/app/app.ts` | Estado y comportamiento del componente raíz | Implementar |
| `src/app/app.html` | Plantilla declarativa | Implementar |
| `src/app/app.css` | Estilos encapsulados del componente | Implementar |
| `src/styles.css` | Estilos globales y Bootstrap | Implementar |
| `public/` | Archivos estáticos | Conservar favicon |
| `dist/` | Salida de producción | No editar y regenerar con build |
| `node_modules/` | Dependencias instaladas | No editar ni copiar al repositorio |

---

## 4. Componentes standalone

Un componente standalone declara directamente las directivas y componentes que usa mediante `imports`. No necesita un `NgModule` propio. El decorador `Component` describe selector, plantilla, estilos y estrategia de detección; la clase conserva el estado y las operaciones de la vista.

**Código 4. Anatomía mínima**
```typescript
@Component({
  selector: 'app-root',
  imports: [ResaltarRiesgoDirective],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
```

| Metadato | Función |
|---|---|
| `selector` | Nombre del elemento que representa el componente en HTML. |
| `imports` | Dependencias de plantilla disponibles para este componente. |
| `templateUrl` | Archivo HTML asociado. |
| `styleUrl` | Hoja de estilos encapsulada del componente. |
| `changeDetection` | Estrategia para comprobar actualizaciones de la vista. |

---

## 5. Enlaces de plantilla

Los enlaces conectan la clase con el HTML. La interpolación produce texto; los corchetes asignan propiedades, atributos, clases o estilos; los paréntesis registran eventos. El sentido del flujo se reconoce por la sintaxis.

| Sintaxis | Nombre | Dirección | Ejemplo del proyecto |
|---|---|---|---|
| `{{ valor }}` | Interpolación | Clase → vista | Nombre y promedio |
| `[disabled]` | Property binding | Clase → propiedad DOM | Desactivar botones |
| `[attr.aria-pressed]` | Attribute binding | Clase → atributo | Estado accesible del filtro |
| `[class.active]` | Class binding | Clase → clase CSS | Filtro seleccionado |
| `[style.width.%]` | Style binding | Clase → estilo | Ancho de barra de progreso |
| `(click)` | Event binding | Vista → clase | Cambiar filtro o restaurar datos |

**Código 5. Enlaces combinados**
```html
<button
  [class.active]="filtroActivo() === 'riesgo'"
  [attr.aria-pressed]="filtroActivo() === 'riesgo'"
  (click)="cambiarFiltro('riesgo')"
>
  En riesgo
</button>
```

---

## 6. Estado reactivo con señales

`signal` conserva un valor reactivo. Se lee llamándolo como función y se modifica con `set` o `update`. `computed` declara un valor derivado y memorizado; Angular vuelve a evaluarlo cuando cambian las señales que leyó. No dupliques en el estado datos que pueden calcularse.

| Elemento | Uso | Regla práctica |
|---|---|---|
| `signal` | Datos que cambian por una acción | Modificar con `set` o `update` |
| `computed` | Filtros, resúmenes y valores derivados | No producir efectos secundarios |
| Valor `readonly` | Texto o configuración fija | No convertir todo en señal |

**Código 6. Señal y valor calculado**
```typescript
const filtroActivo = signal<'todos' | 'riesgo'>('todos');

const estudiantesVisibles = computed(() =>
  filtroActivo() === 'riesgo'
    ? estudiantes().filter((item) => item.promedio < 11)
    : estudiantes(),
);

filtroActivo.set('riesgo');
```

---

## 7. Directivas y control de flujo

Una directiva de atributo añade comportamiento o apariencia a un elemento existente. Una directiva estructural tradicional modifica qué fragmentos existen y se reconoce por el prefijo asterisco. Angular moderno incorpora bloques de control integrados, que cumplen el mismo propósito curricular sin ser directivas y sin importar `CommonModule`.

| Categoría | Sintaxis | Uso en el laboratorio |
|---|---|---|
| Atributo propia | `[appResaltarRiesgo]` | Añade clases según el promedio. |
| Enlace de clase | `[class.active]` | Activa una clase sin crear una directiva. |
| Estructural tradicional | `*ngIf` y `*ngFor` | Referencia histórica; no se usa en el código final. |
| Bloque moderno | `@if` y `@else` | Muestra indicadores o estado vacío. |
| Bloque moderno | `@for` y `@empty` | Recorre estudiantes y cubre lista sin elementos. |
| Bloque moderno | `@switch` y `@case` | Selecciona la insignia académica. |

> **Clave de rendimiento:** En `@for` se usa `track estudiante.id`. La clave estable permite relacionar cada registro con su nodo DOM y reducir operaciones cuando la colección cambia.

---

## 8. Integración de Bootstrap

Bootstrap se instala como dependencia local y se importa desde la hoja global. Así `package-lock.json` registra la versión y el proyecto puede compilar sin depender de un CDN externo. Las utilidades de rejilla y espaciado se combinan con estilos propios del componente.

**Código 7. Instalación e importación**
```bash
npm install bootstrap@5.3.8 --save-exact
```
```css
/* src/styles.css */
@import 'bootstrap/dist/css/bootstrap.min.css';
```

| Clase Bootstrap | Efecto |
|---|---|
| `container` | Limita y centra el contenido. |
| `row` y `col` | Construye la rejilla adaptable. |
| `d-flex` y `gap` | Organiza controles con separación consistente. |
| `btn` y `btn-group` | Da forma a botones y grupos de acciones. |
| `badge` | Presenta estados compactos. |
| `progress` | Representa el promedio de forma visual. |

---

## 9. Diseño del panel académico

El panel parte de seis registros tipados. La señal `estudiantes` conserva la colección y `filtroActivo` conserva la selección. Dos valores `computed` producen la lista visible y el resumen. La plantilla representa esos valores y los botones disparan cambios explícitos.

| Archivo | Responsabilidad |
|---|---|
| `modelos/estudiante.ts` | Contrato `Estudiante` y unión `EstadoAcademico`. |
| `datos/estudiantes.ts` | Colección inicial inmutable. |
| `directivas/resaltar-riesgo.directive.ts` | Clases y atributo `data-*` según promedio. |
| `app.ts` | Estado, señales, cálculos y acciones. |
| `app.html` | Estructura accesible, enlaces, eventos y control de flujo. |
| `app.css` | Diseño específico del panel y estados de las tarjetas. |
| `styles.css` | Bootstrap y base global. |
| `app.spec.ts` | Creación, renderizado, filtro, estado vacío y restauración. |

### 9.1 Algoritmo de interacción

**Código 8. Pseudocódigo**
```
cargar estudiantes iniciales
calcular total, aprobados, riesgo y promedio
mostrar indicadores
mostrar una tarjeta por estudiante con track id

cuando el usuario selecciona un filtro
    actualizar filtroActivo
    recalcular estudiantesVisibles
    actualizar la lista

cuando el usuario simula una lista vacía
    reemplazar estudiantes por un arreglo vacío
    mostrar mensajes alternativos

cuando el usuario restaura
    recuperar datos iniciales y filtro todos
```

---

## 10. Preparación de archivos

1. Genera el proyecto con el comando de la sección 3 y entra en `lab-semana-07`.
2. Instala Bootstrap 5.3.8 y confirma que `package-lock.json` cambió.
3. Dentro de `src/app` crea las carpetas `modelos`, `datos` y `directivas`.
4. Reemplaza únicamente los archivos que la guía presenta completos.
5. Conserva `angular.json`, `tsconfig` y los demás archivos generados por Angular CLI.
6. Ejecuta `npm start` después de cada bloque importante y revisa la consola del navegador.

**Código 9. Estructura final**
```
lab-semana-07/
├─ package.json
├─ package-lock.json
├─ angular.json
├─ src/
│  ├─ index.html
│  ├─ main.ts
│  ├─ styles.css
│  └─ app/
│     ├─ app.config.ts
│     ├─ app.ts
│     ├─ app.html
│     ├─ app.css
│     ├─ app.spec.ts
│     ├─ datos/estudiantes.ts
│     ├─ directivas/resaltar-riesgo.directive.ts
│     └─ modelos/estudiante.ts
└─ public/favicon.ico
```

---

## 11. Implementación de `package.json`

Crea o reemplaza `package.json` con todos los bloques siguientes en el mismo orden. Cada bloque continúa el archivo anterior y no representa un archivo independiente.

**Código 10 y 11. package.json**
```json
{
  "name": "panel-academico",
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
    "@angular/common": "^22.1.0",
    "@angular/compiler": "^22.1.0",
    "@angular/core": "^22.1.0",
    "@angular/forms": "^22.1.0",
    "@angular/platform-browser": "^22.1.0",
    "@angular/router": "^22.1.0",
    "bootstrap": "5.3.8",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0"
  },
  "devDependencies": {
    "@angular/build": "^22.1.8",
    "@angular/cli": "^22.1.8",
    "@angular/compiler-cli": "^22.1.0",
    "jsdom": "^28.0.0",
    "prettier": "^3.8.1",
    "typescript": "~6.0.2",
    "vitest": "^4.0.8"
  }
}
```

Los scripts exponen `serve`, `build`, `test` y `verify` mediante npm. `verify` reproduce el control final. Angular y Bootstrap son dependencias de ejecución; CLI, build, compiler y Vitest son herramientas de desarrollo.

---

## 12. Implementación de documento inicial

Crea o reemplaza `src/index.html` con todos los bloques siguientes en el mismo orden.

**Código 12. src/index.html**
```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Panel de seguimiento académico</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

`lang="es"` mejora la interpretación del idioma y `app-root` es el punto donde Angular monta la aplicación.

---

## 13. Implementación de arranque y configuración

Crea o reemplaza `src/main.ts` con todos los bloques siguientes en el mismo orden.

**Código 13. src/main.ts**
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

`bootstrapApplication` inicia el componente raíz y registra una captura final de errores de arranque.

### 13.1 Implementación de configuración de aplicación

Crea o reemplaza `src/app/app.config.ts` con todos los bloques siguientes en el mismo orden.

**Código 14. src/app/app.config.ts**
```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners()],
};
```

`ApplicationConfig` centraliza proveedores globales. Esta semana solo se mantiene el manejador global generado.

---

## 14. Implementación de modelo `Estudiante`

Crea o reemplaza `src/app/modelos/estudiante.ts` con todos los bloques siguientes en el mismo orden.

**Código 15. src/app/modelos/estudiante.ts**
```typescript
export type EstadoAcademico = 'Destacado' | 'Aprobado' | 'En riesgo';

export interface Estudiante {
  readonly id: number;
  readonly nombre: string;
  readonly programa: string;
  readonly promedio: number;
  readonly asistencia: number;
}
```

La unión limita estados válidos y `readonly` evita reasignaciones accidentales desde TypeScript.

---

## 15. Implementación de datos iniciales

Crea o reemplaza `src/app/datos/estudiantes.ts` con todos los bloques siguientes en el mismo orden.

**Código 16, 17 y 18. src/app/datos/estudiantes.ts**
```typescript
import type { Estudiante } from '../modelos/estudiante';

export const ESTUDIANTES_INICIALES: readonly Estudiante[] = [
  {
    id: 101,
    nombre: 'Ana Torres',
    programa: 'Ingeniería de Software',
    promedio: 17.2,
    asistencia: 94,
  },
  {
    id: 102,
    nombre: 'Luis Ramírez',
    programa: 'Ingeniería de Sistemas',
    promedio: 10.4,
    asistencia: 72,
  },
  {
    id: 103,
    nombre: 'María Paredes',
    programa: 'Ingeniería de Software',
    promedio: 13.5,
    asistencia: 88,
  },
  {
    id: 104,
    nombre: 'Carlos Vega',
    programa: 'Ingeniería de Sistemas',
    promedio: 8.9,
    asistencia: 66,
  },
  {
    id: 105,
    nombre: 'Sofía Medina',
    programa: 'Ingeniería de Software',
    promedio: 18.1,
    asistencia: 97,
  },
  {
    id: 106,
    nombre: 'Diego Salas',
    programa: 'Ingeniería de Sistemas',
    promedio: 11.8,
    asistencia: 81,
  },
];
```

`import type` no genera JavaScript y la colección `readonly` comunica que los registros base no se mutan. Los casos cubren destacados, aprobados, riesgo, dos programas y porcentajes de asistencia diversos.

---

## 16. Implementación de directiva de atributo

Crea o reemplaza `src/app/directivas/resaltar-riesgo.directive.ts` con todos los bloques siguientes en el mismo orden.

**Código 19 y 20. src/app/directivas/resaltar-riesgo.directive.ts**
```typescript
import { computed, Directive, input } from '@angular/core';

@Directive({
  selector: '[appResaltarRiesgo]',
  standalone: true,
  host: {
    '[class.tarjeta-riesgo]': 'esRiesgo()',
    '[class.tarjeta-aprobado]': 'esAprobado()',
    '[class.tarjeta-destacado]': 'esDestacado()',
    '[attr.data-estado]': 'estado()',
  },
})
export class ResaltarRiesgoDirective {
  readonly promedio = input.required<number>({ alias: 'appResaltarRiesgo' });

  protected readonly esRiesgo = computed(() => this.promedio() < 11);
  protected readonly esAprobado = computed(() => this.promedio() >= 11 && this.promedio() < 14);
  protected readonly esDestacado = computed(() => this.promedio() >= 14);

  protected readonly estado = computed(() => {
    if (this.esDestacado()) return 'destacado';
    if (this.esAprobado()) return 'aprobado';
    return 'riesgo';
  });
}
```

El selector exige el atributo `appResaltarRiesgo` y la entrada requerida comparte ese nombre mediante alias. Los valores `computed` son excluyentes y `host` enlaza clases y un atributo de diagnóstico al elemento receptor.

---

## 17. Implementación de componente raíz

Crea o reemplaza `src/app/app.ts` con todos los bloques siguientes en el mismo orden.

**Código 21, 22, 23 y 24. src/app/app.ts**
```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ESTUDIANTES_INICIALES } from './datos/estudiantes';
import { ResaltarRiesgoDirective } from './directivas/resaltar-riesgo.directive';
import type { EstadoAcademico } from './modelos/estudiante';

type FiltroEstado = 'todos' | 'aprobados' | 'riesgo';

@Component({
  imports: [ResaltarRiesgoDirective],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly titulo = 'Panel de seguimiento académico';
  protected readonly estudiantes = signal(ESTUDIANTES_INICIALES);
  protected readonly filtroActivo = signal<FiltroEstado>('todos');

  protected readonly estudiantesVisibles = computed(() => {
    const filtro = this.filtroActivo();
    if (filtro === 'aprobados') {
      return this.estudiantes().filter((estudiante) => estudiante.promedio >= 11);
    }
    if (filtro === 'riesgo') {
      return this.estudiantes().filter((estudiante) => estudiante.promedio < 11);
    }
    return this.estudiantes();
  });

  protected readonly resumen = computed(() => {
    const estudiantes = this.estudiantes();
    const total = estudiantes.length;
    const aprobados = estudiantes.filter((estudiante) => estudiante.promedio >= 11).length;
    const enRiesgo = total - aprobados;
    const promedioGeneral = total
      ? estudiantes.reduce((suma, estudiante) => suma + estudiante.promedio, 0) / total
      : 0;

    return {
      total,
      aprobados,
      enRiesgo,
      promedioGeneral: Math.round((promedioGeneral + Number.EPSILON) * 100) / 100,
    } as const;
  });

  protected cambiarFiltro(filtro: FiltroEstado): void {
    this.filtroActivo.set(filtro);
  }

  protected simularListaVacia(): void {
    this.estudiantes.set([]);
  }

  protected restaurarDatos(): void {
    this.estudiantes.set(ESTUDIANTES_INICIALES);
    this.filtroActivo.set('todos');
  }

  protected estadoDe(promedio: number): EstadoAcademico {
    if (promedio >= 14) return 'Destacado';
    if (promedio >= 11) return 'Aprobado';
    return 'En riesgo';
  }

  protected porcentajeDe(promedio: number): number {
    return Math.max(0, Math.min(100, promedio * 5));
  }
}
```

El componente importa la directiva porque la plantilla la utiliza y adopta `OnPush`. Las señales conservan colección y filtro; `estudiantesVisibles` deriva una vista sin modificar el origen. `resumen` controla la colección vacía y redondea el promedio a dos decimales. Las acciones cambian señales; `estadoDe` y `porcentajeDe` producen valores de presentación acotados.

---

## 18. Implementación de plantilla

Crea o reemplaza `src/app/app.html` con todos los bloques siguientes en el mismo orden.

**Código 25 a 34. src/app/app.html**
```html
<a class="skip-link" href="#contenido">Saltar al contenido principal</a>

<header class="hero py-5">
  <div class="container py-3">
    <p class="eyebrow mb-2">JavaScript Avanzado · Semana 7</p>
    <h1 class="display-5 fw-bold mb-3">{{ titulo }}</h1>
    <p class="lead col-lg-8 mb-0">
      Consulta indicadores, filtra estudiantes y reconoce casos que requieren acompañamiento.
    </p>
  </div>
</header>

<main id="contenido" class="container py-5">
  <section aria-labelledby="titulo-resumen" class="mb-5">
    <div class="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
      <div>
        <p class="section-kicker mb-1">Resumen</p>
        <h2 id="titulo-resumen" class="h3 mb-0">Indicadores de la sección</h2>
      </div>
      <p class="text-secondary mb-0 align-self-lg-end" aria-live="polite">
        Mostrando {{ estudiantesVisibles().length }} de {{ resumen().total }} estudiantes
      </p>
    </div>

    @if (resumen().total > 0) {
      <div class="row g-3">
        <div class="col-6 col-lg-3">
          <div class="metric-card h-100">
            <span>Total</span>
            <strong>{{ resumen().total }}</strong>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="metric-card h-100">
            <span>Promedio general</span>
            <strong>{{ resumen().promedioGeneral }}</strong>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="metric-card h-100">
            <span>Aprobados</span>
            <strong class="text-success">{{ resumen().aprobados }}</strong>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="metric-card h-100">
            <span>En riesgo</span>
            <strong class="text-danger">{{ resumen().enRiesgo }}</strong>
          </div>
        </div>
      </div>
    } @else {
      <p class="empty-state mb-0">No existen datos para calcular indicadores.</p>
    }
  </section>

  <section aria-labelledby="titulo-listado">
    <div class="d-flex flex-column flex-xl-row justify-content-between gap-3 mb-4">
      <div>
        <p class="section-kicker mb-1">Detalle</p>
        <h2 id="titulo-listado" class="h3 mb-0">Estudiantes registrados</h2>
      </div>
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <div class="btn-group" role="group" aria-label="Filtrar estudiantes por estado">
          <button
            type="button"
            class="btn btn-outline-primary"
            [class.active]="filtroActivo() === 'todos'"
            [attr.aria-pressed]="filtroActivo() === 'todos'"
            (click)="cambiarFiltro('todos')"
          >
            Todos
          </button>
          <button
            type="button"
            class="btn btn-outline-primary"
            [class.active]="filtroActivo() === 'aprobados'"
            [attr.aria-pressed]="filtroActivo() === 'aprobados'"
            (click)="cambiarFiltro('aprobados')"
          >
            Aprobados
          </button>
          <button
            type="button"
            class="btn btn-outline-primary"
            [class.active]="filtroActivo() === 'riesgo'"
            [attr.aria-pressed]="filtroActivo() === 'riesgo'"
            (click)="cambiarFiltro('riesgo')"
          >
            En riesgo
          </button>
        </div>
        <button
          type="button"
          class="btn btn-outline-secondary"
          [disabled]="resumen().total === 0"
          (click)="simularListaVacia()"
        >
          Simular lista vacía
        </button>
        <button
          type="button"
          class="btn btn-dark"
          [disabled]="resumen().total > 0"
          (click)="restaurarDatos()"
        >
          Restaurar datos
        </button>
      </div>
    </div>

    <div class="row g-4">
      @for (estudiante of estudiantesVisibles(); track estudiante.id; let posicion = $index) {
        <div class="col-md-6 col-xl-4">
          <article class="tarjeta-estudiante h-100" [appResaltarRiesgo]="estudiante.promedio">
            <div class="d-flex justify-content-between gap-3 mb-3">
              <div>
                <span class="student-number">Registro {{ posicion + 1 }}</span>
                <h3 class="h5 mb-1">{{ estudiante.nombre }}</h3>
                <p class="text-secondary small mb-0">{{ estudiante.programa }}</p>
              </div>
              @switch (estadoDe(estudiante.promedio)) {
                @case ('Destacado') {
                  <span class="badge text-bg-success align-self-start">Destacado</span>
                }
                @case ('Aprobado') {
                  <span class="badge text-bg-primary align-self-start">Aprobado</span>
                }
                @default {
                  <span class="badge text-bg-danger align-self-start">En riesgo</span>
                }
              }
            </div>
            <dl class="row g-2 mb-3">
              <dt class="col-7">Promedio</dt>
              <dd class="col-5 text-end fw-semibold">{{ estudiante.promedio }} / 20</dd>
              <dt class="col-7">Asistencia</dt>
              <dd class="col-5 text-end fw-semibold">{{ estudiante.asistencia }} %</dd>
            </dl>
            <div
              class="progress"
              role="progressbar"
              aria-label="Avance del promedio sobre veinte"
              aria-valuemin="0"
              aria-valuemax="100"
              [attr.aria-valuenow]="porcentajeDe(estudiante.promedio)"
            >
              <div
                class="progress-bar"
                [class.bg-danger]="estudiante.promedio < 11"
                [class.bg-primary]="estudiante.promedio >= 11 && estudiante.promedio < 14"
                [class.bg-success]="estudiante.promedio >= 14"
                [style.width.%]="porcentajeDe(estudiante.promedio)"
              ></div>
            </div>
          </article>
        </div>
      } @empty {
        <div class="col-12">
          <p class="empty-state mb-0" role="status">
            No hay estudiantes que coincidan con la vista seleccionada.
          </p>
        </div>
      }
    </div>
  </section>
</main>

<footer class="border-top py-4">
  <div class="container text-secondary small">
    Laboratorio de Angular con componentes standalone y control de flujo moderno
  </div>
</footer>
```

El enlace para saltar al contenido y la jerarquía de encabezados facilitan navegación por teclado y lector. `@if` separa el resumen con datos del estado sin registros. Los filtros combinan clases visuales, eventos y `aria-pressed` para comunicar el estado. `@for` usa la identidad del estudiante y aplica la directiva a cada `article`. `@switch` selecciona una insignia con texto para no depender únicamente del color. La barra enlaza valor accesible, clases y ancho; `@empty` cubre cualquier lista visible vacía.

---

## 19. Implementación de estilos del componente

Crea o reemplaza `src/app/app.css` con todos los bloques siguientes en el mismo orden.

**Código 35 a 42. src/app/app.css**
```css
:host {
  display: block;
  min-height: 100vh;
  color: #172033;
  background: #f5f7fb;
}

.skip-link {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 1050;
  padding: 0.65rem 1rem;
  color: #fff;
  background: #111827;
  border-radius: 0.5rem;
  transform: translateY(-160%);
}

.skip-link:focus {
  transform: translateY(0);
}

.hero {
  color: #fff;
  background:
    radial-gradient(circle at 82% 10%, rgb(255 255 255 / 16%), transparent 28%),
    linear-gradient(125deg, #111827, #173d74 68%, #0b6b79);
}

.eyebrow,
.section-kicker {
  font-size: 0.77rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.eyebrow {
  color: #bdebf2;
}

.section-kicker {
  color: #315d9d;
}

.metric-card,
.tarjeta-estudiante,
.empty-state {
  background: #fff;
  border: 1px solid #dce3ee;
  border-radius: 1rem;
  box-shadow: 0 0.45rem 1.1rem rgb(29 47 76 / 7%);
}

.metric-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.25rem;
}

.metric-card span {
  color: #5f6b7d;
  font-size: 0.86rem;
}

.metric-card strong {
  font-size: 1.75rem;
  line-height: 1;
}

.tarjeta-estudiante {
  padding: 1.35rem;
  border-left: 0.36rem solid #94a3b8;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
}

.tarjeta-estudiante:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.75rem 1.4rem rgb(29 47 76 / 12%);
}

.tarjeta-estudiante.tarjeta-riesgo {
  border-left-color: #dc3545;
}

.tarjeta-estudiante.tarjeta-aprobado {
  border-left-color: #0d6efd;
}

.tarjeta-estudiante.tarjeta-destacado {
  border-left-color: #198754;
}

.student-number {
  display: block;
  margin-bottom: 0.2rem;
  color: #6b7280;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

dt,
dd {
  margin-bottom: 0;
}

dt {
  color: #5f6b7d;
  font-weight: 500;
}

.progress {
  height: 0.55rem;
  background: #e9eef5;
}

.empty-state {
  padding: 2rem;
  color: #5f6b7d;
  text-align: center;
  border-style: dashed;
  box-shadow: none;
}

.btn:focus-visible,
.skip-link:focus-visible {
  outline: 0.2rem solid #ffca2c;
  outline-offset: 0.18rem;
}

@media (prefers-reduced-motion: reduce) {
  .tarjeta-estudiante {
    transition: none;
  }
}
```

`:host` define el lienzo y `.skip-link` permanece fuera de la pantalla hasta recibir foco. El encabezado usa contraste alto y las tarjetas comparten borde, radio y sombra. Las clases que añade la directiva modifican el borde sin reemplazar la semántica textual. El foco visible y `prefers-reduced-motion` mejoran accesibilidad y respetan preferencias del usuario.

---

## 20. Implementación de estilos globales

Crea o reemplaza `src/styles.css` con todos los bloques siguientes en el mismo orden.

**Código 43. src/styles.css**
```css
@import 'bootstrap/dist/css/bootstrap.min.css';

html {
  color-scheme: light;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  font-family:
    Inter,
    Aptos,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  background: #f5f7fb;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}
```

Bootstrap se carga primero y las reglas globales definen la base tipográfica y el fondo.

### 20.1 Implementación de pruebas automatizadas

Crea o reemplaza `src/app/app.spec.ts` con todos los bloques siguientes en el mismo orden.

**Código 44, 45 y 46. src/app/app.spec.ts**
```typescript
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
```

`TestBed` crea el componente standalone sin un módulo de prueba adicional. La segunda prueba verifica contenido observable y cantidad de tarjetas. Los eventos reales de `click` comprueban filtrado, estado vacío y restauración.

---

## 21. Ejecución y verificación

Ejecuta los comandos desde la carpeta que contiene `package.json`. El servidor de desarrollo es para trabajo local; `build` genera una versión optimizada y `test:ci` ejecuta las pruebas una sola vez.

**Código 47. Ciclo de verificación**
```bash
npm start
npm run build
npm run test:ci
npm run verify
```

| Comprobación | Resultado esperado |
|---|---|
| Carga inicial | Seis tarjetas, total 6, aprobados 4, riesgo 2 y promedio general 13.32. |
| Filtro Aprobados | Se muestran cuatro tarjetas y `aria-pressed` cambia en el botón. |
| Filtro En riesgo | Se muestran Luis y Carlos con borde rojo. |
| Simular lista vacía | Indicadores alternativos y mensaje de colección vacía. |
| Restaurar datos | Regresan seis tarjetas y el filtro Todos. |
| Vista adaptable | Tres columnas amplias, dos medianas y una en pantalla pequeña. |
| `npm run build` | Finaliza correctamente y crea `dist/panel-academico`. |
| `npm run test:ci` | Un archivo de pruebas y cuatro casos aprobados. |
| `npm run verify` | Build y pruebas terminan sin errores. |

### 21.1 Matriz de pruebas manuales

| Caso | Acción | Resultado esperado |
|---|---|---|
| 1. Inicio | Abrir `localhost:4200` | Título, indicadores, seis tarjetas y pie visibles. |
| 2. Todos | Pulsar Todos | Seis estudiantes y botón marcado como presionado. |
| 3. Aprobados | Pulsar Aprobados | Cuatro estudiantes con promedio mayor o igual a 11. |
| 4. Riesgo | Pulsar En riesgo | Dos estudiantes y tarjetas con `data-estado="riesgo"`. |
| 5. Vacío | Pulsar Simular lista vacía | No hay tarjetas y aparecen ambos mensajes alternativos. |
| 6. Restauración | Pulsar Restaurar datos | Se recuperan seis estudiantes y filtro Todos. |
| 7. Teclado | Usar Tab y Enter | Todos los botones se alcanzan y activan. |
| 8. Foco | Recorrer controles con Tab | El foco visible usa contorno amarillo. |
| 9. Lectura | Inspeccionar progreso | Cada barra tiene etiqueta, mínimos, máximos y valor actual. |
| 10. Móvil | Reducir a 360 píxeles | No aparece desplazamiento horizontal. |
| 11. Recarga | Actualizar la página | La aplicación arranca sin errores de consola. |
| 12. Producción | Abrir `dist` mediante servidor estático | La interfaz conserva comportamiento y estilos. |
| 13. Pruebas | Ejecutar `npm run test:ci` | Cuatro pruebas y cero fallos. |
| 14. Verificación | Ejecutar `npm run verify` | Build y pruebas completan la secuencia. |

### 21.2 Depuración

1. Lee el primer error que informa Angular CLI y localiza archivo, línea y columna.
2. Revisa la consola del navegador para errores que solo aparecen durante la interacción.
3. Inspecciona en Angular DevTools los valores de `estudiantes`, `filtroActivo` y los `computed`.
4. Coloca un breakpoint en `cambiarFiltro` o `restaurarDatos` y repite la acción.
5. Usa el inspector para comprobar clases, `data-estado`, `aria-pressed` y ancho de la barra.
6. Ejecuta `npm run verify` antes de considerar concluido un cambio.

---

## 22. Errores frecuentes

| Síntoma | Causa probable | Corrección |
|---|---|---|
| `ng` no se reconoce | CLI global ausente o PATH incorrecto | Usa `npx` con la versión indicada. |
| Versión incompatible | Node.js anterior al mínimo | Selecciona Node.js 24 LTS y abre terminal nueva. |
| Puerto 4200 ocupado | Otro servidor sigue activo | Detén el proceso o usa `npm start -- --port 4201`. |
| Bootstrap no aparece | Importación ausente o paquete no instalado | Instala 5.3.8 y revisa `styles.css`. |
| No se puede enlazar directiva | Falta import en `Component` | Añade `ResaltarRiesgoDirective` a `imports`. |
| `Required input` sin valor | La directiva se usó sin promedio | Enlaza `appResaltarRiesgo` con un `number`. |
| Error de `@for` | Falta `track` o expresión inválida | Usa `track estudiante.id`. |
| La vista no cambia | Se reasignó fuera de la señal | Usa `set` o `update` sobre la señal. |
| Estilos no se aplican | Nombre de clase o encapsulación | Comprueba clase host y selector en `app.css`. |
| Prueba encuentra cero tarjetas | No se esperó estabilidad | Usa `await fixture.whenStable()`. |
| Build excede presupuesto | CSS o dependencia demasiado grande | Revisa tamaño antes de ampliar `budgets`. |
| `npm ci` falla | Lockfile y package.json no coinciden | Ejecuta `npm install` y conserva ambos cambios. |

---

## 23. Reto de extensión

Implementa dos mejoras y añade una prueba automatizada por cada comportamiento nuevo. No incorpores rutas ni formularios todavía.

| Nivel | Mejora | Condición de aceptación |
|---|---|---|
| 1 | Filtro Destacados | Muestra promedio mayor o igual a 14 y conserva `aria-pressed`. |
| 1 | Orden por promedio | Usa `toSorted` en `computed` sin mutar los datos iniciales. |
| 1 | Indicador de asistencia | Clasifica menor de 75 y añade texto además del color. |
| 2 | Directiva configurable | Recibe umbral requerido y aplica clases mediante host bindings. |
| 2 | Vista compacta | Cambia densidad con una señal y un enlace de clase. |
| 2 | Tema de alto contraste | Respeta contraste, foco visible y `prefers-reduced-motion`. |
| 3 | Componente de tarjeta | Extrae presentación con `input` requerido sin añadir navegación. |

> **Restricción:** El proyecto debe conservar tipado estricto, seguimiento estable en `@for`, accesibilidad por teclado y la aprobación de `npm run verify`.

---

## 24. Preguntas de reflexión

1. ¿Qué responsabilidad cumple Node.js si la aplicación final se ejecuta en el navegador?
2. ¿Qué ventaja ofrece un componente standalone para declarar dependencias de plantilla?
3. ¿Cuándo corresponde usar interpolación y cuándo `property binding`?
4. ¿Por qué `aria-pressed` se enlaza como atributo y no solo como clase visual?
5. ¿Qué diferencia existe entre una señal y un valor `computed`?
6. ¿Por qué `@for` requiere una expresión `track` estable?
7. ¿En qué se diferencia una directiva de atributo de un bloque de control integrado?
8. ¿Por qué Bootstrap se instala localmente en lugar de usar un CDN en este proyecto?
9. ¿Qué estados alternativos debe manejar una lista además del caso con datos?
10. ¿Qué partes de este panel podrán convertirse en componentes durante la semana 8?

> **Cierre:** La aplicación no manipula el DOM de forma imperativa. El estado cambia en TypeScript, la plantilla describe la representación y Angular sincroniza la vista.

---

## Fuentes de consulta

- Angular version compatibility
- Angular installation
- Angular CLI local setup
- Angular components
- Angular template binding
- Angular event listeners
- Angular control flow
- Angular attribute directives
- Angular signals
- Angular testing overview
- Angular CLI build
- Bootstrap introduction
- Bootstrap npm package