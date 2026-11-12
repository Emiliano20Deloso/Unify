// Formatos de la interfaz del cotizador. Puras y seguras para cliente.
import { formatMXN } from "../pricing/format";

type Lang = "es" | "en";

/** Rellena "{clave}" en una plantilla del diccionario. Las claves que faltan quedan tal cual. */
export function fill(template: string, vars: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** 16.24 → "16"; 4.36 → "4.4" (una decimal solo por debajo de 10 km). */
export function formatKm(km: number): string {
    if (!Number.isFinite(km) || km < 0) return "0";
    return km < 10 ? String(Math.round(km * 10) / 10) : String(Math.round(km));
}

function roundTo5(n: number, dir: "down" | "up"): number {
    return dir === "down" ? Math.max(5, Math.floor(n / 5) * 5) : Math.ceil(n / 5) * 5;
}

function minutesLabel(min: number): string {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/**
 * Duración como rango legible: 38 → "35 a 45 min"; 72 → "1 h 10 min a 1 h 30 min".
 * El rango (−5 % / +20 %, a múltiplos de 5) refleja que el tráfico de la ciudad varía.
 */
export function formatDuration(minutes: number, lang: Lang): string {
    const m = Math.max(1, Math.round(minutes));
    const lo = roundTo5(m * 0.95, "down");
    const hi = Math.max(lo + 5, roundTo5(m * 1.2, "up"));
    const sep = lang === "es" ? " a " : " to ";
    if (hi < 60) return `${lo}${sep}${hi} min`;
    return `${minutesLabel(lo)}${sep}${minutesLabel(hi)}`;
}

/** "2026-11-20" → "vie 20 nov" / "Fri, Nov 20". Fecha de pared: se formatea en UTC. */
export function formatShortDate(date: string, lang: Lang): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!m) return "";
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    if (lang === "en") {
        return new Intl.DateTimeFormat("en-US", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(d);
    }
    // es-MX mete puntos y "de" ("vie., 20 de nov."): se arma por partes como en la maqueta.
    const part = (o: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat("es-MX", { ...o, timeZone: "UTC" }).format(d).replace(/\./g, "");
    return `${part({ weekday: "short" })} ${d.getUTCDate()} ${part({ month: "short" })}`;
}

/** Horas cada 15 minutos ("00:00" … "23:45"); incluye `extra` si no cae en la rejilla. */
export function timeOptions(extra?: string): string[] {
    const out: string[] = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
    if (extra && /^([01]\d|2[0-3]):[0-5]\d$/.test(extra) && !out.includes(extra)) {
        out.push(extra);
        out.sort();
    }
    return out;
}

/** Multiplicador legible: 1.25 → "×1.25"; 1.5 → "×1.5". */
export function formatMultiplier(n: number): string {
    return `×${Number(n.toFixed(2))}`;
}

export { formatMXN };
