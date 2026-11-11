// STUB DE CONTRATO (Fase 1b). El agente del cotizador reemplaza el interior de ambos componentes;
// las firmas se quedan. `dict` es el diccionario "quote" (Dictionary<"quote">).
// Los dos paneles comparten QUOTE_PANEL_VT para el morph hero → /tarifas.
import Link from "next/link";
import { ViewTransition } from "react";
import { Button, Card, RouteLine } from "@/components/ui";
import type { Dictionary, Locale } from "@/i18n/types";
import { localizedHref } from "@/i18n/routes";
import { QUOTE_PANEL_VT } from "@/lib/motion";

interface QuoteProps {
    lang: Locale;
    dict: Dictionary<"quote">;
}

/** Barra del cotizador en el hero de la portada (marcador). */
export function QuoteWidget({ lang, dict }: QuoteProps) {
    return (
        <ViewTransition name={QUOTE_PANEL_VT} share="morph" default="none">
            <Card tone="elevated" className="gap-6 shadow-bar md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-6">
                    <RouteLine className="hidden w-24 md:flex" />
                    <div>
                        <p className="type-subheading">{dict.meta.title}</p>
                        <p className="mt-1 text-fg-subtle">{dict.meta.description}</p>
                    </div>
                </div>
                <Button asChild size="lg">
                    <Link href={localizedHref(lang, "pricing", "cotizar")}>{dict.meta.title}</Link>
                </Button>
            </Card>
        </ViewTransition>
    );
}

/** Cotizador completo de /tarifas (marcador). */
export function QuoteCalculator({ dict }: QuoteProps) {
    return (
        <ViewTransition name={QUOTE_PANEL_VT} share="morph" default="none">
            <Card className="gap-6">
                <h2 className="type-heading">{dict.meta.title}</h2>
                <p className="text-fg-subtle">{dict.meta.description}</p>
                <RouteLine draw />
            </Card>
        </ViewTransition>
    );
}
