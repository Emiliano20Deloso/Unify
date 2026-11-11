// Tipos de servicio (terminos-condiciones.md, § 4): orden, foto y acción de cada uno.
// Los textos viven en el diccionario "services"; aquí solo los datos que no se traducen.
import type { StaticImageData } from "next/image";
import { interiorTechoCristal, rutaCosta, teslaRojoCiudad, teslaRojoLuces } from "@/assets/images";
import type { SpecialQuoteKind } from "@/lib/whatsapp";

/** Se cotizan en línea: llevan al cotizador de /tarifas. */
export const ONLINE_SERVICES = [
    { id: "point", image: { src: teslaRojoLuces, position: "40% 55%" } },
    { id: "airport", image: { src: interiorTechoCristal, position: "50% 40%" } },
] as const satisfies readonly { id: string; image: { src: StaticImageData; position: string } }[];

/** Cotización personalizada por WhatsApp (buildSpecialQuoteUrl con su tipo). */
export const CUSTOM_SERVICES = [
    { id: "hourly", kind: "hourly" },
    { id: "event", kind: "event" },
    { id: "out_of_zone", kind: "out_of_zone" },
] as const satisfies readonly { id: string; kind: SpecialQuoteKind }[];

export const servicesImages = {
    hero: { src: teslaRojoCiudad, position: "50% 70%" },
    custom: { src: rutaCosta, position: "40% 50%" },
} as const;
