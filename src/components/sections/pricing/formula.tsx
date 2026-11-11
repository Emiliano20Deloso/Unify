// "Así se calcula": la fórmula del motor explicada en tres pasos y un ejemplo trabajado.
// Todas las cifras se leen de la config de precios en el servidor; nada viaja al cliente.
import { Reveal } from "@/components/motion";
import { Card, RouteLine, Section, SectionHeader } from "@/components/ui";
import { catalogRouteKm, fill, levels, pricingExample } from "@/content";
import type { Locale } from "@/i18n/config";
import type { PricingDictionary } from "@/i18n/types";
import { cn } from "@/lib";
import { getCatalogPlace } from "@/lib/places/catalog";
import { formatMXN, priceLeg, pricingConfig, routePrice, SERVICE_LEVELS, type Level } from "@/lib/pricing";
import { formatKm } from "@/lib/quote/format";
import { formatHour, formatMultiplier, formatPercent, formatRange, windowSegments } from "./format";

interface FormulaProps {
    lang: Locale;
    t: PricingDictionary["formula"];
    tone?: "bg" | "surface";
    id?: string;
}

export function Formula({ lang, t, tone = "surface", id = "como-se-calcula" }: FormulaProps) {
    const levelNames = Object.fromEntries(levels[lang].map((l) => [l.id, l.name])) as Record<Level, string>;
    const { capacity } = pricingConfig;
    const steps = [
        { key: "fare", ...t.steps.fare, visual: <LevelTable t={t} names={levelNames} /> },
        { key: "time", ...t.steps.time, visual: <TimeOfDay lang={lang} t={t} /> },
        {
            key: "passengers",
            title: t.steps.passengers.title,
            text: fill(t.steps.passengers.text, { max: capacity.max_passengers }),
            visual: <Extras t={t} />,
        },
    ];

    return (
        <Section tone={tone} aria-labelledby={id}>
            <SectionHeader id={id} title={t.title} text={t.text} />
            <ol aria-label={t.stepsLabel} className="border-t border-line">
                {steps.map((step, i) => (
                    <li
                        key={step.key}
                        className="grid gap-8 border-b border-line py-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-12"
                    >
                        <div className="flex gap-5">
                            <span aria-hidden="true" className="type-subheading tabular text-brand-ink">
                                {i + 1}
                            </span>
                            <div className="flex flex-col gap-3">
                                <h3 className="type-subheading">{step.title}</h3>
                                <p className="max-w-[26rem] text-fg-subtle">{step.text}</p>
                            </div>
                        </div>
                        <Reveal>{step.visual}</Reveal>
                    </li>
                ))}
            </ol>
            <Example lang={lang} t={t} names={levelNames} surfaceTone={tone} />
        </Section>
    );
}

/* Paso 1 · base, costo por km y tarifa mínima de cada nivel. */
function LevelTable({ t, names }: { t: PricingDictionary["formula"]; names: Record<Level, string> }) {
    const { base, per_km, min_fare } = pricingConfig;
    const hasMinimum = SERVICE_LEVELS.some((l) => (min_fare?.[l] ?? 0) > 0);
    const rows: { key: string; label: string; values: Record<Level, number | undefined> }[] = [
        { key: "base", label: t.levelTable.base, values: base },
        { key: "perKm", label: t.levelTable.perKm, values: per_km },
        ...(hasMinimum ? [{ key: "minimum", label: t.levelTable.minimum, values: { ...min_fare } as Record<Level, number | undefined> }] : []),
    ];
    return (
        <table className="w-full table-fixed border-collapse text-left">
            <caption className="sr-only">{t.levelTable.caption}</caption>
            <thead>
                <tr className="border-b border-line-strong">
                    <th scope="col" className="w-[34%] pb-4 pr-3 type-small font-medium text-fg-subtle sm:w-[31%]">
                        <span className="sr-only">{t.levelTable.level}</span>
                    </th>
                    {SERVICE_LEVELS.map((level) => (
                        <th key={level} scope="col" className="pb-4 pr-3 font-medium last:pr-0">
                            {names[level]}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.key} className="border-b border-line last:border-b-0">
                        <th scope="row" className="py-4 pr-3 type-small font-medium text-fg-subtle">
                            {row.label}
                        </th>
                        {SERVICE_LEVELS.map((level) => {
                            const value = row.values[level];
                            return (
                                <td key={level} className="tabular py-4 pr-3 text-[1.25rem] font-medium last:pr-0 sm:text-[1.5rem]">
                                    {value === undefined ? "—" : formatMXN(value)}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

/* Paso 2 · el día en una barra de 24 h con sus ventanas, y la semana con el recargo de fin de semana. */
function TimeOfDay({ lang, t }: { lang: Locale; t: PricingDictionary["formula"] }) {
    const { windows, multipliers, holidays_mx } = pricingConfig;
    const c = t.clock;
    const bands = [
        {
            key: "peak",
            label: c.peak,
            range: [windows.peak_morning, windows.peak_evening].map((w) => formatRange(w, lang, c)).join(c.join),
            surcharge: formatPercent(multipliers.peak_hour, t),
            multiplier: formatMultiplier(multipliers.peak_hour, lang, t),
            swatch: "bg-brand-ink/40",
            segments: [...windowSegments(windows.peak_morning), ...windowSegments(windows.peak_evening)],
        },
        {
            key: "night",
            label: c.night,
            range: formatRange(windows.nighttime, lang, c),
            surcharge: formatPercent(multipliers.nighttime, t),
            multiplier: formatMultiplier(multipliers.nighttime, lang, t),
            swatch: "bg-brand-ink/70",
            segments: windowSegments(windows.nighttime),
        },
    ];
    const ticks = [0, 6, 12, 18, 24];

    return (
        <div className="flex flex-col gap-10">
            <figure className="flex flex-col gap-6">
                <figcaption className="sr-only">{c.label}</figcaption>
                <div aria-hidden="true">
                    <div className="relative h-12 overflow-hidden rounded-inner bg-elevated">
                        {bands.flatMap((band) =>
                            band.segments.map((s) => (
                                <span
                                    key={`${band.key}-${s.start}`}
                                    className={cn("absolute inset-y-0", band.swatch)}
                                    style={{ left: `${(s.start / 24) * 100}%`, width: `${((s.end - s.start) / 24) * 100}%` }}
                                />
                            )),
                        )}
                        {ticks.slice(1, -1).map((h) => (
                            <span key={h} className="absolute inset-y-0 w-px bg-bg/60" style={{ left: `${(h / 24) * 100}%` }} />
                        ))}
                    </div>
                    <div className="relative mt-2 h-5 type-label font-normal text-fg-subtle">
                        {ticks.map((h, i) => (
                            <span
                                key={h}
                                className={cn(
                                    "tabular absolute top-0 whitespace-nowrap",
                                    i === 0 ? "left-0" : i === ticks.length - 1 ? "right-0" : "-translate-x-1/2",
                                )}
                                style={i === 0 || i === ticks.length - 1 ? undefined : { left: `${(h / 24) * 100}%` }}
                            >
                                {formatHour(h, lang)}
                            </span>
                        ))}
                    </div>
                </div>
                <ul className="border-t border-line">
                    {bands.map((band) => (
                        <LegendRow key={band.key} swatch={band.swatch} label={band.label} detail={band.range} value={band.surcharge} hint={band.multiplier} />
                    ))}
                    <LegendRow swatch="bg-elevated border border-line-strong" label={c.normal} value={c.noSurcharge} muted />
                </ul>
            </figure>

            <figure className="flex flex-col gap-6">
                <figcaption className="sr-only">{c.weekdaysLabel}</figcaption>
                <div aria-hidden="true" className="grid grid-cols-7 gap-1.5">
                    {c.weekdays.map((day, i) => (
                        <span
                            key={i}
                            className={cn(
                                "grid h-11 place-items-center rounded-inner type-label",
                                i >= 5 ? "border border-brand-ink text-fg" : "bg-elevated text-fg-subtle",
                            )}
                        >
                            {day}
                        </span>
                    ))}
                </div>
                <ul className="border-t border-line">
                    <LegendRow
                        swatch="border border-brand-ink"
                        label={c.weekend}
                        value={formatPercent(multipliers.weekend, t)}
                        hint={formatMultiplier(multipliers.weekend, lang, t)}
                    />
                    {holidays_mx.length > 0 ? (
                        <LegendRow
                            swatch="bg-brand-ink"
                            label={c.holiday}
                            detail={c.holidayNote}
                            value={formatPercent(multipliers.holiday, t)}
                            hint={formatMultiplier(multipliers.holiday, lang, t)}
                        />
                    ) : null}
                </ul>
            </figure>
        </div>
    );
}

function LegendRow({
    swatch,
    label,
    detail,
    value,
    hint,
    muted,
}: {
    swatch: string;
    label: string;
    detail?: string;
    value: string;
    hint?: string;
    muted?: boolean;
}) {
    return (
        <li className="flex items-start gap-4 border-b border-line py-4">
            <span aria-hidden="true" className={cn("mt-1.5 size-3 shrink-0 rounded-[4px]", swatch)} />
            <span className="min-w-0 flex-1">
                <span className="block font-medium">{label}</span>
                {detail ? <span className="type-small mt-0.5 block text-fg-subtle">{detail}</span> : null}
            </span>
            <span className="flex shrink-0 flex-col items-end">
                <span className={cn("tabular font-medium", muted ? "text-fg-subtle" : "text-fg")}>{value}</span>
                {hint ? <span className="type-label tabular font-normal text-fg-subtle">{hint}</span> : null}
            </span>
        </li>
    );
}

/* Paso 3 · cargo por pasajero adicional (y por maleta, solo si la capacidad permite llegar a él). */
function Extras({ t }: { t: PricingDictionary["formula"] }) {
    const { extras, capacity } = pricingConfig;
    const seats = Array.from({ length: capacity.max_passengers }, (_, i) => i + 1);
    const passengerFee = extras.passenger_fee_amount > 0 && extras.passenger_fee_from <= capacity.max_passengers;
    const luggageFee = extras.luggage_fee_amount > 0 && extras.luggage_fee_from <= capacity.max_luggage;
    if (!passengerFee && !luggageFee) return null;

    return (
        <div className="flex flex-col gap-6">
            {passengerFee ? (
                <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
                    <div aria-hidden="true" className="flex items-center gap-3">
                        {seats.map((n) => (
                            <span
                                key={n}
                                className={cn(
                                    "size-4 rounded-full",
                                    n >= extras.passenger_fee_from ? "border-2 border-brand-ink" : "bg-fg-subtle",
                                )}
                            />
                        ))}
                    </div>
                    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="type-figure">+{formatMXN(extras.passenger_fee_amount)}</span>
                        <span className="text-fg-subtle">
                            {fill(t.passenger.from, { n: extras.passenger_fee_from })}, {t.passenger.each}
                        </span>
                    </p>
                </div>
            ) : null}
            {luggageFee ? (
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-line pt-6">
                    <span className="type-figure">+{formatMXN(extras.luggage_fee_amount)}</span>
                    <span className="text-fg-subtle">
                        {fill(t.luggage.from, { n: extras.luggage_fee_from })}, {t.luggage.each}
                    </span>
                </p>
            ) : null}
        </div>
    );
}

/* Ejemplo trabajado con el motor (ruta de pricingExample), línea por línea, y la variante en hora pico. */
function Example({
    lang,
    t,
    names,
    surfaceTone,
}: {
    lang: Locale;
    t: PricingDictionary["formula"];
    names: Record<Level, string>;
    surfaceTone: "bg" | "surface";
}) {
    const origin = getCatalogPlace(pricingExample.origin);
    const destination = getCatalogPlace(pricingExample.destination);
    if (!origin || !destination) return null;
    const km = catalogRouteKm(origin.slug, destination.slug);
    const e = t.example;
    const level = pricingExample.level;
    const config = { ...pricingConfig, holidays_mx: [] };
    const { windows, per_km } = config;
    const peakHour = Math.floor((windows.peak_morning.start + windows.peak_morning.end) / 2);
    const peakTime = `${String(peakHour).padStart(2, "0")}:00`;
    const leg = priceLeg({ level, distanceKm: km, date: pricingExample.peakDate, time: "12:00", passengers: 1, luggage: 0 }, config);
    const peak = priceLeg({ level, distanceKm: km, date: pricingExample.peakDate, time: peakTime, passengers: 1, luggage: 0 }, config);
    const total = routePrice(level, km);
    const minFare = config.min_fare?.[level] ?? 0;

    const ledger = [
        { key: "base", label: `${e.base} · ${names[level]}`, amount: formatMXN(leg.base) },
        { key: "distance", label: fill(e.distance, { km: (Math.round(km * 10) / 10).toFixed(1), rate: formatMXN(per_km[level]) }), amount: formatMXN(leg.distanceCost) },
        ...(minFare > 0
            ? [
                  {
                      key: "minimum",
                      label: fill(e.minimum, { level: names[level], amount: formatMXN(minFare) }),
                      amount: leg.minFareApplied ? formatMXN(leg.adjusted) : e.minimumNotApplied,
                      soft: !leg.minFareApplied,
                  },
              ]
            : []),
        { key: "hours", label: e.normalHours, amount: formatMultiplier(leg.hourMultiplier * leg.dayMultiplier, lang, t) },
    ];

    return (
        <Reveal className="mt-section-sm">
            <Card as="article" tone={surfaceTone === "surface" ? "elevated" : "surface"} aria-labelledby={`ejemplo-titulo`}>
                {/* Móvil: intro → cálculo → niveles. Escritorio: intro y niveles a la izquierda, cálculo a la derecha. */}
                <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr] lg:gap-x-16">
                    <div className="flex flex-col lg:col-start-1 lg:row-start-1">
                        <h3 id="ejemplo-titulo" className="type-heading">
                            {e.title}
                        </h3>
                        <p className="type-subheading mt-6 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>{origin.name[lang]}</span>
                            <RouteLine label={e.to} className="w-12 sm:w-16" />
                            <span>{destination.name[lang]}</span>
                        </p>
                        <p className="type-small tabular mt-2 text-fg-subtle">
                            {fill(e.km, { km: formatKm(km) })}
                        </p>
                        <p className="mt-6 max-w-[26rem] text-fg-subtle">{fill(e.text, { level: names[level] })}</p>
                    </div>

                    <div className="lg:col-start-1 lg:row-start-2 lg:self-end">
                            <h4 className="font-medium">{e.levelsTitle}</h4>
                            <ul className="mt-3 grid grid-cols-3 gap-3 border-t border-line pt-4">
                                {SERVICE_LEVELS.map((l) => (
                                    <li key={l} className="flex flex-col gap-1">
                                        <span className={cn("type-small", l === level ? "text-fg" : "text-fg-subtle")}>{names[l]}</span>
                                        <span className="tabular text-[1.25rem] font-medium">{formatMXN(routePrice(l, km))}</span>
                                    </li>
                                ))}
                            </ul>
                        <p className="type-label mt-3 font-normal text-fg-subtle">{e.levelsNote}</p>
                    </div>

                    <div className="flex flex-col lg:col-start-2 lg:row-span-2 lg:row-start-1">
                        <dl className="border-t border-line">
                            {ledger.map((row) => (
                                <div key={row.key} className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                                    <dt className="text-fg-subtle">{row.label}</dt>
                                    <dd className={cn("tabular shrink-0 text-right font-medium", "soft" in row && row.soft ? "text-fg-subtle" : "")}>
                                        {row.amount}
                                    </dd>
                                </div>
                            ))}
                            <div className="flex items-baseline justify-between gap-6 pt-6">
                                <dt className="type-subheading">{e.total}</dt>
                                <dd className="type-figure">{formatMXN(total)}</dd>
                            </div>
                        </dl>
                        {/* Título y precio en una fila; la explicación debajo, a todo lo ancho (no parte la línea en móvil). */}
                        <div className="mt-8 rounded-inner border border-line px-5 py-4">
                            <p className="flex items-baseline justify-between gap-6">
                                <span className="font-medium">{fill(e.peakTitle, { time: formatHour(peakHour, lang) })}</span>
                                <span className="tabular shrink-0 text-[1.375rem] font-medium">{formatMXN(peak.total)}</span>
                            </p>
                            <p className="type-small text-fg-subtle">
                                {e.peakText} · <span className="tabular">{formatMultiplier(peak.hourMultiplier, lang, t)}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </Reveal>
    );
}
