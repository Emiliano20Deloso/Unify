// Borrador del cotizador: valores por defecto, validación al leer y parámetros de URL.
// Funciones puras (sin DOM): nada de lo que llega de sessionStorage o de la URL se usa sin validar.
import { catalogId, getCatalogPlace } from "../places/catalog";
import { addDays, instantToWall, isValidDate, isValidTime, todayInTz } from "../pricing/time";
import {
    DEFAULT_LEVEL,
    LEVELS,
    MAX_LUGGAGE,
    MAX_PASSENGERS,
    SERVICE_TZ,
    type Level,
    type PlaceKind,
    type QuoteDraft,
    type QuotePlace,
} from "./types";

type Lang = "es" | "en";

/** Caja aproximada de México (espejo de lib/geo, que arrastra la config de precios). */
const MX = { minLat: 14.3, maxLat: 32.8, minLng: -118.6, maxLng: -86.5 } as const;
const KINDS: readonly PlaceKind[] = ["airport", "zone", "venue", "address"];
const FLIGHT_RE = /^[A-Za-z0-9 -]{0,10}$/;

export const DEFAULT_TIME = "10:00";

/** Mañana a las 10:00 (hora de CDMX). */
export function defaultDraft(now: Date = new Date()): QuoteDraft {
    return {
        origin: null,
        destination: null,
        date: addDays(todayInTz(SERVICE_TZ, now), 1),
        time: DEFAULT_TIME,
        passengers: 1,
        luggage: 0,
        level: DEFAULT_LEVEL,
        roundTrip: false,
        returnDate: "",
        returnTime: "",
        flight: "",
    };
}

/** Borrador vacío y estable para el render del servidor (sin fecha: depende del día). */
export const SERVER_DRAFT: QuoteDraft = Object.freeze({
    origin: null,
    destination: null,
    date: "",
    time: DEFAULT_TIME,
    passengers: 1,
    luggage: 0,
    level: DEFAULT_LEVEL,
    roundTrip: false,
    returnDate: "",
    returnTime: "",
    flight: "",
}) as QuoteDraft;

export function isLevel(v: unknown): v is Level {
    return typeof v === "string" && (LEVELS as readonly string[]).includes(v);
}

function isInt(v: unknown, min: number, max: number): v is number {
    return typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
}

export function sanitizePlace(v: unknown): QuotePlace | null {
    if (!v || typeof v !== "object") return null;
    const p = v as Record<string, unknown>;
    if (typeof p.id !== "string" || p.id.length < 1 || p.id.length > 300) return null;
    if (typeof p.label !== "string") return null;
    const label = p.label.trim();
    if (label.length < 1 || label.length > 200) return null;
    if (typeof p.lat !== "number" || typeof p.lng !== "number") return null;
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return null;
    if (p.lat < MX.minLat || p.lat > MX.maxLat || p.lng < MX.minLng || p.lng > MX.maxLng) return null;
    const kind = KINDS.includes(p.kind as PlaceKind) ? (p.kind as PlaceKind) : "address";
    return { id: p.id, label, lat: p.lat, lng: p.lng, kind };
}

/**
 * Valida un borrador de origen desconocido campo por campo: lo inválido vuelve al valor por defecto
 * y lo demás se conserva. Las fechas en el pasado (en CDMX) se reemplazan.
 */
export function sanitizeDraft(v: unknown, now: Date = new Date()): QuoteDraft {
    const base = defaultDraft(now);
    if (!v || typeof v !== "object") return base;
    const d = v as Record<string, unknown>;
    const today = todayInTz(SERVICE_TZ, now);
    const okDate = (x: unknown): x is string => typeof x === "string" && isValidDate(x) && x >= today;
    const okTime = (x: unknown): x is string => typeof x === "string" && isValidTime(x);

    const date = okDate(d.date) ? d.date : base.date;
    const roundTrip = d.roundTrip === true;
    const returnDate = roundTrip && okDate(d.returnDate) && d.returnDate >= date ? d.returnDate : "";
    const returnTime = roundTrip && okTime(d.returnTime) ? d.returnTime : "";

    return {
        origin: sanitizePlace(d.origin),
        destination: sanitizePlace(d.destination),
        date,
        time: okTime(d.time) ? d.time : base.time,
        passengers: isInt(d.passengers, 1, MAX_PASSENGERS) ? d.passengers : base.passengers,
        luggage: isInt(d.luggage, 0, MAX_LUGGAGE) ? d.luggage : base.luggage,
        level: isLevel(d.level) ? d.level : base.level,
        roundTrip,
        returnDate,
        returnTime,
        flight: typeof d.flight === "string" && FLIGHT_RE.test(d.flight) ? d.flight : "",
    };
}

/** Lugar del catálogo listo para el cotizador ("polanco" o "cat:polanco"). */
export function catalogPlace(idOrSlug: string, lang: Lang): QuotePlace | null {
    const p = getCatalogPlace(idOrSlug);
    if (!p) return null;
    return { id: catalogId(p.slug), label: p.name[lang], lat: p.lat, lng: p.lng, kind: p.kind };
}

/**
 * Parámetros de enlaces compartibles y de rutas populares:
 * `?o=cat:polanco&d=cat:aicm-t1&f=2026-11-20&h=10:30&n=select&p=2&m=1&rf=2026-11-22&rh=18:00`.
 * Solo se aceptan lugares del catálogo (los de Google no traen coordenadas en la URL).
 * Devuelve únicamente los campos presentes y válidos.
 */
export function parseQuoteParams(
    search: string | URLSearchParams,
    lang: Lang,
    now: Date = new Date()
): Partial<QuoteDraft> {
    const q = typeof search === "string" ? new URLSearchParams(search) : search;
    const out: Partial<QuoteDraft> = {};
    const today = todayInTz(SERVICE_TZ, now);

    const o = q.get("o");
    const d = q.get("d");
    if (o) {
        const p = catalogPlace(o, lang);
        if (p) out.origin = p;
    }
    if (d) {
        const p = catalogPlace(d, lang);
        if (p) out.destination = p;
    }
    const f = q.get("f");
    if (f && isValidDate(f) && f >= today) out.date = f;
    const h = q.get("h");
    if (h && isValidTime(h)) out.time = h;
    const n = q.get("n");
    if (isLevel(n)) out.level = n;
    const p = Number(q.get("p") ?? NaN);
    if (isInt(p, 1, MAX_PASSENGERS)) out.passengers = p;
    const m = Number(q.get("m") ?? NaN);
    if (q.get("m") !== null && isInt(m, 0, MAX_LUGGAGE)) out.luggage = m;
    const rf = q.get("rf");
    const rh = q.get("rh");
    if (rf && isValidDate(rf) && rf >= (out.date ?? today) && rh && isValidTime(rh)) {
        out.roundTrip = true;
        out.returnDate = rf;
        out.returnTime = rh;
    }
    return out;
}

/** Inverso de parseQuoteParams (solo con lugares del catálogo). */
export function buildQuoteParams(draft: QuoteDraft): string {
    const q = new URLSearchParams();
    if (draft.origin?.id.startsWith("cat:")) q.set("o", draft.origin.id);
    if (draft.destination?.id.startsWith("cat:")) q.set("d", draft.destination.id);
    if (draft.date) q.set("f", draft.date);
    q.set("h", draft.time);
    q.set("n", draft.level);
    q.set("p", String(draft.passengers));
    q.set("m", String(draft.luggage));
    if (draft.roundTrip && draft.returnDate && draft.returnTime) {
        q.set("rf", draft.returnDate);
        q.set("rh", draft.returnTime);
    }
    return q.toString();
}

/** ¿Algún extremo es aeropuerto? (decide si se pide el número de vuelo). */
export function involvesAirport(draft: Pick<QuoteDraft, "origin" | "destination">): boolean {
    return draft.origin?.kind === "airport" || draft.destination?.kind === "airport";
}

export type FieldKey = "origin" | "destination" | "date" | "time" | "returnDate" | "returnTime";
export type DraftIssue =
    | "chooseOrigin"
    | "chooseDestination"
    | "date"
    | "time"
    | "returnDate"
    | "returnTime"
    | "returnAfter"
    | "pickupPast"
    | "samePlace";

/** Errores de cliente que impiden pedir la estimación (la API vuelve a validar todo). */
export function draftIssues(draft: QuoteDraft, now: Date = new Date()): Partial<Record<FieldKey, DraftIssue>> {
    const issues: Partial<Record<FieldKey, DraftIssue>> = {};
    const today = todayInTz(SERVICE_TZ, now);
    if (!draft.origin) issues.origin = "chooseOrigin";
    if (!draft.destination) issues.destination = "chooseDestination";
    else if (draft.origin && draft.origin.id === draft.destination.id) issues.destination = "samePlace";
    if (!isValidDate(draft.date) || draft.date < today) issues.date = "date";
    if (!isValidTime(draft.time)) issues.time = "time";
    else if (!issues.date && draft.date === today && draft.time <= instantToWall(now, SERVICE_TZ).time) issues.time = "pickupPast";
    if (draft.roundTrip) {
        if (!isValidDate(draft.returnDate) || draft.returnDate < today) issues.returnDate = "returnDate";
        else if (!isValidTime(draft.returnTime)) issues.returnTime = "returnTime";
        else if (`${draft.returnDate}T${draft.returnTime}` <= `${draft.date}T${draft.time}`) issues.returnTime = "returnAfter";
    }
    return issues;
}
