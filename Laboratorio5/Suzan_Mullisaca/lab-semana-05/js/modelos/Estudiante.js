export class Estudiante {
    constructor({ codigo, nombre, correo, programa, notas }) {
        this.codigo = String(codigo).trim().toUpperCase();
        this.nombre = String(nombre).trim();
        this.correo = String(correo).trim().toLocaleLowerCase("es-PE");
        this.programa = String(programa).trim();
        this.notas = notas.map(Number);
    }
    get promedio() {
        const suma = this.notas.reduce((total, nota) => total + nota, 0);
        return Math.round((suma / this.notas.length + Number.EPSILON) * 100) / 100;
    }
    get estado() {
        return this.promedio >= 12 ? "Aprobado" : "En riesgo";
    }
    get iniciales() {
        return this.nombre
            .split(/\s+/u)
            .slice(0, 2)
            .map(parte => parte.at(0)?.toLocaleUpperCase("es-PE") ?? "")
            .join("");
    }
    toJSON() {
        return {
            codigo: this.codigo,
            nombre: this.nombre,
            correo: this.correo,
            programa: this.programa,
            notas: [...this.notas]
        };
    }
    static desdeObjeto(datos) {
        return new Estudiante(datos);
    }
}
