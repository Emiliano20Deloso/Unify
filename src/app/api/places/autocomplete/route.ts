import { z } from "zod";
import { googleAutocomplete } from "@/lib/google/places";
import { GoogleApiError, hasGoogleKey } from "@/lib/google/key";
import { errorResponse, guardJsonRequest, jsonResponse, zodIssues } from "@/lib/http/guard";
import { catalogId, searchCatalog } from "@/lib/places/catalog";

export const runtime = "nodejs";

const bodySchema = z
    .object({
        input: z.string().trim().min(3).max(120),
        sessionToken: z.string().uuid(),
        lang: z.enum(["es", "en"]).default("es"),
    })
    .strict();

type Suggestion = {
    id: string;
    main: string;
    secondary?: string;
    source: "catalog" | "google";
    kind?: "airport" | "zone" | "venue";
};

// Primero el catálogo; con llave, además Places API (New). Las sugerencias de Google no se cachean.
export async function POST(req: Request) {
    const guarded = await guardJsonRequest(req, "autocomplete");
    if (!guarded.ok) return guarded.response;

    const parsed = bodySchema.safeParse(guarded.body);
    if (!parsed.success) {
        return errorResponse(422, "VALIDATION", "Datos inválidos", { issues: zodIssues(parsed.error) });
    }
    const { input, sessionToken, lang } = parsed.data;

    const suggestions: Suggestion[] = searchCatalog(input).map((p) => ({
        id: catalogId(p.slug),
        main: p.name[lang],
        source: "catalog",
        kind: p.kind,
    }));

    if (!hasGoogleKey()) {
        return jsonResponse({ ok: true, suggestions, attribution: null, degraded: "no_key" });
    }

    try {
        const predictions = await googleAutocomplete(input, sessionToken, lang);
        for (const p of predictions) {
            suggestions.push({
                id: p.placeId,
                main: p.main,
                ...(p.secondary ? { secondary: p.secondary } : {}),
                source: "google",
                ...(p.types.includes("airport") ? { kind: "airport" as const } : {}),
            });
        }
        return jsonResponse({
            ok: true,
            suggestions,
            attribution: predictions.length > 0 ? "google_maps" : null,
        });
    } catch (e) {
        console.warn(`[places/autocomplete] Google falló (${e instanceof GoogleApiError ? e.code : "UNKNOWN"})`);
        return jsonResponse({ ok: true, suggestions, attribution: null, degraded: "google_error" });
    }
}
