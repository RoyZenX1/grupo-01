export function redondearDos(valor: number): number { 
const correccion = Number.EPSILON * Math.max(1, Math.abs(valor)); 
return Math.round((valor + correccion) * 100) / 100; 
} 