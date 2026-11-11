// Textos de las secciones compartidas sin datos propios: cifras, cómo funciona y cierre.
import type { Locale } from "@/i18n/config";

/** Lema de marca: en inglés en ambos idiomas (se marca lang="en"). */
export const TAGLINE = "The luxury of travelling green";

const stats = {
    es: {
        label: "Unify en cifras",
        // Espacio fino no separable antes de "%".
        items: [
            { value: "+1,500", label: "viajes" },
            { value: "98\u202F%", label: "de satisfacción" },
        ],
    },
    en: {
        label: "Unify in numbers",
        items: [
            { value: "+1,500", label: "trips" },
            { value: "98\u202F%", label: "satisfaction" },
        ],
    },
} satisfies Record<Locale, unknown>;

const howItWorks = {
    es: {
        title: "Tu viaje en tres pasos",
        text: "Cotizas en línea, confirmas por WhatsApp y tu chofer llega a la hora acordada.",
        steps: [
            {
                title: "Cotiza",
                text: "Indica origen, destino, fecha y hora. Ves tu tarifa al momento, en pesos y con IVA incluido.",
            },
            {
                title: "Confirma",
                text: "Reserva con al menos 12 horas de anticipación. Tu viaje queda confirmado al recibir la confirmación y procesar el pago.",
            },
            {
                title: "Viaja",
                text: "Tu chofer llega puntual al punto acordado. Tú solo descansa en un Tesla silencioso, con las amenities de tu nivel.",
            },
        ],
    },
    en: {
        title: "Your ride in three steps",
        text: "Get a quote online, confirm on WhatsApp and your driver arrives at the agreed time.",
        steps: [
            {
                title: "Get a quote",
                text: "Enter origin, destination, date and time. You see your fare right away, in pesos with VAT included.",
            },
            {
                title: "Confirm",
                text: "Book at least 12 hours ahead. Your ride is confirmed once you receive the confirmation and the payment is processed.",
            },
            {
                title: "Ride",
                text: "Your driver arrives on time at the agreed spot. You simply rest in a quiet Tesla, with the amenities of your level.",
            },
        ],
    },
} satisfies Record<Locale, unknown>;

const finalCta = {
    es: {
        title: "Tus mañanas pueden empezar mejor.",
        text: "Solo necesitas un viaje a tu altura.",
        cta: "Cotizar tu viaje",
        imageAlt: "Silueta de un Tesla iluminada en la oscuridad",
    },
    en: {
        title: "Your mornings can start better.",
        text: "All it takes is a ride that matches your standards.",
        cta: "Get a quote",
        imageAlt: "Silhouette of a Tesla lit in the dark",
    },
} satisfies Record<Locale, unknown>;

export const statsCopy: Record<Locale, (typeof stats)["es"]> = stats;
export const howItWorksCopy: Record<Locale, (typeof howItWorks)["es"]> = howItWorks;
export const finalCtaCopy: Record<Locale, (typeof finalCta)["es"]> = finalCta;
