// Contrato de /api/estimate. Sin "server-only": la interfaz importa los tipos y el esquema.
import { z } from "zod";
import { isInMexico } from "../geo";
import type { Level } from "../pricing/config";
import type { PriceLine } from "../pricing/engine";
import { isValidDate, isValidTime } from "../pricing/time";

export const dateField = z.string().refine(isValidDate, "Fecha inválida (YYYY-MM-DD)");
export const timeField = z.string().refine(isValidTime, "Hora inválida (HH:mm)");

export const placeRefSchema = z
    .object({
        label: z.string().trim().min(1).max(200),
        placeId: z.string().min(1).max(300).optional(),
        lat: z.number().finite(),
        lng: z.number().finite(),
    })
    .strict()
    .refine((p) => isInMexico(p), { message: "Las coordenadas deben estar dentro de México", path: ["lat"] });

export const estimateRequestSchema = z
    .object({
        origin: placeRefSchema,
        destination: placeRefSchema,
        date: dateField,
        time: timeField,
        passengers: z.number().int().min(1).max(10),
        luggage: z.number().int().min(0).max(10),
        returnTrip: z.object({ date: dateField, time: timeField }).strict().nullable().optional(),
        lang: z.enum(["es", "en"]).optional(),
    })
    .strict();

export type PlaceRef = z.infer<typeof placeRefSchema>;
export type EstimateRequest = z.infer<typeof estimateRequestSchema>;

export type SpecialQuoteReason = "out_of_zone" | "too_far" | "capacity" | "no_route";
export type Notice = "tolls_not_included" | "short_notice" | "waiting_policy" | "estimate_not_binding";

export type EstimateFlags = {
    peak: boolean;
    night: boolean;
    weekend: boolean;
    holiday: boolean;
    shortNotice: boolean;
    outOfZone: boolean;
    airport: boolean;
    distanceAnomaly: boolean;
};

export type EstimateLeg = {
    direction: "outbound" | "return";
    date: string;
    time: string;
    pickupUtc: string;
    distanceKm: number;
    durationMin: number;
    durationSource: "traffic" | "static" | "approx";
    distanceSource: "google" | "approx";
    flags: EstimateFlags;
};

export type TierLeg = {
    lines: PriceLine[];
    total: number;
    hourMultiplier: number;
    dayMultiplier: number;
    minFareApplied: boolean;
};

export type Tier = { level: Level; legs: TierLeg[]; total: number };

export type EstimateResponse = {
    ok: true;
    ref: string;
    currency: "MXN";
    taxIncluded: true;
    configVersion: string;
    legs: EstimateLeg[];
    flags: EstimateFlags;
    specialQuote: { required: boolean; reasons: SpecialQuoteReason[] };
    tiers: Record<Level, Tier> | null;
    attribution: "google_maps" | null;
    notices: Notice[];
};

export type EstimateErrorCode =
    | "INVALID_JSON"
    | "PAYLOAD_TOO_LARGE"
    | "VALIDATION"
    | "PICKUP_IN_PAST"
    | "TOO_FAR_AHEAD"
    | "SAME_PLACE"
    | "RATE_LIMITED"
    | "FORBIDDEN_ORIGIN";

export type EstimateError = {
    ok: false;
    code: EstimateErrorCode;
    message: string;
    issues?: { path: string; message: string }[];
};
