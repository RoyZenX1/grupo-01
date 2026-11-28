const integer = n => Number.isInteger(n) && n >= 0;
const string = x => typeof x === 'string' && x.length > 0;
export function workshops(raw) {
  if (!Array.isArray(raw) || !raw.every(w =>
    w && string(w.id) && string(w.title) && integer(w.seats))) {
    throw new Error('Contrato de catálogo inválido');
  }
  return raw;
}
export function receipt(raw) {
  if (!raw || !string(raw.id) || !string(raw.workshopId) ||
      !Number.isInteger(raw.seats) || raw.seats < 1 || raw.seats > 4 ||
      !integer(raw.remaining)) throw new Error('Recibo inválido');
  return raw;
}
export async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options, cache: 'no-store',
    signal: AbortSignal.timeout(3500),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
export function list(base = '', mode = 'normal') {
  return request(`${base}/api/talleres?modo=${encodeURIComponent(mode)}`)
    .then(workshops);
}
export function reserve(data, base = '') {
  return request(`${base}/api/reservas`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(receipt);
}
