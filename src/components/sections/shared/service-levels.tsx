import Link from "next/link";
import { Reveal } from "@/components/motion";
import { Button, Card, CardBody, CheckIcon, Media, Section, SectionHeader } from "@/components/ui";
import { fill, levels, levelsCopy, type Amenities, type LevelContent } from "@/content";
import type { Locale } from "@/i18n/config";
import { localizedHref } from "@/i18n/routes";
import { cn } from "@/lib";
import { formatMXN, fromPrice } from "@/lib/pricing";
import { quoteHref } from "./links";

interface ServiceLevelsProps {
    lang: Locale;
    /** "summary": tres tarjetas con foto (portada). "full": comparativa en columnas, sin fotos (servicios). */
    variant?: "summary" | "full";
    tone?: "bg" | "surface";
    /** Id del título (aria-labelledby). Cambiarlo si la sección se repite en una página. */
    id?: string;
}

const AMENITY_KEYS = ["drink", "sweet", "savory"] as const satisfies readonly (keyof Amenities)[];

/** Práctico · Select · Premium con "Desde $X" del motor y botón al cotizador con el nivel elegido. */
export function ServiceLevels({ lang, variant = "summary", tone = "bg", id = "niveles" }: ServiceLevelsProps) {
    const t = levelsCopy[lang];
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
            {full ? <Comparison lang={lang} id={id} /> : <SummaryCards lang={lang} id={id} tone={tone} />}
        </Section>
    );
}

/** Portada: tres tarjetas con foto. */
function SummaryCards({ lang, id, tone }: { lang: Locale; id: string; tone: "bg" | "surface" }) {
    const t = levelsCopy[lang];
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {levels[lang].map((level, i) => (
                <Reveal key={level.id} variant="item" index={i} className={i === 2 ? "md:col-span-2 lg:col-span-1" : undefined}>
                    <Card
                        as="article"
                        tone={tone === "surface" ? "elevated" : "surface"}
                        padding="none"
                        className="h-full"
                        aria-labelledby={`${id}-${level.id}`}
                    >
                        <Media
                            src={level.image.src}
                            alt={level.image.alt}
                            position={level.image.position}
                            radius="none"
                            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
                            className="aspect-[16/7] shrink-0 md:aspect-[16/6]"
                        />
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
                            <FeatureList level={level} label={t.featuresLabel} className="mt-5 border-t border-line pt-5" />
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
    );
}

/**
 * Servicios: comparativa abierta en tres columnas separadas por filetes. En escritorio cada franja
 * (nombre y precio · para quién · incluye · a bordo · botón) se alinea entre columnas con subgrid,
 * así se compara de un vistazo; en móvil cada nivel es un bloque completo, sin scroll horizontal.
 * Las amenities viven dentro de cada nivel (no en una tabla aparte).
 *
 * Piezas con atributo propio: columna `[data-level]`, precio `[data-level-price]`, botón `[data-level-cta]`.
 */
function Comparison({ lang, id }: { lang: Locale; id: string }) {
    const t = levelsCopy[lang];
    return (
        <Reveal>
            <div
                role="group"
                aria-label={t.compare.caption}
                className="grid border-y border-line-strong lg:grid-cols-3 lg:grid-rows-[auto_auto_1fr_auto_auto]"
            >
                {levels[lang].map((level, i) => (
                    <article
                        key={level.id}
                        data-level={level.id}
                        aria-labelledby={`${id}-${level.id}`}
                        className={cn(
                            "flex flex-col py-10 lg:row-span-5 lg:grid lg:grid-rows-subgrid lg:gap-y-0 lg:px-10 lg:pb-12 lg:pt-12",
                            i > 0 && "border-t border-line lg:border-l lg:border-t-0",
                            i === 0 && "lg:pl-0",
                            i === 2 && "lg:pr-0",
                        )}
                    >
                        <div>
                            <h3 id={`${id}-${level.id}`} className="type-heading">
                                {level.name}
                            </h3>
                            <p data-level-price="" className="mt-4 flex items-baseline gap-2">
                                <span className="type-label text-fg-subtle">{t.from}</span>
                                <span className="type-figure text-fg">{formatMXN(fromPrice(level.id))}</span>
                                <span className="type-label text-fg-subtle">{t.currency}</span>
                            </p>
                        </div>
                        <p className="type-small mt-4 max-w-[24rem] text-fg-subtle lg:mt-5">{level.description}</p>
                        <FeatureList level={level} label={t.featuresLabel} className="mt-8 border-t border-line pt-6" />
                        <div className="mt-8 border-t border-line pt-6">
                            <h4 className="type-label text-fg-muted">{t.amenities.title}</h4>
                            <dl className="mt-3">
                                {AMENITY_KEYS.map((key) => {
                                    const value = level.amenities[key];
                                    return (
                                        <div key={key} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 py-2 type-small">
                                            <dt className="text-fg-subtle">{t.amenities[key]}</dt>
                                            <dd className={value ? "text-fg" : "text-fg-subtle"}>{value ?? t.amenities.none}</dd>
                                        </div>
                                    );
                                })}
                            </dl>
                        </div>
                        <div className="mt-8">
                            <Button asChild variant="secondary" className="w-full" data-level-cta="">
                                <Link href={quoteHref(lang, { n: level.id })}>{fill(t.cta, { level: level.name })}</Link>
                            </Button>
                        </div>
                    </article>
                ))}
            </div>
            <p className="type-label mt-5 font-normal text-fg-subtle">{t.amenities.note}</p>
        </Reveal>
    );
}

function FeatureList({ level, label, className }: { level: LevelContent; label: string; className?: string }) {
    return (
        <ul aria-label={label} className={cn("type-small flex flex-col gap-2.5", className)}>
            {level.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                    <CheckIcon className="mt-[0.2rem] shrink-0 text-brand-ink" />
                    {feature}
                </li>
            ))}
        </ul>
    );
}
