import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { computeEstimate, isShortNotice } from "@/lib/estimate/estimate";
import type { EstimateRequest } from "@/lib/estimate/schema";
import { wallToInstant } from "@/lib/pricing/time";

const TZ = "America/Mexico_City";
const pickup = wallToInstant("2030-01-08", "10:00", TZ);
const req: EstimateRequest = {
    origin: { label: "Polanco", placeId: "cat:polanco", lat: 19.4295, lng: -99.1971 },
    destination: { label: "AICM T1", placeId: "cat:aicm-t1", lat: 19.4352, lng: -99.0827 },
    date: "2030-01-08",
    time: "10:00",
    passengers: 2,
    luggage: 1,
};

describe("anticipación con now inyectado", () => {
    it("11:59 h → shortNotice; 12:00 h → normal", async () => {
        const at1159 = new Date(pickup.getTime() - (11 * 60 + 59) * 60_000);
        const at1200 = new Date(pickup.getTime() - 12 * 3_600_000);
        expect(isShortNotice(pickup, at1159)).toBe(true);
        expect(isShortNotice(pickup, at1200)).toBe(false);

        const short = await computeEstimate(req, { now: at1159 });
        if (!short.ok) throw new Error("se esperaba ok");
        expect(short.flags.shortNotice).toBe(true);
        expect(short.notices).toContain("short_notice");
        expect(short.tiers).not.toBeNull(); // no bloquea

        const normal = await computeEstimate(req, { now: at1200 });
        if (!normal.ok) throw new Error("se esperaba ok");
        expect(normal.flags.shortNotice).toBe(false);
        expect(normal.notices).not.toContain("short_notice");
    });

    it("hora exacta de la recogida ya pasada → PICKUP_IN_PAST", async () => {
        const r = await computeEstimate(req, { now: new Date(pickup.getTime() + 1000) });
        expect(r).toMatchObject({ ok: false, status: 422, code: "PICKUP_IN_PAST" });
    });

    it("tramo vial mayor a max_leg_km → too_far", async () => {
        const r = await computeEstimate(
            { ...req, destination: { label: "AIFA", lat: 19.7438, lng: -99.0106 } },
            {
                now: new Date("2029-12-01T00:00:00Z"),
                config: {
                    ...(await import("@/lib/pricing")).pricingConfig,
                    service_area: { center: { lat: 19.4326, lng: -99.1332 }, radius_km: 45, max_leg_km: 30 },
                },
            }
        );
        expect(r).toMatchObject({ ok: true, specialQuote: { required: true, reasons: ["too_far"] }, tiers: null });
    });
});
