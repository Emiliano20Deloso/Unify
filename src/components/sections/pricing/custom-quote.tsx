// Cierre de /tarifas: lo que no se cotiza en línea va por WhatsApp (buildSpecialQuoteUrl).
import { ArrowIcon, Button, Section, WhatsAppIcon } from "@/components/ui";
import { fill } from "@/content";
import { customQuoteKinds } from "@/content/pricing-page";
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
            <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
                <div className="flex flex-col items-start">
                    <h2 id={id} className="type-title">
                        {t.title}
                    </h2>
                    <p className="type-lead mt-5 max-w-[30rem] text-fg-subtle">{t.text}</p>
                    <Button asChild size="lg" className="mt-10 w-full sm:w-auto">
                        <a href={buildSpecialQuoteUrl({ kind: "general", lang })} target="_blank" rel="noopener noreferrer">
                            <WhatsAppIcon />
                            {t.cta}
                            <span className="sr-only"> {t.external}</span>
                        </a>
                    </Button>
                    <p className="type-small mt-4 text-fg-subtle">{t.note}</p>
                </div>
                <ul aria-label={t.listLabel} className="border-t border-line lg:mt-2">
                    {customQuoteKinds.map((kind) => {
                        const item = t.items[kind];
                        const text = fill(item.text, { passengers: capacity.max_passengers, luggage: capacity.max_luggage });
                        return (
                            <li key={kind} className="border-b border-line">
                                <a
                                    href={buildSpecialQuoteUrl({ kind, lang })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between gap-6 py-6"
                                >
                                    <span className="flex flex-col gap-1">
                                        <span className="type-subheading transition-colors duration-fast ease group-hover:text-white">
                                            {item.title}
                                        </span>
                                        <span className="type-small text-fg-subtle">{text}</span>
                                        <span className="sr-only"> {t.external}</span>
                                    </span>
                                    <ArrowIcon className="size-5 shrink-0 text-fg-subtle transition-transform duration-fast ease-out group-hover:translate-x-1" />
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </Section>
    );
}
