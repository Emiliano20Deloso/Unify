import { pricingConfig, type PricingConfig } from "../pricing/config";

export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371.0088;

/** Distancia en línea recta (km) entre dos puntos. */
export function haversineKm(a: LatLng, b: LatLng): number {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h =
        Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

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

/** ¿Está dentro del radio de servicio? (no considera marcas del catálogo; ver places/zone). */
export function isWithinServiceRadius(p: LatLng, config: PricingConfig = pricingConfig): boolean {
    return haversineKm(config.service_area.center, p) <= config.service_area.radius_km;
}
