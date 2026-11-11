import "server-only";
import { haversineKm, type LatLng } from "../geo";
import { computeRoute, type Waypoint } from "../google/routes";
import { GoogleApiError, hasGoogleKey } from "../google/key";
import { pricingConfig, type PricingConfig } from "../pricing/config";
import { hourBand, round2 } from "../pricing/engine";
import { instantToWall } from "../pricing/time";
import { approxKm } from "./approx";

export { approxKm } from "./approx";

export type LegDistance = {
    km: number;
    min: number;
    source: "google" | "approx";
    durationSource: "traffic" | "static" | "approx";
    /** Google respondió una distancia que no cuadra con la línea recta (o falló): se usó el aproximado. */
    anomaly: boolean;
    /** Google respondió sin rutas (p. ej. destino inalcanzable por carretera). */
    noRoute?: boolean;
};

/** Aproximado sin Google: haversine × road_factor (mínimo min_km), duración con la tabla de velocidades. */
export function approxLegDistance(
    origin: LatLng,
    destination: LatLng,
    departure: Date,
    config: PricingConfig = pricingConfig
): { km: number; min: number } {
    const { speed_kmh } = config.approx;
    const km = approxKm(origin, destination, config);
    const band = hourBand(instantToWall(departure, config.timezone).time, config);
    const speed = band === "night" ? speed_kmh.night : band === "peak" ? speed_kmh.peak : speed_kmh.normal;
    return { km, min: Math.max(1, Math.round((km / speed) * 60)) };
}

/** ¿La distancia vial cuadra con la línea recta? (entre 0.9× y 3× la haversine) */
export function isPlausibleRoadKm(roadKm: number, straightKm: number): boolean {
    return roadKm >= straightKm * 0.9 && roadKm <= straightKm * 3;
}

/**
 * Distancia y duración de un tramo. Nunca lanza: si no hay llave o Google falla, tarda
 * o responde algo raro, regresa el aproximado marcado.
 */
export async function resolveLegDistance(
    origin: LatLng,
    destination: LatLng,
    departure: Date,
    config: PricingConfig = pricingConfig,
    now: Date = new Date()
): Promise<LegDistance> {
    const approx = (anomaly: boolean, noRoute = false): LegDistance => ({
        ...approxLegDistance(origin, destination, departure, config),
        source: "approx",
        durationSource: "approx",
        anomaly,
        ...(noRoute ? { noRoute } : {}),
    });

    if (!hasGoogleKey()) return approx(false);

    try {
        const toWp = (p: LatLng): Waypoint => ({ lat: p.lat, lng: p.lng });
        const r = await computeRoute(toWp(origin), toWp(destination), departure, now);
        const km = round2(r.distanceMeters / 1000);
        if (!isPlausibleRoadKm(km, haversineKm(origin, destination))) {
            console.warn("[distance] distancia de Google fuera de rango; se usa el aproximado");
            return approx(true);
        }
        const seconds = r.trafficAware ? r.durationSec : (r.staticDurationSec ?? r.durationSec);
        return {
            km,
            min: Math.max(1, Math.round(seconds / 60)),
            source: "google",
            durationSource: r.trafficAware ? "traffic" : "static",
            anomaly: false,
        };
    } catch (e) {
        const code = e instanceof GoogleApiError ? e.code : "UNKNOWN";
        console.warn(`[distance] Routes API falló (${code}); se usa el aproximado`);
        return approx(true, code === "NO_ROUTE");
    }
}
