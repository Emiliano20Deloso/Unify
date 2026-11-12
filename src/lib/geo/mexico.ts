// Constantes geográficas del servicio, sin dependencias: se pueden importar desde el cliente
// (cotizador) sin arrastrar la config de precios ni zod. lib/geo y lib/quote las comparten.

export type LatLng = { lat: number; lng: number };

/** Zona horaria del servicio. Debe coincidir con `timezone` de config/pricing.json (lo comprueba una prueba). */
export const SERVICE_TZ = "America/Mexico_City";

/** Caja aproximada de la República Mexicana (incluye islas). */
export const MEXICO_BOUNDS = { minLat: 14.3, maxLat: 32.8, minLng: -118.6, maxLng: -86.5 } as const;

export function isInMexico(p: LatLng): boolean {
    return (
        p.lat >= MEXICO_BOUNDS.minLat &&
        p.lat <= MEXICO_BOUNDS.maxLat &&
        p.lng >= MEXICO_BOUNDS.minLng &&
        p.lng <= MEXICO_BOUNDS.maxLng
    );
}
