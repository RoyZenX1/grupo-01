import { z } from 'zod';

export const MODES = [
  { id: 'normal', label: 'Normal' },
  { id: 'vacio', label: 'Lista vacía' },
  { id: 'lento', label: 'Respuesta lenta' },
  { id: 'agotado', label: 'Tiempo agotado' },
  { id: 'error', label: 'Error HTTP 503' },
  { id: 'invalido', label: 'Datos inválidos' },
] as const;

export type Mode = (typeof MODES)[number]['id'];

export const listUrl = (mode: Mode) =>
  '/api/talleres?modo=' + mode;

export const RESERVATIONS = '/api/reservas';

export const TIMEOUT = 3500;

const workshopSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  seats: z.number().int().nonnegative(),
});

const listSchema = z.array(workshopSchema);

const receiptSchema = z.object({
  id: z.uuid(),
  workshopId: z.string().min(1),
  seats: z.number().int().min(1).max(4),
  remaining: z.number().int().nonnegative(),
});

export type Workshop = z.infer<typeof workshopSchema>;
export type Receipt = z.infer<typeof receiptSchema>;

export type Reservation = {
  workshopId: string;
  seats: number;
};

type Failure = 'http' | 'timeout' | 'network' | 'format';

export class ApiError extends Error {
  constructor(
    readonly kind: Failure,
    readonly status?: number,
  ) {
    super(status ? 'HTTP ' + status : kind);
    this.name = 'ApiError';
  }
}

function decode<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);

  if (!result.success) throw new ApiError('format');

  return result.data;
}

export const parseWorkshops = (raw: unknown) =>
  decode(listSchema, raw);

export const parseReceipt = (raw: unknown) =>
  decode(receiptSchema, raw);

export function abortError() {
  return new DOMException('Consulta cancelada.', 'AbortError');
}

export async function withDeadline<T>(
  run: (signal: AbortSignal) => Promise<T>,
  signal?: AbortSignal | null,
) {
  const timeout = AbortSignal.timeout(TIMEOUT);
  const combined = signal
    ? AbortSignal.any([signal, timeout])
    : timeout;

  try {
    return await run(combined);
  } catch (error) {
    if (signal?.aborted) throw abortError();
    if (timeout.aborted) throw new ApiError('timeout');
    throw error;
  }
}

export function parseJsonText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError('format');
  }
}

export function failureText(error: unknown) {
  if (error instanceof Error && error.name === 'AbortError') {
    return 'Consulta cancelada. Pulsa Actualizar.';
  }

  if (error instanceof ApiError) {
    if (error.status === 409) {
      return 'HTTP 409: cupos insuficientes.';
    }

    if (error.kind === 'http') {
      return 'Error HTTP ' + error.status + '.';
    }

    if (error.kind === 'format') {
      return 'La respuesta no cumple el contrato.';
    }

    if (error.kind === 'timeout') {
      return 'Se agotó el tiempo de espera.';
    }
  }

  return 'No se completó la comunicación con la API.';
}

export async function readResponse(
  response: Response,
): Promise<unknown> {
  if (!response.ok) throw new ApiError('http', response.status);

  try {
    const data: unknown = await response.json();
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ApiError('format');
    }

    throw error;
  }
}
