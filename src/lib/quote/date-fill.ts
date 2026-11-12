// Fecha del cotizador sin salto al cargar (design/MOVIMIENTO.md §D2). El servidor no conoce el día:
// pinta la celda vacía y un script en línea justo después escribe, antes de la primera pintura, la
// fecha de mañana en CDMX (texto, value y min). Al hidratar, React escribe el mismo texto: cero cambio.
// Las funciones que viajan como texto no pueden usar nada de fuera de su cuerpo (ni imports ni
// constantes del módulo): se convierten con toString(). Su paridad con formatShortDate, todayInTz y
// addDays la comprueba tests/quote-date-fill.test.ts.
import { SERVICE_TZ } from "../geo/mexico";
import { formatShortDate } from "./format";

type Lang = "es" | "en";

interface CellLike {
    querySelector: (selector: string) => unknown;
}

/**
 * Hoy y mañana (YYYY-MM-DD) en `tz` para el instante `now`; si recibe la celda, la rellena:
 * `[data-date-text]` con la fecha formateada, y el `input[type=date]` con value = mañana y min = hoy.
 * Autocontenida (viaja como texto en el script).
 */
export function fillDateCell(cell: CellLike | null, lang: Lang, tz: string, format: (date: string, lang: Lang) => string, now?: number) {
    const parts: Record<string, string> = {};
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
    fmt.formatToParts(new Date(now === undefined ? Date.now() : now)).forEach((p) => {
        parts[p.type] = p.value;
    });
    const today = parts.year + "-" + parts.month + "-" + parts.day;
    const tomorrow = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + 1)).toISOString().slice(0, 10);
    if (cell) {
        const text = cell.querySelector("[data-date-text]") as { textContent: string | null } | null;
        const input = cell.querySelector('input[type="date"]') as { value: string; min: string } | null;
        if (text) text.textContent = format(tomorrow, lang);
        if (input) {
            input.value = tomorrow;
            input.min = today;
        }
    }
    return { today, tomorrow };
}

/** Texto del script que va justo después de la celda (dentro de ella): rellena su celda padre. */
export function dateCellScript(lang: Lang): string {
    return `(function(){try{var s=document.currentScript;(${fillDateCell.toString()})(s&&s.parentElement,${JSON.stringify(lang)},${JSON.stringify(SERVICE_TZ)},${formatShortDate.toString()})}catch(e){}})()`;
}
