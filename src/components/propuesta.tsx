"use client";

import * as React from "react";

export interface PropuestaInput {
    origin: string;
    destination: string;
    pickupAtIso: string;
    serviceLevel: "practico" | "select" | "premium";
    luggage: number;
    distanceKm: number | null;
    durationMin: number | null;
    pricePreliminary: number | null;
    quoteId: string;
    emittedAt?: Date;
}

interface Props {
    data: PropuestaInput;
    q: Record<string, string>;
    lang: "es" | "en";
    footer?: React.ReactNode;
}

const TIER_LABELS: Record<PropuestaInput["serviceLevel"], { es: string; en: string }> = {
    practico: { es: "Práctico", en: "Essential" },
    select: { es: "Select", en: "Select" },
    premium: { es: "Premium", en: "Premium" },
};

const formatMXN = (amount: number) =>
    new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
    }).format(amount);

const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
};

export function buildReference(quoteId: string, emittedAt: Date = new Date()) {
    return `UF-${emittedAt.getFullYear()}-${quoteId.slice(0, 8).toUpperCase()}`;
}

export function QuotePropuesta({ data, q, lang, footer }: Props) {
    const emittedAt = data.emittedAt ?? new Date();
    const locale = lang === "es" ? "es-MX" : "en-US";
    const reference = buildReference(data.quoteId, emittedAt);

    const emittedLabel = new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(emittedAt);

    const pickupLabel = (() => {
        const dt = new Date(data.pickupAtIso);
        if (Number.isNaN(dt.getTime())) return "—";
        return new Intl.DateTimeFormat(locale, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(dt);
    })();

    const luggageText =
        data.luggage === 0
            ? q.propuestaLuggageNone
            : `${data.luggage} ${data.luggage === 1 ? q.propuestaLuggageUnit : q.propuestaLuggageUnitPlural}`;

    const hasRoute = data.distanceKm != null && data.durationMin != null;
    const routeText = hasRoute
        ? `${data.distanceKm!.toFixed(1)} km · ${formatDuration(data.durationMin!)}`
        : q.propuestaRoutePending;

    const hasPrice = data.pricePreliminary != null;

    const considerations = [
        q.propuestaConsid1,
        q.propuestaConsid2,
        q.propuestaConsid3,
        q.propuestaConsid4,
        q.propuestaConsid5,
    ];

    return (
        <div className="flex flex-col max-h-[92vh]">
            <div className="px-8 pt-7 pb-5 border-b border-white/5 flex items-start justify-between gap-6">
                <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#FF2400]/70 font-medium">
                        {emittedLabel} · {q.propuestaCity}
                    </p>
                    <h3 className="text-lg font-bold text-white mt-2 leading-tight">
                        {q.propuestaTitle}
                    </h3>
                    <p className="text-[11px] text-white/35 mt-1">{q.propuestaStatusPreliminary}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                        {q.propuestaNumberLabel}
                    </p>
                    <p className="text-xs font-bold text-white mt-1 font-mono tracking-wider">
                        {reference}
                    </p>
                </div>
            </div>

            <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6">
                <p className="text-sm text-white/55 leading-relaxed">{q.propuestaIntro}</p>

                <section>
                    <h4 className="text-[10px] uppercase tracking-[0.25em] text-white/35 font-medium mb-3">
                        {q.propuestaDetailsTitle}
                    </h4>
                    <dl className="rounded-2xl border border-white/8 bg-white/[0.02] divide-y divide-white/5">
                        <PropuestaRow label={q.propuestaDate} value={pickupLabel} />
                        <PropuestaRow label={q.propuestaOrigin} value={data.origin || "—"} />
                        <PropuestaRow label={q.propuestaDestination} value={data.destination || "—"} />
                        <PropuestaRow label={q.propuestaService} value={TIER_LABELS[data.serviceLevel][lang]} />
                        <PropuestaRow label={q.propuestaLuggage} value={luggageText} />
                        <PropuestaRow label={q.propuestaRoute} value={routeText} />
                    </dl>
                </section>

                <section>
                    <h4 className="text-[10px] uppercase tracking-[0.25em] text-white/35 font-medium mb-3">
                        {hasPrice ? q.propuestaCostTitle : q.propuestaCostPendingTitle}
                    </h4>
                    {hasPrice ? (
                        <div className="rounded-2xl border border-[#FF2400]/25 bg-[#FF2400]/[0.06] px-7 py-6 text-center">
                            <p className="text-4xl font-bold text-white tracking-tight">
                                {formatMXN(data.pricePreliminary!)}
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.25em] text-[#FF2400]/70 font-medium mt-2">
                                MXN
                            </p>
                            <p className="text-[11px] text-white/40 mt-4 leading-relaxed max-w-md mx-auto">
                                {q.propuestaCostFootnote}
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-7 py-6">
                            <p className="text-sm text-white/70 leading-relaxed">
                                {q.propuestaCostPendingDesc}
                            </p>
                        </div>
                    )}
                </section>

                <section>
                    <h4 className="text-[10px] uppercase tracking-[0.25em] text-white/35 font-medium mb-3">
                        {q.propuestaConsidTitle}
                    </h4>
                    <ul className="space-y-2 text-[13px] text-white/55 leading-relaxed">
                        {considerations.map((c, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="text-[#FF2400]/60 shrink-0 mt-0.5">•</span>
                                <span>{c}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <div className="pt-2 text-center">
                    <p className="text-sm text-white/55 italic">{q.propuestaClosing}</p>
                    <p className="text-xs text-white/35 mt-3 tracking-wide uppercase">
                        {q.propuestaBrand}
                    </p>
                </div>
            </div>

            {footer && (
                <div className="px-8 pb-7 pt-5 border-t border-white/5 shrink-0">
                    {footer}
                </div>
            )}
        </div>
    );
}

function PropuestaRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-6 px-5 py-3.5">
            <dt className="text-[11px] uppercase tracking-wider text-white/35 shrink-0 pt-0.5">
                {label}
            </dt>
            <dd className="text-sm text-white/85 text-right break-words min-w-0">{value}</dd>
        </div>
    );
}
