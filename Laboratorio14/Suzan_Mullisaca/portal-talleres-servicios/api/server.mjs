import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';

const seed = [
  { id: 'react', title: 'Interfaces con React', seats: 2 },
  { id: 'accesibilidad', title: 'Accesibilidad web', seats: 3 },
  { id: 'pruebas', title: 'Pruebas de interfaces', seats: 4 },
];

const inputSchema = z.strictObject({
  workshopId: z.string().min(1),
  seats: z.number().int().min(1).max(4),
});

function send(res, status, body) {
  if (res.destroyed) return;
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let bytes = 0;
  const parts = [];

  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes <= 4096) parts.push(chunk);
  }

  if (bytes > 4096) return { status: 413 };

  try {
    return {
      value: JSON.parse(Buffer.concat(parts).toString('utf8')),
    };
  } catch {
    return { status: 400 };
  }
}

export function createLabServer() {
  const workshops = structuredClone(seed);

  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const { pathname } = url;

      if (
        pathname !== '/api/talleres' &&
        pathname !== '/api/reservas'
      ) {
        return send(res, 404, {
          message: 'Ruta desconocida.',
        });
      }

      const allowed =
        pathname === '/api/talleres' ? 'GET' : 'POST';

      if (req.method !== allowed) {
        res.setHeader('Allow', allowed);
        return send(res, 405, {
          message: 'Método no permitido.',
        });
      }

      if (allowed === 'GET') {
        const mode = url.searchParams.get('modo') ?? 'normal';

        const delay =
          mode === 'agotado' ? 4700 :
          mode === 'lento' ? 1600 :
          250;

        await sleep(delay);

        if (mode === 'error') {
          return send(res, 503, {
            message: 'Fallo simulado.',
          });
        }

        if (mode === 'invalido') {
          return send(res, 200, [
            { id: 'react', seats: 'dos' },
          ]);
        }

        return send(
          res,
          200,
          mode === 'vacio' ? [] : workshops,
        );
      }

      const contentType =
        req.headers['content-type']?.split(';')[0];

      if (
        contentType?.trim().toLowerCase() !==
        'application/json'
      ) {
        return send(res, 415, {
          message: 'Envía JSON.',
        });
      }

      const input = await readJson(req);

      if (input.status) {
        return send(res, input.status, {
          message: 'Cuerpo no válido.',
        });
      }

      const result = inputSchema.safeParse(input.value);

      if (!result.success) {
        return send(res, 422, {
          message: 'Revisa los campos.',
        });
      }

      const { workshopId, seats } = result.data;

      const workshop = workshops.find(
        (item) => item.id === workshopId,
      );

      if (!workshop) {
        return send(res, 404, {
          message: 'Taller no encontrado.',
        });
      }

      if (workshop.seats < seats) {
        return send(res, 409, {
          message: 'Cupos insuficientes.',
        });
      }

      workshop.seats -= seats;

      return send(res, 201, {
        id: randomUUID(),
        workshopId,
        seats,
        remaining: workshop.seats,
      });
    } catch {
      return send(res, 500, {
        message: 'Error interno del laboratorio.',
      });
    }
  });
}

if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  createLabServer().listen(3001, '127.0.0.1', () => {
    console.log('API local: http://127.0.0.1:3001');
  });
}
