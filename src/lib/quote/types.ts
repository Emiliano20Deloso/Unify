// Tipos del cotizador (interfaz). Seguro para cliente: solo tipos y constantes.
import type { Level } from "../pricing/config";

export type { Level };

export const LEVELS = ["practico", "select", "premium"] as const satisfies readonly Level[];
export const DEFAULT_LEVEL: Level = "select";

/** Zona horaria del servicio (espejo de config/pricing.json, que no viaja al navegador). */
export const SERVICE_TZ = "America/Mexico_City";

/** Topes de los Stepper. Por encima de la capacidad (4 / 2) la API pide cotización especial. */
export const MAX_PASSENGERS = 8;
export const MAX_LUGGAGE = 6;

export type PlaceKind = "airport" | "zone" | "venue" | "address";

/** Lugar ya resuelto (con coordenadas). `id` es "cat:slug" o un place id de Google. */
export interface QuotePlace {
    id: string;
    label: string;
    lat: number;
    lng: number;
    kind: PlaceKind;
}

export interface QuoteDraft {
    origin: QuotePlace | null;
    destination: QuotePlace | null;
    date: string; // YYYY-MM-DD, hora de pared CDMX ("" = sin elegir)
    time: string; // HH:mm
    passengers: number;
    luggage: number;
    level: Level;
    roundTrip: boolean;
    returnDate: string;
    returnTime: string;
    flight: string;
}

/** Sugerencia de /api/places/autocomplete. */
export interface Suggestion {
    id: string;
    main: string;
    secondary?: string;
    source: "catalog" | "google";
    kind?: "airport" | "zone" | "venue";
}
