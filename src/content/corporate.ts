// Empresas. Fuente: textos del sitio anterior (corpCta), sin "Disponibilidad prioritaria 24/7"
// (la atención es de lunes a sábado, 8:00 a 22:00, según los términos).
import type { Locale } from "@/i18n/config";

const copy = {
    es: {
        title: "Movilidad ejecutiva para tu empresa",
        text: "Traslados corporativos con facturación centralizada, reportes de uso y atención dedicada. Para equipos que exigen puntualidad y discreción.",
        points: [
            "Facturación centralizada y reportes mensuales",
            "Cuenta corporativa con crédito prepagado",
            "Conductor asignado para tu empresa",
        ],
        cta: "Cotizar plan corporativo",
        note: "Atención de lunes a sábado, de 8:00 a 22:00.",
        whatsappContext: "Me interesa una cuenta corporativa para mi empresa.",
        imageAlt: "Tesla negro bajo una estructura arquitectónica blanca, reflejado en el piso",
    },
    en: {
        title: "Executive mobility for your company",
        text: "Corporate transfers with centralized billing, usage reports and dedicated support. For teams that demand punctuality and discretion.",
        points: [
            "Centralized billing and monthly reports",
            "Corporate account with prepaid credit",
            "Assigned driver for your company",
        ],
        cta: "Quote a corporate plan",
        note: "Support Monday to Saturday, 8:00 a.m. to 10:00 p.m.",
        whatsappContext: "I'm interested in a corporate account for my company.",
        imageAlt: "Black Tesla under a white architectural structure, reflected on the floor",
    },
} satisfies Record<Locale, unknown>;

export const corporateCopy: Record<Locale, (typeof copy)["es"]> = copy;
