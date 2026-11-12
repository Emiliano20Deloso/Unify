import { z } from "zod";
import { GOOGLE_PLACE_ID_RE, googlePlaceDetails } from "@/lib/google/places";
import { GoogleApiError, hasGoogleKey } from "@/lib/google/key";
import { errorResponse, guardJsonRequest, jsonResponse, zodIssues } from "@/lib/http/guard";
import { CATALOG_PREFIX, getCatalogPlace } from "@/lib/places/catalog";
import { isAirport, isInZone } from "@/lib/places/zone";

export const runtime = "nodejs";

const bodySchema = z
    .object({
        id: z.string().min(1).max(300),
        sessionToken: z.string().uuid().optional(),
        lang: z.enum(["es", "en"]).default("es"),
    })
    .strict();

// Coordenadas de una sugerencia. Para ids de Google: Place Details (New) con FieldMask mínimo.
export async function POST(req: Request) {
    const guarded = await guardJsonRequest(req, "details");
    if (!guarded.ok) return guarded.response;

    const parsed = bodySchema.safeParse(guarded.body);
    if (!parsed.success) {
        return errorResponse(422, "VALIDATION", "Datos inválidos", { issues: zodIssues(parsed.error) });
    }
    const { id, sessionToken, lang } = parsed.data;

    if (id.startsWith(CATALOG_PREFIX)) {
        const place = getCatalogPlace(id);
        if (!place) return errorResponse(404, "NOT_FOUND", "Lugar no encontrado");
        const ref = { lat: place.lat, lng: place.lng, placeId: id };
        return jsonResponse({
            ok: true,
            id,
            label: place.name[lang],
            lat: place.lat,
            lng: place.lng,
            airport: place.kind === "airport",
            inZone: isInZone(ref),
            source: "catalog",
        });
    }

    if (!GOOGLE_PLACE_ID_RE.test(id)) {
        return errorResponse(422, "VALIDATION", "Identificador de lugar inválido", {
            issues: [{ path: "id", message: "Formato inválido" }],
        });
    }
    if (!hasGoogleKey()) {
        return errorResponse(503, "PLACES_UNAVAILABLE", "Búsqueda de direcciones no disponible");
    }

    try {
        const d = await googlePlaceDetails(id, sessionToken, lang);
        const ref = { lat: d.lat, lng: d.lng, placeId: d.id };
        return jsonResponse({
            ok: true,
            id: d.id,
            label: d.label,
            lat: d.lat,
            lng: d.lng,
            airport: d.types.includes("airport") || isAirport(ref),
            inZone: isInZone(ref),
            source: "google",
        });
    } catch (e) {
        console.warn(`[places/details] Google falló (${e instanceof GoogleApiError ? e.code : "UNKNOWN"})`);
        return errorResponse(502, "PLACES_UNAVAILABLE", "No se pudo obtener el lugar");
    }
}
