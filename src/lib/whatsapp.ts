// Enlaces de WhatsApp. Seguro para cliente y servidor (sin "server-only").
import type { EstimateRequest, EstimateResponse } from "./estimate/schema";
import type { Level } from "./pricing/config";
import { formatMXN } from "./pricing/format";

/** Único lugar del número (código de país + número, sin espacios ni "+"). */
export const WHATSAPP_NUMBER = "525951076664";
export const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

type Lang = "es" | "en";

const LEVEL_NAMES: Record<Level, Record<Lang, string>> = {
    practico: { es: "Práctico", en: "Práctico" },
    select: { es: "Select", en: "Select" },
    premium: { es: "Premium", en: "Premium" },
};

function waUrl(text: string): string {
    return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(text)}`;
}

function formatDate(date: string, time: string, lang: Lang): string {
    const [y, m, d] = date.split("-").map(Number);
    // Fecha de pared: se formatea en UTC para no depender de la zona del navegador.
    const label = new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(Date.UTC(y!, m! - 1, d!)));
    return `${label}, ${time} h`;
}

export function buildWhatsAppUrl(args: {
    request: EstimateRequest;
    estimate: EstimateResponse;
    level: Level;
    lang: Lang;
    flightNumber?: string | null;
}): string {
    const { request, estimate, level, lang } = args;
    const es = lang === "es";
    const tier = estimate.tiers?.[level];
    const flight = args.flightNumber?.trim();
    const lines: string[] = [];

    lines.push(es ? "Hola, Unify. Quiero reservar este traslado:" : "Hi Unify, I'd like to book this ride:");
    lines.push("");
    lines.push(`${es ? "Ruta" : "Route"}: ${request.origin.label} → ${request.destination.label}`);
    lines.push(`${es ? "Fecha y hora" : "Date and time"}: ${formatDate(request.date, request.time, lang)}`);
    if (request.returnTrip) {
        lines.push(
            `${es ? "Regreso" : "Return"}: ${formatDate(request.returnTrip.date, request.returnTrip.time, lang)} (${
                es ? "ida y vuelta" : "round trip"
            })`
        );
    }
    lines.push(`${es ? "Nivel" : "Service level"}: ${LEVEL_NAMES[level][lang]}`);
    lines.push(`${es ? "Pasajeros" : "Passengers"}: ${request.passengers}`);
    lines.push(`${es ? "Maletas" : "Luggage"}: ${request.luggage}`);
    if (flight) lines.push(`${es ? "Vuelo" : "Flight"}: ${flight}`);
    if (tier) {
        lines.push(
            `${es ? "Tarifa estimada" : "Estimated fare"}: ${formatMXN(tier.total)} MXN (${
                es ? "IVA incluido" : "VAT included"
            })`
        );
    }
    lines.push(`${es ? "Referencia" : "Reference"}: ${estimate.ref}`);
    lines.push("");
    lines.push(
        es
            ? "Entiendo que es una estimación sujeta a confirmación de disponibilidad y tarifa final."
            : "I understand this is an estimate, subject to confirmation of availability and final fare."
    );
    return waUrl(lines.join("\n"));
}

export type SpecialQuoteKind = "hourly" | "event" | "out_of_zone" | "capacity" | "general";

const SPECIAL_TEXT: Record<SpecialQuoteKind, Record<Lang, string>> = {
    hourly: {
        es: "Hola, Unify. Quiero cotizar un servicio por horas con chofer.",
        en: "Hi Unify, I'd like a quote for an hourly chauffeur service.",
    },
    event: {
        es: "Hola, Unify. Quiero cotizar transporte para un evento.",
        en: "Hi Unify, I'd like a quote for event transportation.",
    },
    out_of_zone: {
        es: "Hola, Unify. Quiero cotizar un traslado fuera de la zona de servicio.",
        en: "Hi Unify, I'd like a quote for a ride outside the service area.",
    },
    capacity: {
        es: "Hola, Unify. Quiero cotizar un traslado para un grupo o con más equipaje del habitual.",
        en: "Hi Unify, I'd like a quote for a group or for extra luggage.",
    },
    general: {
        es: "Hola, Unify. Quiero una cotización personalizada.",
        en: "Hi Unify, I'd like a custom quote.",
    },
};

export function buildSpecialQuoteUrl(args: { kind: SpecialQuoteKind; context?: string | null; lang: Lang }): string {
    const ctx = args.context?.trim();
    const text = ctx ? `${SPECIAL_TEXT[args.kind][args.lang]}\n\n${ctx}` : SPECIAL_TEXT[args.kind][args.lang];
    return waUrl(text);
}
