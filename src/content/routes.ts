// Rutas populares (las 5 del sitio anterior). Origen y destino usan ids del catálogo (cat:<slug>).
// Las rutas dentro de zona NO llevan km escritos: se calculan con las coordenadas del catálogo y el
// mismo aproximado que usa el cotizador sin Google, para que tarjeta y cotizador digan lo mismo.
// Las foráneas no tienen precio (se cotizan aparte, términos sección 4) y conservan km de referencia.
import type { StaticImageData } from "next/image";
import { rutaAutopista, rutaBosque, rutaPuente, teslaRojoCiudad, teslaRojoTunel } from "@/assets/images";
import type { Locale } from "@/i18n/config";
import { approxKm } from "@/lib/distance/approx";
import { catalogId, getCatalogPlace } from "@/lib/places/catalog";

type Place = {
    /** Id del catálogo (cat:<slug>) o null si el lugar no está en el catálogo. */
    id: string | null;
    name: Record<Locale, string>;
};

type RouteDefinition = {
    slug: string;
    origin: Place;
    destination: Place;
    image: { src: StaticImageData; alt: Record<Locale, string>; position?: string };
} & (
    /** Dentro de la zona: precio del motor, distancia calculada (ver approxKm). */
    | { zone: "in" }
    /** Foránea: cotización personalizada, km de referencia. */
    | { zone: "out"; referenceKm: number }
);

export type PopularRoute = RouteDefinition & {
    /** km: calculados (zona "in", aproximados) o de referencia (zona "out"). */
    km: number;
};

/** Distancia que verá el cotizador sin llave de Google para dos lugares del catálogo. */
export function catalogRouteKm(originId: string, destinationId: string): number {
    const origin = getCatalogPlace(originId);
    const destination = getCatalogPlace(destinationId);
    if (!origin || !destination) throw new Error(`Ruta fuera del catálogo: ${originId} → ${destinationId}`);
    return approxKm(origin, destination);
}

const definitions: readonly RouteDefinition[] = [
    {
        slug: "polanco-aicm",
        origin: { id: catalogId("polanco"), name: { es: "Polanco", en: "Polanco" } },
        destination: { id: catalogId("aicm-t1"), name: { es: "AICM Terminal 1", en: "MEX Airport Terminal 1" } },
        zone: "in",
        image: {
            src: rutaAutopista,
            alt: { es: "Tesla gris en una vía rápida al amanecer", en: "Grey Tesla on an expressway at dawn" },
            position: "55% 60%",
        },
    },
    {
        slug: "santa-fe-autodromo",
        origin: { id: catalogId("santa-fe"), name: { es: "Santa Fe", en: "Santa Fe" } },
        destination: {
            id: catalogId("autodromo"),
            name: { es: "Autódromo Hermanos Rodríguez", en: "Autódromo Hermanos Rodríguez" },
        },
        zone: "in",
        image: {
            src: rutaPuente,
            alt: { es: "Tesla negro cruzando un puente atirantado", en: "Black Tesla crossing a cable-stayed bridge" },
            position: "50% 60%",
        },
    },
    {
        slug: "condesa-perisur",
        origin: { id: catalogId("condesa"), name: { es: "Condesa", en: "Condesa" } },
        destination: { id: catalogId("perisur"), name: { es: "Perisur", en: "Perisur" } },
        zone: "in",
        image: {
            src: teslaRojoCiudad,
            alt: { es: "Tesla rojo frente a edificios de la ciudad", en: "Red Tesla in front of city buildings" },
            position: "70% 70%",
        },
    },
    {
        slug: "roma-tepoztlan",
        origin: { id: catalogId("roma"), name: { es: "Roma", en: "Roma" } },
        destination: { id: null, name: { es: "Tepoztlán", en: "Tepoztlán" } },
        zone: "out",
        referenceKm: 100,
        image: {
            src: rutaBosque,
            alt: { es: "Tesla plateado en una carretera entre árboles", en: "Silver Tesla on a road through the trees" },
            position: "50% 55%",
        },
    },
    {
        slug: "lomas-toluca",
        origin: {
            id: catalogId("lomas-de-chapultepec"),
            name: { es: "Lomas de Chapultepec", en: "Lomas de Chapultepec" },
        },
        destination: {
            id: catalogId("aeropuerto-toluca"),
            name: { es: "Aeropuerto de Toluca", en: "Toluca Airport" },
        },
        zone: "out",
        referenceKm: 75,
        image: {
            src: teslaRojoTunel,
            alt: { es: "Tesla rojo saliendo de un túnel iluminado", en: "Red Tesla driving out of a lit tunnel" },
            position: "55% 65%",
        },
    },
];

export const popularRoutes: readonly PopularRoute[] = definitions.map((route) => ({
    ...route,
    km: route.zone === "out" ? route.referenceKm : catalogRouteKm(route.origin.id ?? "", route.destination.id ?? ""),
}));

const copy = {
    es: {
        title: "Rutas frecuentes",
        text: "Precios de referencia en Práctico, entre semana y en horario normal. La tarifa final depende de la fecha, la hora y el nivel.",
        to: "a",
        from: "Desde",
        level: "en Práctico",
        /** {km}: distancia redondeada. "≈" porque sale del aproximado, no de una ruta real. */
        approxKm: "≈ {km} km",
        km: "{km} km",
        outOfZone: "Cotización personalizada",
        outOfZoneHint: "Fuera de la zona de servicio",
        /** "{origin}", "{destination}" y "{km}" se sustituyen. */
        whatsappContext: "Ruta: {origin} → {destination} (aprox. {km} km).",
        seeAll: "Ver todas las rutas",
    },
    en: {
        title: "Popular routes",
        text: "Reference prices for Práctico, on a weekday at regular hours. The final fare depends on the date, time and level.",
        to: "to",
        from: "From",
        level: "in Práctico",
        approxKm: "≈ {km} km",
        km: "{km} km",
        outOfZone: "Custom quote",
        outOfZoneHint: "Outside the service area",
        whatsappContext: "Route: {origin} → {destination} (approx. {km} km).",
        seeAll: "See all routes",
    },
} satisfies Record<Locale, unknown>;

export const routesCopy: Record<Locale, (typeof copy)["es"]> = copy;
