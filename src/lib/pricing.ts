import pricingConfig from "../../config/pricing.json";
import type { ServiceLevel } from "./db-types";

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

export function calculatePrice(input: PricingInput): PricingBreakdown {
    const { serviceLevel, distanceKm, pickupAt, passengers, luggage } = input;

    const base = pricingConfig.base[serviceLevel];
    const perKm = pricingConfig.per_km[serviceLevel];
    const distanceCost = round2(distanceKm * perKm);
    const subtotal = round2(base + distanceCost);

    const hourMultiplier = getHourMultiplier(pickupAt);
    const dayMultiplier = getDayMultiplier(pickupAt);
    const extras = calculateExtras(passengers, luggage);

    const raw = subtotal * hourMultiplier * dayMultiplier + extras;
    const total = Math.round(Number(raw.toFixed(2)));

    return {
        base,
        distanceCost,
        subtotal,
        hourMultiplier,
        dayMultiplier,
        extras,
        total,
        currency: pricingConfig.currency,
    };
}

function getLocalDateParts(d: Date): { hour: number; weekday: number; isoDate: string } {
    const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: pricingConfig.timezone,
        hour: "2-digit",
        hour12: false,
        weekday: "short",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    const parts = Object.fromEntries(
        fmt.formatToParts(d).map((p) => [p.type, p.value])
    );
    const weekdayMap: Record<string, number> = {
        Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };
    return {
        hour: parseInt(parts.hour, 10) % 24,
        weekday: weekdayMap[parts.weekday] ?? 0,
        isoDate: `${parts.year}-${parts.month}-${parts.day}`,
    };
}

function getHourMultiplier(d: Date): number {
    const { hour } = getLocalDateParts(d);
    const { nighttime, peak_morning, peak_evening } = pricingConfig.windows;
    const m = pricingConfig.multipliers;

    if (inWrappedWindow(hour, nighttime.start, nighttime.end)) return m.nighttime;
    if (inWindow(hour, peak_morning.start, peak_morning.end)) return m.peak_hour;
    if (inWindow(hour, peak_evening.start, peak_evening.end)) return m.peak_hour;
    return m.normal;
}

function getDayMultiplier(d: Date): number {
    const { weekday, isoDate } = getLocalDateParts(d);
    const m = pricingConfig.multipliers;

    if ((pricingConfig.holidays_mx as string[]).includes(isoDate)) return m.holiday;
    if (weekday === 0 || weekday === 6) return m.weekend;
    return m.normal;
}

function calculateExtras(passengers: number, luggage: number): number {
    const { passenger_fee_from, passenger_fee_amount, luggage_fee_from, luggage_fee_amount } =
        pricingConfig.extras;
    let total = 0;
    if (passengers >= passenger_fee_from) {
        total += (passengers - passenger_fee_from + 1) * passenger_fee_amount;
    }
    if (luggage >= luggage_fee_from) {
        total += (luggage - luggage_fee_from + 1) * luggage_fee_amount;
    }
    return total;
}

function inWindow(hour: number, start: number, end: number): boolean {
    return hour >= start && hour < end;
}

function inWrappedWindow(hour: number, start: number, end: number): boolean {
    return start > end ? hour >= start || hour < end : inWindow(hour, start, end);
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}
