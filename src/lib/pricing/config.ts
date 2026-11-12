import { z } from "zod";
import rawConfig from "../../../config/pricing.json";

export const SERVICE_LEVELS = ["practico", "select", "premium"] as const;
export type Level = (typeof SERVICE_LEVELS)[number];

const perLevel = z.object({
    practico: z.number().nonnegative(),
    select: z.number().nonnegative(),
    premium: z.number().nonnegative(),
});

const hourWindow = z.object({
    start: z.number().min(0).max(24),
    end: z.number().min(0).max(24),
});

const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "fecha YYYY-MM-DD");

// Todo lo agregado en 2026-11 es opcional con default para que una config vieja siga cargando.
export const pricingConfigSchema = z.object({
    version: z.string().default("legacy"),
    currency: z.string().default("MXN"),
    timezone: z.string().min(1),
    base: perLevel,
    per_km: perLevel,
    min_fare: perLevel.partial().optional(),
    multipliers: z.object({
        normal: z.number().positive(),
        peak_hour: z.number().positive(),
        nighttime: z.number().positive(),
        weekend: z.number().positive(),
        holiday: z.number().positive(),
    }),
    windows: z.object({
        peak_morning: hourWindow,
        peak_evening: hourWindow,
        nighttime: hourWindow,
    }),
    extras: z.object({
        passenger_fee_from: z.number().int().positive(),
        passenger_fee_amount: z.number().nonnegative(),
        luggage_fee_from: z.number().int().positive(),
        luggage_fee_amount: z.number().nonnegative(),
    }),
    capacity: z
        .object({
            max_passengers: z.number().int().positive(),
            max_luggage: z.number().int().nonnegative(),
        })
        .default({ max_passengers: 4, max_luggage: 2 }),
    booking: z
        .object({
            min_notice_hours: z.number().nonnegative(),
            max_advance_days: z.number().int().positive(),
        })
        .default({ min_notice_hours: 12, max_advance_days: 365 }),
    service_area: z
        .object({
            center: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }),
            radius_km: z.number().positive(),
            max_leg_km: z.number().positive(),
        })
        .default({ center: { lat: 19.4326, lng: -99.1332 }, radius_km: 45, max_leg_km: 90 }),
    approx: z
        .object({
            road_factor: z.number().min(1),
            min_km: z.number().nonnegative(),
            speed_kmh: z.object({
                peak: z.number().positive(),
                normal: z.number().positive(),
                night: z.number().positive(),
            }),
        })
        .default({ road_factor: 1.35, min_km: 2, speed_kmh: { peak: 18, normal: 28, night: 40 } }),
    // Informativo (términos, sección 9): no entra al cálculo.
    waiting: z
        .object({
            city_min: z.number().nonnegative(),
            airport_min: z.number().nonnegative(),
            excess_per_15min: z.number().nonnegative(),
        })
        .default({ city_min: 15, airport_min: 30, excess_per_15min: 60 }),
    holidays_mx: z.array(isoDay).default([]),
});

export type PricingConfig = z.infer<typeof pricingConfigSchema>;
export type PricingConfigInput = z.input<typeof pricingConfigSchema>;

export function parsePricingConfig(input: unknown): PricingConfig {
    const parsed = pricingConfigSchema.safeParse(input);
    if (!parsed.success) {
        const detail = parsed.error.issues
            .map((i) => `${i.path.join(".") || "(raíz)"}: ${i.message}`)
            .join("; ");
        throw new Error(`config/pricing.json inválido → ${detail}`);
    }
    try {
        new Intl.DateTimeFormat("en-US", { timeZone: parsed.data.timezone });
    } catch {
        throw new Error(`config/pricing.json inválido → timezone desconocida: ${parsed.data.timezone}`);
    }
    return parsed.data;
}

/** Config global, validada al cargar el módulo. */
export const pricingConfig: PricingConfig = parsePricingConfig(rawConfig);
