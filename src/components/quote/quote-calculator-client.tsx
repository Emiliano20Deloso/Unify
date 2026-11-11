"use client";

// Cotizador completo de /tarifas: formulario a la izquierda, resultado a la derecha (apilados en
// móvil, con barra fija inferior cuando ya hay precio). Estado = borrador compartido (sessionStorage).
import { useEffect, useMemo, ViewTransition } from "react";
import { ArrowUpDown } from "lucide-react";
import { Field, Input, RouteLine, Stepper } from "@/components/ui";
import type { Dictionary, Locale } from "@/i18n/types";
import { QUOTE_PANEL_SHARE, QUOTE_PANEL_VT } from "@/lib/motion";
import { cn } from "@/lib";
import { draftToRequest } from "@/lib/quote/api";
import { draftIssues, involvesAirport, parseQuoteParams, type FieldKey } from "@/lib/quote/draft";
import { fieldErrorsFromApi, type FieldIssue } from "@/lib/quote/outcome";
import { updateDraft, useQuoteDraft } from "@/lib/quote/store";
import { MAX_LUGGAGE, MAX_PASSENGERS, type Level } from "@/lib/quote/types";
import { useEstimate, useToday } from "./hooks";
import { PlaceField } from "./place-field";
import { QuoteResult } from "./quote-result";
import { cellFocus, DateCell, TimeCell } from "./when-fields";

interface Props {
    lang: Locale;
    dict: Dictionary<"quote">;
    fromPrices: Record<Level, number>;
}

export function QuoteCalculatorClient({ lang, dict, fromPrices }: Props) {
    const draft = useQuoteDraft();
    const today = useToday();
    const f = dict.fields;

    // Enlaces compartibles (?o=cat:polanco&d=cat:aicm-t1…): se leen en el cliente tras montar,
    // así la página sigue siendo estática. Lo de la URL gana al borrador guardado.
    useEffect(() => {
        const patch = parseQuoteParams(window.location.search, lang);
        if (Object.keys(patch).length > 0) updateDraft(patch);
    }, [lang]);

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

    const swap = () => updateDraft((d) => ({ origin: d.destination, destination: d.origin }));

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
                        <div className="relative rounded-inner bg-elevated">
                            <RouteLine orientation="vertical" className="absolute left-4 top-[25px] h-[66px]" />
                            <PlaceField
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
                                className="absolute right-1.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-control text-fg-subtle transition-[background-color,color,transform] duration-fast ease hover:bg-surface hover:text-fg active:scale-95 disabled:opacity-40"
                            >
                                <ArrowUpDown aria-hidden="true" strokeWidth={1.6} className="size-[18px]" />
                            </button>
                        </div>
                        <ErrorText id={errId("origin")} text={message("origin")} />
                        <ErrorText id={errId("destination")} text={message("destination")} />

                        <div className="grid grid-cols-2 gap-2.5">
                            <DateCell
                                label={f.date}
                                lang={lang}
                                value={draft.date}
                                min={today}
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
                        <ErrorText id={errId("date")} text={message("date")} />
                        <ErrorText id={errId("time")} text={message("time")} />
                    </div>

                    <div className="flex flex-col gap-3 border-t border-line pt-5">
                        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
                            <span className="text-[0.9375rem] font-medium">{f.roundTrip}</span>
                            <input
                                type="checkbox"
                                role="switch"
                                checked={draft.roundTrip}
                                onChange={(e) => {
                                    const on = e.target.checked;
                                    updateDraft((d) => ({
                                        roundTrip: on,
                                        returnDate: on ? d.returnDate || d.date : "",
                                        returnTime: on ? d.returnTime || "18:00" : "",
                                    }));
                                }}
                                className="peer sr-only"
                            />
                            <span
                                aria-hidden="true"
                                className={cn(
                                    "relative h-7 w-12 shrink-0 rounded-full border border-line-strong bg-elevated transition-[background-color,border-color] duration-fast ease",
                                    "peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-fg",
                                    "peer-checked:[&>span]:translate-x-5",
                                )}
                            >
                                <span className="absolute left-[3px] top-[3px] size-5 rounded-full bg-fg transition-transform duration-base ease-out" />
                            </span>
                        </label>
                        {draft.roundTrip ? (
                            <>
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
                                <ErrorText id={errId("returnDate")} text={message("returnDate")} />
                                <ErrorText id={errId("returnTime")} text={message("returnTime")} />
                            </>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-3 border-t border-line pt-5">
                        <div className="flex items-center justify-between gap-4">
                            <span id="quote-passengers" className="text-[0.9375rem] font-medium">
                                {f.passengers}
                            </span>
                            <Stepper
                                value={draft.passengers}
                                onValueChange={(passengers) => updateDraft({ passengers })}
                                min={1}
                                max={MAX_PASSENGERS}
                                labelledBy="quote-passengers"
                                decrementLabel={f.passengersDecrement}
                                incrementLabel={f.passengersIncrement}
                            />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="flex flex-col">
                                <span id="quote-luggage" className="text-[0.9375rem] font-medium">
                                    {f.luggage}
                                </span>
                                <span className="type-label font-normal text-fg-subtle">{f.luggageHint}</span>
                            </span>
                            <Stepper
                                value={draft.luggage}
                                onValueChange={(luggage) => updateDraft({ luggage })}
                                min={0}
                                max={MAX_LUGGAGE}
                                labelledBy="quote-luggage"
                                decrementLabel={f.luggageDecrement}
                                incrementLabel={f.luggageIncrement}
                            />
                        </div>
                    </div>

                    {airport ? (
                        <div className="border-t border-line pt-5">
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
                    ) : null}
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

function ErrorText({ id, text }: { id?: string; text?: string }) {
    if (!id || !text) return null;
    return (
        <p id={id} className="type-label -mt-1 px-1 text-brand-ink">
            {text}
        </p>
    );
}
