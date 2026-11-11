// "Qué incluye tu tarifa" (terminos-condiciones.md, § 6 a 9). Espera y capacidad salen de la config.
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Button, RouteLine, Section, SectionHeader } from "@/components/ui";
import { fill } from "@/content";
import type { Locale } from "@/i18n/config";
import { localizedHref } from "@/i18n/routes";
import type { PricingDictionary } from "@/i18n/types";
import { cn } from "@/lib";
import { formatMXN, pricingConfig } from "@/lib/pricing";

interface IncludesProps {
    lang: Locale;
    t: PricingDictionary["includes"];
    tone?: "bg" | "surface";
    id?: string;
}

/** La config guarda el excedente como `excess_per_15min`: la fracción es de 15 minutos. */
const WAITING_BLOCK_MIN = 15;

export function Includes({ lang, t, tone = "bg", id = "que-incluye" }: IncludesProps) {
    const { waiting, capacity } = pricingConfig;
    const items = [
        { key: "vat", title: t.vat.title, text: t.vat.text },
        {
            key: "waiting",
            title: t.waiting.title,
            text: fill(t.waiting.text, { amount: formatMXN(waiting.excess_per_15min), block: WAITING_BLOCK_MIN }),
            figures: [fill(t.waiting.city, { city: waiting.city_min }), fill(t.waiting.airport, { airport: waiting.airport_min })],
        },
        {
            key: "capacity",
            title: fill(t.capacity.title, { passengers: capacity.max_passengers, luggage: capacity.max_luggage }),
            text: t.capacity.text,
        },
        { key: "payment", title: t.payment.title, text: t.payment.text },
        { key: "tolls", title: t.tolls.title, text: t.tolls.text },
    ];
    const c = t.cancellation;

    return (
        <Section tone={tone} aria-labelledby={id}>
            <SectionHeader id={id} title={t.title} text={t.text} />
            {/* Escritorio: tres arriba y dos abajo (rejilla de 6); tableta: 2 + 2 + 1 a todo lo ancho. Sin huecos. */}
            <Stagger className="grid gap-x-10 md:grid-cols-2 lg:grid-cols-6">
                {items.map((item, i) => (
                    <StaggerItem
                        key={item.key}
                        className={cn(
                            "border-t border-line py-8",
                            i < 3 ? "lg:col-span-2" : "lg:col-span-3",
                            i === items.length - 1 && "md:col-span-2 lg:col-span-3",
                        )}
                    >
                        <h3 className="type-subheading">{item.title}</h3>
                        {item.figures ? (
                            <ul className="mt-4 flex flex-col gap-1">
                                {item.figures.map((figure) => (
                                    <li key={figure} className="tabular text-[1.25rem] font-medium">
                                        {figure}
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                        <p className="type-small mt-3 max-w-[24rem] text-fg-subtle">{item.text}</p>
                    </StaggerItem>
                ))}
            </Stagger>

            <Reveal className="mt-section-sm grid gap-10 border-t border-line-strong pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:pt-12">
                <div className="flex flex-col items-start gap-3">
                    <h3 id={`${id}-cancelaciones`} className="type-heading">
                        {c.title}
                    </h3>
                    <p className="max-w-[26rem] text-fg-subtle">{c.text}</p>
                    <Button asChild variant="link" className="mt-2">
                        <Link href={localizedHref(lang, "terms")}>{c.terms}</Link>
                    </Button>
                </div>
                <div className="relative">
                    {/* La línea va del aviso (●) al viaje (○): cuanto antes avisas, más se reembolsa. */}
                    <RouteLine className="absolute left-0 top-0 hidden md:flex" />
                    <RouteLine orientation="vertical" className="absolute bottom-2 left-0 top-1.5 md:hidden" />
                    <ol aria-label={c.listLabel} className="grid gap-8 pl-10 md:grid-cols-3 md:gap-x-8 md:pl-0 md:pt-10">
                        {c.rows.map((row) => (
                            <li key={row.notice} className="flex flex-col gap-2">
                                <span className="type-figure">{row.refund}</span>
                                <span className="type-small text-fg-subtle">{row.notice}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </Reveal>
        </Section>
    );
}
