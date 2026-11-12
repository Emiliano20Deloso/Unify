import "server-only";
import { getGoogleServerKey, googleFetch, GoogleApiError } from "./key";

const COMPUTE_ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";
// Mínimo necesario. Sin peajes: TOLLS es SKU Enterprise.
const FIELD_MASK = "routes.distanceMeters,routes.duration,routes.staticDuration";

export type Waypoint = { lat: number; lng: number } | { address: string };

export type RouteResult = {
    distanceMeters: number;
    durationSec: number;
    staticDurationSec: number | null;
    trafficAware: boolean;
};

function toWaypoint(w: Waypoint) {
    return "address" in w
        ? { address: w.address }
        : { location: { latLng: { latitude: w.lat, longitude: w.lng } } };
}

/** "2710s" → 2710 */
function parseDuration(v: unknown): number | null {
    if (typeof v !== "string") return null;
    const m = /^(\d+(?:\.\d+)?)s$/.exec(v);
    return m ? Number(m[1]) : null;
}

export function trafficAwareEnabled(): boolean {
    return process.env.GOOGLE_ROUTES_TRAFFIC?.trim().toLowerCase() !== "unaware";
}

/** Routes API computeRoutes por REST. Timeout 4 s, sin reintentos. */
export async function computeRoute(
    origin: Waypoint,
    destination: Waypoint,
    departure: Date | null,
    now: Date = new Date()
): Promise<RouteResult> {
    const key = getGoogleServerKey();
    if (!key) throw new GoogleApiError("NO_KEY");
    const trafficAware = trafficAwareEnabled();

    const body: Record<string, unknown> = {
        origin: toWaypoint(origin),
        destination: toWaypoint(destination),
        travelMode: "DRIVE",
        routingPreference: trafficAware ? "TRAFFIC_AWARE" : "TRAFFIC_UNAWARE",
        languageCode: "es-MX",
        regionCode: "mx",
        units: "METRIC",
    };
    // departureTime debe ser futuro; si no lo es, se omite y Google usa "ahora".
    if (departure && departure.getTime() > now.getTime() + 60_000) {
        body.departureTime = departure.toISOString();
    }

    const data = (await googleFetch(COMPUTE_ROUTES_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": key,
            "X-Goog-FieldMask": FIELD_MASK,
        },
        body: JSON.stringify(body),
    })) as { routes?: { distanceMeters?: number; duration?: string; staticDuration?: string }[] };

    const route = data?.routes?.[0];
    if (!route) throw new GoogleApiError("NO_ROUTE");
    const duration = parseDuration(route.duration);
    if (typeof route.distanceMeters !== "number" || duration === null) {
        throw new GoogleApiError("BAD_RESPONSE");
    }
    return {
        distanceMeters: route.distanceMeters,
        durationSec: duration,
        staticDurationSec: parseDuration(route.staticDuration),
        trafficAware,
    };
}
