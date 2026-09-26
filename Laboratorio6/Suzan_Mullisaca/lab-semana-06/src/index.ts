import { resolve } from "node:path"; 
 
import { analizarArgumentos, obtenerAyuda } from "./cli/argumentos.js"; 
import { cargarEstudiantes } from "./infraestructura/repositorioJson.js"; 
import { AnalizadorAcademico } from "./servicios/AnalizadorAcademico.js"; 
 
async function main(): Promise<void> { 
  const opciones = analizarArgumentos(process.argv.slice(2)); 
  if (opciones.ayuda) { 
    console.log(obtenerAyuda()); 
    return; 
  } 
 
  const ruta = resolve(opciones.archivo); 
  const estudiantes = await cargarEstudiantes(ruta); 
  const analizador = new AnalizadorAcademico(estudiantes); 
  const encontrados = analizador.filtrar(opciones.filtros); 
  const resumen = analizador.resumir(encontrados); 
 
  console.log(`\nArchivo: ${ruta}`); 
  console.log(`Programas disponibles: ${analizador.programas().join(" | ")}\n`); 
 
  if (encontrados.length === 0) { 
    console.log("No se encontraron estudiantes con los filtros indicados."); 
    } else { 
    console.table(encontrados.map(estudiante => estudiante.toRow())); 
  } 
 
  console.log("Resumen de los resultados visibles:"); 
  console.log(`  Total: ${resumen.total}`); 
  console.log(`  Aprobados: ${resumen.aprobados}`); 
  console.log(`  En riesgo: ${resumen.riesgo}`); 
  console.log(`  Promedio grupal: ${resumen.promedioGrupal.toFixed(2)}`); 
} 
 
main().catch((error: unknown) => { 
  const mensaje = error instanceof Error ? error.message : String(error); 
  console.error(`\nError: ${mensaje}`); 
  process.exitCode = 1; 
}); 