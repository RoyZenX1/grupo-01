export function validarDNI(dni: string): boolean {
  return /^\d{8}$/.test(dni.trim());
}

export function validarRUC(ruc: string): boolean {
  return /^\d{11}$/.test(ruc.trim());
}

export function validarCorreo(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
}

