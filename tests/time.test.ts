import { afterAll, describe, expect, it } from "vitest";
import { addDays, instantToWall, isValidDate, todayInTz, wallToInstant, weekdayOf } from "@/lib/pricing/time";
import { hourBand } from "@/lib/pricing/engine";

const TZ = "America/Mexico_City";
const originalTz = process.env.TZ;
afterAll(() => {
    if (originalTz === undefined) delete process.env.TZ;
    else process.env.TZ = originalTz;
});

describe.each(["Asia/Tokyo", "America/Los_Angeles", "UTC", "America/Mexico_City"])("con TZ del proceso = %s", (procTz) => {
    it("pared ↔ instante no depende del TZ del proceso", () => {
        process.env.TZ = procTz;
        expect(wallToInstant("2026-11-11", "07:00", TZ).toISOString()).toBe("2026-11-11T13:00:00.000Z");
        expect(wallToInstant("2026-07-01", "23:30", TZ).toISOString()).toBe("2026-07-02T05:30:00.000Z");
        expect(instantToWall(new Date("2026-11-11T05:59:00Z"), TZ)).toEqual({ date: "2026-11-10", time: "23:59" });
        expect(todayInTz(TZ, new Date("2026-11-12T05:00:00Z"))).toBe("2026-11-11");
        expect(weekdayOf("2026-11-10")).toBe(2);
        expect(hourBand("05:59")).toBe("night");
        // Zona con horario de verano (resuelve bien ambos lados del cambio).
        expect(wallToInstant("2026-07-01", "12:00", "America/New_York").toISOString()).toBe("2026-07-01T16:00:00.000Z");
        expect(wallToInstant("2026-01-15", "12:00", "America/New_York").toISOString()).toBe("2026-01-15T17:00:00.000Z");
    });
});

describe("validación y utilidades de fecha", () => {
    it("fechas reales", () => {
        expect(isValidDate("2026-02-29")).toBe(false);
        expect(isValidDate("2028-02-29")).toBe(true);
        expect(isValidDate("2026-13-01")).toBe(false);
        expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    });
});
