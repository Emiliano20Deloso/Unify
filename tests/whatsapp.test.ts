import { describe, expect, it } from "vitest";
import { buildSpecialQuoteUrl, buildWhatsAppUrl, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { WHATSAPP_LINK } from "@/constants/links";
import type { EstimateRequest, EstimateResponse } from "@/lib/estimate/schema";

const request: EstimateRequest = {
    origin: { label: "Polanco", lat: 19.43, lng: -99.19 },
    destination: { label: "AICM Terminal 1", lat: 19.435, lng: -99.083 },
    date: "2026-11-17",
    time: "10:00",
    passengers: 2,
    luggage: 1,
    returnTrip: { date: "2026-11-20", time: "18:30" },
};
const tier = (total: number) => ({ level: "select" as const, legs: [], total });
const estimate = {
    ok: true, ref: "UE-AB12CD", currency: "MXN", taxIncluded: true, configVersion: "2026-11", legs: [],
    flags: {} as EstimateResponse["flags"], specialQuote: { required: false, reasons: [] },
    tiers: { practico: tier(500), select: tier(1234), premium: tier(1500) }, attribution: null, notices: [],
} as EstimateResponse;

describe("whatsapp", () => {
    it("una sola constante del número", () => {
        expect(WHATSAPP_LINK).toBe(`https://wa.me/${WHATSAPP_NUMBER}`);
        expect(WHATSAPP_NUMBER).toBe("525951076664");
    });
    it("mensaje en español", () => {
        const url = buildWhatsAppUrl({ request, estimate, level: "select", lang: "es", flightNumber: "AM 123" });
        expect(url.startsWith("https://wa.me/525951076664?text=")).toBe(true);
        const text = decodeURIComponent(url.split("?text=")[1]!);
        for (const s of ["Polanco → AICM Terminal 1", "martes, 17 de noviembre de 2026, 10:00 h", "Regreso:", "ida y vuelta", "Select", "Pasajeros: 2", "Maletas: 1", "Vuelo: AM 123", "$1,234 MXN (IVA incluido)", "UE-AB12CD", "estimación sujeta a confirmación"]) {
            expect(text).toContain(s);
        }
    });
    it("mensaje en inglés y cotización especial", () => {
        const text = decodeURIComponent(buildWhatsAppUrl({ request: { ...request, returnTrip: null }, estimate, level: "premium", lang: "en" }).split("?text=")[1]!);
        expect(text).toContain("Tuesday, November 17, 2026, 10:00 h");
        expect(text).toContain("VAT included");
        expect(text).not.toContain("Return");
        const sp = decodeURIComponent(buildSpecialQuoteUrl({ kind: "out_of_zone", context: "Toluca → Polanco", lang: "es" }).split("?text=")[1]!);
        expect(sp).toContain("fuera de la zona");
        expect(sp).toContain("Toluca → Polanco");
    });
});
