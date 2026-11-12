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
 * Entrada en secuencia con data-enter: título → texto → cotizador.
 */
export function PricingHero({ lang, t, quote }: PricingHeroProps) {
    return (
        <section aria-labelledby="tarifas-titulo" className="bg-bg pb-section-md pt-[calc(var(--header-h)+var(--section-sm))]">
            <Container>
                <div className="mb-8 flex flex-col gap-4 md:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
                    <h1 id="tarifas-titulo" data-enter="1" className="type-display">
                        {t.title}
                    </h1>
                    <p data-enter="2" className="type-lead max-w-[30rem] text-fg-soft lg:mb-2 lg:text-right">{t.text}</p>
                </div>
                {/* Solo fundido (data-enter-still): contiene la barra fija del cotizador en móvil. */}
                <div data-enter="3" data-enter-still>
                    <QuoteCalculator lang={lang} dict={quote} />
                </div>
            </Container>
        </section>
    );
}
