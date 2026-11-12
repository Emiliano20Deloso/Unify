// Cierre de /tarifas: lo que no se cotiza en línea va por WhatsApp (buildSpecialQuoteUrl).
// Panorámica de la vía rápida a todo el ancho del contenido y, debajo, la propuesta a la izquierda
// y los cuatro tipos de cotización a la medida en rejilla a la derecha.
// Piezas con atributo propio: cada tipo `[data-quote-kind]` y su flecha `[data-quote-arrow]`.
import { Reveal, RevealGroup } from "@/components/motion";
import { ArrowIcon, Button, Media, Section } from "@/components/ui";
import { customQuoteKinds, fill, photos } from "@/content";
import type { Locale } from "@/i18n/config";
import type { PricingDictionary } from "@/i18n/types";
import { pricingConfig } from "@/lib/pricing";
import { buildSpecialQuoteUrl } from "@/lib/whatsapp";

interface CustomQuoteProps {
    lang: Locale;
    t: PricingDictionary["custom"];
    tone?: "bg" | "surface";
    id?: string;
}

export function CustomQuote({ lang, t, tone = "surface", id = "a-la-medida" }: CustomQuoteProps) {
    const { capacity } = pricingConfig;
    return (
        <Section tone={tone} aria-labelledby={id}>
            {/* La panorámica se funde y se asienta; luego la propuesta y, en escalonado, los cuatro tipos. */}
            <Reveal variant="media">
                <Media
                    src={photos.pricingCustomQuote}
                    alt={t.imageAlt}
                    position="50% 66%"
                    sizes="(min-width: 1440px) 1280px, 92vw"
                    className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
                />
            </Reveal>
            <div className="mt-10 grid gap-12 md:mt-14 lg:grid-cols-12 lg:gap-x-8">
                <RevealGroup className="flex flex-col items-start lg:col-span-5">
                    <Reveal as="h2" variant="title" index={0} id={id} className="type-title">
                        {t.title}
                    </Reveal>
                    <Reveal as="p" variant="text" index={1} className="type-lead mt-5 max-w-[30rem] text-fg-subtle">
                        {t.text}
                    </Reveal>
                    <Reveal variant="text" index={2} className="mt-10 w-full sm:w-auto">
                        <Button asChild size="lg" className="w-full sm:w-auto">
                            <a href={buildSpecialQuoteUrl({ kind: "general", lang })} target="_blank" rel="noopener noreferrer">
                                {t.cta}
                                <span className="sr-only"> {t.external}</span>
                            </a>
                        </Button>
                        <p className="type-small mt-4 text-fg-subtle">{t.note}</p>
                    </Reveal>
                </RevealGroup>
                {/* Cada tipo: al pasar el cursor o con el foco, el filete superior se recorre en claro y la flecha avanza. */}
                <RevealGroup as="ul" aria-label={t.listLabel} className="grid gap-x-8 sm:grid-cols-2 lg:col-span-6 lg:col-start-7 lg:self-start">
                    {customQuoteKinds.map((kind, i) => {
                        const item = t.items[kind];
                        const text = fill(item.text, { passengers: capacity.max_passengers, luggage: capacity.max_luggage });
                        return (
                            <Reveal as="li" variant="item" index={i} key={kind} className="border-t border-line-strong">
                                <a
                                    data-quote-kind={kind}
                                    href={buildSpecialQuoteUrl({ kind, lang })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative flex h-full items-start justify-between gap-6 pb-8 pt-5"
                                >
                                    <span className="flex flex-col gap-2">
                                        <span className="type-subheading transition-colors duration-micro ease group-hover:text-white group-focus-visible:text-white">
                                            {item.title}
                                        </span>
                                        <span className="type-small text-fg-subtle">{text}</span>
                                        <span className="sr-only"> {t.external}</span>
                                    </span>
                                    <span
                                        data-quote-arrow=""
                                        aria-hidden="true"
                                        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line-strong text-fg"
                                    >
                                        <ArrowIcon className="size-5" />
                                    </span>
                                </a>
                            </Reveal>
                        );
                    })}
                </RevealGroup>
            </div>
        </Section>
    );
}
