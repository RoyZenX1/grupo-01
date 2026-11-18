# Portal de talleres React

Laboratorio de la semana 12 de JavaScript Avanzado. Usa datos ficticios y una operación asíncrona
local. No envía HTTP ni guarda inscripciones.

## Requisitos y ejecución

Node.js 24 LTS actualizado. Las dependencias están fijadas en package.json y package-lock.json.

1. Ejecuta `npm ci` en una copia con el archivo de bloqueo.
2. Ejecuta `npm run dev` y abre la URL que indique Vite.
3. Abre el catálogo, un detalle y la inscripción del equipo.
4. Completa la coordinación, presupuesto 0, un participante y aceptación.
5. Envía y comprueba la confirmación y el objeto JSON.
6. Ejecuta `npm run verify` para build y pruebas.

## Escenarios

- `/inscripcion/react` admite de 1 a 4 participantes.
- Modalidad presencial exige aula; virtual excluye el aula del payload.
- Los correos de participantes no pueden repetirse tras normalizarlos.
- Un correo de coordinación terminado en `@fallo.test` provoca un fallo local recuperable.
- El presupuesto usa punto decimal, entre 0 y 5000, con hasta dos decimales.
- Salir de la ruta pierde los datos no enviados; recargar elimina la última confirmación.
- Para publicar con BrowserRouter, configura el servidor para devolver index.html en rutas de la SPA.

No incluir node_modules ni dist en la entrega. En producción harían falta servidor, validación
independiente, controles de acceso, persistencia e idempotencia.