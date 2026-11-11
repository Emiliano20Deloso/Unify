// Testimonios del sitio anterior (legacy/translations), con su calificación original.
import type { Locale } from "@/i18n/config";

export type Testimonial = {
    id: string;
    name: string;
    /** Calificación de 0 a 5 tal como la dio el cliente. */
    rating: number;
    text: string;
};

const RATINGS = { carlos: 5, andrea: 4.5, roberto: 5, sofia: 4 } as const;

const es: Testimonial[] = [
    {
        id: "carlos",
        name: "Carlos M.",
        rating: RATINGS.carlos,
        text: "Usé Unify para ir al aeropuerto y fue una experiencia completamente diferente. El auto impecable, el conductor puntual y muy profesional.",
    },
    {
        id: "andrea",
        name: "Andrea L.",
        rating: RATINGS.andrea,
        text: "Para nuestras reuniones corporativas, Unify es la única opción. Puntualidad, discreción y clase en cada traslado.",
    },
    {
        id: "roberto",
        name: "Roberto A.",
        rating: RATINGS.roberto,
        text: "Reservé para mi esposa y le encantó. Dijo que fue el traslado más cómodo que ha tenido. Ya somos clientes fijos.",
    },
    {
        id: "sofia",
        name: "Sofía R.",
        rating: RATINGS.sofia,
        text: "El Tesla llegó a tiempo y muy limpio, el conductor fue amable. El trayecto fue cómodo y sin sorpresas. Buena opción para viajes importantes.",
    },
];

const en: Testimonial[] = [
    {
        id: "carlos",
        name: "Carlos M.",
        rating: RATINGS.carlos,
        text: "I used Unify to get to the airport and it was a completely different experience. The car was impeccable, the driver punctual and very professional.",
    },
    {
        id: "andrea",
        name: "Andrea L.",
        rating: RATINGS.andrea,
        text: "For our corporate meetings, Unify is the only option. Punctuality, discretion and class in every transfer.",
    },
    {
        id: "roberto",
        name: "Roberto A.",
        rating: RATINGS.roberto,
        text: "I booked for my wife and she loved it. She said it was the most comfortable transfer she's ever had. We're now regulars.",
    },
    {
        id: "sofia",
        name: "Sofía R.",
        rating: RATINGS.sofia,
        text: "The Tesla arrived on time and very clean, the driver was friendly. The ride was comfortable and hassle-free. A good option for important trips.",
    },
];

const copy = {
    es: {
        title: "Lo que dicen quienes viajan con nosotros",
        /** "{rating}" se sustituye. */
        rating: "{rating} de 5",
        ratingLabel: "Calificación: {rating} de 5",
    },
    en: {
        title: "What our riders say",
        rating: "{rating} out of 5",
        ratingLabel: "Rating: {rating} out of 5",
    },
} satisfies Record<Locale, unknown>;

export const testimonials: Record<Locale, Testimonial[]> = { es, en };
export const testimonialsCopy: Record<Locale, (typeof copy)["es"]> = copy;
