import { pricingConfig, type PricingConfig } from "../pricing/config";
import type { LatLng } from "./mexico";

export { isInMexico, MEXICO_BOUNDS, SERVICE_TZ, type LatLng } from "./mexico";

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

/** ¿Está dentro del radio de servicio? (no considera marcas del catálogo; ver places/zone). */
export function isWithinServiceRadius(p: LatLng, config: PricingConfig = pricingConfig): boolean {
    return haversineKm(config.service_area.center, p) <= config.service_area.radius_km;
}
