# Portal de talleres UTP — Semana 15
Proyecto independiente. Node 22.12+ y navegador moderno con AbortSignal.any.

1. npm install
2. npm test (pruebas API; también se puede ejecutar antes de instalar dependencias)
3. Terminal 1: npm run api
4. Terminal 2: npm run dev
5. Abrir http://127.0.0.1:5173
6. npm run build; con API activa: npm run preview (http://127.0.0.1:4173)

La API está en memoria. Reiniciar la API restablece 2, 3 y 4 cupos; recargar la SPA borra el último recibo de navegación. No emplear datos personales. El proxy de Vite es para desarrollo y vista previa, no para producción.

Verificación de entrega: ocho pruebas HTTP ejecutadas con Node 22.16.0; compilación completa y pruebas de navegador pendientes de instalar las dependencias npm en el equipo de laboratorio.
