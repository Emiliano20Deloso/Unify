import { describe, expect, it } from "vitest";
import { defaultLocale, hasLocale, htmlLang, locales, ogLocale } from "@/i18n/config";
import { alternates, localizedHref, routeKeys, routes, stripLocale, switchLocalePath } from "@/i18n/routes";

describe("i18n: configuración", () => {
    it("idiomas y valores de html/og", () => {
        expect(locales).toEqual(["es", "en"]);
        expect(defaultLocale).toBe("es");
        expect(hasLocale("es")).toBe(true);
        expect(hasLocale("en")).toBe(true);
        expect(hasLocale("fr")).toBe(false);
        expect(hasLocale("admin")).toBe(false);
        expect(htmlLang).toEqual({ es: "es-MX", en: "en" });
        expect(ogLocale.es).toBe("es_MX");
    });
});

describe("i18n: rutas", () => {
    it("las seis rutas conservan las URLs actuales", () => {
        expect(routes).toEqual({
            home: "/",
            services: "/servicios",
            pricing: "/tarifas",
            about: "/nosotros",
            privacy: "/privacidad",
            terms: "/terminos",
        });
        expect(routeKeys).toHaveLength(6);
    });

    it("localizedHref: español sin prefijo, inglés bajo /en, con ancla opcional", () => {
        expect(localizedHref("es", "home")).toBe("/");
        expect(localizedHref("en", "home")).toBe("/en");
        expect(localizedHref("es", "services")).toBe("/servicios");
        expect(localizedHref("en", "pricing")).toBe("/en/tarifas");
        expect(localizedHref("es", "pricing", "cotizar")).toBe("/tarifas#cotizar");
        expect(localizedHref("en", "home", "faq")).toBe("/en#faq");
    });

    it("alternates: es-MX, en y x-default", () => {
        expect(alternates("home")).toEqual({ "es-MX": "/", en: "/en", "x-default": "/" });
        expect(alternates("terms")).toEqual({
            "es-MX": "/terminos",
            en: "/en/terminos",
            "x-default": "/terminos",
        });
    });

    it("stripLocale quita solo un prefijo de idioma completo", () => {
        expect(stripLocale("/en")).toBe("/");
        expect(stripLocale("/en/nosotros")).toBe("/nosotros");
        expect(stripLocale("/es/nosotros")).toBe("/nosotros");
        expect(stripLocale("/servicios")).toBe("/servicios");
        expect(stripLocale("/english")).toBe("/english");
    });

    it("switchLocalePath lleva a la misma página en el otro idioma", () => {
        expect(switchLocalePath("/", "en")).toBe("/en");
        expect(switchLocalePath("/en", "es")).toBe("/");
        expect(switchLocalePath("/servicios", "en")).toBe("/en/servicios");
        expect(switchLocalePath("/en/servicios", "es")).toBe("/servicios");
        // Durante el prerender usePathname puede ver la ruta interna /es/x: el resultado es el mismo.
        expect(switchLocalePath("/es/servicios", "en")).toBe("/en/servicios");
        expect(switchLocalePath("/en/tarifas", "en")).toBe("/en/tarifas");
    });
});

describe("i18n: diccionarios", () => {
    it("cada namespace de página tiene meta con título y descripción en ambos idiomas", async () => {
        const { getDictionary } = await import("@/i18n/get-dictionary");
        for (const lang of locales) {
            for (const ns of ["home", "services", "pricing", "about", "quote", "not-found"] as const) {
                const { meta } = await getDictionary(lang, ns);
                expect(meta.title.length, `${lang}/${ns}`).toBeGreaterThan(0);
                expect(meta.description.length, `${lang}/${ns}`).toBeGreaterThan(0);
            }
            const legal = await getDictionary(lang, "legal");
            expect(legal.privacy.meta.title).toBeTruthy();
            expect(legal.terms.meta.description).toBeTruthy();
            const common = await getDictionary(lang, "common");
            expect(common.actions.quote).toBeTruthy();
        }
    });
});
