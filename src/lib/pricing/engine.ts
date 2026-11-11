import { pricingConfig, type Level, type PricingConfig } from "./config";
import { minuteOfDay, weekdayOf } from "./time";

// Modelo (decidido con el dueño):
//   sub   = base[nivel] + round2(km × per_km[nivel])
//   adj   = max(min_fare[nivel] ?? 0, sub)            ← la mínima va ANTES de los recargos
//   total = half_up(adj × mult_hora × mult_día + extras)   entero, MXN, IVA incluido

export type LineKey =
    | "base"
    | "distance"
    | "minFareAdjustment"
    | "hourSurcharge"
    | "daySurcharge"
    | "passengerExtra"
    | "luggageExtra";

export type PriceLine = { key: LineKey; amount: number };

export type HourBand = "night" | "peak" | "normal";
export type DayType = "holiday" | "weekend" | "weekday";

export type LegPriceInput = {
    level: Level;
    distanceKm: number;
    date: string; // YYYY-MM-DD, hora de pared CDMX
    time: string; // HH:mm
    passengers: number;
    luggage: number;
};

export type LegPrice = {
    level: Level;
    lines: PriceLine[];
    total: number;
    hourMultiplier: number;
    dayMultiplier: number;
    minFareApplied: boolean;
    // Valores intermedios (útiles para el adaptador y para pruebas).
    base: number;
    distanceCost: number;
    subtotal: number;
    adjusted: number;
    extras: number;
};

export function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

/** Redondeo a entero "half up" protegido contra ruido de coma flotante (607.4999999 → 608). */
export function roundHalfUp(n: number): number {
    return Math.round(Number(n.toFixed(2)));
}

function inWindow(min: number, start: number, end: number): boolean {
    const s = start * 60;
    const e = end * 60;
    return s > e ? min >= s || min < e : min >= s && min < e;
}

/** Franja horaria. Nocturno gana a pico. */
export function hourBand(time: string, config: PricingConfig = pricingConfig): HourBand {
    const min = minuteOfDay(time);
    const w = config.windows;
    if (inWindow(min, w.nighttime.start, w.nighttime.end)) return "night";
    if (inWindow(min, w.peak_morning.start, w.peak_morning.end)) return "peak";
    if (inWindow(min, w.peak_evening.start, w.peak_evening.end)) return "peak";
    return "normal";
}

export function isWeekend(date: string): boolean {
    const wd = weekdayOf(date);
    return wd === 0 || wd === 6;
}

export function isHoliday(date: string, config: PricingConfig = pricingConfig): boolean {
    return config.holidays_mx.includes(date);
}

/** Tipo de día. Festivo gana a fin de semana. */
export function dayType(date: string, config: PricingConfig = pricingConfig): DayType {
    if (isHoliday(date, config)) return "holiday";
    if (isWeekend(date)) return "weekend";
    return "weekday";
}

export function hourMultiplierFor(band: HourBand, config: PricingConfig = pricingConfig): number {
    const m = config.multipliers;
    return band === "night" ? m.nighttime : band === "peak" ? m.peak_hour : m.normal;
}

export function dayMultiplierFor(type: DayType, config: PricingConfig = pricingConfig): number {
    const m = config.multipliers;
    return type === "holiday" ? m.holiday : type === "weekend" ? m.weekend : m.normal;
}

export function passengerExtra(passengers: number, config: PricingConfig = pricingConfig): number {
    const { passenger_fee_from: from, passenger_fee_amount: amount } = config.extras;
    return passengers >= from ? (passengers - from + 1) * amount : 0;
}

export function luggageExtra(luggage: number, config: PricingConfig = pricingConfig): number {
    const { luggage_fee_from: from, luggage_fee_amount: amount } = config.extras;
    return luggage >= from ? (luggage - from + 1) * amount : 0;
}

export function minFareFor(level: Level, config: PricingConfig = pricingConfig): number {
    return config.min_fare?.[level] ?? 0;
}

/** Precio de un tramo para un nivel. Σ lines.amount === total siempre. */
export function priceLeg(input: LegPriceInput, config: PricingConfig = pricingConfig): LegPrice {
    const { level, distanceKm, date, time, passengers, luggage } = input;
    if (!Number.isFinite(distanceKm) || distanceKm < 0) throw new Error(`Distancia inválida: ${distanceKm}`);

    const base = config.base[level];
    const distanceCost = round2(distanceKm * config.per_km[level]);
    const subtotal = round2(base + distanceCost);
    const minFare = minFareFor(level, config);
    const adjusted = Math.max(minFare, subtotal);
    const minFareApplied = adjusted > subtotal;

    const h = hourMultiplierFor(hourBand(time, config), config);
    const d = dayMultiplierFor(dayType(date, config), config);
    const pax = passengerExtra(passengers, config);
    const lug = luggageExtra(luggage, config);
    const extras = pax + lug;

    const total = roundHalfUp(adjusted * h * d + extras);

    const lines: PriceLine[] = [
        { key: "base", amount: Math.round(base) },
        { key: "distance", amount: Math.round(distanceCost) },
        { key: "minFareAdjustment", amount: Math.round(adjusted - subtotal) },
        { key: "hourSurcharge", amount: Math.round(adjusted * (h - 1)) },
        { key: "daySurcharge", amount: Math.round(adjusted * h * (d - 1)) },
        { key: "passengerExtra", amount: Math.round(pax) },
        { key: "luggageExtra", amount: Math.round(lug) },
    ];

    // El residuo de redondeo va a la última línea de recargo distinta de cero; si no hay recargos,
    // al ajuste por mínima (si aplica) y, si tampoco, a la distancia.
    const residual = total - lines.reduce((s, l) => s + l.amount, 0);
    if (residual !== 0) {
        const order: LineKey[] = ["daySurcharge", "hourSurcharge", "minFareAdjustment"];
        const target =
            order.map((k) => lines.find((l) => l.key === k && l.amount !== 0)).find(Boolean) ??
            lines.find((l) => l.key === "distance")!;
        target.amount += residual;
    }

    return {
        level,
        lines: lines.filter((l) => l.amount !== 0 || l.key === "base" || l.key === "distance"),
        total,
        hourMultiplier: h,
        dayMultiplier: d,
        minFareApplied,
        base,
        distanceCost,
        subtotal,
        adjusted,
        extras,
    };
}
