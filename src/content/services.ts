// Tipos de servicio (terminos-condiciones.md, § 4): orden, foto y acción de cada uno.
// Los textos viven en el diccionario "services"; aquí solo los datos que no se traducen.
import type { StaticImageData } from "next/image";
import type { SpecialQuoteKind } from "@/lib/whatsapp";
import { photos } from "./photos";

/** Se cotizan en línea: llevan al cotizador de /tarifas. */
export const ONLINE_SERVICES = [
    { id: "point", image: { src: photos.servicePoint, position: "40% 55%" } },
    { id: "airport", image: { src: photos.serviceAirport, position: "38% 52%" } },
] as const satisfies readonly { id: string; image: { src: StaticImageData; position: string } }[];

/** Cotización personalizada por WhatsApp (buildSpecialQuoteUrl con su tipo). */
export const CUSTOM_SERVICES = [
    { id: "hourly", kind: "hourly" },
    { id: "event", kind: "event" },
    { id: "out_of_zone", kind: "out_of_zone" },
] as const satisfies readonly { id: string; kind: SpecialQuoteKind }[];

export const servicesImages = {
    hero: { src: photos.servicesHero, position: "50% 70%" },
    custom: { src: photos.serviceCustom, position: "40% 50%" },
} as const;
