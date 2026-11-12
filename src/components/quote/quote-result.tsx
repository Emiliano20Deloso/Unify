"use client";

// Tarjeta de resultado (maqueta: "Resultado de la cotización"). Mantiene su estructura en todos los
// estados —vacío, cargando, precio, especial, error— para que llegar el precio no mueva la página.
// Movimiento: un solo cuerpo que pasa de un estado a otro con fundido cruzado y alto animado (Swap +
// AutoHeight); los tres niveles siguen montados y su cifra rueda de "Desde $X" al precio; el desglose
// y los avisos entran y salen fila por fila; títulos, distancia y atribución se funden; mientras
// llega un precio nuevo las cifras se atenúan (aria-busy). La barra móvil vive en <body> (portal).
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, useIsPresent, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { RotateCw } from "lucide-react";
import { AutoHeight } from "@/components/motion/auto-height";
import { Collapse } from "@/components/motion/collapse";
import { Presence } from "@/components/motion/presence";
import { Swap } from "@/components/motion/swap";
import { Button, Price, RouteLine, Segmented } from "@/components/ui";
import type { Dictionary, Locale } from "@/i18n/types";
import { cn } from "@/lib";
import type { EstimateRequest, EstimateResponse } from "@/lib/estimate/schema";
import { FADE_IN, FADE_OUT, SPRING } from "@/lib/motion";
import { formatMXN } from "@/lib/pricing/format";
import { breakdownRows } from "@/lib/quote/breakdown";
import { fill, formatDuration, formatKm, formatShortDate } from "@/lib/quote/format";
import { noticeKeys, primaryReason, specialKind } from "@/lib/quote/outcome";
import { updateDraft } from "@/lib/quote/store";
import { LEVELS, type Level, type QuoteDraft } from "@/lib/quote/types";
import { buildSpecialQuoteUrl, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { EstimateState } from "./hooks";
import { spin, useSlideOnChange } from "./motion";

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

const noop = () => () => {};
/** true solo en el cliente ya hidratado (el portal de la barra necesita document.body). */
function useMounted(): boolean {
    return useSyncExternalStore(
        noop,
        () => true,
        () => false,
    );
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

    // Barra fija inferior (móvil): visible cuando hay precio (también mientras llega el siguiente), el
    // cotizador está en pantalla y el botón propio de la tarjeta no.
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
    const mounted = useMounted();
    const showBar = !!tiers && cardVisible && !ctaVisible;

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
    const body = view.kind === "special" ? "special" : view.kind === "error" ? "error" : "levels";
    const meta = leg ? `${fill(t.distance, { km: formatKm(leg.distanceKm) })} · ${formatDuration(leg.durationMin, lang)}` : null;
    // Sin ruta no hay nota: el mensaje de la tarjeta vacía va una sola vez, dentro de la caja del desglose.
    const note = leg ? (leg.distanceSource === "google" ? dict.places.attribution : t.approx) : null;

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
                <h2 id="quote-result-title" data-draft-value="" className="type-subheading min-w-0">
                    <RouteTitle dict={dict} draft={draft} />
                </h2>
                <div data-draft-value="" className="type-small min-h-[1.6em] shrink-0 font-medium text-fg-subtle tabular md:mb-[3px] md:text-right">
                    <Swap inline id={meta ?? (loading ? "loading" : "none")} className="quote-dim whitespace-nowrap">
                        {meta ? meta : loading ? <Bar className="h-4 w-36" /> : null}
                    </Swap>
                </div>
            </div>
            <p data-draft-value="" className="type-label mt-2 min-h-[1.4em] font-normal text-fg-subtle md:text-right">
                <Swap inline id={note ?? ""}>
                    {note}
                </Swap>
            </p>

            <AutoHeight>
                {/* Relleno y no margen arriba: el estado que sale (popLayout) no se recorre al salir del flujo. */}
                <Swap id={body} className="pt-6 md:pt-8">
                    {view.kind === "special" ? (
                        <SpecialPanel lang={lang} dict={dict} draft={draft} data={view.data} />
                    ) : view.kind === "error" ? (
                        <ErrorPanel text={errorText(dict, view.reason)} retry={dict.errors.retry} onRetry={estimate.retry} />
                    ) : (
                        <>
                            <div data-draft-value="">
                                <Segmented
                                    name="quote-level"
                                    legend={t.levelLegend}
                                    value={level}
                                    onValueChange={(l) => updateDraft({ level: l })}
                                    selectedLabel={t.selected}
                                    className="quote-dim"
                                    options={LEVELS.map((l) => ({
                                        value: l,
                                        label: dict.levels[l],
                                        // Siempre la misma cifra montada: rueda de "Desde $X" al precio real.
                                        detail: (
                                            <span className="quote-detail">
                                                <span className="quote-from" data-hidden={tiers ? "" : undefined} aria-hidden={tiers ? true : undefined}>
                                                    <span className="type-label font-normal text-fg-subtle">{t.from}</span>
                                                </span>
                                                <Price value={tiers ? tiers[l].total : fromPrices[l]} />
                                            </span>
                                        ),
                                    }))}
                                />
                            </div>

                            <div className="quote-dim mt-6 min-h-[13.5rem] rounded-control bg-elevated px-5 py-1 md:mt-7">
                                <Swap id={data && tiers ? "price" : view.kind === "fix" ? "fix" : loading ? "loading" : "empty"}>
                                        {data && tiers ? (
                                            <Breakdown lang={lang} dict={dict} data={data} level={level} />
                                        ) : (
                                            <div className="flex min-h-[13rem] flex-col justify-center gap-3 py-4">
                                                {view.kind === "fix" ? (
                                                    <p className="type-small text-balance text-center text-fg-subtle">{t.fixFields}</p>
                                                ) : loading ? (
                                                    <>
                                                        <span className="sr-only">{t.loading}</span>
                                                        <Bar className="h-4 w-2/3" />
                                                        <Bar className="h-4 w-1/2" />
                                                        <Bar className="h-4 w-3/5" />
                                                        <Bar className="mt-3 h-7 w-1/3 self-end" />
                                                    </>
                                                ) : (
                                                    <p className="type-small text-balance text-center text-fg-subtle">{t.emptyText}</p>
                                                )}
                                            </div>
                                        )}
                                </Swap>
                            </div>

                            <Notices dict={dict} data={data && tiers ? data : null} />
                        </>
                    )}
                </Swap>
            </AutoHeight>

            <div ref={ctaRef} className="mt-auto flex flex-col pt-8">
                <Collapse open={view.kind !== "special"}>
                    <div className="pb-3">
                        <BookLink href={waUrl} size="lg" className="w-full" label={dict.cta.book} newTab={dict.cta.newTab} />
                    </div>
                </Collapse>
                <p className="type-label text-center font-normal text-fg-subtle">{dict.cta.hours}</p>
                <Button asChild variant="link" size="sm" className="mt-3 max-w-full self-center whitespace-normal text-center text-[0.9375rem]">
                    <a href={buildSpecialQuoteUrl({ kind: "general", lang })} target="_blank" rel="noopener noreferrer">
                        {dict.cta.custom}
                        <span className="sr-only"> {dict.cta.newTab}</span>
                    </a>
                </Button>
            </div>

            {/* Fuera de la tarjeta (en <body>): un ancestro con transform o recorte la dejaría mal anclada. */}
            {mounted
                ? createPortal(
                      <Presence
                          show={showBar}
                          preset="drop"
                          data-site-chrome=""
                          data-quote-bar=""
                          className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-bg px-gutter pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden"
                      >
                          {tiers ? (
                              <>
                                  <p className="flex min-w-0 flex-col">
                                      <span className="type-label font-normal text-fg-subtle">
                                          <Swap inline id={level}>
                                              {fill(dict.mobileBar.label, { level: dict.levels[level] })}
                                          </Swap>
                                      </span>
                                      <Price value={tiers[level].total} currency className="text-xl font-medium" />
                                  </p>
                                  <BookLink href={waUrl} size="md" className="px-5" label={dict.cta.book} newTab={dict.cta.newTab} />
                              </>
                          ) : null}
                      </Presence>,
                      document.body,
                  )
                : null}
        </article>
    );
}

/**
 * Reservar por WhatsApp: un único enlace. Sin precio vigente no lleva href (aria-disabled, sigue
 * enfocable para no perder el foco) y se atenúa con retraso: una actualización rápida no parpadea.
 */
function BookLink({ href, size, className, label, newTab }: { href: string | null; size: "md" | "lg"; className?: string; label: string; newTab: string }) {
    return (
        <Button asChild size={size} className={cn("quote-book", className)}>
            <a
                href={href ?? undefined}
                role={href ? undefined : "link"}
                tabIndex={href ? undefined : 0}
                aria-disabled={href ? undefined : true}
                target="_blank"
                rel="noopener noreferrer"
            >
                {label}
                <span className="sr-only"> {newTab}</span>
            </a>
        </Button>
    );
}

/** Origen ●——○ Destino. Las etiquetas se funden al cambiar; La línea no se vuelve a montar. */
function RouteTitle({ dict, draft }: { dict: Dict; draft: QuoteDraft }) {
    const t = dict.result;
    const line = useRef<HTMLSpanElement>(null);
    const end = useRef<HTMLSpanElement>(null);
    const origin = draft.origin?.label ?? "";
    const destination = draft.destination?.label ?? "";
    const route = !!draft.origin && !!draft.destination;
    const routeKey = route ? `${draft.origin!.id}>${draft.destination!.id}` : "";
    // Si cambia el ancho de una etiqueta, La línea y el destino se deslizan a su sitio nuevo.
    useSlideOnChange(line, `${origin}|${destination}`);
    useSlideOnChange(end, `${origin}|${destination}`);

    return (
        <Swap inline id={route ? "route" : "empty"} className="block">
            {route ? (
                <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <Swap inline id={origin} className="min-w-0">
                        {origin}
                    </Swap>
                    <span ref={line} className="flex w-14 shrink-0">
                        <RouteLine draw redraw={routeKey} label={t.routeTo} className="w-14 shrink-0" />
                    </span>
                    <span ref={end} className="min-w-0">
                        <Swap inline id={destination}>
                            {destination}
                        </Swap>
                    </span>
                </span>
            ) : (
                t.emptyTitle
            )}
        </Swap>
    );
}

function errorText(dict: Dict, reason: "rate_limited" | "network" | "error"): string {
    return reason === "rate_limited" ? dict.errors.rateLimited : reason === "network" ? dict.errors.network : dict.errors.generic;
}

function Bar({ className }: { className?: string }) {
    return <span aria-hidden="true" className={cn("block animate-pulse rounded-sm bg-line motion-reduce:animate-none", className)} />;
}

/** Fila que entra y sale con alto animado y fundido (mismos tiempos que Collapse), dentro de AnimatePresence. */
const ROW = {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1, transition: { height: SPRING.layout, opacity: { ...FADE_IN, delay: 0.06 } } },
    exit: { height: 0, opacity: 0, transition: { height: SPRING.ui, opacity: FADE_OUT } },
} as const;

/** Movimiento reducido: solo fundido (el alto cambia de una vez al entrar y al salir, no en dos cuadros). */
const ROW_REDUCED = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: FADE_IN },
    exit: { opacity: 0, transition: FADE_OUT },
} as const;

function Row({ className, li = false, children }: { className?: string; li?: boolean; children: React.ReactNode }) {
    // Sin relleno propio: con alto 0 no quedaría nada asomando (el relleno va en los hijos).
    const present = useIsPresent();
    const v = useReducedMotion() ? ROW_REDUCED : ROW;
    const Tag = li ? m.li : m.div;
    return (
        <Tag
            className={className}
            aria-hidden={present ? undefined : true}
            inert={!present}
            initial={v.initial}
            animate={v.animate}
            exit={v.exit}
            style={{ overflow: "clip", overflowClipMargin: 6 }}
        >
            {children}
        </Tag>
    );
}

function Breakdown({ lang, dict, data, level }: { lang: Locale; dict: Dict; data: EstimateResponse; level: Level }) {
    const tier = data.tiers![level];
    const t = dict.result;
    const round = data.legs.length > 1;
    return (
        <div>
            <h3 className="type-label pt-3.5 font-normal text-fg-subtle">{t.breakdownTitle}</h3>
            <AnimatePresence initial={false}>
                {data.legs.map((leg, i) => {
                    const tierLeg = tier.legs[i]!;
                    const rows = breakdownRows(tierLeg, { distanceKm: leg.distanceKm, flags: leg.flags }, dict.lines);
                    const heading = fill(leg.direction === "outbound" ? t.outbound : t.return, {
                        date: formatShortDate(leg.date, lang),
                        time: leg.time,
                    });
                    return (
                        <Row key={leg.direction}>
                            <AnimatePresence initial={false}>
                                {round ? (
                                    <Row key="heading">
                                        <h4 className="pt-3 text-[0.9375rem] font-medium">
                                            <Swap inline id={heading}>
                                                {heading}
                                            </Swap>
                                        </h4>
                                    </Row>
                                ) : null}
                            </AnimatePresence>
                            <dl className="type-small tabular">
                                <AnimatePresence initial={false}>
                                    {rows.map((r) => (
                                        <Row key={r.key} className="flex justify-between gap-4 border-b border-line">
                                            <dt className="py-[13px] text-fg-subtle">
                                                <Swap inline id={r.label}>
                                                    {r.label}
                                                </Swap>
                                            </dt>
                                            <dd className="py-[13px] font-medium">{r.amount === null ? r.note : <Price value={r.amount} />}</dd>
                                        </Row>
                                    ))}
                                    {round ? (
                                        <Row key="leg-total" className="flex justify-between gap-4 border-b border-line">
                                            <dt className="py-[13px] font-medium">{dict.result.total}</dt>
                                            <dd className="py-[13px] font-medium">
                                                <Price value={tierLeg.total} />
                                            </dd>
                                        </Row>
                                    ) : null}
                                </AnimatePresence>
                            </dl>
                        </Row>
                    );
                })}
            </AnimatePresence>
            <div className="flex items-baseline justify-between gap-4 pb-3.5 pt-4">
                <span className="font-medium">
                    <Swap inline id={round ? "round" : "one"}>
                        {round ? t.roundTripTotal : t.total}
                    </Swap>
                </span>
                <span className="flex items-baseline gap-2.5">
                    <span className="type-label text-fg-subtle">{t.taxIncluded}</span>
                    <Price value={tier.total} currency className="text-[1.625rem] font-medium" />
                </span>
            </div>
        </div>
    );
}

/** Avisos: el bloque se despliega y cada aviso entra o sale con su propio alto. */
function Notices({ dict, data }: { dict: Dict; data: EstimateResponse | null }) {
    const keys = data ? noticeKeys(data) : [];
    return (
        <AnimatePresence initial={false}>
            {keys.length > 0 ? (
                <Row key="notices">
            <div className="pt-6">
                <h3 className="sr-only">{dict.notices.label}</h3>
                <ul className="type-small flex flex-col text-fg-subtle">
                    <AnimatePresence initial={false}>
                        {keys.map((k) => (
                            <Row key={k} li>
                                <span className={cn("flex gap-3 pb-2", (k === "shortNotice" || k === "peak" || k === "night") && "text-fg-muted")}>
                                    <span
                                        aria-hidden="true"
                                        className={cn("mt-[0.6em] size-1.5 shrink-0 rounded-full", k === "shortNotice" ? "bg-brand-ink" : "bg-route")}
                                    />
                                    {dict.notices[k]}
                                </span>
                            </Row>
                        ))}
                    </AnimatePresence>
                </ul>
            </div>
                </Row>
            ) : null}
        </AnimatePresence>
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
        <div className="flex min-h-[13.5rem] flex-col items-start gap-4 rounded-control bg-elevated p-5 md:p-6">
            <h3 className="type-subheading">
                <Swap inline id={reason}>
                    {copy.title}
                </Swap>
            </h3>
            <p className="type-small max-w-prose text-fg-subtle">
                <Swap inline id={reason}>
                    {copy.text}
                </Swap>
            </p>
            <Button asChild size="md" className="mt-auto">
                <a href={url} target="_blank" rel="noopener noreferrer">
                    {dict.special.cta}
                    <span className="sr-only"> {dict.cta.newTab}</span>
                </a>
            </Button>
        </div>
    );
}

function ErrorPanel({ text, retry, onRetry }: { text: string; retry: string; onRetry: () => void }) {
    const icon = useRef<SVGSVGElement>(null);
    return (
        <div className="flex min-h-[13.5rem] flex-col items-start justify-center gap-4 rounded-control bg-elevated p-5 md:p-6">
            <p className="type-small max-w-prose">
                <Swap inline id={text}>
                    {text}
                </Swap>
            </p>
            <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                    // El icono da una vuelta mientras el panel se funde hacia la espera del precio.
                    spin(icon.current, 360);
                    onRetry();
                }}
            >
                <RotateCw ref={icon} aria-hidden="true" strokeWidth={1.6} className="size-[18px]" />
                {retry}
            </Button>
        </div>
    );
}
