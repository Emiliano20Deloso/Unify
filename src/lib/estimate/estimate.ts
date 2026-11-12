import "server-only";
import { createHash } from "node:crypto";
import { haversineKm } from "../geo";
import { approxLegDistance, resolveLegDistance, type LegDistance } from "../distance";
import { isAirport, isInZone } from "../places/zone";
import { pricingConfig, SERVICE_LEVELS, type Level, type PricingConfig } from "../pricing/config";
import { dayType, hourBand, isWeekend, priceLeg } from "../pricing/engine";
import { wallToInstant } from "../pricing/time";
import type {
    EstimateErrorCode,
    EstimateFlags,
    EstimateLeg,
    EstimateRequest,
    EstimateResponse,
    Notice,
    SpecialQuoteReason,
    Tier,
} from "./schema";

export const SAME_PLACE_KM = 0.3;

export type EstimateFailure = {
    ok: false;
    status: 422;
    code: Extract<EstimateErrorCode, "PICKUP_IN_PAST" | "TOO_FAR_AHEAD" | "SAME_PLACE" | "VALIDATION">;
    message: string;
    issues?: { path: string; message: string }[];
};

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // base32 de Crockford

/** Referencia corta y determinista de la petición ("UE-XXXXXX"). No se guarda. */
export function estimateRef(req: EstimateRequest): string {
    const canonical = JSON.stringify([
        [req.origin.lat, req.origin.lng, req.origin.placeId ?? null],
        [req.destination.lat, req.destination.lng, req.destination.placeId ?? null],
        req.date,
        req.time,
        req.passengers,
        req.luggage,
        req.returnTrip ? [req.returnTrip.date, req.returnTrip.time] : null,
    ]);
    const digest = createHash("sha256").update(canonical).digest();
    let out = "";
    for (let i = 0; i < 6; i++) out += ALPHABET[digest[i]! % 32];
    return `UE-${out}`;
}

/** ¿Faltan menos de min_notice_hours para la recogida? */
export function isShortNotice(pickup: Date, now: Date, config: PricingConfig = pricingConfig): boolean {
    return pickup.getTime() - now.getTime() < config.booking.min_notice_hours * 3_600_000;
}

type LegPlan = {
    direction: "outbound" | "return";
    date: string;
    time: string;
    pickup: Date;
    from: EstimateRequest["origin"];
    to: EstimateRequest["origin"];
};

export async function computeEstimate(
    req: EstimateRequest,
    opts: { config?: PricingConfig; now?: Date } = {}
): Promise<EstimateResponse | EstimateFailure> {
    const config = opts.config ?? pricingConfig;
    const now = opts.now ?? new Date();
    const tz = config.timezone;

    const plans: LegPlan[] = [
        {
            direction: "outbound",
            date: req.date,
            time: req.time,
            pickup: wallToInstant(req.date, req.time, tz),
            from: req.origin,
            to: req.destination,
        },
    ];
    if (req.returnTrip) {
        plans.push({
            direction: "return",
            date: req.returnTrip.date,
            time: req.returnTrip.time,
            pickup: wallToInstant(req.returnTrip.date, req.returnTrip.time, tz),
            from: req.destination,
            to: req.origin,
        });
    }

    // --- Reglas de fecha ---
    for (const p of plans) {
        if (p.pickup.getTime() <= now.getTime()) {
            return { ok: false, status: 422, code: "PICKUP_IN_PAST", message: "La fecha y hora ya pasaron" };
        }
        if (p.pickup.getTime() - now.getTime() > config.booking.max_advance_days * 86_400_000) {
            return {
                ok: false,
                status: 422,
                code: "TOO_FAR_AHEAD",
                message: `Solo se cotiza con hasta ${config.booking.max_advance_days} días de anticipación`,
            };
        }
    }
    if (plans[1] && plans[1].pickup.getTime() <= plans[0]!.pickup.getTime()) {
        return {
            ok: false,
            status: 422,
            code: "VALIDATION",
            message: "El regreso debe ser posterior a la ida",
            issues: [{ path: "returnTrip", message: "El regreso debe ser posterior a la ida" }],
        };
    }
    if (haversineKm(req.origin, req.destination) < SAME_PLACE_KM) {
        return { ok: false, status: 422, code: "SAME_PLACE", message: "Origen y destino son el mismo lugar" };
    }

    // --- Casos que no se cotizan en línea (se decide antes de gastar en Google) ---
    const reasons = new Set<SpecialQuoteReason>();
    const outOfZone = !isInZone(req.origin, config) || !isInZone(req.destination, config);
    if (outOfZone) reasons.add("out_of_zone");
    if (req.passengers > config.capacity.max_passengers || req.luggage > config.capacity.max_luggage) {
        reasons.add("capacity");
    }

    const distances: LegDistance[] = await Promise.all(
        plans.map((p) =>
            reasons.size > 0
                ? Promise.resolve<LegDistance>({
                      ...approxLegDistance(p.from, p.to, p.pickup, config),
                      source: "approx",
                      durationSource: "approx",
                      anomaly: false,
                  })
                : resolveLegDistance(p.from, p.to, p.pickup, config, now)
        )
    );

    if (distances.some((d) => d.km > config.service_area.max_leg_km)) reasons.add("too_far");
    if (distances.some((d) => d.noRoute)) reasons.add("no_route");

    const airport = isAirport(req.origin) || isAirport(req.destination);
    const legs: EstimateLeg[] = plans.map((p, i) => {
        const d = distances[i]!;
        const band = hourBand(p.time, config);
        const flags: EstimateFlags = {
            peak: band === "peak",
            night: band === "night",
            weekend: isWeekend(p.date),
            holiday: dayType(p.date, config) === "holiday",
            shortNotice: isShortNotice(p.pickup, now, config),
            outOfZone,
            airport,
            distanceAnomaly: d.anomaly,
        };
        return {
            direction: p.direction,
            date: p.date,
            time: p.time,
            pickupUtc: p.pickup.toISOString(),
            distanceKm: d.km,
            durationMin: d.min,
            durationSource: d.durationSource,
            distanceSource: d.source,
            flags,
        };
    });

    const flags = legs.reduce<EstimateFlags>(
        (acc, l) => {
            for (const k of Object.keys(acc) as (keyof EstimateFlags)[]) acc[k] = acc[k] || l.flags[k];
            return acc;
        },
        {
            peak: false,
            night: false,
            weekend: false,
            holiday: false,
            shortNotice: false,
            outOfZone: false,
            airport: false,
            distanceAnomaly: false,
        }
    );

    const special = reasons.size > 0;
    let tiers: Record<Level, Tier> | null = null;
    if (!special) {
        tiers = Object.fromEntries(
            SERVICE_LEVELS.map((level) => {
                const tierLegs = legs.map((l) => {
                    const p = priceLeg(
                        {
                            level,
                            distanceKm: l.distanceKm,
                            date: l.date,
                            time: l.time,
                            passengers: req.passengers,
                            luggage: req.luggage,
                        },
                        config
                    );
                    return {
                        lines: p.lines,
                        total: p.total,
                        hourMultiplier: p.hourMultiplier,
                        dayMultiplier: p.dayMultiplier,
                        minFareApplied: p.minFareApplied,
                    };
                });
                return [level, { level, legs: tierLegs, total: tierLegs.reduce((s, l) => s + l.total, 0) }];
            })
        ) as Record<Level, Tier>;
    }

    const notices: Notice[] = ["estimate_not_binding", "tolls_not_included", "waiting_policy"];
    if (flags.shortNotice) notices.push("short_notice");

    const reasonOrder: SpecialQuoteReason[] = ["out_of_zone", "too_far", "capacity", "no_route"];
    return {
        ok: true,
        ref: estimateRef(req),
        currency: "MXN",
        taxIncluded: true,
        configVersion: config.version,
        legs,
        flags,
        specialQuote: { required: special, reasons: reasonOrder.filter((r) => reasons.has(r)) },
        tiers,
        attribution: legs.some((l) => l.distanceSource === "google") ? "google_maps" : null,
        notices,
    };
}
