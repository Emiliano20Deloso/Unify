// Sin dependencias: se puede importar desde componentes cliente sin arrastrar la config ni zod.
const mxn = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
});

/** 1234 → "$1,234". */
export function formatMXN(n: number): string {
    return mxn.format(Math.round(n));
}
