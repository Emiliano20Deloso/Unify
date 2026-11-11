import { describe, expect, it } from "vitest";
import {
    buildQuoteParams,
    defaultDraft,
    draftIssues,
    involvesAirport,
    parseQuoteParams,
    sanitizeDraft,
    sanitizePlace,
} from "@/lib/quote/draft";
import { draftToRequest, requestKey } from "@/lib/quote/api";

// 12-nov-2026 15:00 UTC = 09:00 en CDMX (jueves).
const NOW = new Date("2026-11-12T15:00:00Z");

const polanco = { id: "cat:polanco", label: "Polanco", lat: 19.4295, lng: -99.1971, kind: "zone" as const };
const aicm = { id: "cat:aicm-t1", label: "AICM Terminal 1", lat: 19.4352, lng: -99.0827, kind: "airport" as const };

describe("defaultDraft", () => {
    it("propone mañana a las 10:00 en CDMX, Select, 1 pasajero", () => {
        const d = defaultDraft(NOW);
        expect(d.date).toBe("2026-11-13");
        expect(d.time).toBe("10:00");
        expect(d.level).toBe("select");
        expect(d.passengers).toBe(1);
        expect(d.luggage).toBe(0);
    });

    it("usa el día de CDMX aunque en UTC ya sea mañana", () => {
        // 13-nov 03:00 UTC = 12-nov 21:00 en CDMX → mañana es el 13.
        expect(defaultDraft(new Date("2026-11-13T03:00:00Z")).date).toBe("2026-11-13");
    });
});

describe("sanitizePlace", () => {
    it("acepta un lugar válido y normaliza el tipo desconocido", () => {
        expect(sanitizePlace(polanco)).toEqual(polanco);
        expect(sanitizePlace({ ...polanco, kind: "castle" })?.kind).toBe("address");
    });

    it("rechaza coordenadas fuera de México, tipos erróneos y etiquetas vacías", () => {
        expect(sanitizePlace({ ...polanco, lat: 40.7, lng: -74 })).toBeNull();
        expect(sanitizePlace({ ...polanco, lat: "19.4" })).toBeNull();
        expect(sanitizePlace({ ...polanco, lat: Number.NaN })).toBeNull();
        expect(sanitizePlace({ ...polanco, label: "   " })).toBeNull();
        expect(sanitizePlace({ ...polanco, id: "" })).toBeNull();
        expect(sanitizePlace("cat:polanco")).toBeNull();
        expect(sanitizePlace(null)).toBeNull();
    });
});

describe("sanitizeDraft", () => {
    it("devuelve el borrador por defecto con basura", () => {
        expect(sanitizeDraft("x", NOW)).toEqual(defaultDraft(NOW));
        expect(sanitizeDraft(null, NOW)).toEqual(defaultDraft(NOW));
        expect(sanitizeDraft([1, 2], NOW).date).toBe("2026-11-13");
    });

    it("conserva lo válido y corrige campo por campo", () => {
        const d = sanitizeDraft(
            {
                origin: polanco,
                destination: { ...aicm, lat: 999 },
                date: "2026-11-10", // en el pasado
                time: "25:00",
                passengers: 3,
                luggage: 99,
                level: "premium",
                flight: "<script>",
            },
            NOW
        );
        expect(d.origin).toEqual(polanco);
        expect(d.destination).toBeNull();
        expect(d.date).toBe("2026-11-13");
        expect(d.time).toBe("10:00");
        expect(d.passengers).toBe(3);
        expect(d.luggage).toBe(0);
        expect(d.level).toBe("premium");
        expect(d.flight).toBe("");
    });

    it("ida y vuelta: limpia el regreso si no está activo o si es anterior a la ida", () => {
        expect(sanitizeDraft({ date: "2026-11-20", roundTrip: false, returnDate: "2026-11-21", returnTime: "18:00" }, NOW).returnDate).toBe("");
        const before = sanitizeDraft({ date: "2026-11-20", roundTrip: true, returnDate: "2026-11-19", returnTime: "18:00" }, NOW);
        expect(before.roundTrip).toBe(true);
        expect(before.returnDate).toBe("");
        const ok = sanitizeDraft({ date: "2026-11-20", roundTrip: true, returnDate: "2026-11-22", returnTime: "18:00" }, NOW);
        expect([ok.returnDate, ok.returnTime]).toEqual(["2026-11-22", "18:00"]);
    });
});

describe("parseQuoteParams", () => {
    it("lee el enlace de ruta popular", () => {
        const p = parseQuoteParams("?o=cat:polanco&d=cat:aicm-t1&f=2026-11-20&h=10:30&n=select&p=2&m=1", "es", NOW);
        expect(p.origin).toEqual(polanco);
        expect(p.destination).toMatchObject({ id: "cat:aicm-t1", label: "AICM Terminal 1", kind: "airport" });
        expect(p).toMatchObject({ date: "2026-11-20", time: "10:30", level: "select", passengers: 2, luggage: 1 });
    });

    it("acepta el slug sin prefijo y etiqueta en el idioma pedido", () => {
        expect(parseQuoteParams("d=aicm-t1", "en", NOW).destination?.label).toBe("Mexico City Airport (MEX) Terminal 1");
    });

    it("ignora valores inválidos o maliciosos sin romper los demás", () => {
        const p = parseQuoteParams("o=ChIJxyz&d=cat:nope&f=2026-02-30&h=7:5&n=gold&p=0&m=-1&x=1", "es", NOW);
        expect(p).toEqual({});
        expect(parseQuoteParams("f=2026-11-01", "es", NOW)).toEqual({}); // en el pasado
        expect(parseQuoteParams("p=99", "es", NOW)).toEqual({});
        expect(parseQuoteParams("m=0", "es", NOW)).toEqual({ luggage: 0 });
    });

    it("regreso solo con fecha y hora válidas y no antes de la ida", () => {
        expect(parseQuoteParams("f=2026-11-20&rf=2026-11-22&rh=18:00", "es", NOW)).toMatchObject({
            roundTrip: true,
            returnDate: "2026-11-22",
            returnTime: "18:00",
        });
        expect(parseQuoteParams("f=2026-11-20&rf=2026-11-19&rh=18:00", "es", NOW).roundTrip).toBeUndefined();
        expect(parseQuoteParams("rf=2026-11-22", "es", NOW).roundTrip).toBeUndefined();
    });

    it("ida y vuelta con buildQuoteParams", () => {
        const draft = {
            ...defaultDraft(NOW),
            origin: polanco,
            destination: aicm,
            date: "2026-11-20",
            time: "10:30",
            passengers: 2,
            luggage: 1,
            roundTrip: true,
            returnDate: "2026-11-21",
            returnTime: "19:00",
        };
        const back = parseQuoteParams(buildQuoteParams(draft), "es", NOW);
        expect(back).toMatchObject({
            origin: polanco,
            destination: { id: "cat:aicm-t1" },
            date: "2026-11-20",
            time: "10:30",
            passengers: 2,
            luggage: 1,
            roundTrip: true,
            returnDate: "2026-11-21",
            returnTime: "19:00",
        });
    });
});

describe("draftIssues", () => {
    const base = { ...defaultDraft(NOW), origin: polanco, destination: aicm };

    it("sin problemas con un borrador completo", () => {
        expect(draftIssues(base, NOW)).toEqual({});
    });

    it("pide elegir lugares, distintos entre sí", () => {
        expect(draftIssues({ ...base, origin: null, destination: null }, NOW)).toMatchObject({
            origin: "chooseOrigin",
            destination: "chooseDestination",
        });
        expect(draftIssues({ ...base, destination: polanco }, NOW).destination).toBe("samePlace");
    });

    it("hoy a una hora que ya pasó en CDMX", () => {
        expect(draftIssues({ ...base, date: "2026-11-12", time: "08:30" }, NOW).time).toBe("pickupPast");
        expect(draftIssues({ ...base, date: "2026-11-12", time: "09:30" }, NOW).time).toBeUndefined();
        expect(draftIssues({ ...base, date: "2026-11-11" }, NOW).date).toBe("date");
    });

    it("el regreso debe ser posterior a la ida", () => {
        const rt = { ...base, roundTrip: true, date: "2026-11-20", time: "10:00", returnDate: "2026-11-20", returnTime: "09:00" };
        expect(draftIssues(rt, NOW).returnTime).toBe("returnAfter");
        expect(draftIssues({ ...rt, returnTime: "18:00" }, NOW)).toEqual({});
        expect(draftIssues({ ...rt, returnDate: "" }, NOW).returnDate).toBe("returnDate");
    });
});

describe("involvesAirport y draftToRequest", () => {
    it("detecta aeropuerto en cualquiera de los extremos", () => {
        expect(involvesAirport({ origin: polanco, destination: aicm })).toBe(true);
        expect(involvesAirport({ origin: aicm, destination: null })).toBe(true);
        expect(involvesAirport({ origin: polanco, destination: null })).toBe(false);
    });

    it("arma la petición del contrato y una clave que ignora nivel y vuelo", () => {
        const draft = { ...defaultDraft(NOW), origin: polanco, destination: aicm };
        const req = draftToRequest(draft, "es")!;
        expect(req).toEqual({
            origin: { label: "Polanco", placeId: "cat:polanco", lat: 19.4295, lng: -99.1971 },
            destination: { label: "AICM Terminal 1", placeId: "cat:aicm-t1", lat: 19.4352, lng: -99.0827 },
            date: "2026-11-13",
            time: "10:00",
            passengers: 1,
            luggage: 0,
            returnTrip: null,
            lang: "es",
        });
        const other = draftToRequest({ ...draft, level: "premium", flight: "AM 123" }, "es")!;
        expect(requestKey(other)).toBe(requestKey(req));
        expect(requestKey(draftToRequest({ ...draft, passengers: 2 }, "es")!)).not.toBe(requestKey(req));
        expect(draftToRequest({ ...draft, origin: null }, "es")).toBeNull();
    });
});
