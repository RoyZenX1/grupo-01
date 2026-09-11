
const ESTADO = {
    PENDIENTE:   1 << 0, // 00001 -> 1
    EN_TRANSITO: 1 << 1, // 00010 -> 2
    ENTREGADO:   1 << 2, // 00100 -> 4
    CANCELADO:   1 << 3, // 01000 -> 8
    URGENTE:     1 << 4, // 10000 -> 16 (se combina con cualquier otro estado)
};


const ETIQUETA_ESTADO = new Map([
    [ESTADO.PENDIENTE, "Pendiente"],
    [ESTADO.EN_TRANSITO, "En tránsito"],
    [ESTADO.ENTREGADO, "Entregado"],
    [ESTADO.CANCELADO, "Cancelado"],
    [ESTADO.URGENTE, "Urgente"],
]);


const ordenes = [
    { id: 1,  cliente: "Transportes del Sur", origen: "Lima",     destino: "Trujillo", monto: 1850, estado: ESTADO.EN_TRANSITO | ESTADO.URGENTE, fecha: "2026-08-02" },
    { id: 2,  cliente: "Comercial Andina",    origen: "Lima",     destino: "Arequipa", monto: 2400, estado: ESTADO.ENTREGADO,                     fecha: "2026-08-03" },
    { id: 3,  cliente: "Distribuidora Norte", origen: "Piura",    destino: "Lima",     monto: 3100, estado: ESTADO.PENDIENTE,                      fecha: "2026-08-04" },
    { id: 4,  cliente: "Transportes del Sur", origen: "Lima",     destino: "Ica",      monto: 950,  estado: ESTADO.ENTREGADO,                     fecha: "2026-08-05" },
    { id: 5,  cliente: "Agroexport SAC",      origen: "Ica",      destino: "Lima",     monto: 1600, estado: ESTADO.CANCELADO,                     fecha: "2026-08-06" },
    { id: 6,  cliente: "Comercial Andina",    origen: "Arequipa", destino: "Cusco",    monto: 2200, estado: ESTADO.EN_TRANSITO,                   fecha: "2026-08-06" },
    { id: 7,  cliente: "Distribuidora Norte", origen: "Lima",     destino: "Piura",    monto: 2750, estado: ESTADO.PENDIENTE | ESTADO.URGENTE,   fecha: "2026-08-07" },
    { id: 8,  cliente: "Minera Los Andes",    origen: "Cusco",    destino: "Lima",     monto: 4200, estado: ESTADO.ENTREGADO,                     fecha: "2026-08-08" },
    { id: 9,  cliente: "Agroexport SAC",      origen: "Lima",     destino: "Chiclayo", monto: 1300, estado: ESTADO.EN_TRANSITO,                   fecha: "2026-08-09" },
    { id: 10, cliente: "Minera Los Andes",    origen: "Lima",     destino: "Cusco",    monto: 3900, estado: ESTADO.PENDIENTE,                      fecha: "2026-08-10" },
];

function tieneEstado(orden, flag) {
    return (orden.estado & flag) !== 0; // AND bit a bit
}

function combinarFlags(...flags) {
    return flags.reduce((mascara, flag) => mascara | flag, 0); // OR bit a bit
}


function alternarFlag(mascara, flag) {
    return mascara ^ flag; // XOR bit a bit
}


function filtrarPorEstado(listaOrdenes, mascara) {
    if (mascara === 0) return listaOrdenes; // sin filtro activo
    return listaOrdenes.filter((orden) => (orden.estado & mascara) !== 0);
}

function etiquetasDeEstado(orden) {
    const etiquetas = [];
    ETIQUETA_ESTADO.forEach((texto, flag) => {
        if (tieneEstado(orden, flag)) etiquetas.push(texto);
    });
    return etiquetas.join(" + ");
}


function ordenarPor(listaOrdenes, campo, direccion = "asc") {
    // el spread evita mutar el arreglo original
    return [...listaOrdenes].sort((a, b) => {
        if (typeof a[campo] === "number") {
            return direccion === "asc" ? a[campo] - b[campo] : b[campo] - a[campo];
        }
        return direccion === "asc"
            ? String(a[campo]).localeCompare(String(b[campo]))
            : String(b[campo]).localeCompare(String(a[campo]));
    });
}


function agruparPorCliente(listaOrdenes) {
    const mapa = new Map();
    listaOrdenes.forEach((orden) => {
        if (!mapa.has(orden.cliente)) {
            mapa.set(orden.cliente, []);
        }
        mapa.get(orden.cliente).push(orden);
    });
    return mapa;
}


function topClientesPorMonto(listaOrdenes, n = 5) {
    const porCliente = agruparPorCliente(listaOrdenes);
    const resumen = [];

    porCliente.forEach((ordenesCliente, cliente) => {
        const total = ordenesCliente.reduce((suma, o) => suma + o.monto, 0);
        resumen.push({ cliente, total, cantidad: ordenesCliente.length });
    });

    return resumen.sort((a, b) => b.total - a.total).slice(0, n);
}


function clientesUnicos(listaOrdenes) {
    return new Set(listaOrdenes.map((orden) => orden.cliente));
}


function rutasUnicas(listaOrdenes) {
    return new Set(listaOrdenes.map((orden) => `${orden.origen} → ${orden.destino}`));
}

function resumenPorRuta(listaOrdenes) {
    const mapa = new Map();

    listaOrdenes.forEach((orden) => {
        const ruta = `${orden.origen} → ${orden.destino}`;
        const actual = mapa.get(ruta) || { ruta, cantidad: 0, monto: 0 };
        actual.cantidad += 1;
        actual.monto += orden.monto;
        mapa.set(ruta, actual);
    });

    return [...mapa.values()].sort((a, b) => b.monto - a.monto);
}


function calcularMetricas(listaOrdenes) {
    const montoTotal = listaOrdenes.reduce((suma, o) => suma + o.monto, 0);
    const cantidad = listaOrdenes.length;
    const promedio = cantidad > 0 ? montoTotal / cantidad : 0;
    const urgentes = listaOrdenes.filter((o) => tieneEstado(o, ESTADO.URGENTE)).length;

    return {
        cantidad,
        montoTotal,
        promedio,
        clientesUnicos: clientesUnicos(listaOrdenes).size,
        rutasUnicas: rutasUnicas(listaOrdenes).size,
        urgentes,
    };
}


function transformarParaReporte(listaOrdenes) {
    return listaOrdenes.map((orden) => ({
        id: orden.id,
        cliente: orden.cliente,
        ruta: `${orden.origen} → ${orden.destino}`,
        monto: `S/ ${orden.monto.toFixed(2)}`,
        estado: etiquetasDeEstado(orden),
        fecha: orden.fecha,
        esUrgente: tieneEstado(orden, ESTADO.URGENTE),
    }));
}
