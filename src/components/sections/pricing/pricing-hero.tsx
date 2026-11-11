import { QuoteCalculator } from "@/components/quote";
import { Container } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import type { PricingDictionary, QuoteDictionary } from "@/i18n/types";

interface PricingHeroProps {
    lang: Locale;
    t: PricingDictionary["hero"];
    quote: QuoteDictionary;
}

/**
 * Cabecera breve y, de inmediato, el cotizador (trae id="cotizar" y el panel con QUOTE_PANEL_VT).
 * En escritorio el título y la línea de apoyo van en una fila para que el cotizador asome sin scroll.
 * Sin animaciones de entrada: todo está arriba del pliegue.
 */
export function PricingHero({ lang, t, quote }: PricingHeroProps) {
    return (
        <section aria-labelledby="tarifas-titulo" className="bg-bg pb-section-md pt-[calc(var(--header-h)+var(--section-sm))]">
            {/* Provisional: el enlace "Cotización personalizada…" del cotizador lleva whitespace-nowrap y en
                móvil desborda la página (también en /dev/cotizador). Se deja envolver mientras se corrige
                en src/components/quote/quote-result.tsx. */}
            <Container className="[&_#cotizar_a]:max-w-full [&_#cotizar_a]:whitespace-normal">
                <div className="mb-8 flex flex-col gap-4 md:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
                    <h1 id="tarifas-titulo" className="type-display">
                        {t.title}
                    </h1>
                    <p className="type-lead max-w-[30rem] text-fg-soft lg:mb-2 lg:text-right">{t.text}</p>
                </div>
                <QuoteCalculator lang={lang} dict={quote} />
            </Container>
        </section>
    );
}
