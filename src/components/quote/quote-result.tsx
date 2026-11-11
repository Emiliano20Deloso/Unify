"use client";

// Tarjeta de resultado (maqueta: "Resultado de la cotización"). Mantiene su estructura en todos los
// estados —vacío, cargando, precio, especial, error— para que llegar el precio no mueva la página.
import { useEffect, useRef, useState } from "react";
import { RotateCw } from "lucide-react";
import { Button, Price, RouteLine, Segmented, WhatsAppIcon } from "@/components/ui";
import type { Dictionary, Locale } from "@/i18n/types";
import { cn } from "@/lib";
import type { EstimateRequest, EstimateResponse } from "@/lib/estimate/schema";
import { formatMXN } from "@/lib/pricing/format";
import { breakdownRows } from "@/lib/quote/breakdown";
import { fill, formatDuration, formatKm, formatShortDate } from "@/lib/quote/format";
import { noticeKeys, primaryReason, specialKind } from "@/lib/quote/outcome";
import { updateDraft } from "@/lib/quote/store";
import { LEVELS, type Level, type QuoteDraft } from "@/lib/quote/types";
import { buildSpecialQuoteUrl, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { EstimateState } from "./hooks";

type Dict = Dictionary<"quote">;

interface Props {
    lang: Locale;
    dict: Dict;
    draft: QuoteDraft;
    fromPrices: Record<Level, number>;
    estimate: EstimateState;
    hasFieldErrors: boolean;
}

type View =
    | { kind: "empty" }
    | { kind: "fix" }
    | { kind: "skeleton" }
    | { kind: "price"; data: EstimateResponse; request: EstimateRequest; stale: boolean }
    | { kind: "special"; data: EstimateResponse }
    | { kind: "error"; reason: "rate_limited" | "network" | "error" };

function viewFor(draft: QuoteDraft, estimate: EstimateState, hasFieldErrors: boolean): View {
    if (!draft.origin || !draft.destination) return { kind: "empty" };
    if (hasFieldErrors) return { kind: "fix" };
    const r = estimate.result;
    if (!r) {
        if (!estimate.loading) return { kind: "empty" };
        const last = estimate.lastOk;
        return last && last.data.tiers ? { kind: "price", data: last.data, request: last.request, stale: true } : { kind: "skeleton" };
    }
    switch (r.kind) {
        case "ok":
            if (r.data.specialQuote.required || !r.data.tiers) return { kind: "special", data: r.data };
            return { kind: "price", data: r.data, request: estimate.request!, stale: false };
        case "invalid":
            return { kind: "error", reason: "error" };
        default:
            return { kind: "error", reason: r.kind };
    }
}

export function QuoteResult({ lang, dict, draft, fromPrices, estimate, hasFieldErrors }: Props) {
    const t = dict.result;
    const view = viewFor(draft, estimate, hasFieldErrors);
    const level = draft.level;
    const data = view.kind === "price" ? view.data : null;
    const tiers = data?.tiers ?? null;
    const leg = view.kind === "price" || view.kind === "special" ? view.data.legs[0] : undefined;
    const routeLabel = draft.origin && draft.destination ? `${draft.origin.label} ${t.routeTo} ${draft.destination.label}` : "";

    const waUrl =
        view.kind === "price" && !view.stale
            ? buildWhatsAppUrl({ request: view.request, estimate: view.data, level, lang, flightNumber: draft.flight })
            : null;

    // Barra fija inferior (móvil): visible cuando hay precio, el cotizador está en pantalla y el
    // botón propio de la tarjeta no.
    const ctaRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLElement>(null);
    const [ctaVisible, setCtaVisible] = useState(true);
    const [cardVisible, setCardVisible] = useState(false);
    useEffect(() => {
        const cta = ctaRef.current;
        const card = cardRef.current;
        if (!cta || !card) return;
        const io = new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (e.target === cta) setCtaVisible(e.isIntersecting);
                if (e.target === card) setCardVisible(e.isIntersecting);
            }
        });
        io.observe(cta);
        io.observe(card);
        return () => io.disconnect();
    }, []);
    const showBar = !!waUrl && !!tiers && cardVisible && !ctaVisible;

    const announce =
        view.kind === "price" && !view.stale && tiers
            ? fill(t.announce, {
                  route: routeLabel,
                  level: dict.levels[level],
                  price: formatMXN(tiers[level].total),
                  practico: formatMXN(tiers.practico.total),
                  select: formatMXN(tiers.select.total),
                  premium: formatMXN(tiers.premium.total),
              })
            : view.kind === "special"
              ? dict.special[primaryReason(view.data) ?? "no_route"].title
              : view.kind === "error"
                ? errorText(dict, view.reason)
                : "";

    const loading = view.kind === "skeleton" || (view.kind === "price" && view.stale);

    return (
        <article
            ref={cardRef}
            aria-labelledby="quote-result-title"
            aria-busy={loading}
            className="flex min-w-0 flex-col rounded-card border border-line bg-surface p-5 md:px-9 md:py-8 lg:min-h-[40rem]"
        >
            <p className="sr-only" role="status" aria-live="polite">
                {announce}
            </p>

            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
                <h2 id="quote-result-title" className="type-subheading min-w-0">
                    {draft.origin && draft.destination ? (
                        <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="min-w-0">{draft.origin.label}</span>
                            <RouteLine key={estimate.key ?? "none"} draw label={t.routeTo} className="w-14 shrink-0" />
                            <span className="min-w-0">{draft.destination.label}</span>
                        </span>
                    ) : (
                        t.emptyTitle
                    )}
                </h2>
                <div className="type-small min-h-[1.6em] shrink-0 font-medium text-fg-subtle tabular md:mb-[3px] md:text-right">
                    {leg ? (
                        <p className="whitespace-nowrap">
                            {fill(t.distance, { km: formatKm(leg.distanceKm) })} · {formatDuration(leg.durationMin, lang)}
                        </p>
                    ) : loading ? (
                        <Bar className="h-4 w-36" />
                    ) : null}
                </div>
            </div>
            <p className="type-label mt-2 min-h-[1.4em] font-normal text-fg-subtle md:text-right">
                {leg ? (leg.distanceSource === "google" ? dict.places.attribution : t.approx) : view.kind === "empty" ? t.emptyText : null}
            </p>

            {view.kind === "special" ? (
                <SpecialPanel lang={lang} dict={dict} draft={draft} data={view.data} />
            ) : view.kind === "error" ? (
                <ErrorPanel text={errorText(dict, view.reason)} retry={dict.errors.retry} onRetry={estimate.retry} />
            ) : (
                <>
                    <Segmented
                        name="quote-level"
                        legend={t.levelLegend}
                        value={level}
                        onValueChange={(l) => updateDraft({ level: l })}
                        selectedLabel={t.selected}
                        className="mt-6 md:mt-8"
                        options={LEVELS.map((l) => ({
                            value: l,
                            label: dict.levels[l],
                            detail: tiers ? (
                                <Price value={tiers[l].total} />
                            ) : loading ? (
                                <Bar className="mt-1 h-6 w-16" />
                            ) : (
                                <span className="flex flex-wrap items-baseline gap-x-1.5">
                                    <span className="type-label font-normal text-fg-subtle">{t.from}</span>
                                    <Price value={fromPrices[l]} />
                                </span>
                            ),
                        }))}
                    />

                    <div className="mt-6 min-h-[13.5rem] rounded-control bg-elevated px-5 py-1 md:mt-7">
                        {data && tiers ? (
                            <Breakdown lang={lang} dict={dict} data={data} level={level} />
                        ) : (
                            <div className="flex min-h-[13rem] flex-col justify-center gap-3 py-4">
                                {view.kind === "fix" ? (
                                    <p className="type-small text-fg-subtle">{t.fixFields}</p>
                                ) : loading ? (
                                    <>
                                        <span className="sr-only">{t.loading}</span>
                                        <Bar className="h-4 w-2/3" />
                                        <Bar className="h-4 w-1/2" />
                                        <Bar className="h-4 w-3/5" />
                                        <Bar className="mt-3 h-7 w-1/3 self-end" />
                                    </>
                                ) : (
                                    <p className="type-small text-fg-subtle">{t.emptyText}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {data && tiers ? <Notices dict={dict} data={data} /> : null}
                </>
            )}

            <div ref={ctaRef} className="mt-auto flex flex-col gap-3 pt-8">
                {view.kind === "special" ? null : waUrl ? (
                    <Button asChild size="lg" className="w-full">
                        <a href={waUrl} target="_blank" rel="noopener noreferrer">
                            <WhatsAppIcon />
                            {dict.cta.book}
                            <span className="sr-only"> {dict.cta.newTab}</span>
                        </a>
                    </Button>
                ) : (
                    <Button size="lg" className="w-full" disabled>
                        <WhatsAppIcon />
                        {dict.cta.book}
                    </Button>
                )}
                <p className="type-label text-center font-normal text-fg-subtle">{dict.cta.hours}</p>
                <Button asChild variant="link" size="sm" className="max-w-full self-center whitespace-normal text-center text-[0.9375rem]">
                    <a href={buildSpecialQuoteUrl({ kind: "general", lang })} target="_blank" rel="noopener noreferrer">
                        {dict.cta.custom}
                        <span className="sr-only"> {dict.cta.newTab}</span>
                    </a>
                </Button>
            </div>

            {showBar && tiers && waUrl ? (
                <div data-site-chrome className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-bg px-gutter pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 duration-base animate-in fade-in-0 slide-in-from-bottom-2 lg:hidden">
                    <p className="flex min-w-0 flex-col">
                        <span className="type-label font-normal text-fg-subtle">{fill(dict.mobileBar.label, { level: dict.levels[level] })}</span>
                        <Price value={tiers[level].total} currency className="text-xl font-medium" />
                    </p>
                    <Button asChild size="md" className="px-5">
                        <a href={waUrl} target="_blank" rel="noopener noreferrer">
                            <WhatsAppIcon />
                            {dict.cta.book}
                            <span className="sr-only"> {dict.cta.newTab}</span>
                        </a>
                    </Button>
                </div>
            ) : null}
        </article>
    );
}

function errorText(dict: Dict, reason: "rate_limited" | "network" | "error"): string {
    return reason === "rate_limited" ? dict.errors.rateLimited : reason === "network" ? dict.errors.network : dict.errors.generic;
}

function Bar({ className }: { className?: string }) {
    return <span aria-hidden="true" className={cn("block animate-pulse rounded-sm bg-line motion-reduce:animate-none", className)} />;
}

function Breakdown({ lang, dict, data, level }: { lang: Locale; dict: Dict; data: EstimateResponse; level: Level }) {
    const tier = data.tiers![level];
    const t = dict.result;
    const round = data.legs.length > 1;
    return (
        <div>
            <h3 className="type-label pt-3.5 font-normal text-fg-subtle">{t.breakdownTitle}</h3>
            {data.legs.map((leg, i) => {
                const tierLeg = tier.legs[i]!;
                const rows = breakdownRows(tierLeg, { distanceKm: leg.distanceKm, flags: leg.flags }, dict.lines);
                return (
                    <div key={leg.direction}>
                        {round ? (
                            <h4 className="pt-3 text-[0.9375rem] font-medium">
                                {fill(leg.direction === "outbound" ? t.outbound : t.return, {
                                    date: formatShortDate(leg.date, lang),
                                    time: leg.time,
                                })}
                            </h4>
                        ) : null}
                        <dl className="type-small tabular">
                        {rows.map((r) => (
                            <div key={r.key} className="flex justify-between gap-4 border-b border-line py-[13px]">
                                <dt className="text-fg-subtle">{r.label}</dt>
                                <dd className="font-medium">{r.amount === null ? r.note : formatMXN(r.amount)}</dd>
                            </div>
                        ))}
                        {round ? (
                            <div className="flex justify-between gap-4 border-b border-line py-[13px]">
                                <dt className="font-medium">{dict.result.total}</dt>
                                <dd className="font-medium">{formatMXN(tierLeg.total)}</dd>
                            </div>
                        ) : null}
                        </dl>
                    </div>
                );
            })}
            <div className="flex items-baseline justify-between gap-4 pb-3.5 pt-4">
                <span className="font-medium">{round ? t.roundTripTotal : t.total}</span>
                <span className="flex items-baseline gap-2.5">
                    <span className="type-label text-fg-subtle">{t.taxIncluded}</span>
                    <Price value={tier.total} currency className="text-[1.625rem] font-medium" />
                </span>
            </div>
        </div>
    );
}

function Notices({ dict, data }: { dict: Dict; data: EstimateResponse }) {
    const keys = noticeKeys(data);
    if (keys.length === 0) return null;
    return (
        <div className="mt-6">
            <h3 className="sr-only">{dict.notices.label}</h3>
            <ul className="type-small flex flex-col gap-2 text-fg-subtle">
                {keys.map((k) => (
                    <li key={k} className={cn("flex gap-3", (k === "shortNotice" || k === "peak" || k === "night") && "text-fg-muted")}>
                        <span aria-hidden="true" className={cn("mt-[0.6em] size-1.5 shrink-0 rounded-full", k === "shortNotice" ? "bg-brand-ink" : "bg-route")} />
                        {dict.notices[k]}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function SpecialPanel({ lang, dict, draft, data }: { lang: Locale; dict: Dict; draft: QuoteDraft; data: EstimateResponse }) {
    const reason = primaryReason(data) ?? "no_route";
    const copy = dict.special[reason];
    const context = fill(dict.special.context, {
        route: draft.origin && draft.destination ? `${draft.origin.label} → ${draft.destination.label}` : "",
        date: formatShortDate(draft.date, lang),
        time: draft.time,
        passengers: draft.passengers,
        luggage: draft.luggage,
    });
    const url = buildSpecialQuoteUrl({ kind: specialKind(reason), context: `${context}\n${data.ref}`, lang });
    return (
        <div className="mt-6 flex min-h-[13.5rem] flex-col items-start gap-4 rounded-control bg-elevated p-5 md:mt-8 md:p-6">
            <h3 className="type-subheading">{copy.title}</h3>
            <p className="type-small max-w-prose text-fg-subtle">{copy.text}</p>
            <Button asChild size="md" className="mt-auto">
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon />
                    {dict.special.cta}
                    <span className="sr-only"> {dict.cta.newTab}</span>
                </a>
            </Button>
        </div>
    );
}

function ErrorPanel({ text, retry, onRetry }: { text: string; retry: string; onRetry: () => void }) {
    return (
        <div className="mt-6 flex min-h-[13.5rem] flex-col items-start justify-center gap-4 rounded-control bg-elevated p-5 md:mt-8 md:p-6">
            <p className="type-small max-w-prose">{text}</p>
            <Button variant="secondary" size="sm" onClick={onRetry}>
                <RotateCw aria-hidden="true" strokeWidth={1.6} className="size-[18px]" />
                {retry}
            </Button>
        </div>
    );
}
