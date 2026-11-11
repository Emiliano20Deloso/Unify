// Datos no traducibles de la página de Tarifas: la ruta y el nivel del ejemplo trabajado.
// Los km salen de las rutas frecuentes (src/content/routes.ts) y los precios del motor.
import type { Level } from "@/lib/pricing/config";
import type { SpecialQuoteKind } from "@/lib/whatsapp";

export const pricingExample = {
    /** slug de popularRoutes */
    route: "polanco-aicm",
    level: "select" as Level,
    /** Un martes cualquiera; la hora pico se toma de la ventana de la mañana de la config. */
    peakDate: "2026-11-10",
};

/** Cotizaciones a la medida que se ofrecen en el cierre de /tarifas, en orden. */
export const customQuoteKinds = ["hourly", "event", "out_of_zone", "capacity"] as const satisfies readonly SpecialQuoteKind[];
