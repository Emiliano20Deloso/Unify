// Datos no traducibles de la página de Tarifas: la ruta y el nivel del ejemplo trabajado.
// La ruta usa lugares del catálogo: sus km salen del mismo aproximado que el cotizador sin Google
// (catalogRouteKm) y los precios del motor. Elegida para que en Select no aplique la tarifa mínima.
import type { Level } from "@/lib/pricing/config";
import type { SpecialQuoteKind } from "@/lib/whatsapp";

export const pricingExample = {
    /** slugs del catálogo (src/lib/places/catalog.ts) */
    origin: "santa-fe",
    destination: "aicm-t1",
    level: "select" as Level,
    /** Un martes cualquiera; la hora pico se toma de la ventana de la mañana de la config. */
    peakDate: "2026-11-10",
};

/** Cotizaciones a la medida que se ofrecen en el cierre de /tarifas, en orden. */
export const customQuoteKinds = ["hourly", "event", "out_of_zone", "capacity"] as const satisfies readonly SpecialQuoteKind[];
