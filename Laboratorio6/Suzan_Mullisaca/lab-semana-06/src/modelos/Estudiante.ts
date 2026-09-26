import type { EstadoAcademico, EstudianteEntrada } from "../tipos.js"; 
import { redondearDos } from "../utilidades/numeros.js"; 
 
export class Estudiante { 
  readonly codigo: string; 
  readonly nombre: string; 
  readonly programa: string; 
  readonly notas: readonly number[]; 
 
  constructor(datos: EstudianteEntrada) { 
    this.codigo = datos.codigo; 
    this.nombre = datos.nombre; 
    this.programa = datos.programa; 
    this.notas = [...datos.notas]; 
  } 
 
  get promedio(): number { 
    const suma = this.notas.reduce((total, nota) => total + nota, 0); 
    return redondearDos(suma / this.notas.length); 
  } 
 
  get estado(): EstadoAcademico { 
    return this.promedio >= 12 ? "aprobado" : "riesgo"; 
  } 
    toRow(): Record<string, string | number> { 
    return { 
      Código: this.codigo, 
      Estudiante: this.nombre, 
      Programa: this.programa, 
      Notas: this.notas.join(" / "), 
      Promedio: this.promedio.toFixed(2), 
      Estado: this.estado === "aprobado" ? "Aprobado" : "En riesgo" 
    }; 
  } 
} 