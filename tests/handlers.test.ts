import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { POST as estimate } from "@/app/api/estimate/route";
import { POST as autocomplete } from "@/app/api/places/autocomplete/route";
import { POST as details } from "@/app/api/places/details/route";
import { POST as quote } from "@/app/api/quote/route";
import { resetRateLimits } from "@/lib/http/guard";
import { addDays, todayInTz, weekdayOf } from "@/lib/pricing/time";
import { getCatalogPlace } from "@/lib/places/catalog";

const TZ = "America/Mexico_City";
const BASE = "http://localhost:3000";
const SESSION = "6f1c2d3e-4b5a-4c7d-8e9f-0a1b2c3d4e5f";

function nextTuesday(minDaysAhead = 2): string {
    let d = addDays(todayInTz(TZ), minDaysAhead);
    while (weekdayOf(d) !== 2) d = addDays(d, 1);
    return d;
}

function post(path: string, body: unknown, headers: Record<string, string> = {}) {
    return new Request(`${BASE}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: BASE, "x-forwarded-for": "203.0.113.7", ...headers },
        body: typeof body === "string" ? body : JSON.stringify(body),
    });
}

const place = (slug: string) => {
    const p = getCatalogPlace(slug)!;
    return { label: p.name.es, placeId: `cat:${slug}`, lat: p.lat, lng: p.lng };
};

function estimateBody(over: Record<string, unknown> = {}) {
    return {
        origin: place("polanco"),
        destination: place("aicm-t1"),
        date: nextTuesday(),
        time: "10:00",
        passengers: 2,
        luggage: 1,
        lang: "es",
        ...over,
    };
}

const originalKey = process.env.GOOGLE_MAPS_SERVER_KEY;
beforeEach(() => {
    resetRateLimits();
    delete process.env.GOOGLE_MAPS_SERVER_KEY;
});
afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    if (originalKey === undefined) delete process.env.GOOGLE_MAPS_SERVER_KEY;
    else process.env.GOOGLE_MAPS_SERVER_KEY = originalKey;
});

describe("POST /api/estimate", () => {
    it("sin llave → 200 approx, Select 399 por mínimo, Σ líneas = total, no-store", async () => {
        const fetchSpy = vi.fn();
        vi.stubGlobal("fetch", fetchSpy);
        const res = await estimate(post("/api/estimate", estimateBody()));
        expect(res.status).toBe(200);
        expect(res.headers.get("cache-control")).toBe("no-store");
        const json = await res.json();
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(json.ok).toBe(true);
        expect(json.ref).toMatch(/^UE-[0-9A-Z]{6}$/);
        expect(json.legs[0]).toMatchObject({ direction: "outbound", distanceSource: "approx", durationSource: "approx" });
        expect(json.legs[0].distanceKm).toBeGreaterThan(14);
        expect(json.legs[0].distanceKm).toBeLessThan(19);
        expect(json.flags.airport).toBe(true);
        expect(json.attribution).toBeNull();
        expect(json.specialQuote).toEqual({ required: false, reasons: [] });
        expect(json.tiers.select.total).toBe(399);
        expect(json.tiers.select.legs[0].minFareApplied).toBe(true);
        for (const t of Object.values(json.tiers) as { legs: { lines: { amount: number }[]; total: number }[] }[]) {
            for (const l of t.legs) expect(l.lines.reduce((s, x) => s + x.amount, 0)).toBe(l.total);
        }
        expect(json.notices).toEqual(expect.arrayContaining(["estimate_not_binding", "tolls_not_included", "waiting_policy"]));
        // La referencia es determinista.
        const again = await (await estimate(post("/api/estimate", estimateBody()))).json();
        expect(again.ref).toBe(json.ref);
    });

    it("con llave y Google simulado → google + atribución", async () => {
        vi.stubEnv("GOOGLE_MAPS_SERVER_KEY", "test-key");
        const f = vi.fn(async () => Response.json({ routes: [{ distanceMeters: 25000, duration: "2400s" }] }));
        vi.stubGlobal("fetch", f);
        const json = await (await estimate(post("/api/estimate", estimateBody()))).json();
        expect(f).toHaveBeenCalledTimes(1);
        expect(json.legs[0]).toMatchObject({ distanceKm: 25, durationMin: 40, distanceSource: "google", durationSource: "traffic" });
        expect(json.attribution).toBe("google_maps");
        expect(json.tiers.select.total).toBe(450);
        expect(json.tiers.premium.total).toBe(599);
    });

    it.each([
        ["error", async () => new Response("x", { status: 503 })],
        ["timeout", async () => { throw Object.assign(new Error("t"), { name: "TimeoutError" }); }],
    ])("Google con %s → 200 approx", async (_n, impl) => {
        vi.stubEnv("GOOGLE_MAPS_SERVER_KEY", "test-key");
        vi.stubGlobal("fetch", vi.fn(impl));
        const res = await estimate(post("/api/estimate", estimateBody()));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.legs[0].distanceSource).toBe("approx");
        expect(json.flags.distanceAnomaly).toBe(true);
        expect(json.tiers).not.toBeNull();
    });

    it("fuera de zona → specialQuote sin precios y sin llamar a Google", async () => {
        vi.stubEnv("GOOGLE_MAPS_SERVER_KEY", "test-key");
        const f = vi.fn();
        vi.stubGlobal("fetch", f);
        const json = await (await estimate(post("/api/estimate", estimateBody({ destination: place("aeropuerto-toluca") })))).json();
        expect(json.specialQuote).toEqual({ required: true, reasons: ["out_of_zone"] });
        expect(json.tiers).toBeNull();
        expect(json.flags.outOfZone).toBe(true);
        expect(f).not.toHaveBeenCalled();
    });

    it("exceso de capacidad → specialQuote capacity", async () => {
        const json = await (await estimate(post("/api/estimate", estimateBody({ passengers: 5, luggage: 3 })))).json();
        expect(json.specialQuote).toEqual({ required: true, reasons: ["capacity"] });
        expect(json.tiers).toBeNull();
    });

    it("ida y vuelta: dos tramos con recargos propios y total = suma", async () => {
        const date = nextTuesday();
        const json = await (await estimate(post("/api/estimate", estimateBody({ returnTrip: { date, time: "23:00" } })))).json();
        expect(json.legs.map((l: { direction: string }) => l.direction)).toEqual(["outbound", "return"]);
        expect(json.legs[1].flags.night).toBe(true);
        expect(json.flags.night).toBe(true);
        const sel = json.tiers.select;
        expect(sel.legs[0].hourMultiplier).toBe(1);
        expect(sel.legs[1].hourMultiplier).toBe(1.35);
        expect(sel.total).toBe(sel.legs[0].total + sel.legs[1].total);
    });

    it("fecha pasada → 422 PICKUP_IN_PAST", async () => {
        const res = await estimate(post("/api/estimate", estimateBody({ date: "2025-01-07" })));
        expect(res.status).toBe(422);
        expect((await res.json()).code).toBe("PICKUP_IN_PAST");
    });

    it("demasiado adelante → 422 TOO_FAR_AHEAD; mismo lugar → 422 SAME_PLACE; regreso antes de la ida → 422", async () => {
        const far = await estimate(post("/api/estimate", estimateBody({ date: addDays(todayInTz(TZ), 400) })));
        expect((await far.json()).code).toBe("TOO_FAR_AHEAD");
        const same = await estimate(post("/api/estimate", estimateBody({ destination: { ...place("polanco"), placeId: undefined } })));
        expect(same.status).toBe(422);
        expect((await same.json()).code).toBe("SAME_PLACE");
        const back = await estimate(post("/api/estimate", estimateBody({ returnTrip: { date: nextTuesday(), time: "09:00" } })));
        expect((await back.json()).code).toBe("VALIDATION");
    });

    it("cuerpo inválido → 422; JSON roto → 400; cuerpo grande → 413", async () => {
        const bad = await estimate(post("/api/estimate", estimateBody({ passengers: 0, extra: 1 })));
        expect(bad.status).toBe(422);
        const j = await bad.json();
        expect(j.code).toBe("VALIDATION");
        expect(j.issues.length).toBeGreaterThan(0);
        const outsideMx = await estimate(post("/api/estimate", estimateBody({ origin: { label: "NY", lat: 40.7, lng: -74 } })));
        expect(outsideMx.status).toBe(422);
        expect((await estimate(post("/api/estimate", "{nope"))).status).toBe(400);
        const big = await estimate(post("/api/estimate", JSON.stringify({ pad: "x".repeat(9000) })));
        expect(big.status).toBe(413);
    });

    it("límite de peticiones → 429 con Retry-After", async () => {
        let last: Response | undefined;
        for (let i = 0; i < 13; i++) last = await estimate(post("/api/estimate", estimateBody()));
        expect(last!.status).toBe(429);
        expect(Number(last!.headers.get("retry-after"))).toBeGreaterThan(0);
        // Otra IP no se ve afectada.
        expect((await estimate(post("/api/estimate", estimateBody(), { "x-forwarded-for": "198.51.100.1" }))).status).toBe(200);
    });

    it("origen ajeno → 403; sin Origin en producción → 403", async () => {
        expect((await estimate(post("/api/estimate", estimateBody(), { origin: "https://evil.example" }))).status).toBe(403);
        vi.stubEnv("NODE_ENV", "production");
        const noOrigin = new Request(`${BASE}/api/estimate`, { method: "POST", body: JSON.stringify(estimateBody()) });
        expect((await estimate(noOrigin)).status).toBe(403);
        const sameSite = new Request(`${BASE}/api/estimate`, { method: "POST", headers: { "sec-fetch-site": "same-origin" }, body: JSON.stringify(estimateBody()) });
        expect((await estimate(sameSite)).status).toBe(200);
    });
});

describe("POST /api/places/*", () => {
    it("autocomplete sin llave → catálogo + degraded no_key", async () => {
        const res = await autocomplete(post("/api/places/autocomplete", { input: "aero", sessionToken: SESSION, lang: "es" }));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toMatchObject({ ok: true, attribution: null, degraded: "no_key" });
        expect(json.suggestions[0]).toMatchObject({ source: "catalog", kind: "airport" });
        expect(json.suggestions[0].id).toMatch(/^cat:/);
    });

    it("autocomplete con llave → catálogo + Google con FieldMask y sesgo", async () => {
        vi.stubEnv("GOOGLE_MAPS_SERVER_KEY", "test-key");
        const f = vi.fn(async () =>
            Response.json({
                suggestions: [
                    { placePrediction: { placeId: "ChIJ_test_place_1", text: { text: "Av. Presidente Masaryk 123, Polanco" }, structuredFormat: { mainText: { text: "Av. Presidente Masaryk 123" }, secondaryText: { text: "Polanco, CDMX" } }, types: ["street_address"] } },
                ],
            })
        );
        vi.stubGlobal("fetch", f);
        const json = await (await autocomplete(post("/api/places/autocomplete", { input: "masaryk", sessionToken: SESSION }))).json();
        expect(json.attribution).toBe("google_maps");
        expect(json.degraded).toBeUndefined();
        expect(json.suggestions.at(-1)).toEqual({ id: "ChIJ_test_place_1", main: "Av. Presidente Masaryk 123", secondary: "Polanco, CDMX", source: "google" });
        const init = (f.mock.calls[0] as unknown as [string, RequestInit])[1];
        const body = JSON.parse(init.body as string);
        expect(body).toMatchObject({ sessionToken: SESSION, includedRegionCodes: ["mx"], locationBias: { circle: { radius: 50000 } } });
    });

    it("autocomplete con Google caído → degraded google_error", async () => {
        vi.stubEnv("GOOGLE_MAPS_SERVER_KEY", "test-key");
        vi.stubGlobal("fetch", vi.fn(async () => new Response("x", { status: 500 })));
        const json = await (await autocomplete(post("/api/places/autocomplete", { input: "polanco", sessionToken: SESSION }))).json();
        expect(json).toMatchObject({ ok: true, degraded: "google_error", attribution: null });
        expect(json.suggestions[0].id).toBe("cat:polanco");
    });

    it("autocomplete valida entrada y límite 40/min", async () => {
        expect((await autocomplete(post("/api/places/autocomplete", { input: "ab", sessionToken: SESSION }))).status).toBe(422);
        expect((await autocomplete(post("/api/places/autocomplete", { input: "abc", sessionToken: "x" }))).status).toBe(422);
        resetRateLimits();
        let last: Response | undefined;
        for (let i = 0; i < 41; i++) last = await autocomplete(post("/api/places/autocomplete", { input: "roma", sessionToken: SESSION }));
        expect(last!.status).toBe(429);
    });

    it("details de catálogo", async () => {
        const json = await (await details(post("/api/places/details", { id: "cat:aicm-t1" }))).json();
        expect(json).toMatchObject({ ok: true, id: "cat:aicm-t1", airport: true, inZone: true, source: "catalog" });
        const tlc = await (await details(post("/api/places/details", { id: "cat:aeropuerto-toluca" }))).json();
        expect(tlc.inZone).toBe(false);
        expect((await details(post("/api/places/details", { id: "cat:nada" }))).status).toBe(404);
    });

    it("details de Google con FieldMask sin displayName", async () => {
        vi.stubEnv("GOOGLE_MAPS_SERVER_KEY", "test-key");
        const f = vi.fn(async () => Response.json({ id: "ChIJ_test_place_1", formattedAddress: "Masaryk 123, Polanco, CDMX", types: ["street_address"], location: { latitude: 19.431, longitude: -99.195 } }));
        vi.stubGlobal("fetch", f);
        const json = await (await details(post("/api/places/details", { id: "ChIJ_test_place_1", sessionToken: SESSION }))).json();
        expect(json).toEqual({ ok: true, id: "ChIJ_test_place_1", label: "Masaryk 123, Polanco, CDMX", lat: 19.431, lng: -99.195, airport: false, inZone: true, source: "google" });
        const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
        expect(url).toContain(`sessionToken=${SESSION}`);
        expect((init.headers as Record<string, string>)["X-Goog-FieldMask"]).toBe("id,location,formattedAddress,types");
    });

    it("details de Google sin llave → 503", async () => {
        expect((await details(post("/api/places/details", { id: "ChIJ_test_place_1" }))).status).toBe(503);
    });
});

describe("POST /api/quote", () => {
    it("conserva 503 not_configured sin Supabase", async () => {
        vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
        vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
        const res = await quote(
            post("/api/quote", {
                origin: "Polanco", destination: "AICM T1", pickupAt: "2030-01-08T10:00:00-06:00",
                passengers: 2, luggage: 1, serviceLevel: "select", customerName: "Ana", customerEmail: "ana@example.com",
            })
        );
        expect(res.status).toBe(503);
        expect(await res.json()).toEqual({ error: "not_configured" });
    });
});
