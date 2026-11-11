// Llamadas del navegador a /api/estimate y /api/places/*. Solo tipos del contrato: nada de zod.
import type { EstimateError, EstimateRequest, EstimateResponse } from "../estimate/schema";
import type { QuoteDraft, QuotePlace, Suggestion } from "./types";

type Lang = "es" | "en";

/** Petición de estimación a partir del borrador (null si faltan lugares). */
export function draftToRequest(draft: QuoteDraft, lang: Lang): EstimateRequest | null {
    if (!draft.origin || !draft.destination) return null;
    const place = (p: QuotePlace) => ({ label: p.label, placeId: p.id, lat: p.lat, lng: p.lng });
    return {
        origin: place(draft.origin),
        destination: place(draft.destination),
        date: draft.date,
        time: draft.time,
        passengers: draft.passengers,
        luggage: draft.luggage,
        returnTrip: draft.roundTrip ? { date: draft.returnDate, time: draft.returnTime } : null,
        lang,
    };
}

/** Clave estable de la petición (para no repetir consultas idénticas). */
export function requestKey(req: EstimateRequest): string {
    return JSON.stringify([
        req.origin.placeId,
        req.origin.lat,
        req.origin.lng,
        req.destination.placeId,
        req.destination.lat,
        req.destination.lng,
        req.date,
        req.time,
        req.passengers,
        req.luggage,
        req.returnTrip ?? null,
        req.lang,
    ]);
}

export type EstimateResult =
    | { kind: "ok"; data: EstimateResponse }
    | { kind: "invalid"; error: EstimateError }
    | { kind: "rate_limited"; retryAfter: number }
    | { kind: "network" }
    | { kind: "error" };

async function postJson(url: string, body: unknown, signal?: AbortSignal): Promise<Response> {
    return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
    });
}

/** Lanza AbortError si se cancela (quien llama lo ignora). */
export async function fetchEstimate(req: EstimateRequest, signal?: AbortSignal): Promise<EstimateResult> {
    let res: Response;
    try {
        res = await postJson("/api/estimate", req, signal);
    } catch (e) {
        if (signal?.aborted) throw e;
        return { kind: "network" };
    }
    if (res.status === 429) {
        return { kind: "rate_limited", retryAfter: Number(res.headers.get("Retry-After")) || 30 };
    }
    let body: unknown;
    try {
        body = await res.json();
    } catch (e) {
        if (signal?.aborted) throw e;
        return { kind: "error" };
    }
    if (res.ok && (body as EstimateResponse)?.ok === true) return { kind: "ok", data: body as EstimateResponse };
    if (res.status === 422 && (body as EstimateError)?.ok === false) return { kind: "invalid", error: body as EstimateError };
    return { kind: "error" };
}

export type AutocompleteResult =
    | { kind: "ok"; suggestions: Suggestion[]; attribution: "google_maps" | null; degraded: "no_key" | "google_error" | null }
    | { kind: "error" };

export async function fetchSuggestions(
    input: string,
    sessionToken: string,
    lang: Lang,
    signal?: AbortSignal
): Promise<AutocompleteResult> {
    let res: Response;
    try {
        res = await postJson("/api/places/autocomplete", { input, sessionToken, lang }, signal);
    } catch (e) {
        if (signal?.aborted) throw e;
        return { kind: "error" };
    }
    if (!res.ok) return { kind: "error" };
    const body = (await res.json().catch(() => null)) as {
        ok?: boolean;
        suggestions?: Suggestion[];
        attribution?: "google_maps" | null;
        degraded?: "no_key" | "google_error";
    } | null;
    if (!body?.ok || !Array.isArray(body.suggestions)) return { kind: "error" };
    return {
        kind: "ok",
        suggestions: body.suggestions,
        attribution: body.attribution ?? null,
        degraded: body.degraded ?? null,
    };
}

/** Coordenadas de una sugerencia de Google (las del catálogo se resuelven en el cliente). */
export async function fetchPlaceDetails(
    id: string,
    sessionToken: string,
    lang: Lang,
    signal?: AbortSignal
): Promise<QuotePlace | null> {
    try {
        const res = await postJson("/api/places/details", { id, sessionToken, lang }, signal);
        if (!res.ok) return null;
        const b = (await res.json()) as { ok?: boolean; id?: string; label?: string; lat?: number; lng?: number; airport?: boolean };
        if (!b?.ok || typeof b.lat !== "number" || typeof b.lng !== "number" || typeof b.label !== "string") return null;
        return { id: b.id ?? id, label: b.label, lat: b.lat, lng: b.lng, kind: b.airport ? "airport" : "address" };
    } catch (e) {
        if (signal?.aborted) throw e;
        return null;
    }
}

/** UUID v4 para el token de sesión de Places (renovado tras cada elección). */
export function newSessionToken(): string {
    if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
    // Respaldo para navegadores sin randomUUID (contextos no seguros).
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6]! & 0x0f) | 0x40;
    b[8] = (b[8]! & 0x3f) | 0x80;
    const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
