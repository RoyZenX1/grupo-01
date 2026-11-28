import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createLabServer } from './server.mjs';

const server = createLabServer();
let base;
before(async () => {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));
const get = (mode = 'normal') => fetch(`${base}/api/talleres?modo=${mode}`);
const post = (data) => fetch(`${base}/api/reservas`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

test('Catálogo inicial: cupos 2, 3, 4', async () => {
  const r = await get();
  assert.equal(r.status, 200);
  assert.deepEqual((await r.json()).map(w => w.seats), [2, 3, 4]);
});
test('Lista vacía y error 503 son distintos', async () => {
  const r = await get('vacio');
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), []);
  assert.equal((await get('error')).status, 503);
});
test('Modo inválido simula un contrato roto', async () => {
  const r = await get('invalido');
  assert.equal(r.status, 200);
  assert.equal(typeof (await r.json())[0].seats, 'string');
});
test('Validación y recurso inexistente', async () => {
  assert.equal((await post({ workshopId: 'react', seats: 0 })).status, 422);
  assert.equal((await post({ workshopId: 'react', seats: '1' })).status, 422);
  assert.equal((await post({ workshopId: 'no-existe', seats: 1 })).status, 404);
});
test('Reserva válida, recibo y recarga del catálogo', async () => {
  const r = await post({ workshopId: 'react', seats: 1 });
  assert.equal(r.status, 201);
  const receipt = await r.json();
  assert.match(receipt.id, /^[a-f0-9-]{36}$/);
  assert.equal(receipt.remaining, 1);
  assert.equal((await (await get()).json())[0].seats, 1);
});
test('Conflicto no reduce el cupo', async () => {
  assert.equal((await post({ workshopId: 'react', seats: 2 })).status, 409);
  assert.equal((await (await get()).json())[0].seats, 1);
});
test('Dos reservas concurrentes no sobrepasan el último cupo', async () => {
  const results = await Promise.all([1, 2].map(() => post({ workshopId: 'react', seats: 1 })));
  assert.deepEqual(results.map(r => r.status).sort(), [201, 409]);
  assert.equal((await (await get()).json())[0].seats, 0);
});
test('Método, JSON y tipo de contenido incorrectos', async () => {
  assert.equal((await fetch(`${base}/api/reservas`)).status, 405);
  const send = (body, type) => fetch(`${base}/api/reservas`, {
    method: 'POST', headers: { 'Content-Type': type }, body,
  });
  assert.equal((await send('{', 'application/json')).status, 400);
  assert.equal((await send('{}', 'text/plain')).status, 415);
  assert.equal((await send('x'.repeat(4097), 'application/json')).status, 413);
});
