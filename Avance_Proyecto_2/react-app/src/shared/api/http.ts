const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000')
  .replace(/\/+$/, '')

async function requestJson(
  path: string,
  init?: RequestInit,
): Promise<unknown> {
  const response = await fetch(`${apiBaseUrl}${path}`, init)
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `La API respondió con el estado ${response.status}.`)
  }
  if (response.status === 204) return undefined
  return response.json()
}

function jsonBody(payload: unknown): Pick<RequestInit, 'headers' | 'body'> {
  return {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }
}

export const http = {
  get: (path: string) => requestJson(path),
  post: (path: string, payload: unknown) =>
    requestJson(path, { method: 'POST', ...jsonBody(payload) }),
  patch: (path: string, payload: unknown) =>
    requestJson(path, { method: 'PATCH', ...jsonBody(payload) }),
  delete: (path: string) => requestJson(path, { method: 'DELETE' }),
}

export function mensajeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}
