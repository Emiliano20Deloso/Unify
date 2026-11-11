// Cómo se lee una respuesta de /api/estimate en la interfaz: errores por campo, avisos y
// cotizaciones especiales. Puras y seguras para cliente.
import type { EstimateError, EstimateResponse, SpecialQuoteReason } from "../estimate/schema";
import type { SpecialQuoteKind } from "../whatsapp";
import type { DraftIssue, FieldKey } from "./draft";

export type FieldIssue = DraftIssue | "tooFarAhead" | "invalid";

/** Error 422 de la API → errores por campo del formulario. `null` si no se puede asociar a un campo. */
export function fieldErrorsFromApi(error: EstimateError): Partial<Record<FieldKey, FieldIssue>> | null {
    switch (error.code) {
        case "PICKUP_IN_PAST":
            return { time: "pickupPast" };
        case "TOO_FAR_AHEAD":
            return { date: "tooFarAhead" };
        case "SAME_PLACE":
            return { destination: "samePlace" };
        case "VALIDATION": {
            const out: Partial<Record<FieldKey, FieldIssue>> = {};
            for (const issue of error.issues ?? []) {
                const [head, sub] = issue.path.split(".");
                if (head === "origin" || head === "destination") out[head] = "invalid";
                else if (head === "date" || head === "time") out[head] = "invalid";
                else if (head === "returnTrip") {
                    if (sub === "date") out.returnDate = "returnDate";
                    else out.returnTime = "returnAfter";
                }
            }
            return Object.keys(out).length > 0 ? out : null;
        }
        default:
            return null;
    }
}

export type NoticeKey =
    | "peak"
    | "night"
    | "weekend"
    | "holiday"
    | "shortNotice"
    | "airportWait"
    | "cityWait"
    | "tolls"
    | "estimate";

/** Avisos a mostrar, en orden: recargos, poca anticipación, espera, casetas y estimación. */
export function noticeKeys(estimate: Pick<EstimateResponse, "flags" | "notices">): NoticeKey[] {
    const { flags, notices } = estimate;
    const out: NoticeKey[] = [];
    if (flags.night) out.push("night");
    else if (flags.peak) out.push("peak");
    if (flags.holiday) out.push("holiday");
    else if (flags.weekend) out.push("weekend");
    if (flags.shortNotice || notices.includes("short_notice")) out.push("shortNotice");
    if (notices.includes("waiting_policy")) out.push(flags.airport ? "airportWait" : "cityWait");
    if (notices.includes("tolls_not_included")) out.push("tolls");
    if (notices.includes("estimate_not_binding")) out.push("estimate");
    return out;
}

/** Motivo principal de la cotización especial (el primero, en el orden de la API). */
export function primaryReason(estimate: Pick<EstimateResponse, "specialQuote">): SpecialQuoteReason | null {
    return estimate.specialQuote.required ? (estimate.specialQuote.reasons[0] ?? "no_route") : null;
}

/** Tipo de mensaje de WhatsApp para cada motivo. */
export function specialKind(reason: SpecialQuoteReason): SpecialQuoteKind {
    switch (reason) {
        case "out_of_zone":
        case "too_far":
            return "out_of_zone";
        case "capacity":
            return "capacity";
        default:
            return "general";
    }
}
