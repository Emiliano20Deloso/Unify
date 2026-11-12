import { describe, expect, it } from "vitest";
import { SERVICE_TZ } from "@/lib/geo/mexico";
import { addDays, todayInTz } from "@/lib/pricing/time";
import { dateCellScript, fillDateCell } from "@/lib/quote/date-fill";
import { formatShortDate } from "@/lib/quote/format";

type Lang = "es" | "en";

// Lo que viaja en el script: las mismas funciones convertidas a texto y vueltas a evaluar (si usaran
// algo de fuera de su cuerpo, aquí fallarían).
const scriptFormat = new Function(`return (${formatShortDate.toString()})`)() as (date: string, lang: Lang) => string;
const scriptFill = new Function(`return (${fillDateCell.toString()})`)() as typeof fillDateCell;

/** Todos los días de 2026 y 2027 (incluye cambios de mes, de año y el 29 de febrero de 2028 no). */
function days(): string[] {
    const out: string[] = [];
    for (let t = Date.UTC(2026, 0, 1); t <= Date.UTC(2028, 2, 1); t += 86_400_000) out.push(new Date(t).toISOString().slice(0, 10));
    return out;
}

describe("fecha del cotizador escrita por el script en línea", () => {
    it("el formateador del script da lo mismo que formatShortDate (es y en)", () => {
        for (const lang of ["es", "en"] as const) {
            for (const d of days()) expect(scriptFormat(d, lang)).toBe(formatShortDate(d, lang));
        }
    });

    it("hoy y mañana en CDMX coinciden con todayInTz/addDays (también cerca de medianoche)", () => {
        const instants = [
            Date.UTC(2026, 10, 12, 5, 59), // 23:59 en CDMX del 11
            Date.UTC(2026, 10, 12, 6, 0), // 00:00 en CDMX del 12
            Date.UTC(2026, 11, 31, 18, 0),
            Date.UTC(2027, 1, 28, 23, 30),
            Date.UTC(2028, 1, 29, 12, 0),
        ];
        for (const now of instants) {
            const today = todayInTz(SERVICE_TZ, new Date(now));
            expect(scriptFill(null, "es", SERVICE_TZ, scriptFormat, now)).toEqual({ today, tomorrow: addDays(today, 1) });
        }
    });

    it("el script completo rellena texto, value y min de su celda", () => {
        for (const lang of ["es", "en"] as const) {
            const text = { textContent: " " as string | null };
            const input = { value: "", min: "" };
            const cell = { querySelector: (s: string) => (s === "[data-date-text]" ? text : s.startsWith("input") ? input : null) };
            const document = { currentScript: { parentElement: cell } };
            new Function("document", dateCellScript(lang))(document);
            const today = todayInTz(SERVICE_TZ);
            expect(input.min).toBe(today);
            expect(input.value).toBe(addDays(today, 1));
            expect(text.textContent).toBe(formatShortDate(addDays(today, 1), lang));
        }
    });
});
