// Datos reales del negocio (fuente: terminos-condiciones.md). No inventar: si falta un dato, no se agrega.
import { WHATSAPP_BASE_URL, WHATSAPP_NUMBER } from "@/lib/whatsapp";

function resolveSiteUrl(): string {
    const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (raw) {
        try {
            return new URL(raw).origin;
        } catch {
            /* valor inválido: se usa el dominio de producción */
        }
    }
    return "https://unifyluxury.com";
}

export const site = {
    name: "Unify",
    url: resolveSiteUrl(),
    email: "unifymx@outlook.com",
    whatsapp: {
        number: WHATSAPP_NUMBER,
        /** E.164, para JSON-LD y enlaces tel: */
        phone: `+${WHATSAPP_NUMBER}`,
        /** Como aparece en los T&C */
        display: "+52 595 107 6664",
        url: WHATSAPP_BASE_URL,
    },
    /** Horario de atención: lunes a sábado, 8:00 a 22:00 (hora de la Ciudad de México). */
    hours: {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:00",
        closes: "22:00",
    },
    areaServed: "Ciudad de México y área metropolitana",
} as const;

/** URL absoluta a partir de una ruta interna ("/x"). */
export function absoluteUrl(path: string): string {
    return path === "/" ? site.url : `${site.url}${path}`;
}
