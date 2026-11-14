import assert from 'node:assert/strict';
import { once } from 'node:events';
import { afterEach, beforeEach, test } from 'node:test';
import { createLabServer } from './server.mjs';

let server;
let base;

beforeEach(async () => {
  server = createLabServer().listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = 'http://127.0.0.1:' + server.address().port;
});

afterEach(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

const list = (mode = 'normal') => fetch(base + '/api/talleres?modo=' + mode);

const post = (body, contentType = 'application/json') =>
  fetch(base + '/api/reservas', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  });

test('el catálogo inicial devuelve tres talleres y no se guarda en caché HTTP',
  async () => {
    const response = await list();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual((await response.json()).map((x) => x.seats), [2, 3, 4]);
  },
);

test('lista vacía no es un error HTTP', async () => {
  const response = await list('vacio');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
});

test('el servidor puede fallar con 503', async () => {
  const response = await list('error');
  assert.equal(response.status, 503);
  assert.equal((await response.json()).message, 'Fallo simulado.');
});

test('el escenario inválido tiene HTTP 200 y datos fuera del contrato', async () => {
  const response = await list('invalido');
  assert.equal(response.status, 200);
  assert.equal((await response.json())[0].seats, 'dos');
});

test('POST 201 devuelve recibo y cambia el GET siguiente', async () => {
  const response = await post(JSON.stringify({ workshopId: 'react', seats: 1 }));
  assert.equal(response.status, 201);
  const receipt = await response.json();
  assert.equal(typeof receipt.id, 'string');
  assert.equal(receipt.remaining, 1);
  const catalog = await (await list()).json();
  assert.equal(catalog.find((x) => x.id === 'react').seats, 1);
});

test('rechaza 409 sin reducir cupos', async () => {
  const response = await post(JSON.stringify({ workshopId: 'react', seats: 3 }));
  assert.equal(response.status, 409);
  await response.json();
  assert.equal((await (await list()).json())[0].seats, 2);
});

test('rechaza con 422 un campo de tipo incorrecto', async () => {
  const response = await post(JSON.stringify({ workshopId: 'react', seats: '1' }));
  assert.equal(response.status, 422);
  await response.json();
});

test('distingue 400 por sintaxis y 415 por tipo de medio', async () => {
  const syntax = await post('{');
  assert.equal(syntax.status, 400);
  await syntax.json();

  const media = await post('{}', 'text/plain');
  assert.equal(media.status, 415);
  await media.json();
});

test('distingue ruta desconocida y método no permitido', async () => {
  const missing = await fetch(base + '/api/desconocido');
  assert.equal(missing.status, 404);
  await missing.json();

  const wrong = await fetch(base + '/api/reservas');
  assert.equal(wrong.status, 405);
  assert.equal(wrong.headers.get('allow'), 'POST');
  await wrong.json();
});
