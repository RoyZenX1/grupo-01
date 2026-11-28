# Semana 16 — Vue.js y Next.js
Node.js 22.12+ (o LTS compatible), npm, tres terminales.
Desde la raíz: `node --test api/server.test.mjs tests/http.test.mjs`.
Terminal 1: `node api/server.mjs`.
Terminal 2: `cd vue`, `npm install`, `npm run dev` (http://127.0.0.1:5173).
Terminal 3: `cd next`, `npm install`, `npm run dev` (http://127.0.0.1:3000).
Opcional: copiar next/.env.example a next/.env.local para configurar API_BASE_URL.
Ambas aplicaciones consultan la misma instancia. Reiniciar la API recupera los cupos.
Construir: detener cada servidor de desarrollo, en vue ejecutar `npm run build` y `npm run preview` (4173); en next `npm run build` y `npm start` (3000). Mantener la API activa.
El código de la API proviene de la semana 15. No hay persistencia ni autenticación. No publicar esta API de laboratorio en Internet. No repetir automáticamente un POST tras un error de red.
Versiones mayores seleccionadas: Vue 3, Vite 7, Next 16 y React 19.2; npm resuelve parches compatibles. Conservar package-lock.json una vez generado y utilizar npm ci en otras máquinas. No se incluyen node_modules ni lockfiles no verificados.
