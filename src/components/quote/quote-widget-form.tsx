"use client";

// Barra del cotizador del hero. Escritorio: Origen | ●——○ | Destino | Fecha | Hora | [Ver tarifa].
// Móvil y tableta: tarjeta apilada con La línea vertical entre Origen y Destino.
// Escribe en el borrador compartido; al enviar navega a /tarifas#cotizar con el morph del panel.
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowIcon, RouteLine } from "@/components/ui";
import type { Dictionary, Locale } from "@/i18n/types";
import { localizedHref } from "@/i18n/routes";
import { cn } from "@/lib";
import { draftIssues } from "@/lib/quote/draft";
import { updateDraft, useQuoteDraft } from "@/lib/quote/store";
import { useToday } from "./hooks";
import { PlaceField, type PlaceFieldHandle } from "./place-field";
import { cellFocus, DateCell, TimeCell } from "./when-fields";

interface Props {
    lang: Locale;
    dict: Dictionary<"quote">;
}

type Missing = "origin" | "destination";

export function QuoteWidgetForm({ lang, dict }: Props) {
    const router = useRouter();
    const draft = useQuoteDraft();
    const today = useToday();
    const [missing, setMissing] = useState<Missing[]>([]);
    const originRef = useRef<PlaceFieldHandle>(null);
    const destinationRef = useRef<PlaceFieldHandle>(null);
    const f = dict.fields;
    const errorId = "quote-widget-error";

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const issues = draftIssues(draft);
        const next: Missing[] = [];
        if (issues.origin) next.push("origin");
        if (issues.destination === "chooseDestination") next.push("destination");
        setMissing(next);
        if (next[0] === "origin") return originRef.current?.focus();
        if (next[0] === "destination") return destinationRef.current?.focus();
        updateDraft({}); // asegura la copia en sessionStorage antes de navegar
        router.push(localizedHref(lang, "pricing", "cotizar"), { transitionTypes: ["quote-panel"] });
    };

    const message =
        missing.length === 0 ? null : missing[0] === "origin" ? dict.validation.chooseOrigin : dict.validation.chooseDestination;

    // Celdas: apiladas (móvil) → en línea dentro de la barra (lg).
    const stackCell = "h-[58px] justify-start gap-0.5 pt-[9px]";
    const barCell = "lg:h-auto lg:justify-center lg:gap-1.5 lg:pt-0 lg:px-6";
    const value = "text-base lg:text-lg";

    return (
        <div>
            <form
                noValidate
                aria-label={dict.widget.label}
                onSubmit={submit}
                className="flex flex-col gap-2.5 rounded-card border border-line bg-elevated p-3.5 shadow-bar lg:h-[120px] lg:flex-row lg:items-center lg:gap-0 lg:py-4 lg:pl-2 lg:pr-4"
            >
                <div className="relative rounded-inner bg-surface lg:flex lg:min-w-0 lg:flex-[2.3] lg:items-center lg:self-stretch lg:bg-transparent">
                    <RouteLine orientation="vertical" className="absolute left-4 top-[25px] h-[66px] lg:hidden" />
                    <PlaceField
                        ref={originRef}
                        lang={lang}
                        dict={dict}
                        label={f.origin}
                        placeholder={f.originPlaceholder}
                        value={draft.origin}
                        onChange={(origin) => {
                            updateDraft({ origin });
                            setMissing((m) => m.filter((x) => x !== "origin"));
                        }}
                        invalid={missing.includes("origin")}
                        errorId={missing.includes("origin") ? errorId : undefined}
                        className={cn(stackCell, barCell, "rounded-inner pl-10 pr-3.5 lg:flex-1 lg:self-stretch", cellFocus)}
                        inputClassName={value}
                    />
                    <RouteLine className="mt-[22px] hidden w-24 shrink-0 lg:flex" />
                    <PlaceField
                        ref={destinationRef}
                        lang={lang}
                        dict={dict}
                        label={f.destination}
                        placeholder={f.destinationPlaceholder}
                        value={draft.destination}
                        onChange={(destination) => {
                            updateDraft({ destination });
                            setMissing((m) => m.filter((x) => x !== "destination"));
                        }}
                        invalid={missing.includes("destination")}
                        errorId={missing.includes("destination") ? errorId : undefined}
                        className={cn(
                            stackCell,
                            barCell,
                            "ml-10 rounded-inner border-t border-line pr-3.5 lg:ml-0 lg:flex-[1.3] lg:self-stretch lg:border-t-0",
                            cellFocus,
                        )}
                        inputClassName={value}
                    />
                </div>

                <div className="grid grid-cols-2 gap-2.5 lg:flex lg:gap-0 lg:self-stretch">
                    <span aria-hidden="true" className="hidden h-[52px] w-px self-center bg-line lg:block" />
                    <DateCell
                        label={f.date}
                        lang={lang}
                        value={draft.date}
                        min={today}
                        onChange={(date) => updateDraft({ date })}
                        className={cn(stackCell, barCell, "rounded-inner bg-surface px-3.5 lg:w-[168px] lg:bg-transparent", cellFocus)}
                        valueClassName={value}
                    />
                    <span aria-hidden="true" className="hidden h-[52px] w-px self-center bg-line lg:block" />
                    <TimeCell
                        label={f.time}
                        value={draft.time}
                        onChange={(time) => updateDraft({ time })}
                        className={cn(stackCell, barCell, "rounded-inner bg-surface px-3.5 lg:w-32 lg:bg-transparent", cellFocus)}
                        valueClassName={value}
                    />
                </div>

                <button
                    type="submit"
                    className="flex h-[52px] shrink-0 items-center justify-center gap-2.5 rounded-inner bg-brand px-9 text-base font-medium text-white transition-[background-color,transform] duration-fast ease hover:bg-brand-hover active:scale-[0.97] lg:h-[88px] lg:gap-3 lg:text-[1.0625rem]"
                >
                    {dict.widget.submit}
                    <ArrowIcon />
                </button>
            </form>
            <p id={errorId} role="alert" className="type-label mt-3 min-h-[1.4em] px-1 text-brand-ink empty:hidden lg:px-2">
                {message}
            </p>
        </div>
    );
}
