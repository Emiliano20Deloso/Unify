// Los cinco tipos de servicio de los términos (§ 4). Dos se cotizan en línea (filas con foto
// alternadas, al cotizador) y tres a la medida (una foto y una lista, a WhatsApp).
import Link from "next/link";
import { Reveal } from "@/components/motion";
import { Button, CheckIcon, Media, RouteLine, Section, SectionHeader } from "@/components/ui";
import { CUSTOM_SERVICES, fill, ONLINE_SERVICES, servicesImages } from "@/content";
import type { Locale } from "@/i18n/config";
import type { ServicesDictionary } from "@/i18n/types";
import { cn } from "@/lib";
import { pricingConfig } from "@/lib/pricing";
import { buildSpecialQuoteUrl } from "@/lib/whatsapp";
import { quoteHref } from "@/components/sections/shared";

interface ServiceTypesProps {
    lang: Locale;
    t: ServicesDictionary["types"];
    tone?: "bg" | "surface";
    id?: string;
}

export function ServiceTypes({ lang, t, tone = "bg", id = "tipos-de-servicio" }: ServiceTypesProps) {
    const { waiting, capacity } = pricingConfig;
    const values = {
        city: waiting.city_min,
        airport: waiting.airport_min,
        passengers: capacity.max_passengers,
        luggage: capacity.max_luggage,
    };

    return (
        <Section tone={tone} aria-labelledby={id}>
            <SectionHeader id={id} title={t.title} text={t.text} />

            <GroupLabel>{t.online}</GroupLabel>
            <div className="mt-10 flex flex-col gap-section-sm lg:mt-12">
                {ONLINE_SERVICES.map((service, i) => {
                    const item = t.items[service.id];
                    const reversed = i % 2 === 1;
                    return (
                        <article
                            key={service.id}
                            aria-labelledby={`${id}-${service.id}`}
                            className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-16"
                        >
                            <Reveal className={cn("lg:col-span-7", reversed && "lg:order-2")}>
                                <Media
                                    src={service.image.src}
                                    alt={item.imageAlt}
                                    position={service.image.position}
                                    sizes="(min-width: 1280px) 720px, (min-width: 1024px) 56vw, 100vw"
                                    className="aspect-[4/3] lg:aspect-[3/2]"
                                />
                            </Reveal>
                            <div className="flex flex-col items-start lg:col-span-5">
                                <h3 id={`${id}-${service.id}`} className="type-heading">
                                    {item.title}
                                </h3>
                                <p className="mt-4 max-w-[30rem] text-fg-subtle">{item.text}</p>
                                <ul aria-label={t.featuresLabel} className="type-small mt-6 flex w-full flex-col gap-2.5 border-t border-line pt-6">
                                    {item.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3">
                                            <CheckIcon className="mt-[0.2rem] text-brand-ink" />
                                            {fill(feature, values)}
                                        </li>
                                    ))}
                                </ul>
                                <Button asChild variant="secondary" className="mt-8 w-full sm:w-auto">
                                    <Link href={quoteHref(lang)}>{t.quoteCta}</Link>
                                </Button>
                            </div>
                        </article>
                    );
                })}
            </div>

            <div className="mt-section-md">
                <GroupLabel>{t.custom}</GroupLabel>
            </div>
            <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:gap-16">
                <Reveal className="lg:col-span-5">
                    <Media
                        src={servicesImages.custom.src}
                        alt={t.customImageAlt}
                        position={servicesImages.custom.position}
                        sizes="(min-width: 1280px) 500px, (min-width: 1024px) 40vw, 100vw"
                        className="aspect-[16/10] lg:aspect-[4/5]"
                    />
                </Reveal>
                <ul className="border-t border-line lg:col-span-7 lg:self-center">
                    {CUSTOM_SERVICES.map((service) => {
                        const item = t.items[service.id];
                        return (
                            <li key={service.id} className="border-b border-line">
                                <article
                                    aria-labelledby={`${id}-${service.id}`}
                                    className="flex flex-col items-start gap-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-10"
                                >
                                    <div className="flex flex-col gap-2">
                                        <h3 id={`${id}-${service.id}`} className="type-subheading">
                                            {item.title}
                                        </h3>
                                        <p className="type-small max-w-[26rem] text-fg-subtle">{item.text}</p>
                                    </div>
                                    <Button asChild variant="ghost" className="-ml-4 shrink-0 sm:ml-0">
                                        <a href={buildSpecialQuoteUrl({ kind: service.kind, lang })} target="_blank" rel="noopener noreferrer">
                                            {t.whatsappCta}
                                            <span className="sr-only">
                                                {" "}
                                                · {item.title} {t.external}
                                            </span>
                                        </a>
                                    </Button>
                                </article>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </Section>
    );
}

/** Rótulo de grupo seguido de La línea, que corre hasta el borde del contenido. */
function GroupLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-5">
            <p className="shrink-0 font-medium text-fg-muted">{children}</p>
            <RouteLine className="flex-1" />
        </div>
    );
}
