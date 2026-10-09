
const ESTADO = {
    PENDIENTE:   1 << 0, // 00001 -> 1
    EN_TRANSITO: 1 << 1, // 00010 -> 2
    ENTREGADO:   1 << 2, // 00100 -> 4
    CANCELADO:   1 << 3, // 01000 -> 8
    URGENTE:     1 << 4, // 10000 -> 16 (se combina con cualquier otro estado)
};


const ETIQUETA_ESTADO = new Map([
    [ESTADO.PENDIENTE, "text-bg-secondary"],
    [ESTADO.EN_TRANSITO, "text-bg-warning"],
    [ESTADO.ENTREGADO, "text-bg-success"],
    [ESTADO.CANCELADO, "text-bg-danger"],
    [ESTADO.URGENTE, "text-bg-primary"],
]);

const NOMBRE_ESTADO = new Map([
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

const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MESES_LARGOS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const formatoMoneda = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

const Pipes = {
    moneda: (valor) => formatoMoneda.format(Number(valor) || 0),

    numero: (valor, decimales = 0) =>
        new Intl.NumberFormat("es-PE", {
            minimumFractionDigits: decimales,
            maximumFractionDigits: decimales,
        }).format(Number(valor) || 0),

    porcentaje: (valor, decimales = 1) => `${(Number(valor) || 0).toFixed(decimales)}%`,

    abreviar: (valor) => {
        const n = Number(valor) || 0;
        if (n >= 1e6) return `${(n / 1e6).toFixed(1)} M`;
        if (n >= 1e3) return `${(n / 1e3).toFixed(1)} K`;
        return String(n);
    },

    // "2026-08-02" -> "02 ago 2026" (se parte el texto a mano para evitar el desfase de zona horaria)
    fecha: (iso) => {
        const [anio, mes, dia] = String(iso).split("-");
        if (!anio || !mes || !dia) return String(iso);
        return `${dia} ${MESES_CORTOS[Number(mes) - 1]} ${anio}`;
    },

    // "2026-08" -> "Agosto 2026"
    mesAnio: (clave) => {
        const [anio, mes] = String(clave).split("-");
        return `${MESES_LARGOS[Number(mes) - 1] || mes} ${anio}`;
    },

    recortar: (texto, max = 30) => {
        const t = String(texto);
        return t.length > max ? `${t.slice(0, max - 1)}…` : t;
    },

    // Protege el innerHTML cuando los datos vienen del backend
    escapar: (texto) =>
        String(texto).replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
        }[c])),
};

// Encadena pipes: pipe(f, g)(x) === g(f(x))
function pipe(...funciones) {
    return (valor) => funciones.reduce((acc, fn) => fn(acc), valor);
}

const formatearCliente = pipe((c) => Pipes.recortar(c, 28), Pipes.escapar);

function badgesEstado(orden) {
    const badges = [];
    ETIQUETA_ESTADO.forEach((texto, flag) => {
        if (tieneEstado(orden, flag)) {
            badges.push(`<span class="badge ${CLASE_BADGE.get(flag)}">${texto}</span>`);
        }
    });
    return badges.join(" ");
}

// Quita tildes y pasa a minúsculas para buscar sin importar acentos
function normalizarTexto(texto) {
    return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Filtrado de elementos visuales: texto, rango de monto y rango de fechas
function filtrarPorCriterios(listaOrdenes, criterios = {}) {
    const texto = normalizarTexto(criterios.texto || "").trim();
    const { montoMin = null, montoMax = null, desde = "", hasta = "" } = criterios;

    return listaOrdenes.filter((orden) => {
        if (texto) {
            const pajar = normalizarTexto(`${orden.cliente} ${orden.origen} ${orden.destino}`);
            if (!pajar.includes(texto)) return false;
        }
        if (montoMin !== null && orden.monto < montoMin) return false;
        if (montoMax !== null && orden.monto > montoMax) return false;
        if (desde && orden.fecha < desde) return false;
        if (hasta && orden.fecha > hasta) return false;
        return true;
    });
}

// =====================================================
// SEMANA 9: SERVICIOS DE PROCESAMIENTO MASIVO
// =====================================================

// Cambia esta URL por la del backend real de tu equipo
const API_BASE_URL = "http://localhost:3000/api";
const ENDPOINT_ORDENES = `${API_BASE_URL}/ordenes`;

const FLAG_POR_NOMBRE = new Map([
    ["pendiente", ESTADO.PENDIENTE],
    ["en_transito", ESTADO.EN_TRANSITO],
    ["entregado", ESTADO.ENTREGADO],
    ["cancelado", ESTADO.CANCELADO],
    ["urgente", ESTADO.URGENTE],
]);

// Acepta número (flags), "En tránsito + Urgente" o ["entregado", "urgente"]
function convertirEstado(valor) {
    if (typeof valor === "number") return valor;
    const lista = Array.isArray(valor) ? valor : String(valor ?? "").split(/[+,|]/);
    return lista.reduce((mascara, nombre) => {
        const clave = normalizarTexto(nombre).trim().replace(/\s+/g, "_");
        return mascara | (FLAG_POR_NOMBRE.get(clave) || 0);
    }, 0);
}

// Deja cada orden del backend con la misma forma que usan las demás funciones
function normalizarOrden(crudo) {
    return {
        id: crudo.id,
        cliente: (crudo.cliente && crudo.cliente.nombre) || crudo.cliente || "Sin cliente",
        origen: crudo.origen || "-",
        destino: crudo.destino || "-",
        monto: Number(crudo.monto) || 0,
        estado: convertirEstado(crudo.estado),
        fecha: String(crudo.fecha || "").slice(0, 10),
    };
}

// Consume el backend. Si falla o tarda, se queda con los datos locales.
async function cargarOrdenesDesdeBackend() {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), 4000);

    try {
        const respuesta = await fetch(ENDPOINT_ORDENES, { signal: controlador.signal });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const datos = await respuesta.json();
        if (!Array.isArray(datos) || datos.length === 0) throw new Error("Respuesta vacía");

        const normalizadas = datos.map(normalizarOrden);
        // Se vacía y rellena el mismo arreglo (sin spread, para volúmenes grandes)
        ordenes.length = 0;
        normalizadas.forEach((orden) => ordenes.push(orden));
        return { origen: "backend", total: ordenes.length };
    } catch (error) {
        console.warn("No se pudo usar el backend, se usan datos locales:", error.message);
        return { origen: "local", total: ordenes.length };
    } finally {
        clearTimeout(temporizador);
    }
}

// Map para buscar una orden por id en O(1)
function indexarPorId(listaOrdenes) {
    return listaOrdenes.reduce((mapa, orden) => mapa.set(orden.id, orden), new Map());
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

function procesarOrdenes(listaOrdenes) {
    const inicial = {
        cantidad: 0,
        montoTotal: 0,
        urgentes: 0,
        clientes: new Set(),
        rutas: new Set(),
        porEstado: new Map(
            [...ETIQUETA_ESTADO].map(([flag, etiqueta]) => [flag, { flag, etiqueta, cantidad: 0, monto: 0 }])
        ),
        porMes: new Map(),
    };

    return listaOrdenes.reduce((acc, orden) => {
        acc.cantidad += 1;
        acc.montoTotal += orden.monto;
        acc.clientes.add(orden.cliente);
        acc.rutas.add(`${orden.origen} → ${orden.destino}`);
        if (tieneEstado(orden, ESTADO.URGENTE)) acc.urgentes += 1;

        acc.porEstado.forEach((grupo) => {
            if (tieneEstado(orden, grupo.flag)) {
                grupo.cantidad += 1;
                grupo.monto += orden.monto;
            }
        });

        const mes = orden.fecha.slice(0, 7); // "2026-08"
        const grupoMes = acc.porMes.get(mes) || { mes, cantidad: 0, monto: 0 };
        grupoMes.cantidad += 1;
        grupoMes.monto += orden.monto;
        acc.porMes.set(mes, grupoMes);

        return acc;
    }, inicial);
}

function calcularMetricas(listaOrdenes) {
    const montoTotal = listaOrdenes.reduce((suma, o) => suma + o.monto, 0);
    const cantidad = listaOrdenes.length;
    const promedio = cantidad > 0 ? montoTotal / cantidad : 0;
    const urgentes = listaOrdenes.filter((o) => tieneEstado(o, ESTADO.URGENTE)).length;

    return {
        cantidad,
        montoTotal,
        promedio: cantidad > 0 ? montoTotal / cantidad : 0,
        clientesUnicos: clientesUnicos(listaOrdenes).size,
        rutasUnicas: rutasUnicas(listaOrdenes).size,
        urgentes,
    };
}

function distribucionPorEstado(procesado) {
    return [...procesado.porEstado.values()].map((grupo) => ({
        ...grupo,
        porcentaje: procesado.cantidad > 0 ? (grupo.cantidad / procesado.cantidad) * 100 : 0,
    }));
}

function resumenPorMes(procesado) {
    return [...procesado.porMes.values()].sort((a, b) => a.mes.localeCompare(b.mes));
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
