import { describe, expect, it } from "vitest";
import { priceLeg } from "@/lib/pricing/engine";
import { breakdownRows } from "@/lib/quote/breakdown";
import { fill, formatDuration, formatKm, formatMultiplier, formatShortDate, timeOptions } from "@/lib/quote/format";
import { fieldErrorsFromApi, noticeKeys, primaryReason, specialKind } from "@/lib/quote/outcome";
import es from "@/i18n/dictionaries/es/quote";
import en from "@/i18n/dictionaries/en/quote";

const noFlags = { peak: false, night: false, weekend: false, holiday: false };
const leg = (input: Partial<Parameters<typeof priceLeg>[0]>) => {
    const p = priceLeg({ level: "select", distanceKm: 16.2, date: "2026-11-17", time: "10:00", passengers: 1, luggage: 0, ...input });
    return { lines: p.lines, total: p.total, hourMultiplier: p.hourMultiplier, dayMultiplier: p.dayMultiplier, minFareApplied: p.minFareApplied };
};
const sum = (rows: { amount: number | null }[]) => rows.reduce((s, r) => s + (r.amount ?? 0), 0);

describe("formatos", () => {
    it("fill rellena y deja intactas las claves que faltan", () => {
        expect(fill("{a} y {b}", { a: 1 })).toBe("1 y {b}");
    });

    it("kilómetros", () => {
        expect(formatKm(16.24)).toBe("16");
        expect(formatKm(4.36)).toBe("4.4");
        expect(formatKm(-1)).toBe("0");
    });

    it("duración como rango", () => {
        expect(formatDuration(35, "es")).toBe("30 a 45 min");
        expect(formatDuration(38, "en")).toBe("35 to 50 min");
        expect(formatDuration(72, "es")).toBe("1 h 5 min a 1 h 30 min");
        expect(formatDuration(2, "es")).toBe("5 a 10 min");
        expect(formatDuration(100, "es")).toBe("1 h 35 min a 2 h");
    });

    it("fecha corta sin depender de la zona del proceso", () => {
        expect(formatShortDate("2026-11-20", "es")).toBe("vie 20 nov");
        expect(formatShortDate("2026-11-20", "en")).toBe("Fri, Nov 20");
        expect(formatShortDate("x", "es")).toBe("");
    });

    it("horas cada 15 min, con la hora fuera de rejilla añadida en orden", () => {
        const t = timeOptions();
        expect(t).toHaveLength(96);
        expect(t[0]).toBe("00:00");
        expect(t.at(-1)).toBe("23:45");
        const extra = timeOptions("10:20");
        expect(extra).toHaveLength(97);
        expect(extra.indexOf("10:20")).toBe(extra.indexOf("10:15") + 1);
        expect(timeOptions("99:99")).toHaveLength(96);
    });

    it("multiplicadores", () => {
        expect(formatMultiplier(1.25)).toBe("×1.25");
        expect(formatMultiplier(1.5)).toBe("×1.5");
    });
});

describe("breakdownRows", () => {
    it("Select Polanco → AICM un martes 10:00: base, distancia con tarifa, mínima y sin recargo", () => {
        const l = leg({});
        const rows = breakdownRows(l, { distanceKm: 16.2, flags: noFlags }, es.lines);
        expect(rows.map((r) => r.label)).toEqual([
            "Tarifa base",
            "Distancia 16.2 km × $10",
            "Ajuste a tarifa mínima",
            "Horario normal",
        ]);
        expect(rows.at(-1)).toMatchObject({ amount: null, note: "sin recargo" });
        expect(l.total).toBe(399);
        expect(sum(rows)).toBe(l.total);
    });

    it("hora pico y fin de semana con su multiplicador; pasajero adicional", () => {
        const l = leg({ date: "2026-11-21", time: "08:00", passengers: 4 });
        const rows = breakdownRows(l, { distanceKm: 16.2, flags: { ...noFlags, peak: true, weekend: true } }, es.lines);
        const labels = rows.map((r) => r.label);
        expect(labels).toContain("Recargo hora pico ×1.25");
        expect(labels).toContain("Recargo fin de semana ×1.15");
        expect(labels).toContain("Pasajero adicional");
        expect(labels).not.toContain("Horario normal");
        expect(rows.find((r) => r.key === "passengerExtra")?.amount).toBe(50);
        expect(sum(rows)).toBe(l.total);
    });

    it("nocturno y festivo en inglés", () => {
        const l = leg({ time: "23:00" });
        const night = breakdownRows({ ...l, dayMultiplier: 1.5 }, { distanceKm: 16.2, flags: { ...noFlags, night: true, holiday: true } }, en.lines);
        expect(night.find((r) => r.key === "hourSurcharge")?.label).toBe("Night surcharge ×1.35");
    });

    it("la etiqueta 'sin recargo' va antes de los extras", () => {
        const l = leg({ passengers: 4, distanceKm: 40 });
        const rows = breakdownRows(l, { distanceKm: 40, flags: noFlags }, es.lines);
        expect(rows.map((r) => r.key)).toEqual(["base", "distance", "normalHours", "passengerExtra"]);
        expect(sum(rows)).toBe(l.total);
    });

    it("sin tarifa por km si no cuadra", () => {
        const rows = breakdownRows(
            { lines: [{ key: "base", amount: 200 }, { key: "distance", amount: 173 }], total: 373, hourMultiplier: 1, dayMultiplier: 1, minFareApplied: false },
            { distanceKm: 16.2, flags: noFlags },
            es.lines
        );
        expect(rows[1]!.label).toBe("Distancia 16 km");
    });
});

describe("lectura de la respuesta", () => {
    const flags = { peak: false, night: false, weekend: false, holiday: false, shortNotice: false, outOfZone: false, airport: false, distanceAnomaly: false };
    const all = ["estimate_not_binding", "tolls_not_included", "waiting_policy"] as const;

    it("avisos en orden, con espera según aeropuerto", () => {
        expect(noticeKeys({ flags, notices: [...all] })).toEqual(["cityWait", "tolls", "estimate"]);
        expect(
            noticeKeys({ flags: { ...flags, peak: true, weekend: true, airport: true, shortNotice: true }, notices: [...all, "short_notice"] })
        ).toEqual(["peak", "weekend", "shortNotice", "airportWait", "tolls", "estimate"]);
        expect(noticeKeys({ flags: { ...flags, night: true, peak: true, holiday: true, weekend: true }, notices: [] })).toEqual(["night", "holiday"]);
    });

    it("errores 422 por campo", () => {
        expect(fieldErrorsFromApi({ ok: false, code: "PICKUP_IN_PAST", message: "" })).toEqual({ time: "pickupPast" });
        expect(fieldErrorsFromApi({ ok: false, code: "TOO_FAR_AHEAD", message: "" })).toEqual({ date: "tooFarAhead" });
        expect(fieldErrorsFromApi({ ok: false, code: "SAME_PLACE", message: "" })).toEqual({ destination: "samePlace" });
        expect(
            fieldErrorsFromApi({
                ok: false,
                code: "VALIDATION",
                message: "",
                issues: [
                    { path: "origin.lat", message: "" },
                    { path: "returnTrip", message: "" },
                    { path: "returnTrip.date", message: "" },
                ],
            })
        ).toEqual({ origin: "invalid", returnTime: "returnAfter", returnDate: "returnDate" });
        expect(fieldErrorsFromApi({ ok: false, code: "VALIDATION", message: "", issues: [{ path: "passengers", message: "" }] })).toBeNull();
        expect(fieldErrorsFromApi({ ok: false, code: "RATE_LIMITED", message: "" })).toBeNull();
    });

    it("motivo de cotización especial y su mensaje de WhatsApp", () => {
        expect(primaryReason({ specialQuote: { required: false, reasons: [] } })).toBeNull();
        expect(primaryReason({ specialQuote: { required: true, reasons: ["out_of_zone", "capacity"] } })).toBe("out_of_zone");
        expect(primaryReason({ specialQuote: { required: true, reasons: [] } })).toBe("no_route");
        expect(specialKind("too_far")).toBe("out_of_zone");
        expect(specialKind("capacity")).toBe("capacity");
        expect(specialKind("no_route")).toBe("general");
    });

    it("los dos diccionarios tienen texto para cada aviso y motivo", () => {
        for (const d of [es, en]) {
            for (const k of ["peak", "night", "weekend", "holiday", "shortNotice", "airportWait", "cityWait", "tolls", "estimate"] as const) {
                expect(d.notices[k].length).toBeGreaterThan(5);
            }
            for (const r of ["out_of_zone", "too_far", "capacity", "no_route"] as const) expect(d.special[r].title).toBeTruthy();
        }
    });
});
