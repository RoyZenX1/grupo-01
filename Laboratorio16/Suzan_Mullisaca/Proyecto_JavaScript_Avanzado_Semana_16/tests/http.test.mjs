import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createLabServer } from '../api/server.mjs';
import { list, reserve, workshops, receipt } from '../vue/src/http.mjs';
import { readFile } from 'node:fs/promises';
test('Contratos: catálogo y recibo', () => {
  assert.deepEqual(workshops([]), []);
  assert.throws(() => workshops([{ id: 'a', seats: '2' }]));
  assert.throws(() => receipt({ id: 'a', remaining: -1 }));
});
test('Cliente HTTP contra API real', async () => {
  const server = createLabServer().listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await list(base))[0].seats, 2);
    assert.deepEqual(await list(base, 'vacio'), []);
    await assert.rejects(list(base, 'invalido'), /Contrato/);
    await assert.rejects(list(base, 'error'), /HTTP 503/);
    assert.equal((await reserve({ workshopId: 'react', seats: 2 }, base)).remaining, 0);
    await assert.rejects(reserve({ workshopId: 'react', seats: 1 }, base), /HTTP 409/);
    assert.equal((await list(base))[0].seats, 0);
    await assert.rejects(list(base, 'agotado'), { name: 'TimeoutError' });
  } finally { await new Promise(resolve => server.close(resolve)); }
});
test('Contrato HTTP idéntico en ambos proyectos', async () => {
  const a = await readFile(new URL('../vue/src/http.mjs', import.meta.url));
  const b = await readFile(new URL('../next/lib/http.mjs', import.meta.url));
  assert.deepEqual(a, b);
});
test('Route Handler reenvía los códigos y el recibo', async () => {
  const server = createLabServer().listen(0, '127.0.0.1');
  await once(server, 'listening');
  const previous = process.env.API_BASE_URL;
  process.env.API_BASE_URL = `http://127.0.0.1:${server.address().port}`;
  const { POST } = await import('../next/app/api/reservas/route.js');
  const request = () => new Request('http://localhost/api/reservas', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workshopId: 'react', seats: 2 }),
  });
  try {
    const result = await POST(request());
    assert.equal(result.status, 201);
    assert.equal((await result.json()).remaining, 0);
    assert.equal((await POST(request())).status, 409);
  } finally {
    await new Promise(resolve => server.close(resolve));
    if (previous === undefined) delete process.env.API_BASE_URL;
    else process.env.API_BASE_URL = previous;
  }
});
