// Formato de horas, recargos y multiplicadores para la página de Tarifas (servidor).
import { fill } from "@/content";
import type { Locale } from "@/i18n/config";
import type { PricingDictionary } from "@/i18n/types";

type Formula = PricingDictionary["formula"];

/** 7 → "7:00" (es) · "7 a.m." (en). 0 y 24 son medianoche. */
export function formatHour(hour: number, lang: Locale): string {
    const h = ((hour % 24) + 24) % 24;
    if (lang === "es") return `${h}:00`;
    const twelve = h % 12 === 0 ? 12 : h % 12;
    return `${twelve} ${h < 12 ? "a.m." : "p.m."}`;
}

export function formatRange(window: { start: number; end: number }, lang: Locale, t: Formula["clock"]): string {
    return fill(t.range, { start: formatHour(window.start, lang), end: formatHour(window.end, lang) });
}

/** 1.25 → "+25 %". */
export function formatPercent(multiplier: number, t: Formula): string {
    return fill(t.percent, { n: Math.round((multiplier - 1) * 100) });
}

/** 1.25 → "×1.25". */
export function formatMultiplier(multiplier: number, lang: Locale, t: Formula): string {
    const m = new Intl.NumberFormat(lang === "es" ? "es-MX" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        multiplier,
    );
    return fill(t.multiplier, { m });
}

/** Segmentos [inicio, fin) dentro de 0–24 h; una ventana que cruza la medianoche se parte en dos. */
export function windowSegments(window: { start: number; end: number }): { start: number; end: number }[] {
    if (window.start === window.end) return [];
    return window.start < window.end
        ? [{ start: window.start, end: window.end }]
        : [
              { start: window.start, end: 24 },
              { start: 0, end: window.end },
          ].filter((s) => s.end > s.start);
}
