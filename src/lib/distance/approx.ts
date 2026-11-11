// Distancia aproximada sin Google (sin "server-only"): la usan el motor de cotización y el
// contenido estático (rutas frecuentes, ejemplo de /tarifas), para que prometan la misma cifra.
import { haversineKm, type LatLng } from "../geo";
import { pricingConfig, type PricingConfig } from "../pricing/config";
import { round2 } from "../pricing/engine";

/** haversine × road_factor, con mínimo min_km (km con dos decimales). */
export function approxKm(origin: LatLng, destination: LatLng, config: PricingConfig = pricingConfig): number {
    const { road_factor, min_km } = config.approx;
    return round2(Math.max(min_km, haversineKm(origin, destination) * road_factor));
}
