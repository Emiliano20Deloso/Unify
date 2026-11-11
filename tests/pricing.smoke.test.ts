import { describe, expect, it } from "vitest";
import { calculatePrice } from "@/lib/pricing";

describe("calculatePrice (smoke)", () => {
    it("Select · 20km · 8am lunes (pico) → (200 + 200) × 1.25 = 500", () => {
        const result = calculatePrice({
            serviceLevel: "select",
            distanceKm: 20,
            pickupAt: new Date("2026-10-05T08:00:00-06:00"),
            passengers: 2,
            luggage: 1,
        });

        expect(result).toMatchObject({ total: 500, hourMultiplier: 1.25, dayMultiplier: 1.0 });
    });
});
