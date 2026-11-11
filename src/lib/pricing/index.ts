import type { ServiceLevel } from "../db-types";
import { pricingConfig, type Level, type PricingConfig } from "./config";
import { priceLeg, minFareFor } from "./engine";
import { instantToWall } from "./time";

export * from "./config";
export * from "./engine";
export * from "./time";
export { formatMXN } from "./format";

export type PricingInput = {
    serviceLevel: ServiceLevel;
    distanceKm: number;
    pickupAt: Date;
    passengers: number;
    luggage: number;
};

export type PricingBreakdown = {
    base: number;
    distanceCost: number;
    subtotal: number;
    hourMultiplier: number;
    dayMultiplier: number;
    extras: number;
    total: number;
    currency: string;
};

/**
 * Adaptador con la firma histórica sobre el motor nuevo (incluye la tarifa mínima).
 * `pickupAt` es un instante; se convierte a hora de pared con la zona de la config.
 */
export function calculatePrice(input: PricingInput, config: PricingConfig = pricingConfig): PricingBreakdown {
    const wall = instantToWall(input.pickupAt, config.timezone);
    const leg = priceLeg(
        {
            level: input.serviceLevel,
            distanceKm: input.distanceKm,
            date: wall.date,
            time: wall.time,
            passengers: input.passengers,
            luggage: input.luggage,
        },
        config
    );
    return {
        base: leg.base,
        distanceCost: leg.distanceCost,
        subtotal: leg.subtotal,
        hourMultiplier: leg.hourMultiplier,
        dayMultiplier: leg.dayMultiplier,
        extras: leg.extras,
        total: leg.total,
        currency: config.currency,
    };
}

/** "Desde $X": la tarifa mínima del nivel o, si no hay, la base. */
export function fromPrice(level: Level, config: PricingConfig = pricingConfig): number {
    return minFareFor(level, config) || config.base[level];
}

/** Precio de una ruta en horario normal entre semana (martes 12:00, sin festivos ni extras). */
export function routePrice(level: Level, km: number, config: PricingConfig = pricingConfig): number {
    return priceLeg(
        { level, distanceKm: km, date: "2026-11-10", time: "12:00", passengers: 1, luggage: 0 },
        { ...config, holidays_mx: [] }
    ).total;
}
