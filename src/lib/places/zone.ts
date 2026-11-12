import { haversineKm, type LatLng } from "../geo";
import { pricingConfig, type PricingConfig } from "../pricing/config";
import { CATALOG, getCatalogPlace, CATALOG_PREFIX } from "./catalog";

/** Radio para reconocer que un punto cualquiera es un aeropuerto del catálogo. */
const AIRPORT_MATCH_KM = 1.2;

export type PointRef = LatLng & { placeId?: string | null };

function catalogEntry(ref: PointRef) {
    return ref.placeId?.startsWith(CATALOG_PREFIX) ? getCatalogPlace(ref.placeId) : undefined;
}

/** Dentro de zona: a menos de radius_km del centro y no marcado "out" en el catálogo. */
export function isInZone(ref: PointRef, config: PricingConfig = pricingConfig): boolean {
    if (catalogEntry(ref)?.zone === "out") return false;
    // Un punto pegado a un lugar del catálogo marcado fuera también se considera fuera.
    const nearOut = CATALOG.some((p) => p.zone === "out" && haversineKm(p, ref) <= AIRPORT_MATCH_KM);
    if (nearOut) return false;
    return haversineKm(config.service_area.center, ref) <= config.service_area.radius_km;
}

export function isAirport(ref: PointRef): boolean {
    const entry = catalogEntry(ref);
    if (entry) return entry.kind === "airport";
    return CATALOG.some((p) => p.kind === "airport" && haversineKm(p, ref) <= AIRPORT_MATCH_KM);
}
