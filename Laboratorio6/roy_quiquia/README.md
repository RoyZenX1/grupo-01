# Guía de Laboratorio 06
## Desarrollo con Node y TypeScript para aplicaciones de consola

**UTP | JavaScript Avanzado | Recurso de aprendizaje**

Entorno de ejecución, terminal, npm, módulos ES, tipado estricto, compilación, archivos JSON y pruebas con Node.js.

---

## Caso práctico: Analizador académico desde la terminal

Construirás una aplicación de línea de comandos que carga estudiantes desde JSON, valida datos desconocidos, calcula indicadores, filtra y ordena resultados, procesa argumentos y ejecuta pruebas automatizadas. El proyecto deja preparada la base de TypeScript que utilizarás en Angular.

---

## Ruta del laboratorio

La guía comienza con el entorno de ejecución y termina con una aplicación compilada, ejecutable y probada. Completa cada verificación antes de continuar.

| Bloque | Actividad | Evidencia |
|---|---|---|
| A | Instalar y verificar Node.js LTS | Versiones registradas |
| B | Explorar terminal, Node.js y npm | Comandos ejecutados |
| C | Comprender TypeScript y tipado estricto | Ejercicios explicados |
| D | Configurar proyecto y arquitectura | package.json y tsconfig.json |
| E | Implementar el analizador académico | Aplicación compilada |
| F | Probar, depurar y ampliar | Matriz y pruebas automáticas |

### Resultados de aprendizaje observables

- Diferencia navegador, Node.js, npm, TypeScript y el compilador `tsc`.
- Ejecuta JavaScript desde REPL, archivo, script npm y aplicación compilada.
- Configura `package.json`, `package-lock.json` y `tsconfig.json` con versiones reproducibles.
- Modela datos mediante tipos unión, interfaces, clases, `readonly` y tipos genéricos.
- Usa `unknown` y estrechamiento de tipos para validar JSON antes de construir objetos.
- Organiza módulos ES compatibles con NodeNext y separa dominio, infraestructura, servicio y CLI.
- Trabaja con APIs de Node.js para archivos, rutas, argumentos y códigos de salida.
- Compila, ejecuta, prueba y diagnostica errores de configuración o datos.

> **Decisión tecnológica:** Se usa TypeScript 6.0.x porque es la línea compatible con Angular 22, contenido que continúa en la semana 7.

---

## 1. Qué es Node.js

Node.js es un entorno de ejecución de JavaScript libre, multiplataforma y basado en V8. Permite crear servidores, herramientas de línea de comandos, automatizaciones y aplicaciones sin depender del navegador. No es un framework ni un lenguaje distinto.

| Aspecto | Navegador | Node.js |
|---|---|---|
| Contexto principal | Páginas y aplicaciones web | Servidor, terminal y automatización |
| APIs disponibles | DOM, eventos visuales, storage y red | Sistema de archivos, procesos, rutas, red y streams |
| Objeto global | `globalThis` y `window` | `globalThis`; `process` para el proceso |
| Módulos | ES modules | ES modules y CommonJS |
| Entrada | Interacción y red | Argumentos, archivos, variables de entorno y red |
| Salida | DOM, consola y red | Consola, archivos, códigos de salida y red |

**Código 1. Información del proceso**
```javascript
console.log(process.version);
console.log(process.platform);
console.log(process.cwd());
console.log(process.argv);
```

> **Importante:** Node.js ejecuta JavaScript; los tipos de TypeScript se eliminan antes de la ejecución o mediante el soporte limitado de type stripping. Los tipos no existen en tiempo de ejecución.

### 1.1 Modelo de ejecución

JavaScript ejecuta una tarea a la vez en el hilo principal, mientras Node.js coordina operaciones de entrada y salida sin bloquear mediante el event loop y APIs del sistema. Una lectura con `readFile` devuelve una `Promise`; `await` suspende la función asíncrona, no todo el proceso.

| Paso | Acción |
|---|---|
| 1 | El programa solicita leer el archivo JSON. |
| 2 | Node.js delega la operación de entrada y salida. |
| 3 | El event loop continúa atendiendo trabajo disponible. |
| 4 | Cuando finaliza la lectura, la Promise se resuelve. |
| 5 | La función reanuda, analiza el texto y valida los datos. |

---

## 2. Instalación y verificación

Instala Node.js 24 LTS desde el sitio oficial o mediante el gestor aprobado por tu institución. La línea LTS prioriza estabilidad. En septiembre de 2026, la portada oficial muestra Node.js 24.21.0 como *Latest LTS* y Node.js 26.9.0 como *Latest Release*.

1. Cierra Visual Studio Code y cualquier terminal abierta antes de instalar.
2. Descarga Node.js 24 LTS desde nodejs.org y conserva las opciones predeterminadas.
3. Abre una terminal nueva para actualizar PATH.
4. Ejecuta `node --version` y confirma una versión v24.x.
5. Ejecuta `npm --version` y confirma que el gestor responde.
6. Ejecuta `where node` en Windows o `which node` en Linux/macOS para comprobar la ruta usada.

**Código 2. Diagnóstico mínimo**
```bash
node --version
npm --version
node -p "process.execPath"
node -p "process.versions"
```

> **Evita conflictos:** No mezcles varias instalaciones de Node.js en PATH. Si el aula usa un gestor de versiones, selecciona explícitamente la línea 24 antes de iniciar el proyecto.

---

## 3. Ejecución desde la consola

La consola permite experimentar, ejecutar archivos y automatizar tareas. El REPL se abre con `node` y evalúa expresiones; se cierra con `.exit` o `Ctrl+D`. Para un proyecto real se trabaja con archivos y scripts reproducibles.

| Forma | Comando | Uso |
|---|---|---|
| REPL | `node` | Experimentos breves y comprobación de APIs. |
| Expresión | `node -p "1 + 2"` | Imprime el resultado de una expresión. |
| Código corto | `node -e "console.log('Hola')"` | Ejecuta una instrucción sin crear archivo. |
| Archivo JavaScript | `node archivo.js` | Ejecuta un módulo o script. |
| Script npm | `npm run build` | Ejecuta un comando documentado en package.json. |
| Argumentos | `npm start -- --top 3` | Transfiere opciones a `process.argv`. |

---

## 4. npm y el proyecto reproducible

npm administra dependencias y scripts. `package.json` describe el proyecto; `package-lock.json` registra el árbol exacto instalado; `node_modules` contiene copias locales y no debe editarse ni entregarse como código fuente.

| Elemento | Responsabilidad | Control de versiones |
|---|---|---|
| `package.json` | Metadatos, scripts, engines y dependencias directas. | Sí |
| `package-lock.json` | Versiones exactas e integridad del árbol. | Sí |
| `node_modules` | Paquetes instalados localmente. | No |
| `src` | Código TypeScript editable. | Sí |
| `dist` | JavaScript generado por `tsc`. | Según política; normalmente no |

| Comando | Efecto |
|---|---|
| `npm install` | Instala y actualiza el lockfile cuando corresponde. |
| `npm install -D paquete@versión` | Agrega una dependencia de desarrollo local y explícita. |
| `npm run nombre` | Ejecuta un script definido por el proyecto. |
| `npm ci` | Instala exactamente desde el lockfile y falla si no coincide con package.json. |
| `npm audit` | Informa vulnerabilidades conocidas; requiere interpretar alcance y correcciones. |

> **Buena práctica:** TypeScript se instala en el proyecto, no globalmente. Así todo el equipo y la integración continua utilizan la misma versión.

---

## 5. Qué aporta TypeScript

TypeScript amplía JavaScript con sintaxis para tipos y análisis estático. El editor y `tsc` detectan incompatibilidades antes de ejecutar, pero el resultado final sigue siendo JavaScript. El tipado reduce clases de errores; no valida automáticamente archivos, formularios ni respuestas externas.

**Código 3. Contrato de una función**
```typescript
function calcularPromedio(notas: readonly number[]): number {
  const suma = notas.reduce((total, nota) => total + nota, 0);
  return suma / notas.length;
}

calcularPromedio([15, 18, 17]);
// calcularPromedio(["15", "18"]); // error de tipos
```

| Concepto | Ejemplo | Propósito |
|---|---|---|
| Inferencia | `const cantidad = 3` | Deduce `number` sin anotación redundante. |
| Anotación | `nombre: string` | Declara un contrato cuando aporta claridad. |
| Unión | `'aprobado' \| 'riesgo'` | Limita valores posibles. |
| Interface | `interface EstudianteEntrada` | Describe la forma de un objeto. |
| readonly | `readonly notas` | Impide asignaciones accidentales durante el análisis. |
| Genérico | `ResultadoValidacion<T>` | Reutiliza una estructura preservando el tipo del valor. |
| unknown | `datos: unknown` | Obliga a comprobar antes de usar. |
| never | Rama imposible | Ayuda a comprobar exhaustividad. |

### 5.1 `unknown` frente a `any`

`any` desactiva comprobaciones y permite que el error avance. `unknown` representa un valor todavía no confiable: antes de leer propiedades se debe estrechar su tipo con `typeof`, `Array.isArray`, una comparación o una función de guarda.

**Código 4. Estrechamiento de un valor externo**
```typescript
function describir(valor: unknown): string {
  if (typeof valor === "string") {
    return valor.trim();
  }
  if (Array.isArray(valor)) {
    return `Arreglo con ${valor.length} elementos`;
  }
  return "Tipo no admitido";
}
```

> **Límite del tipado:** `JSON.parse` devuelve datos cuyo contenido no está garantizado. El proyecto conserva el valor como `unknown` y valida cada registro antes de crear una instancia.

---

## 6. Compilación y configuración estricta

`tsc` lee `tsconfig.json`, comprueba el programa completo y emite JavaScript en `dist`. El modo `strict` activa una familia de comprobaciones; `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes` hacen explícitos casos que suelen causar errores en entradas y arreglos.

| Opción | Efecto |
|---|---|
| `target: ES2023` | Define la sintaxis JavaScript emitida. |
| `module: NodeNext` | Modela la resolución moderna de módulos en Node.js. |
| `rootDir` y `outDir` | Separa `src` editable de `dist` generado. |
| `strict` | Activa comprobaciones estrictas coordinadas. |
| `noUncheckedIndexedAccess` | Un acceso por índice puede producir `undefined`. |
| `exactOptionalPropertyTypes` | Distingue ausencia de una propiedad y valor `undefined`. |
| `verbatimModuleSyntax` | Conserva importaciones según se escriben y exige `import type`. |
| `erasableSyntaxOnly` | Limita el código a sintaxis de tipos eliminable. |
| `sourceMap` | Relaciona errores de `dist` con líneas de `src`. |

**Código 5. Ciclo de construcción**
```bash
npm run typecheck # comprueba, no emite
npm run build      # limpia dist y compila
npm start          # ejecuta dist/index.js
npm test           # usa el runner de pruebas de Node.js
npm run verify     # ejecuta todas las verificaciones
```

### 6.1 Type stripping de Node.js

Node.js 24 incluye soporte estable para ejecutar TypeScript cuya sintaxis de tipos pueda borrarse. Sin embargo, ese mecanismo no comprueba tipos, ignora `tsconfig.json` y no transforma todas las características. Este laboratorio compila con `tsc` para que los errores de tipos detengan la construcción.

| Ruta | Ventaja | Limitación |
|---|---|---|
| `node archivo.ts` | Ejecución ligera en Node moderno. | Sin type checking ni tsconfig; sintaxis limitada. |
| `tsc` y `node dist` | Comprobación completa, configuración y salida distribuible. | Requiere un paso de compilación. |

---

## 7. Módulos ES con NodeNext

`package.json` declara `type: module`. Los archivos TypeScript importan rutas relativas con extensión `.js` porque esa será la extensión que Node.js ejecutará después de compilar. TypeScript resuelve la fuente `.ts` durante la comprobación.

**Código 6. Importaciones de valor y de tipo**
```typescript
import { Estudiante } from "../modelos/Estudiante.js";
import type { EstadoAcademico } from "../tipos.js";
// Estudiante existe en tiempo de ejecución.
// EstadoAcademico se elimina al compilar.
```

> **Error frecuente:** En proyectos NodeNext no elimines `.js` de las rutas relativas del código TypeScript. La extensión describe el archivo que existirá en `dist`.

---

## 8. Diseño del analizador académico

La aplicación recibe opciones desde la terminal, lee un archivo JSON, valida todos sus elementos, crea entidades, filtra y ordena resultados y finalmente imprime una tabla y un resumen. Si cualquier dato es inválido, termina con código de salida 1.

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Contratos | `src/tipos.ts` | Uniones, interfaces y resultado de validación. |
| Dominio | `src/modelos/Estudiante.ts` | Entidad y reglas calculadas. |
| Utilidades | `src/utilidades` | Validación y redondeo numérico. |
| Infraestructura | `src/infraestructura/repositorioJson.ts` | Lectura de archivo y conversión desde `unknown`. |
| Aplicación | `src/servicios/AnalizadorAcademico.ts` | Filtros, orden, resumen y programas. |
| Entrada | `src/cli/argumentos.ts` | Opciones de consola y ayuda. |
| Composición | `src/index.ts` | Conecta todas las piezas y controla errores. |
| Pruebas | `src/pruebas` | Verifica reglas sin acceder a red ni archivos. |

### 8.1 Algoritmo principal

**Código 7. Pseudocódigo**
```
leer argumentos de process.argv
si se solicitó ayuda
    imprimir opciones y finalizar correctamente
resolver la ruta del archivo
leer el contenido como texto de forma asíncrona
analizar JSON como unknown
validar todos los registros y la unicidad de códigos
crear instancias de Estudiante
aplicar filtros y ordenar sin mutar
mostrar tabla y resumen
si ocurre un error
    mostrar mensaje y establecer exitCode = 1
```

> **Propiedad de seguridad:** La carga es atómica: el repositorio no devuelve una colección parcial cuando uno de los registros es inválido.

---

## 9. Preparación del proyecto

1. Crea una carpeta llamada `lab-semana-06` y ábrela en Visual Studio Code.
2. Crea las carpetas `data`, `src/cli`, `src/infraestructura`, `src/modelos`, `src/pruebas`, `src/servicios` y `src/utilidades`.
3. Crea `package.json` y `tsconfig.json` con el contenido de esta guía.
4. Desde la raíz del proyecto ejecuta `npm install`.
5. Confirma que se crearon `node_modules` y `package-lock.json`.
6. No edites `package-lock.json` manualmente y no copies `node_modules` entre equipos.

| Carpeta | Contenido |
|---|---|
| `data` | Datos JSON de entrada. |
| `src` | Código fuente TypeScript. |
| `dist` | JavaScript y mapas generados por `tsc`; aparece después de build. |
| `node_modules` | Dependencias locales; aparece después de install. |

**Código 8. Comandos iniciales**
```bash
node --version
npm --version
npm install
npm run typecheck
npm run build
npm start
```

---

## 10. Implementación de `package.json`

Crea `package.json` y escribe todos los bloques en el orden mostrado. Los bloques pertenecen al mismo archivo.

**Código 9. package.json**
```json
{
  "name": "analizador-academico-cli",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=24 <25"
  },
  "scripts": {
    "clean": "node -e \"import('node:fs').then(({ rmSync }) => rmSync('dist', { recursive: true, force: true }))\"",
    "typecheck": "tsc --noEmit",
    "build": "npm run clean && tsc",
    "start": "node --enable-source-maps dist/index.js",
    "test": "node --test dist/pruebas/AnalizadorAcademico.test.js",
    "verify": "npm run typecheck && npm run build && npm test"
  },
  "devDependencies": {
    "@types/node": "24.13.5",
    "typescript": "6.0.3"
  }
}
```

`type: module` activa ESM; `engines` documenta la línea LTS requerida y `private` impide una publicación accidental.

---

## 11. Implementación de `tsconfig.json`

Crea `tsconfig.json` y escribe todos los bloques en el orden mostrado. Los bloques pertenecen al mismo archivo.

**Código 10. tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "useUnknownInCatchVariables": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "sourceMap": true,
    "types": ["node"],
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules"]
}
```

`target` y `NodeNext` modelan el entorno de ejecución; `rootDir` y `outDir` separan fuente y salida.

---

## 12. Implementación de datos JSON

Crea `data/estudiantes.json` y escribe todos los bloques en el orden mostrado. Los bloques pertenecen al mismo archivo.

**Código 11 y 12. data/estudiantes.json**
```json
[
  {
    "codigo": "U20260001",
    "nombre": "Ana María Pérez",
    "programa": "Ingeniería de Software",
    "notas": [16, 15, 17]
  },
  {
    "codigo": "U20260002",
    "nombre": "Luis Alberto Rojas",
    "programa": "Ingeniería de Sistemas",
    "notas": [11, 10, 12]
  },
  {
    "codigo": "U20260003",
    "nombre": "María José Salas",
    "programa": "Ingeniería de Software",
    "notas": [14, 13, 15]
  },
  {
    "codigo": "U20260004",
    "nombre": "Diego Núñez Torres",
    "programa": "Ingeniería de Sistemas",
    "notas": [8, 11, 9]
  },
  {
    "codigo": "U20260005",
    "nombre": "Sofía Ramos Díaz",
    "programa": "Ingeniería de Software",
    "notas": [20, 18, 19]
  },
  {
    "codigo": "U20260006",
    "nombre": "Carlos Medina León",
    "programa": "Ingeniería de Sistemas",
    "notas": [12, 12, 12]
  }
]
```

El archivo contiene objetos planos. JSON no admite comentarios, comas finales ni comportamiento de clases. Los casos cubren ambos programas, estudiantes aprobados, estudiantes en riesgo y la frontera exacta de 12.

---

## 13. Implementación de contratos

Crea `src/tipos.ts` y escribe todos los bloques en el orden mostrado. Los bloques pertenecen al mismo archivo.

**Código 13. src/tipos.ts**
```typescript
export type EstadoAcademico = "aprobado" | "riesgo";

export interface EstudianteEntrada {
  codigo: string;
  nombre: string;
  programa: string;
  notas: number[];
}

export interface FiltrosEstudiantes {
  estado?: EstadoAcademico;
  programa?: string;
  top?: number;
}

export interface ResumenAcademico {
  total: number;
  aprobados: number;
  riesgo: number;
  promedioGrupal: number;
}

export type ResultadoValidacion<T> =
  | { ok: true; valor: T }
  | { ok: false; errores: string[] };
```

La unión `EstadoAcademico` evita cadenas arbitrarias y las interfaces documentan la forma esperada.

---

## 14. Implementación de utilidad numérica

Crea `src/utilidades/numeros.ts` y escribe todos los bloques en el orden mostrado. Los bloques pertenecen al mismo archivo.

**Código 14. src/utilidades/numeros.ts**
```typescript
export function redondearDos(valor: number): number {
  const correccion = Number.EPSILON * Math.max(1, Math.abs(valor));
  return Math.round((valor + correccion) * 100) / 100;
}
```

La corrección proporcional con `Number.EPSILON` estabiliza casos como `10.165` antes del redondeo a dos decimales.

---

## 15. Implementación de modelo `Estudiante`

Crea `src/modelos/Estudiante.ts` y escribe todos los bloques en el orden mostrado. Los bloques pertenecen al mismo archivo.

**Código 15 y 16. src/modelos/Estudiante.ts**
```typescript
import type { EstadoAcademico, EstudianteEntrada } from "../tipos.js";
import { redondearDos } from "../utilidades/numeros.js";

export class Estudiante {
  readonly codigo: string;
  readonly nombre: string;
  readonly programa: string;
  readonly notas: readonly number[];

  constructor(datos: EstudianteEntrada) {
    this.codigo = datos.codigo;
    this.nombre = datos.nombre;
    this.programa = datos.programa;
    this.notas = [...datos.notas];
  }

  get promedio(): number {
    const suma = this.notas.reduce((total, nota) => total + nota, 0);
    return redondearDos(suma / this.notas.length);
  }

  get estado(): EstadoAcademico {
    return this.promedio >= 12 ? "aprobado" : "riesgo";
  }

  toRow(): Record<string, string | number> {
    return {
      Código: this.codigo,
      Estudiante: this.nombre,
      Programa: this.programa,
      Notas: this.notas.join(" / "),
      Promedio: this.promedio.toFixed(2),
      Estado: this.estado === "aprobado" ? "Aprobado" : "En riesgo"
    };
  }
}
```

`import type` se elimina al compilar; la función de redondeo sí se conserva porque se ejecuta. `readonly` limita reasignaciones desde TypeScript y el constructor copia notas para no conservar el arreglo recibido como alias.

---

## 16. Implementación de validación

Crea `src/utilidades/validacion.ts` y escribe todos los bloques en el orden mostrado. Los bloques pertenecen al mismo archivo.

**Código 17, 18 y 19. src/utilidades/validacion.ts**
```typescript
import type {
  EstudianteEntrada,
  ResultadoValidacion
} from "../tipos.js";

const PATRON_CODIGO = /^U\d{8}$/u;
const PATRON_NOMBRE = /^[\p{L}\p{M}]+(?:[ '\-][\p{L}\p{M}]+)+$/u;

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function textoNormalizado(valor: unknown): string {
  return typeof valor === "string" ? valor.trim().replace(/\s+/gu, " ") : "";
}

export function validarEstudiante(
  valor: unknown,
  posicion: number
): ResultadoValidacion<EstudianteEntrada> {
  if (!esObjeto(valor)) {
    return { ok: false, errores: [`Registro ${posicion}: debe ser un objeto.`] };
  }

  const codigo = textoNormalizado(valor.codigo).toUpperCase();
  const nombre = textoNormalizado(valor.nombre);
  const programa = textoNormalizado(valor.programa);
  const notas = valor.notas;
  const errores: string[] = [];

  if (!PATRON_CODIGO.test(codigo)) {
    errores.push(`Registro ${posicion}: código inválido.`);
  }
  if (!PATRON_NOMBRE.test(nombre) || nombre.length > 80) {
    errores.push(`Registro ${posicion}: nombre inválido.`);
  }
  if (programa.length < 3 || programa.length > 60) {
    errores.push(`Registro ${posicion}: programa inválido.`);
  }
  if (
    !Array.isArray(notas) ||
    notas.length !== 3 ||
    !notas.every(nota => typeof nota === "number" && Number.isFinite(nota) && nota >= 0 && nota <= 20)
  ) {
    errores.push(`Registro ${posicion}: se requieren tres notas entre 0 y 20.`);
  }

  if (errores.length > 0) return { ok: false, errores };

  return {
    ok: true,
    valor: {
      codigo,
      nombre,
      programa,
      notas: [...(notas as number[])]
    }
  };
}
```

La función normaliza solo cadenas; las notas conservan `unknown` hasta comprobar arreglo, longitud, tipo, finitud y rango. Los errores se acumulan y el valor tipado solo se construye cuando todas las reglas se cumplen.

---

## 17. Implementación de repositorio JSON

Crea `src/infraestructura/repositorioJson.ts` y escribe todos los bloques en el orden mostrado. Los bloques pertenecen al mismo archivo.

**Código 20 y 21. src/infraestructura/repositorioJson.ts**
```typescript
import { readFile } from "node:fs/promises";
import { Estudiante } from "../modelos/Estudiante.js";
import { validarEstudiante } from "../utilidades/validacion.js";

export async function cargarEstudiantes(ruta: string): Promise<Estudiante[]> {
  const contenido = await readFile(ruta, "utf8");
  let datos: unknown;

  try {
    datos = JSON.parse(contenido) as unknown;
  } catch (error: unknown) {
    const detalle = error instanceof Error ? error.message : String(error);
    throw new SyntaxError(`El archivo no contiene JSON válido: ${detalle}`);
  }

  if (!Array.isArray(datos)) {
    throw new TypeError("La raíz del archivo JSON debe ser un arreglo.");
  }

  const estudiantes: Estudiante[] = [];
  const errores: string[] = [];

  datos.forEach((registro, indice) => {
    const resultado = validarEstudiante(registro, indice + 1);
    if (resultado.ok) {
      estudiantes.push(new Estudiante(resultado.valor));
    } else {
      errores.push(...resultado.errores);
    }
  });

  const codigos = estudiantes.map(estudiante => estudiante.codigo);
  if (new Set(codigos).size !== codigos.length) {
    errores.push("Existen códigos duplicados en el archivo.");
  }

  if (errores.length > 0) {
    throw new TypeError(errores.join("\n"));
  }

  return estudiantes;
}
```

`readFile` pertenece a la API Promise de Node.js; el contenido entra como texto y `JSON.parse` se conserva como `unknown`. Cada elemento se valida antes de crear `Estudiante` y los errores de todos los registros se consolidan.

---

## 18. Implementación de servicio de análisis

Crea `src/servicios/AnalizadorAcademico.ts` y escribe todos los bloques en el orden mostrado. Los bloques pertenecen al mismo archivo.

**Código 22, 23 y 24. src/servicios/AnalizadorAcademico.ts**
```typescript
import { Estudiante } from "../modelos/Estudiante.js";
import type {
  FiltrosEstudiantes,
  ResumenAcademico
} from "../tipos.js";
import { redondearDos } from "../utilidades/numeros.js";

const comparador = new Intl.Collator("es-PE", { sensitivity: "base" });

function normalizarBusqueda(valor: string): string {
  return valor.trim().toLocaleLowerCase("es-PE");
}

export class AnalizadorAcademico {
  readonly #estudiantes: readonly Estudiante[];

  constructor(estudiantes: readonly Estudiante[]) {
    this.#estudiantes = [...estudiantes];
  }

  filtrar(filtros: FiltrosEstudiantes = {}): Estudiante[] {
    const programa = filtros.programa
      ? normalizarBusqueda(filtros.programa)
      : undefined;

    const encontrados = this.#estudiantes.filter(estudiante => {
      const coincideEstado = filtros.estado === undefined || estudiante.estado === filtros.estado;
      const coincidePrograma = programa === undefined ||
        normalizarBusqueda(estudiante.programa).includes(programa);
      return coincideEstado && coincidePrograma;
    });

    const ordenados = encontrados.toSorted((a, b) =>
      b.promedio - a.promedio || comparador.compare(a.nombre, b.nombre)
    );

    return filtros.top === undefined
      ? ordenados
      : ordenados.slice(0, filtros.top);
  }

  resumir(estudiantes: readonly Estudiante[] = this.#estudiantes): ResumenAcademico {
    const base = estudiantes.reduce((acumulado, estudiante) => ({
      total: acumulado.total + 1,
      aprobados: acumulado.aprobados + (estudiante.estado === "aprobado" ? 1 : 0),
      riesgo: acumulado.riesgo + (estudiante.estado === "riesgo" ? 1 : 0),
      sumaPromedios: acumulado.sumaPromedios + estudiante.promedio
    }), { total: 0, aprobados: 0, riesgo: 0, sumaPromedios: 0 });

    return {
      total: base.total,
      aprobados: base.aprobados,
      riesgo: base.riesgo,
      promedioGrupal: base.total === 0
        ? 0
        : redondearDos(base.sumaPromedios / base.total)
    };
  }

  programas(): string[] {
    return [...new Set(this.#estudiantes.map(estudiante => estudiante.programa))]
      .toSorted(comparador.compare);
  }
}
```

El constructor copia la colección y el campo privado impide acceso directo desde otras clases. `filtrar` combina condiciones opcionales y `toSorted` produce una vista ordenada sin mutar la fuente. `resumir` usa `reduce` con acumulador explícito y controla el conjunto vacío antes de dividir.

---

## 19. Implementación de argumentos de consola

Crea `src/cli/argumentos.ts` y escribe todos los bloques en el orden mostrado. Los bloques pertenecen al mismo archivo.

**Código 25, 26, 27 y 28. src/cli/argumentos.ts**
```typescript
import type {
  EstadoAcademico,
  FiltrosEstudiantes
} from "../tipos.js";

export interface OpcionesCli {
  archivo: string;
  ayuda: boolean;
  filtros: FiltrosEstudiantes;
}

function valorSiguiente(argumentos: readonly string[], indice: number, opcion: string): string {
  const valor = argumentos[indice + 1];
  if (valor === undefined || valor.startsWith("--")) {
    throw new TypeError(`Falta el valor de ${opcion}.`);
  }
  return valor;
}

export function analizarArgumentos(argumentos: readonly string[]): OpcionesCli {
  let archivo = "data/estudiantes.json";
  let ayuda = false;
  const filtros: FiltrosEstudiantes = {};

  for (let indice = 0; indice < argumentos.length; indice += 1) {
    const argumento = argumentos[indice];
    if (argumento === undefined) continue;

    switch (argumento) {
      case "--archivo":
        archivo = valorSiguiente(argumentos, indice, argumento);
        indice += 1;
        break;
      case "--estado": {
        const estado = valorSiguiente(argumentos, indice, argumento).toLocaleLowerCase("es-PE");
        if (estado !== "aprobado" && estado !== "riesgo") {
          throw new TypeError("--estado debe ser aprobado o riesgo.");
        }
        filtros.estado = estado satisfies EstadoAcademico;
        indice += 1;
        break;
      }
      case "--programa":
        filtros.programa = valorSiguiente(argumentos, indice, argumento);
        indice += 1;
        break;
      case "--top": {
        const top = Number(valorSiguiente(argumentos, indice, argumento));
        if (!Number.isInteger(top) || top <= 0) {
          throw new TypeError("--top debe ser un entero positivo.");
        }
        filtros.top = top;
        indice += 1;
        break;
      }
      case "--ayuda":
      case "-h":
        ayuda = true;
        break;
      default:
        throw new TypeError(`Opción desconocida: ${argumento}.`);
    }
  }

  return { archivo, ayuda, filtros };
}

export function obtenerAyuda(): string {
  return `Analizador académico

Uso:
  npm start -- [opciones]

Opciones:
  --archivo <ruta>    Archivo JSON de entrada
  --estado <valor>    aprobado | riesgo
  --programa <texto>  Coincidencia parcial de programa
  --top <cantidad>    Limita resultados ya ordenados
  --ayuda, -h         Muestra esta ayuda

Ejemplos:
  npm start
  npm start -- --estado riesgo
  npm start -- --programa "Ingeniería de Software" --top 2`;
}
```

`OpcionesCli` separa la ubicación del archivo, la ayuda y los filtros que entiende el servicio. `valorSiguiente` comprueba ausencia y evita interpretar otra bandera como valor. El `switch` consume opciones una por una y valida `estado` y `top` antes de construir la configuración. `satisfies` confirma el contrato literal sin convertir el valor a un tipo más amplio.

---

## 19.1 Implementación de punto de entrada

Crea `src/index.ts` y escribe todos los bloques en el orden mostrado. Los bloques pertenecen al mismo archivo.

**Código 29 y 30. src/index.ts**
```typescript
import { resolve } from "node:path";
import { analizarArgumentos, obtenerAyuda } from "./cli/argumentos.js";
import { cargarEstudiantes } from "./infraestructura/repositorioJson.js";
import { AnalizadorAcademico } from "./servicios/AnalizadorAcademico.js";

async function main(): Promise<void> {
  const opciones = analizarArgumentos(process.argv.slice(2));

  if (opciones.ayuda) {
    console.log(obtenerAyuda());
    return;
  }

  const ruta = resolve(opciones.archivo);
  const estudiantes = await cargarEstudiantes(ruta);
  const analizador = new AnalizadorAcademico(estudiantes);
  const encontrados = analizador.filtrar(opciones.filtros);
  const resumen = analizador.resumir(encontrados);

  console.log(`\nArchivo: ${ruta}`);
  console.log(`Programas disponibles: ${analizador.programas().join(" | ")}\n`);

  if (encontrados.length === 0) {
    console.log("No se encontraron estudiantes con los filtros indicados.");
  } else {
    console.table(encontrados.map(estudiante => estudiante.toRow()));
  }

  console.log("Resumen de los resultados visibles:");
  console.log(`  Total: ${resumen.total}`);
  console.log(`  Aprobados: ${resumen.aprobados}`);
  console.log(`  En riesgo: ${resumen.riesgo}`);
  console.log(`  Promedio grupal: ${resumen.promedioGrupal.toFixed(2)}`);
}

main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`\nError: ${mensaje}`);
  process.exitCode = 1;
});
```

`main` orquesta componentes sin contener reglas de validación, filtrado o cálculo. `resolve` convierte la ruta a absoluta; `console.table` presenta los registros y el resumen describe solo la vista filtrada.

---

## 19.2 Implementación de pruebas automatizadas

Crea `src/pruebas/AnalizadorAcademico.test.ts` y escribe todos los bloques en el orden mostrado. Los bloques pertenecen al mismo archivo.

**Código 31, 32 y 33. src/pruebas/AnalizadorAcademico.test.ts**
```typescript
import assert from "node:assert/strict";
import test from "node:test";
import { Estudiante } from "../modelos/Estudiante.js";
import { AnalizadorAcademico } from "../servicios/AnalizadorAcademico.js";
import { redondearDos } from "../utilidades/numeros.js";

const estudiantes = [
  new Estudiante({
    codigo: "U20260001",
    nombre: "Ana Pérez",
    programa: "Ingeniería de Software",
    notas: [16, 15, 17]
  }),
  new Estudiante({
    codigo: "U20260002",
    nombre: "Luis Rojas",
    programa: "Ingeniería de Sistemas",
    notas: [10, 11, 12]
  }),
  new Estudiante({
    codigo: "U20260003",
    nombre: "María Salas",
    programa: "Ingeniería de Software",
    notas: [12, 12, 12]
  })
];

test("calcula el resumen académico", () => {
  const analizador = new AnalizadorAcademico(estudiantes);
  assert.deepEqual(analizador.resumir(), {
    total: 3,
    aprobados: 2,
    riesgo: 1,
    promedioGrupal: 13
  });
});

test("combina filtros y ordena por promedio descendente", () => {
  const analizador = new AnalizadorAcademico(estudiantes);
  const resultado = analizador.filtrar({
    programa: "software",
    estado: "aprobado",
    top: 1
  });
  assert.equal(resultado.length, 1);
  assert.equal(resultado[0]?.codigo, "U20260001");
});

test("devuelve una lista vacía cuando no hay coincidencias", () => {
  const analizador = new AnalizadorAcademico(estudiantes);
  assert.deepEqual(analizador.filtrar({ programa: "Diseño" }), []);
});

test("redondea un caso sensible a la representación binaria", () => {
  assert.equal(redondearDos(10.165), 10.17);
});
```

`node:test` y `node:assert/strict` son módulos incorporados; no se agrega un framework de pruebas externo. Los datos controlados permiten verificar resumen, filtrado, orden y ausencia de coincidencias. El caso `10.165` demuestra una frontera numérica que fallaría con un redondeo ingenuo.

---

## 20. Compilación y ejecución

Ejecuta los comandos desde la carpeta que contiene `package.json`. Si `typecheck` falla, corrige el primer error antes de continuar; los errores posteriores pueden ser consecuencia del primero.

**Código 34. Verificación completa**
```bash
npm run typecheck
npm run build
npm start
npm start -- --estado riesgo
npm start -- --programa "Ingeniería de Software" --top 2
npm start -- --ayuda
npm test
npm run verify
```

| Comando | Resultado esperado |
|---|---|
| `npm run typecheck` | Finaliza sin emitir archivos ni mostrar errores. |
| `npm run build` | Crea `dist` con JavaScript y archivos `.map`. |
| `npm start` | Muestra 6 estudiantes, 4 aprobados, 2 en riesgo y promedio 13.56. |
| `--estado riesgo` | Muestra 2 estudiantes y promedio visible 10.17. |
| `--programa ... --top 2` | Muestra a Sofía y Ana, ordenadas por promedio. |
| `npm test` | Ejecuta 4 pruebas y reporta 4 aprobadas. |
| `npm run verify` | Comprueba tipos, compila y prueba en una sola secuencia. |

### 20.1 Matriz de pruebas manuales

| Caso | Preparación o comando | Resultado esperado |
|---|---|---|
| 1. Base | `npm start` | 6 filas; resumen general correcto. |
| 2. Riesgo | `--estado riesgo` | Luis y Diego; promedio 10.17. |
| 3. Aprobado | `--estado aprobado` | 4 estudiantes. |
| 4. Programa parcial | `--programa software` | 3 estudiantes de Software. |
| 5. Top | `--top 1` | Solo Sofía, promedio 19.00. |
| 6. Combinación | `--programa sistemas --estado aprobado` | Solo Carlos. |
| 7. Sin resultados | `--programa Diseño` | Mensaje de lista vacía; resumen en cero. |
| 8. Estado inválido | `--estado observación` | Mensaje y exit code 1. |
| 9. Top inválido | `--top 0` | Mensaje de entero positivo. |
| 10. Opción desconocida | `--orden nombre` | Mensaje de opción desconocida. |
| 11. Archivo ausente | `--archivo data/no-existe.json` | Error del sistema de archivos controlado. |
| 12. JSON roto | Eliminar una coma en una copia | Mensaje de JSON inválido. |
| 13. Raíz incorrecta | Reemplazar el arreglo por un objeto | Mensaje de raíz tipo arreglo. |
| 14. Nota fuera de rango | Cambiar una nota a 21 | Registro rechazado. |
| 15. Código duplicado | Duplicar U20260001 | Colección completa rechazada. |
| 16. Código normalizado | Usar `u20260007` válido | Se transforma a mayúsculas. |
| 17. Build limpio | Crear basura en `dist` y ejecutar `build` | `clean` elimina y `tsc` reconstruye. |
| 18. Pruebas | `npm test` | 4 tests, 0 fallos. |

### 20.2 Depuración

1. Lee el primer diagnóstico de `tsc` y ubica archivo, línea y columna.
2. Coloca un breakpoint en `analizarArgumentos`, `cargarEstudiantes` o `filtrar`.
3. Inspecciona `process.argv.slice(2)`, el valor `unknown` de JSON y el resultado discriminado.
4. Compara `src` con `dist` solo para comprender la transformación; corrige siempre `src`.
5. Repite `npm run verify` después de cada corrección relevante.

---

## 21. Errores frecuentes

| Síntoma | Causa probable | Corrección |
|---|---|---|
| `node` no se reconoce | PATH no actualizado o instalación incompleta | Abre terminal nueva y verifica la ruta de Node. |
| `npm` no se reconoce | Instalación de Node incompleta | Reinstala Node.js 24 LTS desde la fuente oficial. |
| `Cannot find module` | Ruta, mayúsculas o extensión incorrectas | Comprueba la ruta relativa y conserva `.js`. |
| `Cannot use import` | Falta `type: module` | Revisa `package.json` y vuelve a compilar. |
| `tsc` no se reconoce | Se invocó globalmente | Usa `npm run typecheck` o `npm run build`. |
| `Cannot find name process` | Faltan tipos de Node | Instala `@types/node` y conserva `types: ["node"]`. |
| `Object is possibly undefined` | Acceso por índice no comprobado | Estrecha el valor antes de usarlo. |
| `Type unknown` | Dato externo aún no validado | Aplica guarda y estrechamiento; no uses `any`. |
| JSON válido pero rechazado | La estructura incumple reglas | Revisa forma, tipos, rangos y duplicados. |
| Se ejecuta código antiguo | `dist` no se reconstruyó | Ejecuta `npm run build` antes de `start`. |
| `npm ci` falla | Lockfile no coincide | Ejecuta `npm install`, revisa y confirma ambos archivos. |

---

## 22. Reto de extensión

Implementa dos mejoras sin debilitar el tipado y añade al menos una prueba automática por mejora.

| Nivel | Mejora | Condición de aceptación |
|---|---|---|
| 1 | Filtro `--min-promedio` | Acepta 0 a 20, combina filtros y rechaza valores inválidos. |
| 1 | Orden configurable | `--orden nombre` o `promedio` con unión literal y comparación exhaustiva. |
| 2 | Exportar reporte | Escribe `reportes/resumen.json` con `node:fs/promises` y datos derivados. |
| 2 | Conteo por programa | Devuelve `Map` o `Record` tipado y lo presenta con `console.table`. |
| 2 | Validación de correo | Amplía contrato, datos, validación y pruebas sin usar `any`. |
| 3 | Formato CSV | Selecciona parser por extensión y conserva el mismo contrato de dominio. |

> **Restricción:** El proyecto debe continuar aprobando `npm run verify` y los datos inválidos no pueden producir resultados parciales.

---

## 23. Preguntas de reflexión

1. ¿Por qué Node.js no debe describirse como framework?
2. ¿Qué diferencia existe entre comprobar tipos y validar datos en tiempo de ejecución?
3. ¿Por qué `JSON.parse` se mantiene como `unknown` antes de usar sus propiedades?
4. ¿Qué problema evita instalar TypeScript localmente y fijar su versión?
5. ¿Cuál es la diferencia práctica entre `npm install` y `npm ci`?
6. ¿Por qué las importaciones TypeScript contienen `.js` en un proyecto NodeNext?
7. ¿Qué información se elimina al compilar y qué código permanece?
8. ¿Qué efecto tiene `process.exitCode = 1` para otra herramienta o servidor de integración?
9. ¿Por qué el repositorio valida todos los registros antes de devolver estudiantes?
10. ¿Qué parte de esta arquitectura podrá reutilizarse en un servicio Angular?

> **Cierre:** La calidad del proyecto proviene de combinar contratos estáticos, validación de datos reales, responsabilidades claras y una verificación automatizada reproducible.

---

## Fuentes de consulta

- Node.js — sitio oficial y versiones
- Node.js — Modules TypeScript
- Node.js — ECMAScript modules
- Node.js — File system promises
- Node.js — Test runner
- TypeScript Handbook
- TypeScript 6.0
- TypeScript tsconfig strict
- TypeScript Modules Theory
- npm package.json
- npm ci
- Angular version compatibility