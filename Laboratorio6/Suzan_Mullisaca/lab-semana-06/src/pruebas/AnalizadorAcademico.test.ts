import assert from "node:assert/strict";
import test from "node:test";

import { Estudiante } from "../modelos/Estudiante.js";
import { AnalizadorAcademico } from "../servicios/AnalizadorAcademico.js";
import { redondearDos } from "../utilidades/numeros.js";

const estudiantes = [
    new Estudiante({
        codigo: "U20260001",
        nombre: "Ana Pérez",
        programa: "Ingeniería de Software",
        notas: [16, 15, 17]
    }),
    new Estudiante({
        codigo: "U20260002",
        nombre: "Luis Rojas",
        programa: "Ingeniería de Sistemas",
        notas: [10, 11, 12]
    }),
    new Estudiante({
        codigo: "U20260003",
        nombre: "María Salas",
        programa: "Ingeniería de Software",
        notas: [12, 12, 12]
    })
];

test("calcula el resumen académico", () => {
    const analizador = new AnalizadorAcademico(estudiantes);
    assert.deepEqual(analizador.resumir(), {
        total: 3,
        aprobados: 2,
        riesgo: 1,
        promedioGrupal: 13
    });
});

test("combina filtros y ordena por promedio descendente", () => {
    const analizador = new AnalizadorAcademico(estudiantes);
    const resultado = analizador.filtrar({
        programa: "software",
        estado: "aprobado",
        top: 1
    });

    assert.equal(resultado.length, 1);
    assert.equal(resultado[0]?.codigo, "U20260001");

});

test("devuelve una lista vacía cuando no hay coincidencias", () => {
    const analizador = new AnalizadorAcademico(estudiantes);
    assert.deepEqual(analizador.filtrar({ programa: "Diseño" }), []);
});

test("redondea un caso sensible a la representación binaria", () => {
    assert.equal(redondearDos(10.165), 10.17);
});
