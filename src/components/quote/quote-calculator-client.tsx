"use client";

// Cotizador completo de /tarifas: formulario a la izquierda, resultado a la derecha (apilados en
// móvil, con barra fija inferior cuando ya hay precio). Estado = borrador compartido (sessionStorage).
// Movimiento: invertir cruza los dos valores y gira el icono; ida y vuelta, vuelo y errores se
// despliegan con alto animado (Collapse); al llegar con borrador o con o/d en la URL los valores se funden.
import { useLayoutEffect, useMemo, useRef, ViewTransition } from "react";
import { ArrowUpDown } from "lucide-react";
import { Collapse } from "@/components/motion/collapse";
import { Swap } from "@/components/motion/swap";
import { Field, Input, RouteLine, Stepper, Switch } from "@/components/ui";
import type { Dictionary, Locale } from "@/i18n/types";
import { QUOTE_PANEL_SHARE, QUOTE_PANEL_VT } from "@/lib/motion";
import { cn } from "@/lib";
import { draftToRequest } from "@/lib/quote/api";
import { draftIssues, involvesAirport, parseQuoteParams, type FieldKey } from "@/lib/quote/draft";
import { fieldErrorsFromApi, type FieldIssue } from "@/lib/quote/outcome";
import { updateDraft, useDraftRestored, useQuoteDraft } from "@/lib/quote/store";
import { MAX_LUGGAGE, MAX_PASSENGERS, type Level } from "@/lib/quote/types";
import { useEstimate, useToday } from "./hooks";
import { spin } from "./motion";
import { PlaceField, type PlaceFieldHandle } from "./place-field";
import { QuoteResult } from "./quote-result";
import { cellFocus, DateCell, TimeCell } from "./when-fields";

interface Props {
    lang: Locale;
    dict: Dictionary<"quote">;
    fromPrices: Record<Level, number>;
}

/** Distancia entre los textos de Origen y Destino: al invertir, cada uno entra desde el sitio del otro. */
const SWAP_DY = 58;

export function QuoteCalculatorClient({ lang, dict, fromPrices }: Props) {
    const draft = useQuoteDraft();
    const today = useToday();
    const f = dict.fields;
    const originRef = useRef<PlaceFieldHandle>(null);
    const destinationRef = useRef<PlaceFieldHandle>(null);
    const swapIcon = useRef<SVGSVGElement>(null);

    // Enlaces compartibles (?o=cat:polanco&d=cat:aicm-t1…): se leen en el cliente al hidratar (antes
    // de pintar), así la página sigue siendo estática y los valores no saltan. Lo de la URL gana al
    // borrador guardado.
    useLayoutEffect(() => {
        const patch = parseQuoteParams(window.location.search, lang);
        if (Object.keys(patch).length > 0) updateDraft(patch);
    }, [lang]);
    useDraftRestored(draft);

    const clientIssues = useMemo(() => (today ? draftIssues(draft) : {}), [draft, today]);
    const ready = today !== "" && Object.keys(clientIssues).length === 0;
    const request = useMemo(() => (ready ? draftToRequest(draft, lang) : null), [ready, draft, lang]);
    const estimate = useEstimate(request);

    // Errores visibles: los de la API (422) por campo y, de cliente, solo los que la persona ya
    // puede corregir (un lugar vacío no es un error hasta que intenta algo).
    const apiErrors = estimate.result?.kind === "invalid" ? fieldErrorsFromApi(estimate.result.error) : null;
    const visible: Partial<Record<FieldKey, FieldIssue>> = { ...apiErrors };
    for (const k of ["destination", "date", "time", "returnDate", "returnTime"] as const) {
        const issue = clientIssues[k];
        if (issue && issue !== "chooseDestination") visible[k] ??= issue;
    }
    const message = (k: FieldKey) => {
        const issue = visible[k];
        return issue ? dict.validation[issue] : undefined;
    };
    const errId = (k: FieldKey) => (visible[k] ? `quote-err-${k}` : undefined);

    const airport = involvesAirport(draft);
    const cell = cn("h-[58px] justify-start gap-0.5 rounded-inner bg-elevated px-3.5 pt-[9px]", cellFocus);

    const swap = () => {
        // Cada texto entra desde donde estaba el otro; el icono da media vuelta.
        originRef.current?.enterFrom(SWAP_DY);
        destinationRef.current?.enterFrom(-SWAP_DY);
        spin(swapIcon.current, 180);
        updateDraft((d) => ({ origin: d.destination, destination: d.origin }));
    };

    return (
        <div id="cotizar" className="grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
            <ViewTransition name={QUOTE_PANEL_VT} share={QUOTE_PANEL_SHARE} default="none">
                <form
                    noValidate
                    aria-labelledby="quote-form-title"
                    onSubmit={(e) => e.preventDefault()}
                    className="flex flex-col gap-5 rounded-card border border-line bg-surface p-5 md:p-7"
                >
                    <h2 id="quote-form-title" className="type-subheading">
                        {dict.calculator.formTitle}
                    </h2>

                    <div className="flex flex-col gap-2.5">
                        <div>
                            <div className="relative rounded-inner bg-elevated">
                                <RouteLine orientation="vertical" className="absolute left-4 top-[25px] h-[66px]" />
                                <PlaceField
                                    ref={originRef}
                                    lang={lang}
                                    dict={dict}
                                    label={f.origin}
                                    placeholder={f.originPlaceholder}
                                    value={draft.origin}
                                    onChange={(origin) => updateDraft({ origin })}
                                    invalid={!!visible.origin}
                                    errorId={errId("origin")}
                                    className={cn("h-[58px] justify-start gap-0.5 rounded-inner pl-10 pr-14 pt-[9px]", cellFocus)}
                                    inputClassName="text-base"
                                    listClassName="-left-10"
                                />
                                <PlaceField
                                    ref={destinationRef}
                                    lang={lang}
                                    dict={dict}
                                    label={f.destination}
                                    placeholder={f.destinationPlaceholder}
                                    value={draft.destination}
                                    onChange={(destination) => updateDraft({ destination })}
                                    invalid={!!visible.destination}
                                    errorId={errId("destination")}
                                    className={cn("ml-10 h-[58px] justify-start gap-0.5 rounded-inner border-t border-line pr-14 pt-[9px]", cellFocus)}
                                    inputClassName="text-base"
                                    listClassName="-left-10"
                                />
                                <button
                                    type="button"
                                    onClick={swap}
                                    aria-label={f.swap}
                                    disabled={!draft.origin && !draft.destination}
                                    className="ctl ctl-press absolute right-1.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-control text-fg-subtle [--press-scale:0.94] hover:bg-surface hover:text-fg disabled:opacity-40"
                                >
                                    <ArrowUpDown ref={swapIcon} aria-hidden="true" strokeWidth={1.6} className="size-[18px]" />
                                </button>
                            </div>
                            <ErrorTexts items={[[errId("origin"), message("origin")], [errId("destination"), message("destination")]]} />
                        </div>

                        <div>
                            <div className="grid grid-cols-2 gap-2.5">
                                <DateCell
                                    label={f.date}
                                    lang={lang}
                                    value={draft.date}
                                    min={today}
                                    fill
                                    onChange={(date) =>
                                        updateDraft((d) => ({
                                            date,
                                            ...(d.roundTrip && d.returnDate && d.returnDate < date ? { returnDate: date } : {}),
                                        }))
                                    }
                                    invalid={!!visible.date}
                                    errorId={errId("date")}
                                    className={cell}
                                    valueClassName="text-base"
                                />
                                <TimeCell
                                    label={f.time}
                                    value={draft.time}
                                    onChange={(time) => updateDraft({ time })}
                                    invalid={!!visible.time}
                                    errorId={errId("time")}
                                    className={cell}
                                    valueClassName="text-base"
                                />
                            </div>
                            <ErrorTexts items={[[errId("date"), message("date")], [errId("time"), message("time")]]} />
                        </div>
                    </div>

                    <div className="flex flex-col border-t border-line pt-5">
                        <span data-draft-value="">
                            <Switch
                                checked={draft.roundTrip}
                                onCheckedChange={(on) =>
                                    updateDraft((d) => ({
                                        roundTrip: on,
                                        returnDate: on ? d.returnDate || d.date : "",
                                        returnTime: on ? d.returnTime || "18:00" : "",
                                    }))
                                }
                            >
                                <span className="text-[0.9375rem] font-medium">{f.roundTrip}</span>
                            </Switch>
                        </span>
                        <Collapse open={draft.roundTrip}>
                            <div className="pt-3">
                                <div className="grid grid-cols-2 gap-2.5">
                                    <DateCell
                                        label={f.returnDate}
                                        lang={lang}
                                        value={draft.returnDate}
                                        min={draft.date || today}
                                        onChange={(returnDate) => updateDraft({ returnDate })}
                                        invalid={!!visible.returnDate}
                                        errorId={errId("returnDate")}
                                        className={cell}
                                        valueClassName="text-base"
                                    />
                                    <TimeCell
                                        label={f.returnTime}
                                        value={draft.returnTime}
                                        onChange={(returnTime) => updateDraft({ returnTime })}
                                        invalid={!!visible.returnTime}
                                        errorId={errId("returnTime")}
                                        className={cell}
                                        valueClassName="text-base"
                                    />
                                </div>
                                <ErrorTexts items={[[errId("returnDate"), message("returnDate")], [errId("returnTime"), message("returnTime")]]} />
                            </div>
                        </Collapse>
                    </div>

                    <div>
                        <div className="flex flex-col gap-3 border-t border-line pt-5">
                            <div className="flex items-center justify-between gap-4">
                                <span id="quote-passengers" className="text-[0.9375rem] font-medium">
                                    {f.passengers}
                                </span>
                                <span data-draft-value="">
                                    <Stepper
                                        value={draft.passengers}
                                        onValueChange={(passengers) => updateDraft({ passengers })}
                                        min={1}
                                        max={MAX_PASSENGERS}
                                        labelledBy="quote-passengers"
                                        decrementLabel={f.passengersDecrement}
                                        incrementLabel={f.passengersIncrement}
                                    />
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="flex flex-col">
                                    <span id="quote-luggage" className="text-[0.9375rem] font-medium">
                                        {f.luggage}
                                    </span>
                                    <span className="type-label font-normal text-fg-subtle">{f.luggageHint}</span>
                                </span>
                                <span data-draft-value="">
                                    <Stepper
                                        value={draft.luggage}
                                        onValueChange={(luggage) => updateDraft({ luggage })}
                                        min={0}
                                        max={MAX_LUGGAGE}
                                        labelledBy="quote-luggage"
                                        decrementLabel={f.luggageDecrement}
                                        incrementLabel={f.luggageIncrement}
                                    />
                                </span>
                            </div>
                        </div>

                        <Collapse open={airport}>
                            <div className="mt-5 border-t border-line pt-5">
                                <Field
                                    label={
                                        <>
                                            {f.flight} <span className="font-normal">({f.flightOptional})</span>
                                        </>
                                    }
                                    hint={f.flightHint}
                                >
                                    <Input
                                        value={draft.flight}
                                        maxLength={10}
                                        autoCapitalize="characters"
                                        autoComplete="off"
                                        placeholder={f.flightPlaceholder}
                                        onChange={(e) => {
                                            const flight = e.target.value.toUpperCase().replace(/[^A-Z0-9 -]/g, "");
                                            updateDraft({ flight });
                                        }}
                                        className="bg-elevated"
                                    />
                                </Field>
                            </div>
                        </Collapse>
                    </div>
                </form>
            </ViewTransition>

            <QuoteResult
                lang={lang}
                dict={dict}
                draft={draft}
                fromPrices={fromPrices}
                estimate={estimate}
                hasFieldErrors={Object.keys(visible).length > 0}
            />
        </div>
    );
}

/**
 * Errores por campo bajo un grupo: cada uno se despliega y se pliega (Collapse) con su id estable;
 * el texto que cambia se funde. Región viva siempre montada: se anuncia al aparecer.
 */
function ErrorTexts({ items }: { items: [id: string | undefined, text: string | undefined][] }) {
    return (
        <div aria-live="polite">
            {items.map(([id, text], i) => (
                <Collapse key={i} open={!!id && !!text}>
                    <p id={id} className="type-label px-1 pt-1.5 text-brand-ink">
                        <Swap inline id={text ?? ""}>
                            {text}
                        </Swap>
                    </p>
                </Collapse>
            ))}
        </div>
    );
}
