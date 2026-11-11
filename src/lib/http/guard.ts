import "server-only";

// Protección básica de las rutas públicas del cotizador, sin almacenes externos.
// El límite por IP vive en memoria de cada instancia: es best-effort (en serverless cada
// instancia lleva su propia cuenta). El tope REAL de costo son las cuotas diarias configuradas
// en Google Cloud para Routes API y Places API (New), más la regla de rate limit de Vercel WAF.

export const MAX_BODY_BYTES = 8 * 1024;

export const RATE_LIMITS = {
    autocomplete: 40,
    details: 15,
    estimate: 12,
} as const;
export type RateBucket = keyof typeof RATE_LIMITS;

const WINDOW_MS = 60_000;
const MAX_ENTRIES = 10_000;

type Counter = { count: number; resetAt: number };
const counters = new Map<string, Counter>();
let lastSweep = 0;

function sweep(now: number) {
    if (now - lastSweep < WINDOW_MS && counters.size < MAX_ENTRIES) return;
    lastSweep = now;
    for (const [k, v] of counters) if (v.resetAt <= now) counters.delete(k);
    // Si aun así se pasa del tope, se descartan las más antiguas (orden de inserción).
    if (counters.size >= MAX_ENTRIES) {
        const excess = counters.size - MAX_ENTRIES + 1;
        let i = 0;
        for (const k of counters.keys()) {
            if (i++ >= excess) break;
            counters.delete(k);
        }
    }
}

export function clientIp(req: Request): string {
    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0]!.trim() || "unknown";
    return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Ventana fija de 60 s por IP y por ruta. Devuelve los segundos a esperar si se excede. */
export function checkRateLimit(
    bucket: RateBucket,
    ip: string,
    now: number = Date.now()
): { ok: true } | { ok: false; retryAfter: number } {
    sweep(now);
    const key = `${bucket}:${ip}`;
    const c = counters.get(key);
    if (!c || c.resetAt <= now) {
        counters.delete(key);
        counters.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return { ok: true };
    }
    if (c.count >= RATE_LIMITS[bucket]) {
        return { ok: false, retryAfter: Math.max(1, Math.ceil((c.resetAt - now) / 1000)) };
    }
    c.count++;
    return { ok: true };
}

/** Solo para pruebas. */
export function resetRateLimits() {
    counters.clear();
    lastSweep = 0;
}

export function rateLimiterSize(): number {
    return counters.size;
}

function hostsFor(req: Request): Set<string> {
    const hosts = new Set<string>();
    const add = (h: string | null | undefined) => h && hosts.add(h.toLowerCase());
    try {
        add(new URL(req.url).host);
    } catch {
        /* url relativa: se ignora */
    }
    add(req.headers.get("host"));
    add(req.headers.get("x-forwarded-host")?.split(",")[0]?.trim());
    for (const env of [process.env.NEXT_PUBLIC_APP_URL, process.env.NEXT_PUBLIC_SITE_URL]) {
        if (!env) continue;
        try {
            add(new URL(env).host);
        } catch {
            /* valor inválido: se ignora */
        }
    }
    return hosts;
}

/**
 * Mismo origen. Con `Origin`: su host debe ser el de la petición (o el del sitio configurado).
 * Sin `Origin`: se acepta `Sec-Fetch-Site: same-origin`. Sin ninguna de las dos: se permite en
 * desarrollo (curl) y se rechaza en producción.
 */
export function isSameOrigin(req: Request): boolean {
    const origin = req.headers.get("origin");
    if (origin && origin !== "null") {
        try {
            return hostsFor(req).has(new URL(origin).host.toLowerCase());
        } catch {
            return false;
        }
    }
    const site = req.headers.get("sec-fetch-site");
    if (site) return site === "same-origin";
    return process.env.NODE_ENV !== "production";
}

export const NO_STORE = { "Cache-Control": "no-store" } as const;

export type ApiErrorCode =
    | "INVALID_JSON"
    | "PAYLOAD_TOO_LARGE"
    | "VALIDATION"
    | "PICKUP_IN_PAST"
    | "TOO_FAR_AHEAD"
    | "SAME_PLACE"
    | "RATE_LIMITED"
    | "FORBIDDEN_ORIGIN"
    | "NOT_FOUND"
    | "PLACES_UNAVAILABLE";

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
    return Response.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

export function errorResponse(
    status: number,
    code: ApiErrorCode,
    message: string,
    extra: { issues?: unknown; headers?: Record<string, string> } = {}
): Response {
    const body: Record<string, unknown> = { ok: false, code, message };
    if (extra.issues !== undefined) body.issues = extra.issues;
    return jsonResponse(body, status, extra.headers);
}

/** Lee el cuerpo con tope de bytes sin cargarlo entero si se pasa. */
async function readBodyCapped(req: Request, max: number): Promise<string | null> {
    const declared = Number(req.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > max) return null;
    if (!req.body) return "";
    const reader = req.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > max) {
            await reader.cancel().catch(() => {});
            return null;
        }
        chunks.push(value);
    }
    const all = new Uint8Array(size);
    let off = 0;
    for (const c of chunks) {
        all.set(c, off);
        off += c.byteLength;
    }
    return new TextDecoder().decode(all);
}

/**
 * Origen → límite → tamaño → JSON. Devuelve el cuerpo ya parseado o la respuesta de error.
 */
export async function guardJsonRequest(
    req: Request,
    bucket: RateBucket
): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
    if (!isSameOrigin(req)) {
        return { ok: false, response: errorResponse(403, "FORBIDDEN_ORIGIN", "Origen no permitido") };
    }
    const rl = checkRateLimit(bucket, clientIp(req));
    if (!rl.ok) {
        return {
            ok: false,
            response: errorResponse(429, "RATE_LIMITED", "Demasiadas solicitudes, intenta en un momento", {
                headers: { "Retry-After": String(rl.retryAfter) },
            }),
        };
    }
    const text = await readBodyCapped(req, MAX_BODY_BYTES);
    if (text === null) {
        return { ok: false, response: errorResponse(413, "PAYLOAD_TOO_LARGE", "Cuerpo demasiado grande") };
    }
    try {
        return { ok: true, body: JSON.parse(text) };
    } catch {
        return { ok: false, response: errorResponse(400, "INVALID_JSON", "El cuerpo no es JSON válido") };
    }
}

/** Formato de issues de zod para la respuesta. */
export function zodIssues(error: { issues: { path: (string | number)[]; message: string }[] }) {
    return error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
}
