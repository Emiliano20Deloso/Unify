import "server-only";

/**
 * Llave de servidor de Google Maps Platform. Solo se lee aquí, en servidor.
 * Nunca se registra en logs ni se usa NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 * Restringirla en Google Cloud a Routes API y Places API (New) y fijar cuotas diarias:
 * ese es el tope real de costo (el límite por IP de src/lib/http/guard.ts es solo best-effort).
 */
export function getGoogleServerKey(): string | null {
    const key = process.env.GOOGLE_MAPS_SERVER_KEY?.trim();
    return key ? key : null;
}

export function hasGoogleKey(): boolean {
    return getGoogleServerKey() !== null;
}

export const GOOGLE_TIMEOUT_MS = 4000;

/** Error de Google sin datos sensibles (ni la llave ni la URL completa). */
export class GoogleApiError extends Error {
    constructor(
        public code: "HTTP_ERROR" | "TIMEOUT" | "NETWORK" | "BAD_RESPONSE" | "NO_ROUTE" | "NO_KEY",
        public status?: number
    ) {
        super(`Google ${code}${status ? ` (${status})` : ""}`);
        this.name = "GoogleApiError";
    }
}

/** fetch con timeout y sin reintentos; convierte fallas en GoogleApiError. */
export async function googleFetch(url: string, init: RequestInit): Promise<unknown> {
    let resp: Response;
    try {
        resp = await fetch(url, {
            ...init,
            cache: "no-store",
            signal: AbortSignal.timeout(GOOGLE_TIMEOUT_MS),
        });
    } catch (e) {
        const name = e instanceof Error ? e.name : "";
        throw new GoogleApiError(name === "TimeoutError" || name === "AbortError" ? "TIMEOUT" : "NETWORK");
    }
    if (!resp.ok) throw new GoogleApiError("HTTP_ERROR", resp.status);
    try {
        return await resp.json();
    } catch {
        throw new GoogleApiError("BAD_RESPONSE", resp.status);
    }
}
