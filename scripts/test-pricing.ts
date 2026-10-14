import { calculatePrice } from "../src/lib/pricing";

type Case = {
    name: string;
    input: Parameters<typeof calculatePrice>[0];
    expect: Partial<ReturnType<typeof calculatePrice>>;
};

const cases: Case[] = [
    {
        name: "Practico · 10km · mediodía martes · 2 pax, 1 maleta → base + 10km, sin mults ni extras",
        input: {
            serviceLevel: "practico",
            distanceKm: 10,
            pickupAt: cdmx("2026-10-06T12:00:00"),
            passengers: 2,
            luggage: 1,
        },
        expect: { total: 200, hourMultiplier: 1.0, dayMultiplier: 1.0, extras: 0 },
    },
    {
        name: "Select · 20km · 8am lunes (pico) → pico x1.25",
        input: {
            serviceLevel: "select",
            distanceKm: 20,
            pickupAt: cdmx("2026-10-05T08:00:00"),
            passengers: 2,
            luggage: 1,
        },
        // (200 + 200) * 1.25 = 500
        expect: { total: 500, hourMultiplier: 1.25, dayMultiplier: 1.0 },
    },
    {
        name: "Premium · 15km · 11pm viernes (nocturno) → nocturno x1.35",
        input: {
            serviceLevel: "premium",
            distanceKm: 15,
            pickupAt: cdmx("2026-10-02T23:00:00"),
            passengers: 2,
            luggage: 1,
        },
        // (300 + 150) * 1.35 = 607.5 → 608
        expect: { total: 608, hourMultiplier: 1.35, dayMultiplier: 1.0 },
    },
    {
        name: "Select · 10km · 3pm sábado → finde x1.15",
        input: {
            serviceLevel: "select",
            distanceKm: 10,
            pickupAt: cdmx("2026-10-03T15:00:00"),
            passengers: 2,
            luggage: 1,
        },
        // (200 + 100) * 1.15 = 345
        expect: { total: 345, dayMultiplier: 1.15 },
    },
    {
        name: "Practico · 5km · mediodía · 5 pax + 4 maletas → extras: 2×50 + 2×25 = 150",
        input: {
            serviceLevel: "practico",
            distanceKm: 5,
            pickupAt: cdmx("2026-10-06T12:00:00"),
            passengers: 5,
            luggage: 4,
        },
        // (100 + 50) * 1 * 1 + 150 = 300
        expect: { total: 300, extras: 150 },
    },
    {
        name: "Premium · 30km · 7pm sábado (pico + finde) → 1.25 × 1.15",
        input: {
            serviceLevel: "premium",
            distanceKm: 30,
            pickupAt: cdmx("2026-10-03T19:00:00"),
            passengers: 3,
            luggage: 2,
        },
        // (300 + 300) * 1.25 * 1.15 = 862.5 → 863
        expect: { total: 863, hourMultiplier: 1.25, dayMultiplier: 1.15 },
    },
];

function cdmx(iso: string): Date {
    // ISO sin TZ se interpreta como local; forzamos America/Mexico_City (UTC-6, sin DST desde 2022).
    // Para pickup_at real usaremos ISO con offset; aquí fabricamos la fecha correcta en UTC.
    return new Date(`${iso}-06:00`);
}

let pass = 0, fail = 0;
for (const c of cases) {
    const got = calculatePrice(c.input);
    const errs: string[] = [];
    for (const [k, v] of Object.entries(c.expect)) {
        const actual = (got as Record<string, unknown>)[k];
        if (actual !== v) errs.push(`${k}: esperado ${v}, obtuvo ${actual}`);
    }
    if (errs.length) {
        fail++;
        console.log(`❌ ${c.name}`);
        errs.forEach((e) => console.log(`   · ${e}`));
        console.log(`   breakdown:`, got);
    } else {
        pass++;
        console.log(`✅ ${c.name}  →  $${got.total} ${got.currency}`);
    }
}

console.log(`\n${pass}/${pass + fail} casos OK`);
process.exit(fail ? 1 : 0);
