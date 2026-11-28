import { z } from 'zod';
import { listSchema, receiptSchema } from './contract';
import type { Mode, Reservation } from './contract';

async function request<T>(url: string, schema: z.ZodType<T>,
  init: RequestInit = {}): Promise<T> {
  const timeout = AbortSignal.timeout(3500);
  const signal = init.signal
    ? AbortSignal.any([init.signal, timeout]) : timeout;
  try {
    const res = await fetch(url, { ...init, signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw: unknown = await res.json();
    return schema.parse(raw);
  } catch (error) {
    if (init.signal?.aborted) throw error;
    if (timeout.aborted) throw new Error('Tiempo de espera agotado');
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      throw new Error('La respuesta no cumple el contrato JSON');
    }
    if (error instanceof TypeError) throw new Error('Error de red');
    throw error;
  }
}
export function getWorkshops(mode: Mode, signal: AbortSignal) {
  return request(`/api/talleres?modo=${mode}`, listSchema, { signal });
}
export function createReservation(data: Reservation) {
  return request('/api/reservas', receiptSchema, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
