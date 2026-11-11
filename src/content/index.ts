// Contenido compartido del sitio (ES/EN), una sola fuente para portada, servicios y tarifas.
// Datos de negocio en src/lib/site.ts; precios siempre del motor (src/lib/pricing).
export { levels, levelsCopy, type Amenities, type LevelContent } from "./levels";
export { popularRoutes, routesCopy, type PopularRoute } from "./routes";
export { faq, faqCopy, type FaqItem, type FaqTopic } from "./faq";
export { testimonials, testimonialsCopy, type Testimonial } from "./testimonials";
export { corporateCopy } from "./corporate";
export { TAGLINE, finalCtaCopy, howItWorksCopy, statsCopy } from "./sections";

/** Sustituye {clave} en una plantilla de texto. */
export function fill(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
