// Niveles de servicio. Fuente: legacy/translations (pricing.tiers en español, que manda sobre el inglés).
// Los precios NO viven aquí: salen del motor (fromPrice).
import type { StaticImageData } from "next/image";
import { interiorAsientosDelanteros, interiorAsientosTraseros, interiorFrenteDia } from "@/assets/images";
import type { Locale } from "@/i18n/config";
import type { Level } from "@/lib/pricing/config";

export type Amenities = {
    drink: string;
    /** null: el nivel no lo incluye. */
    sweet: string | null;
    savory: string | null;
};

export type LevelContent = {
    id: Level;
    name: string;
    description: string;
    features: string[];
    amenities: Amenities;
    image: { src: StaticImageData; alt: string; position?: string };
};

const IMAGES = {
    practico: { src: interiorFrenteDia, position: "50% 55%" },
    select: { src: interiorAsientosDelanteros, position: "50% 50%" },
    premium: { src: interiorAsientosTraseros, position: "50% 60%" },
} as const;

const es: LevelContent[] = [
    {
        id: "practico",
        name: "Práctico",
        description: "La experiencia Unify en su versión esencial. Para traslados rápidos y eficientes.",
        features: ["Vehículo Tesla", "Conductor certificado", "Confort superior", "Confirmación en minutos", "Traslado ágil"],
        amenities: { drink: "Agua natural", sweet: null, savory: null },
        image: { ...IMAGES.practico, alt: "Cabina de un Tesla con asientos blancos y luz de día" },
    },
    {
        id: "select",
        name: "Select",
        description: "Una experiencia elevada, con detalles pensados para tu comodidad.",
        features: ["Tesla Model 3", "Conductor certificado", "Música a tu elección", "Bebida de bienvenida", "Snack ligero"],
        amenities: { drink: "Agua natural o mineral", sweet: "Mentas", savory: "Frutos secos o chips" },
        image: { ...IMAGES.select, alt: "Asientos delanteros de un Tesla vistos desde atrás" },
    },
    {
        id: "premium",
        name: "Premium",
        description: "El nivel más completo de Unify, para quienes cuidan cada detalle del trayecto.",
        features: [
            "Tesla Model 3 / Y",
            "Conductor de élite",
            "Todas las amenities a bordo",
            "Ambiente personalizado",
            "Prioridad de reserva",
            "Servicio white-glove",
        ],
        amenities: {
            drink: "Bebidas premium seleccionadas",
            sweet: "Alta confitería",
            savory: "Frutos secos de lujo",
        },
        image: { ...IMAGES.premium, alt: "Asientos traseros blancos de un Tesla" },
    },
];

const en: LevelContent[] = [
    {
        id: "practico",
        name: "Práctico",
        description: "The Unify experience in its essential form. For quick, efficient transfers.",
        features: ["Tesla vehicle", "Certified driver", "Superior comfort", "Confirmation in minutes", "Swift transfer"],
        amenities: { drink: "Still water", sweet: null, savory: null },
        image: { ...IMAGES.practico, alt: "Tesla cabin with white seats in daylight" },
    },
    {
        id: "select",
        name: "Select",
        description: "An elevated experience, with details designed for your comfort.",
        features: ["Tesla Model 3", "Certified driver", "Music of your choice", "Welcome drink", "Light snack"],
        amenities: { drink: "Still or sparkling water", sweet: "Mints", savory: "Nuts or chips" },
        image: { ...IMAGES.select, alt: "Front seats of a Tesla seen from the back" },
    },
    {
        id: "premium",
        name: "Premium",
        description: "Unify's most complete level, for those who care about every detail of the ride.",
        features: [
            "Tesla Model 3 / Y",
            "Elite driver",
            "All on-board amenities",
            "Personalized atmosphere",
            "Booking priority",
            "White-glove service",
        ],
        amenities: { drink: "Curated premium drinks", sweet: "Fine confectionery", savory: "Luxury nuts" },
        image: { ...IMAGES.premium, alt: "White rear seats of a Tesla" },
    },
];

const copy = {
    es: {
        title: "Elige tu nivel",
        text: "Cada viaje se cotiza según distancia, nivel y horario. Todas las tarifas en pesos, con IVA incluido.",
        from: "Desde",
        currency: "MXN",
        featuresLabel: "Incluye",
        /** "{level}" se sustituye por el nombre del nivel. */
        cta: "Cotizar {level}",
        seeAll: "Ver tarifas",
        amenities: {
            title: "Amenities a bordo",
            text: "Lo que encuentras en el vehículo según el nivel que elijas.",
            caption: "Amenities por nivel de servicio",
            amenityHeader: "Amenity",
            drink: "Bebida",
            sweet: "Dulce",
            savory: "Salado",
            none: "No incluye",
            note: "Variedades sujetas a disponibilidad.",
        },
    },
    en: {
        title: "Choose your level",
        text: "Every ride is quoted by distance, level and time. All fares in Mexican pesos, VAT included.",
        from: "From",
        currency: "MXN",
        featuresLabel: "Includes",
        cta: "Quote {level}",
        seeAll: "See pricing",
        amenities: {
            title: "On-board amenities",
            text: "What you'll find in the car, depending on the level you choose.",
            caption: "Amenities by service level",
            amenityHeader: "Amenity",
            drink: "Drink",
            sweet: "Sweet",
            savory: "Savory",
            none: "Not included",
            note: "Varieties subject to availability.",
        },
    },
} satisfies Record<Locale, unknown>;

export const levels: Record<Locale, LevelContent[]> = { es, en };
export const levelsCopy: Record<Locale, (typeof copy)["es"]> = copy;
