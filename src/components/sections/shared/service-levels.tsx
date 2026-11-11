import Link from "next/link";
import { Reveal } from "@/components/motion";
import { Button, Card, CardBody, CheckIcon, Media, Section, SectionHeader } from "@/components/ui";
import { fill, levels, levelsCopy, type Amenities } from "@/content";
import type { Locale } from "@/i18n/config";
import { localizedHref } from "@/i18n/routes";
import { formatMXN, fromPrice } from "@/lib/pricing";
import { quoteHref } from "./links";

interface ServiceLevelsProps {
    lang: Locale;
    /** "summary": tres tarjetas (portada). "full": tarjetas + comparativa de amenities (servicios). */
    variant?: "summary" | "full";
    tone?: "bg" | "surface";
    /** Id del título (aria-labelledby). Cambiarlo si la sección se repite en una página. */
    id?: string;
}

const AMENITY_KEYS = ["drink", "sweet", "savory"] as const satisfies readonly (keyof Amenities)[];

/** Práctico · Select · Premium con "Desde $X" del motor y botón al cotizador con el nivel elegido. */
export function ServiceLevels({ lang, variant = "summary", tone = "bg", id = "niveles" }: ServiceLevelsProps) {
    const t = levelsCopy[lang];
    const items = levels[lang];
    const full = variant === "full";

    return (
        <Section tone={tone} aria-labelledby={id}>
            <SectionHeader
                id={id}
                title={t.title}
                text={t.text}
                action={
                    full ? undefined : (
                        <Button asChild variant="link">
                            <Link href={localizedHref(lang, "pricing")}>{t.seeAll}</Link>
                        </Button>
                    )
                }
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((level, i) => (
                    <Reveal key={level.id} delay={i * 0.06} className={i === 2 ? "md:col-span-2 lg:col-span-1" : undefined}>
                        <Card
                            as="article"
                            tone={tone === "surface" ? "elevated" : "surface"}
                            padding="none"
                            className="h-full" aria-labelledby={`${id}-${level.id}`}>
                            {full ? null : (
                                <Media
                                    src={level.image.src}
                                    alt={level.image.alt}
                                    position={level.image.position}
                                    radius="none"
                                    sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
                                    className="aspect-[16/7] shrink-0 md:aspect-[16/6]"
                                                                />
                            )}
                            <CardBody>
                                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                    <h3 id={`${id}-${level.id}`} className="type-heading">
                                        {level.name}
                                    </h3>
                                    <p className="flex items-baseline gap-1.5 text-sm font-medium text-fg-subtle">
                                        {t.from}
                                        <span className="tabular text-[1.375rem] text-fg">{formatMXN(fromPrice(level.id))}</span>
                                        {t.currency}
                                    </p>
                                </div>
                                <p className="type-small mt-3 text-fg-subtle">{level.description}</p>
                                <ul aria-label={t.featuresLabel} className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5 type-small">
                                    {level.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3">
                                            <CheckIcon className="mt-[0.2rem] text-brand-ink" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-auto pt-8">
                                    <Button asChild variant="secondary" className="w-full">
                                        <Link href={quoteHref(lang, { n: level.id })}>{fill(t.cta, { level: level.name })}</Link>
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Reveal>
                ))}
            </div>

            {full ? (
                <div className="mt-section-sm">
                    <h3 className="type-heading">{t.amenities.title}</h3>
                    <p className="mt-3 max-w-[36rem] text-fg-subtle">{t.amenities.text}</p>
                    <div className="mt-8 overflow-x-auto">
                        <table className="w-full min-w-[34rem] border-collapse text-left type-small">
                            <caption className="sr-only">{t.amenities.caption}</caption>
                            <thead>
                                <tr className="border-b border-line-strong">
                                    <th scope="col" className="py-4 pr-6 font-medium text-fg-subtle">
                                        <span className="sr-only">{t.amenities.amenityHeader}</span>
                                    </th>
                                    {items.map((level) => (
                                        <th key={level.id} scope="col" className="py-4 pr-6 type-subheading">
                                            {level.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {AMENITY_KEYS.map((key) => (
                                    <tr key={key} className="border-b border-line">
                                        <th scope="row" className="py-4 pr-6 font-medium text-fg-subtle">
                                            {t.amenities[key]}
                                        </th>
                                        {items.map((level) => (
                                            <td key={level.id} className="py-4 pr-6">
                                                {level.amenities[key] ?? <span className="text-fg-subtle">{t.amenities.none}</span>}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="type-label mt-4 font-normal text-fg-subtle">{t.amenities.note}</p>
                </div>
            ) : null}
        </Section>
    );
}
