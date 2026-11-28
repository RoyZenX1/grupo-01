import { apiBase } from '../../../lib/backend.js';
export async function POST(request) {
  try {
    const upstream = await fetch(`${apiBase()}/api/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': request.headers.get('content-type') || '' },
      body: await request.text(), cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return Response.json({ message: 'Resultado de escritura no confirmado' },
      { status: e.name === 'TimeoutError' ? 504 : 502 });
  }
}
