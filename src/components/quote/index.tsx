// Cotizador: barra del hero (QuoteWidget) y cotizador completo de /tarifas (QuoteCalculator).
// Ambos son componentes de servidor delgados que montan su isla cliente. `dict` es Dictionary<"quote">.
// Los dos paneles comparten QUOTE_PANEL_VT para el morph hero → /tarifas.
import { ViewTransition } from "react";
import type { Dictionary, Locale } from "@/i18n/types";
import { QUOTE_PANEL_SHARE, QUOTE_PANEL_VT } from "@/lib/motion";
import { fromPrice } from "@/lib/pricing";
import { LEVELS, type Level } from "@/lib/quote/types";
import { QuoteCalculatorClient } from "./quote-calculator-client";
import { QuoteWidgetForm } from "./quote-widget-form";

interface QuoteProps {
    lang: Locale;
    dict: Dictionary<"quote">;
}

/** Barra del cotizador en el hero de la portada. */
export function QuoteWidget({ lang, dict }: QuoteProps) {
    return (
        <ViewTransition name={QUOTE_PANEL_VT} share={QUOTE_PANEL_SHARE} default="none">
            <QuoteWidgetForm lang={lang} dict={dict} />
        </ViewTransition>
    );
}

/**
 * Cotizador completo de /tarifas (raíz con id="cotizar"). Los "Desde $X" se calculan aquí, en el
 * servidor, para que la config de precios no viaje al navegador. El panel del formulario lleva
 * QUOTE_PANEL_VT dentro de la isla.
 */
export function QuoteCalculator({ lang, dict }: QuoteProps) {
    const fromPrices = Object.fromEntries(LEVELS.map((l) => [l, fromPrice(l)])) as Record<Level, number>;
    return <QuoteCalculatorClient lang={lang} dict={dict} fromPrices={fromPrices} />;
}
