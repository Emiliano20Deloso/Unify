// Contenido compartido del sitio (ES/EN), una sola fuente para portada, servicios y tarifas.
// Datos de negocio en src/lib/site.ts; precios siempre del motor (src/lib/pricing).
export { levels, levelsCopy, type Amenities, type LevelContent } from "./levels";
export { catalogRouteKm, popularRoutes, routesCopy, type PopularRoute } from "./routes";
export { faq, faqCopy, type FaqItem, type FaqTopic } from "./faq";
export { testimonials, testimonialsCopy, type Testimonial } from "./testimonials";
export { corporateCopy } from "./corporate";
export { TAGLINE, finalCtaCopy, howItWorksCopy, statsCopy } from "./sections";
export { CUSTOM_SERVICES, ONLINE_SERVICES, servicesImages } from "./services";
export { customQuoteKinds, pricingExample } from "./pricing-page";
export { aboutImages } from "./about";
export { photos } from "./photos";

/** Sustituye {clave} en una plantilla de texto (la misma función que usa el cotizador). */
export { fill } from "@/lib/quote/format";
