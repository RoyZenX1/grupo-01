# Analizador Académico CLI

Aplicación de línea de comandos construida con **Node.js 24 LTS** y **TypeScript 6** (modo estricto) que carga estudiantes desde un archivo JSON, valida cada registro, calcula indicadores académicos, permite filtrar y ordenar resultados, y ejecuta pruebas automatizadas con el test runner nativo de Node.

## Características

- Lectura asíncrona de datos desde `data/estudiantes.json`.
- Validación estricta de cada registro (`unknown` → tipo estrechado) antes de construir entidades.
- Carga atómica: si un registro es inválido, no se devuelve una colección parcial.
- Cálculo de promedio, estado (`aprobado` / `riesgo`) y resumen grupal.
- Filtros combinables por estado, programa y cantidad (`--top`), con orden por promedio descendente.
- Manejo de argumentos de consola con mensajes de ayuda (`--ayuda`, `-h`).
- Pruebas unitarias con `node:test` y `node:assert/strict`.
- Módulos ES (`NodeNext`) y `tsconfig.json` con `strict`, `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`.

## Estructura del proyecto

```
lab-semana-06/
├── data/
│   └── estudiantes.json          # Datos de entrada
├── src/
│   ├── tipos.ts                  # Contratos: uniones, interfaces, ResultadoValidacion<T>
│   ├── modelos/
│   │   └── Estudiante.ts         # Entidad de dominio y reglas calculadas
│   ├── utilidades/
│   │   ├── numeros.ts            # Redondeo numérico estable
│   │   └── validacion.ts         # Validación de datos externos (unknown)
│   ├── infraestructura/
│   │   └── repositorioJson.ts    # Lectura de archivo y conversión desde unknown
│   ├── servicios/
│   │   └── AnalizadorAcademico.ts # Filtros, orden y resumen
│   ├── cli/
│   │   └── argumentos.ts         # Parseo de opciones de consola
│   ├── pruebas/
│   │   └── AnalizadorAcademico.test.ts
│   └── index.ts                  # Punto de entrada (composición)
├── package.json
└── tsconfig.json
```

## Requisitos

- Node.js `>=24 <25`
- npm (incluido con Node.js)

## Instalación

```bash
npm install
```

## Scripts disponibles

| Comando              | Descripción                                              |
|-----------------------|-----------------------------------------------------------|
| `npm run typecheck`  | Comprueba tipos sin emitir archivos.                      |
| `npm run build`      | Limpia `dist` y compila con `tsc`.                        |
| `npm start`          | Ejecuta `dist/index.js`.                                   |
| `npm test`           | Ejecuta las pruebas automatizadas.                         |
| `npm run verify`     | Ejecuta typecheck + build + test en una sola secuencia.    |

## Uso

```bash
npm run build

npm start
npm start -- --estado riesgo
npm start -- --programa "Ingeniería de Software" --top 2
npm start -- --ayuda
```

### Opciones de la CLI

| Opción              | Descripción                                  |
|----------------------|-----------------------------------------------|
| `--archivo <ruta>`  | Archivo JSON de entrada (por defecto `data/estudiantes.json`). |
| `--estado <valor>`  | Filtra por `aprobado` o `riesgo`.              |
| `--programa <texto>`| Coincidencia parcial de programa.             |
| `--top <cantidad>`  | Limita los resultados ya ordenados.           |
| `--ayuda`, `-h`     | Muestra el mensaje de ayuda.                  |

## Reglas de validación

Cada registro del JSON debe cumplir:

- `codigo`: formato `U` seguido de 8 dígitos (ej. `U20260001`).
- `nombre`: solo letras, espacios, apóstrofos o guiones, con al menos dos palabras.
- `programa`: texto entre 3 y 60 caracteres.
- `notas`: arreglo de exactamente 3 números finitos entre 0 y 20.
- `codigo` único en todo el archivo.

Un estudiante es **aprobado** si su promedio es `>= 12`; en caso contrario queda en **riesgo**.

## Pruebas

```bash
npm test
```

Verifica el cálculo del resumen, la combinación de filtros con orden descendente, el caso sin coincidencias y el redondeo de casos sensibles (ej. `10.165 → 10.17`).

## Notas técnicas

- El proyecto usa módulos ES (`"type": "module"`) con resolución `NodeNext`; por eso las importaciones relativas en `.ts` terminan en `.js` (la extensión que tendrán los archivos compilados en `dist`).
- `unknown` se usa para cualquier dato externo (salida de `JSON.parse`) hasta que se valida y estrecha su tipo; nunca se usa `any`.
- La compilación se hace con `tsc` (no con el *type stripping* de Node) para que los errores de tipos detengan la construcción.