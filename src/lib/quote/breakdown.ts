// Líneas del desglose ("Así se calcula") con sus etiquetas. Pura y segura para cliente.
import type { QuoteDictionary } from "../../i18n/dictionaries/es/quote";
import type { EstimateFlags, TierLeg } from "../estimate/schema";
import { formatMXN } from "../pricing/format";
import { fill, formatKm, formatMultiplier } from "./format";

export type BreakdownRow = {
    key: string;
    label: string;
    /** Pesos; null cuando la fila es solo informativa (p. ej. "Horario normal · sin recargo"). */
    amount: number | null;
    note?: string;
};

type Labels = QuoteDictionary["lines"];

/**
 * Convierte las líneas del motor en filas legibles. Σ amount === leg.total (las filas informativas
 * no suman). Si no hay recargo de hora ni de día, añade "Horario normal · sin recargo".
 */
export function breakdownRows(
    leg: TierLeg,
    ctx: { distanceKm: number; flags: Pick<EstimateFlags, "peak" | "night" | "weekend" | "holiday"> },
    labels: Labels
): BreakdownRow[] {
    const km = formatKm(ctx.distanceKm);
    const rows: BreakdownRow[] = [];

    for (const line of leg.lines) {
        switch (line.key) {
            case "base":
                rows.push({ key: "base", label: labels.base, amount: line.amount });
                break;
            case "distance": {
                // La tarifa por km no viaja en la respuesta: se deduce y solo se muestra si cuadra.
                const rate = ctx.distanceKm > 0 ? Math.round(line.amount / ctx.distanceKm) : 0;
                const exact = rate > 0 && Math.abs(rate * ctx.distanceKm - line.amount) <= 1;
                rows.push({
                    key: "distance",
                    label: exact ? fill(labels.distanceRate, { km: String(Math.round(ctx.distanceKm * 10) / 10), rate: formatMXN(rate) }) : fill(labels.distance, { km }),
                    amount: line.amount,
                });
                break;
            }
            case "minFareAdjustment":
                rows.push({ key: "minFareAdjustment", label: labels.minFareAdjustment, amount: line.amount });
                break;
            case "hourSurcharge": {
                const tpl = ctx.flags.night ? labels.night : labels.peak;
                rows.push({ key: "hourSurcharge", label: fill(tpl, { mult: formatMultiplier(leg.hourMultiplier) }), amount: line.amount });
                break;
            }
            case "daySurcharge": {
                const tpl = ctx.flags.holiday ? labels.holiday : labels.weekend;
                rows.push({ key: "daySurcharge", label: fill(tpl, { mult: formatMultiplier(leg.dayMultiplier) }), amount: line.amount });
                break;
            }
            case "passengerExtra":
                rows.push({ key: "passengerExtra", label: labels.passengerExtra, amount: line.amount });
                break;
            case "luggageExtra":
                rows.push({ key: "luggageExtra", label: labels.luggageExtra, amount: line.amount });
                break;
        }
    }

    if (leg.hourMultiplier === 1 && leg.dayMultiplier === 1) {
        const at = rows.findIndex((r) => r.key === "passengerExtra" || r.key === "luggageExtra");
        const info: BreakdownRow = { key: "normalHours", label: labels.normalHours, amount: null, note: labels.noSurcharge };
        if (at === -1) rows.push(info);
        else rows.splice(at, 0, info);
    }
    return rows;
}
