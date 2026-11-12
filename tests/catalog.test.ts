import { describe, expect, it } from "vitest";
import { CATALOG, getCatalogPlace, normalize, searchCatalog } from "@/lib/places/catalog";
import { isInZone } from "@/lib/places/zone";

describe("catálogo", () => {
    it("búsqueda sin acentos ni mayúsculas", () => {
        expect(searchCatalog("COYOACAN")[0]?.slug).toBe("coyoacan");
        expect(searchCatalog("autodromo")[0]?.slug).toBe("autodromo");
        expect(searchCatalog("Ángel")[0]?.slug).toBe("reforma-angel");
        expect(normalize("Zócalo, CDMX")).toBe("zocalo cdmx");
    });
    it("búsqueda por alias", () => {
        expect(searchCatalog("estadio azteca")[0]?.slug).toBe("estadio-banorte");
        expect(searchCatalog("foro sol")[0]?.slug).toBe("estadio-gnp");
        expect(searchCatalog("zocalo")[0]?.slug).toBe("centro-historico");
    });
    it('"aero" trae aeropuertos', () => {
        const r = searchCatalog("aero");
        expect(r.length).toBeGreaterThanOrEqual(4);
        expect(r.every((p) => p.kind === "airport")).toBe(true);
    });
    it("integridad: slugs únicos, coordenadas en el Valle de México, Toluca fuera", () => {
        expect(new Set(CATALOG.map((p) => p.slug)).size).toBe(CATALOG.length);
        expect(CATALOG.length).toBeGreaterThanOrEqual(25);
        for (const p of CATALOG) {
            expect(p.lat).toBeGreaterThan(19);
            expect(p.lat).toBeLessThan(20);
            expect(p.lng).toBeGreaterThan(-100);
            expect(p.lng).toBeLessThan(-98.9);
            const inZone = isInZone({ ...p, placeId: `cat:${p.slug}` });
            expect(inZone).toBe(p.zone !== "out");
        }
        expect(getCatalogPlace("cat:aeropuerto-toluca")?.zone).toBe("out");
    });
});
