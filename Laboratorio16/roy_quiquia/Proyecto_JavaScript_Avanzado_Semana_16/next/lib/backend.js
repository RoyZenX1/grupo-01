// Solo importar desde páginas servidor o Route Handlers.
export const apiBase = () =>
  process.env.API_BASE_URL || 'http://127.0.0.1:3001';
