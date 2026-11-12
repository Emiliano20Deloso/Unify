// Fecha y hora "de pared" en la zona del servicio (CDMX).
// El cliente manda date "YYYY-MM-DD" y time "HH:mm" como hora local de CDMX. Los multiplicadores
// se calculan directo de esos campos; la única conversión pared → instante usa Intl con la zona
// de la config (sin offset fijo, sin librerías), así que el resultado no depende del TZ del proceso.

export const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
export const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type WallTime = { date: string; time: string };

export function isValidDate(date: string): boolean {
    const m = DATE_RE.exec(date);
    if (!m) return false;
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (mo < 1 || mo > 12 || d < 1) return false;
    const check = new Date(Date.UTC(y, mo - 1, d));
    return check.getUTCFullYear() === y && check.getUTCMonth() === mo - 1 && check.getUTCDate() === d;
}

export function isValidTime(time: string): boolean {
    return TIME_RE.test(time);
}

/** 0 = domingo … 6 = sábado, calculado sobre la fecha de pared (independiente del TZ del proceso). */
export function weekdayOf(date: string): number {
    const m = DATE_RE.exec(date);
    if (!m) throw new Error(`Fecha inválida: ${date}`);
    return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay();
}

export function minuteOfDay(time: string): number {
    const m = TIME_RE.exec(time);
    if (!m) throw new Error(`Hora inválida: ${time}`);
    return Number(m[1]) * 60 + Number(m[2]);
}

const formatters = new Map<string, Intl.DateTimeFormat>();
function formatterFor(timeZone: string): Intl.DateTimeFormat {
    let f = formatters.get(timeZone);
    if (!f) {
        f = new Intl.DateTimeFormat("en-US", {
            timeZone,
            hourCycle: "h23",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
        formatters.set(timeZone, f);
    }
    return f;
}

function wallParts(instant: Date, timeZone: string) {
    const parts = Object.fromEntries(
        formatterFor(timeZone)
            .formatToParts(instant)
            .map((p) => [p.type, p.value])
    );
    return {
        year: Number(parts.year),
        month: Number(parts.month),
        day: Number(parts.day),
        hour: Number(parts.hour) % 24,
        minute: Number(parts.minute),
        second: Number(parts.second),
    };
}

/** Offset (ms) de la zona en ese instante: hora de pared − UTC. */
function zoneOffsetMs(instant: Date, timeZone: string): number {
    const p = wallParts(instant, timeZone);
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** Instante → fecha y hora de pared en la zona dada. */
export function instantToWall(instant: Date, timeZone: string): WallTime {
    const p = wallParts(instant, timeZone);
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
        date: `${p.year}-${pad(p.month)}-${pad(p.day)}`,
        time: `${pad(p.hour)}:${pad(p.minute)}`,
    };
}

/** Hora de pared en la zona dada → instante UTC. */
export function wallToInstant(date: string, time: string, timeZone: string): Date {
    const d = DATE_RE.exec(date);
    const t = TIME_RE.exec(time);
    if (!d || !t) throw new Error(`Fecha/hora inválida: ${date} ${time}`);
    const naive = Date.UTC(Number(d[1]), Number(d[2]) - 1, Number(d[3]), Number(t[1]), Number(t[2]));
    // Dos pasadas para resolver correctamente cerca de un cambio de horario.
    let guess = naive - zoneOffsetMs(new Date(naive), timeZone);
    const second = naive - zoneOffsetMs(new Date(guess), timeZone);
    if (second !== guess) guess = second;
    return new Date(guess);
}

/** Fecha de hoy ("YYYY-MM-DD") en la zona dada; sirve de mínimo para el selector de fecha. */
export function todayInTz(timeZone: string, now: Date = new Date()): string {
    return instantToWall(now, timeZone).date;
}

/** Suma días a una fecha de pared. */
export function addDays(date: string, days: number): string {
    const m = DATE_RE.exec(date);
    if (!m) throw new Error(`Fecha inválida: ${date}`);
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days));
    return d.toISOString().slice(0, 10);
}
