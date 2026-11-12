import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { haversineKm, isInMexico, isWithinServiceRadius } from "@/lib/geo";
import { approxLegDistance, isPlausibleRoadKm, resolveLegDistance } from "@/lib/distance";
import { isAirport, isInZone } from "@/lib/places/zone";
import { getCatalogPlace } from "@/lib/places/catalog";
import { pricingConfig } from "@/lib/pricing";

const ZOCALO = { lat: 19.4326, lng: -99.1332 };
const POLANCO = getCatalogPlace("polanco")!;
const T1 = getCatalogPlace("aicm-t1")!;
const DEP = new Date("2030-01-08T16:00:00Z"); // martes 10:00 CDMX

describe("geo", () => {
    it("haversine", () => {
        expect(haversineKm(ZOCALO, ZOCALO)).toBe(0);
        // 1° de latitud ≈ 111.2 km
        expect(haversineKm({ lat: 19, lng: -99 }, { lat: 20, lng: -99 })).toBeCloseTo(111.2, 0);
        expect(haversineKm(POLANCO, T1)).toBeGreaterThan(11);
        expect(haversineKm(POLANCO, T1)).toBeLessThan(13.5);
    });
    it("radio de servicio y México", () => {
        expect(isWithinServiceRadius({ lat: 19.75, lng: -99.0 })).toBe(true); // ~37 km
        expect(isWithinServiceRadius({ lat: 19.05, lng: -98.2 })).toBe(false); // Puebla
        expect(isInMexico({ lat: 40.7, lng: -74 })).toBe(false);
        expect(isInMexico(ZOCALO)).toBe(true);
    });
    it("zona: radio y lugar del catálogo marcado fuera", () => {
        expect(isInZone({ ...POLANCO, placeId: "cat:polanco" })).toBe(true);
        expect(isInZone({ lat: 19.05, lng: -98.2 })).toBe(false);
        const tlc = getCatalogPlace("aeropuerto-toluca")!;
        const bigRadius = { ...pricingConfig, service_area: { ...pricingConfig.service_area, radius_km: 200 } };
        // Aun con un radio enorme, Toluca está marcado fuera (por id y por cercanía).
        expect(isInZone({ ...tlc, placeId: "cat:aeropuerto-toluca" }, bigRadius)).toBe(false);
        expect(isInZone({ lat: tlc.lat + 0.001, lng: tlc.lng }, bigRadius)).toBe(false);
    });
    it("aeropuerto por id o por cercanía", () => {
        expect(isAirport({ ...T1, placeId: "cat:aicm-t1" })).toBe(true);
        expect(isAirport({ lat: T1.lat + 0.002, lng: T1.lng })).toBe(true);
        expect(isAirport(POLANCO)).toBe(false);
    });
});

describe("distancia", () => {
    const original = process.env.GOOGLE_MAPS_SERVER_KEY;
    beforeEach(() => delete process.env.GOOGLE_MAPS_SERVER_KEY);
    afterEach(() => {
        vi.unstubAllGlobals();
        if (original === undefined) delete process.env.GOOGLE_MAPS_SERVER_KEY;
        else process.env.GOOGLE_MAPS_SERVER_KEY = original;
    });

    it("aproximado: haversine × road_factor, mínimo min_km, velocidad por franja", () => {
        const a = approxLegDistance(POLANCO, T1, DEP);
        expect(a.km).toBeCloseTo(haversineKm(POLANCO, T1) * 1.35, 1);
        expect(a.min).toBe(Math.round((a.km / 28) * 60));
        const peak = approxLegDistance(POLANCO, T1, new Date("2030-01-08T14:00:00Z")); // 08:00
        expect(peak.min).toBe(Math.round((peak.km / 18) * 60));
        expect(approxLegDistance(ZOCALO, { lat: 19.4336, lng: -99.1332 }, DEP).km).toBe(2);
    });

    it("anomalía: menos de 0.9× o más de 3× la línea recta", () => {
        expect(isPlausibleRoadKm(10, 10)).toBe(true);
        expect(isPlausibleRoadKm(8.9, 10)).toBe(false);
        expect(isPlausibleRoadKm(30, 10)).toBe(true);
        expect(isPlausibleRoadKm(30.1, 10)).toBe(false);
    });

    it("sin llave → approx sin llamar a Google", async () => {
        const f = vi.fn();
        vi.stubGlobal("fetch", f);
        const r = await resolveLegDistance(POLANCO, T1, DEP);
        expect(r).toMatchObject({ source: "approx", durationSource: "approx", anomaly: false });
        expect(f).not.toHaveBeenCalled();
    });

    it("con llave → Routes API (TRAFFIC_AWARE, FieldMask mínimo, departureTime)", async () => {
        process.env.GOOGLE_MAPS_SERVER_KEY = "test-key";
        const f = vi.fn(async () => Response.json({ routes: [{ distanceMeters: 16234, duration: "2710s", staticDuration: "1900s" }] }));
        vi.stubGlobal("fetch", f);
        const r = await resolveLegDistance(POLANCO, T1, DEP, pricingConfig, new Date("2030-01-01T00:00:00Z"));
        expect(r).toEqual({ km: 16.23, min: 45, source: "google", durationSource: "traffic", anomaly: false });
        const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
        expect(url).toBe("https://routes.googleapis.com/directions/v2:computeRoutes");
        const headers = init.headers as Record<string, string>;
        expect(headers["X-Goog-FieldMask"]).toBe("routes.distanceMeters,routes.duration,routes.staticDuration");
        const body = JSON.parse(init.body as string);
        expect(body.routingPreference).toBe("TRAFFIC_AWARE");
        expect(body.departureTime).toBe(DEP.toISOString());
        expect(body.extraComputations).toBeUndefined();
    });

    it("GOOGLE_ROUTES_TRAFFIC=unaware → TRAFFIC_UNAWARE y duración estática", async () => {
        process.env.GOOGLE_MAPS_SERVER_KEY = "test-key";
        process.env.GOOGLE_ROUTES_TRAFFIC = "unaware";
        const f = vi.fn(async () => Response.json({ routes: [{ distanceMeters: 16000, duration: "1800s", staticDuration: "1800s" }] }));
        vi.stubGlobal("fetch", f);
        const r = await resolveLegDistance(POLANCO, T1, DEP);
        delete process.env.GOOGLE_ROUTES_TRAFFIC;
        expect(r.durationSource).toBe("static");
        expect(JSON.parse((f.mock.calls[0] as unknown as [string, RequestInit])[1].body as string).routingPreference).toBe("TRAFFIC_UNAWARE");
    });

    it.each([
        ["error HTTP", async () => new Response("nope", { status: 500 })],
        ["timeout", async () => { throw Object.assign(new Error("t"), { name: "TimeoutError" }); }],
        ["red", async () => { throw new TypeError("fetch failed"); }],
        ["JSON raro", async () => Response.json({ routes: [{}] })],
    ])("Google con %s → approx marcado", async (_n, impl) => {
        process.env.GOOGLE_MAPS_SERVER_KEY = "test-key";
        vi.stubGlobal("fetch", vi.fn(impl));
        const r = await resolveLegDistance(POLANCO, T1, DEP);
        expect(r).toMatchObject({ source: "approx", durationSource: "approx", anomaly: true });
    });

    it("Google con distancia absurda → approx con anomalía", async () => {
        process.env.GOOGLE_MAPS_SERVER_KEY = "test-key";
        vi.stubGlobal("fetch", vi.fn(async () => Response.json({ routes: [{ distanceMeters: 95000, duration: "3600s" }] })));
        const r = await resolveLegDistance(POLANCO, T1, DEP);
        expect(r).toMatchObject({ source: "approx", anomaly: true });
    });

    it("Google sin rutas → noRoute", async () => {
        process.env.GOOGLE_MAPS_SERVER_KEY = "test-key";
        vi.stubGlobal("fetch", vi.fn(async () => Response.json({})));
        const r = await resolveLegDistance(POLANCO, T1, DEP);
        expect(r).toMatchObject({ source: "approx", noRoute: true });
    });
});

describe("constantes compartidas y rutas frecuentes", () => {
    it("la zona horaria del cliente coincide con la de la config", async () => {
        const { SERVICE_TZ } = await import("@/lib/geo/mexico");
        expect(SERVICE_TZ).toBe(pricingConfig.timezone);
    });
    it("las rutas dentro de zona usan la misma distancia que el cotizador sin Google", async () => {
        const { popularRoutes } = await import("@/content/routes");
        for (const route of popularRoutes.filter((r) => r.zone === "in")) {
            const o = getCatalogPlace(route.origin.id!)!;
            const d = getCatalogPlace(route.destination.id!)!;
            expect(route.km).toBe(approxLegDistance(o, d, DEP).km);
        }
    });
});
