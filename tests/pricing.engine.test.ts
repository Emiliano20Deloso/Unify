import { describe, expect, it } from "vitest";
import {
    calculatePrice,
    formatMXN,
    fromPrice,
    parsePricingConfig,
    priceLeg,
    pricingConfig,
    routePrice,
    SERVICE_LEVELS,
    type PricingConfig,
} from "@/lib/pricing";
import rawConfig from "../config/pricing.json";

const noMin: PricingConfig = { ...pricingConfig, min_fare: undefined };
const TUE = "2026-11-10";
const SAT = "2026-11-14";

function leg(level: "practico" | "select" | "premium", km: number, date: string, time: string, extra = {}, config = pricingConfig) {
    return priceLeg({ level, distanceKm: km, date, time, passengers: 2, luggage: 1, ...extra }, config);
}

describe("bordes de horario (Select 10 km, martes, sin min_fare → sub 300)", () => {
    const cases: [string, number][] = [
        ["05:59", 1.35], ["06:00", 1], ["06:59", 1], ["07:00", 1.25], ["08:59", 1.25], ["09:00", 1],
        ["17:59", 1], ["18:00", 1.25], ["19:59", 1.25], ["20:00", 1],
        ["21:59", 1], ["22:00", 1.35], ["23:59", 1.35], ["00:00", 1.35],
    ];
    it.each(cases)("%s → ×%s", (time, mult) => {
        const r = leg("select", 10, TUE, time, {}, noMin);
        expect(r.subtotal).toBe(300);
        expect(r.hourMultiplier).toBe(mult);
        expect(r.total).toBe(Math.round(300 * mult));
    });
});

describe("modelo con la config real", () => {
    it("Select 25 km martes 10:00 = 450", () => expect(leg("select", 25, TUE, "10:00").total).toBe(450));
    it("Select 25 km martes 18:30 = 563", () => expect(leg("select", 25, TUE, "18:30").total).toBe(563));
    it("Select 25 km sábado 23:00 = 699", () => expect(leg("select", 25, SAT, "23:00").total).toBe(699));
    it("Premium 25 km martes 10:00 = 599 (mínimo)", () => {
        const r = leg("premium", 25, TUE, "10:00");
        expect(r.total).toBe(599);
        expect(r.minFareApplied).toBe(true);
        expect(r.lines.find((l) => l.key === "minFareAdjustment")?.amount).toBe(49);
    });
    it("Práctico 3 km martes 12:00 = 249 (mínimo) y 23:00 = 336", () => {
        expect(leg("practico", 3, TUE, "12:00").total).toBe(249);
        const night = leg("practico", 3, TUE, "23:00");
        expect(night.total).toBe(336);
        expect(night.lines.map((l) => [l.key, l.amount])).toEqual([
            ["base", 100], ["distance", 30], ["minFareAdjustment", 119], ["hourSurcharge", 87],
        ]);
    });
    it("4º pasajero = +50", () => {
        const a = leg("select", 25, TUE, "10:00", { passengers: 3 });
        const b = leg("select", 25, TUE, "10:00", { passengers: 4 });
        expect(b.total - a.total).toBe(50);
        expect(b.lines.find((l) => l.key === "passengerExtra")?.amount).toBe(50);
    });
    it("3ª maleta = +25 (el motor respeta el extra aunque en línea no se cotice)", () => {
        expect(leg("select", 25, TUE, "10:00", { luggage: 3 }).total).toBe(475);
    });
    it("festivo inyectado ×1.5 y festivo en sábado sin ×1.15", () => {
        const cfg = { ...pricingConfig, holidays_mx: [TUE, SAT] };
        const h = leg("select", 25, TUE, "10:00", {}, cfg);
        expect(h.dayMultiplier).toBe(1.5);
        expect(h.total).toBe(675);
        const s = leg("select", 25, SAT, "10:00", {}, cfg);
        expect(s.dayMultiplier).toBe(1.5);
        expect(s.total).toBe(675);
    });
    it("fin de semana ×1.15 en domingo", () => {
        expect(leg("select", 25, "2026-11-15", "10:00").dayMultiplier).toBe(1.15);
    });
});

describe("propiedad: Σ líneas = total", () => {
    const kms = [0, 1.37, 2, 3.333, 7.25, 12.5, 18.05, 25, 44.44, 89.99];
    const dates = ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15"];
    it("3 niveles × 7 días × 24 horas × distancias, con y sin mínimo y con extras", () => {
        let n = 0;
        for (const cfg of [pricingConfig, noMin, { ...pricingConfig, holidays_mx: ["2026-11-14"] }]) {
            for (const level of SERVICE_LEVELS) for (const date of dates) for (let h = 0; h < 24; h++) for (const km of kms) {
                const time = `${String(h).padStart(2, "0")}:${h % 2 ? "30" : "00"}`;
                const r = priceLeg({ level, distanceKm: km, date, time, passengers: 1 + (h % 4), luggage: h % 3 }, cfg);
                expect(r.lines.reduce((s, l) => s + l.amount, 0)).toBe(r.total);
                expect(Number.isInteger(r.total)).toBe(true);
                for (const l of r.lines) expect(Number.isInteger(l.amount)).toBe(true);
                n++;
            }
        }
        expect(n).toBe(3 * 3 * 7 * 24 * kms.length);
    });
});

describe("casos heredados de scripts/test-pricing.ts (config sin min_fare)", () => {
    const cdmx = (iso: string) => new Date(`${iso}-06:00`);
    const cases: [string, Parameters<typeof calculatePrice>[0], Record<string, number>][] = [
        ["Práctico 10 km mediodía martes", { serviceLevel: "practico", distanceKm: 10, pickupAt: cdmx("2026-10-06T12:00:00"), passengers: 2, luggage: 1 }, { total: 200, hourMultiplier: 1, dayMultiplier: 1, extras: 0 }],
        ["Select 20 km 8am lunes (pico)", { serviceLevel: "select", distanceKm: 20, pickupAt: cdmx("2026-10-05T08:00:00"), passengers: 2, luggage: 1 }, { total: 500, hourMultiplier: 1.25, dayMultiplier: 1 }],
        ["Premium 15 km 11pm viernes (nocturno)", { serviceLevel: "premium", distanceKm: 15, pickupAt: cdmx("2026-10-02T23:00:00"), passengers: 2, luggage: 1 }, { total: 608, hourMultiplier: 1.35, dayMultiplier: 1 }],
        ["Select 10 km 3pm sábado", { serviceLevel: "select", distanceKm: 10, pickupAt: cdmx("2026-10-03T15:00:00"), passengers: 2, luggage: 1 }, { total: 345, dayMultiplier: 1.15 }],
        ["Práctico 5 km 5 pax + 4 maletas", { serviceLevel: "practico", distanceKm: 5, pickupAt: cdmx("2026-10-06T12:00:00"), passengers: 5, luggage: 4 }, { total: 300, extras: 150 }],
        ["Premium 30 km 7pm sábado (pico + finde)", { serviceLevel: "premium", distanceKm: 30, pickupAt: cdmx("2026-10-03T19:00:00"), passengers: 3, luggage: 2 }, { total: 863, hourMultiplier: 1.25, dayMultiplier: 1.15 }],
    ];
    it.each(cases)("%s", (_name, input, expected) => {
        expect(calculatePrice(input, noMin)).toMatchObject({ ...expected, currency: "MXN" });
    });
    it("con la config real el adaptador aplica la mínima", () => {
        expect(calculatePrice(cases[0]![1]).total).toBe(249);
    });
});

describe("config y ayudas", () => {
    it("config inválida = error claro", () => {
        expect(() => parsePricingConfig({ ...rawConfig, base: { practico: -1, select: 1, premium: 1 } })).toThrow(/pricing\.json inválido → base\.practico/);
        expect(() => parsePricingConfig({ ...rawConfig, timezone: "Marte/Olympus" })).toThrow(/timezone/);
    });
    it("config vieja (sin campos nuevos) carga con defaults", () => {
        const old: Record<string, unknown> = { ...rawConfig };
        for (const k of ["version", "min_fare", "capacity", "booking", "service_area", "approx", "waiting"]) delete old[k];
        const cfg = parsePricingConfig(old);
        expect(cfg.capacity.max_passengers).toBe(4);
        expect(cfg.min_fare).toBeUndefined();
        expect(cfg.version).toBe("legacy");
    });
    it("fromPrice, routePrice y formatMXN", () => {
        expect(fromPrice("practico")).toBe(249);
        expect(fromPrice("select")).toBe(399);
        expect(fromPrice("premium", noMin)).toBe(300);
        expect(routePrice("select", 25)).toBe(450);
        expect(routePrice("premium", 10)).toBe(599);
        expect(formatMXN(1234.4)).toBe("$1,234");
    });
});
