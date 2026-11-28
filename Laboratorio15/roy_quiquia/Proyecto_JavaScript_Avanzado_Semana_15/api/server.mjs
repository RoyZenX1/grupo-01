import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

const seed = [
  { id: 'react', title: 'Interfaces con React', seats: 2 },
  { id: 'accesibilidad', title: 'Accesibilidad web', seats: 3 },
  { id: 'pruebas', title: 'Pruebas de interfaces', seats: 4 },
];

function send(res, status, body) {
  if (res.destroyed) return;
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let size = 0;
  const parts = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size <= 4096) parts.push(chunk);
  }
  if (size > 4096) return { status: 413 };
  try {
    return { value: JSON.parse(Buffer.concat(parts).toString('utf8')) };
  } catch { return { status: 400 }; }
}

export function createLabServer() {
  const workshops = structuredClone(seed);
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const route = url.pathname;
      if (!['/api/talleres', '/api/reservas'].includes(route)) {
        return send(res, 404, { message: 'Ruta desconocida' });
      }
      const allowed = route === '/api/talleres' ? 'GET' : 'POST';
      if (req.method !== allowed) {
        res.setHeader('Allow', allowed);
        return send(res, 405, { message: 'Método no permitido' });
      }
      if (allowed === 'GET') {
        const mode = url.searchParams.get('modo') ?? 'normal';
        await sleep(mode === 'agotado' ? 4700 : mode === 'lento' ? 1600 : 250);
        if (mode === 'error') return send(res, 503, { message: 'Fallo simulado' });
        if (mode === 'vacio') return send(res, 200, []);
        if (mode === 'invalido') return send(res, 200, [{ id: 'react', seats: '2' }]);
        return send(res, 200, workshops);
      }
      const media = req.headers['content-type']?.split(';')[0].trim().toLowerCase();
      if (media !== 'application/json') {
        return send(res, 415, { message: 'Usa application/json' });
      }
      const body = await readJson(req);
      if (body.status) return send(res, body.status, { message: 'Cuerpo inválido' });
      const data = body.value;
      if (!data || typeof data !== 'object' || Array.isArray(data) ||
          Object.keys(data).length !== 2 ||
          typeof data.workshopId !== 'string' || !data.workshopId.trim() ||
          !Number.isInteger(data.seats) || data.seats < 1 || data.seats > 4) {
        return send(res, 422, { message: 'Reserva inválida' });
      }
      const workshop = workshops.find(w => w.id === data.workshopId);
      if (!workshop) return send(res, 404, { message: 'Taller inexistente' });
      if (data.seats > workshop.seats) {
        return send(res, 409, { message: 'Cupo insuficiente' });
      }
      // No hay await entre la comprobación y el descuento.
      workshop.seats -= data.seats;
      return send(res, 201, {
        id: randomUUID(), workshopId: workshop.id,
        seats: data.seats, remaining: workshop.seats,
      });
    } catch { return send(res, 500, { message: 'Error interno' }); }
  });
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  createLabServer().listen(3001, '127.0.0.1', () => {
    console.log('API: http://127.0.0.1:3001');
  });
}
