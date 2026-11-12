import Link from "next/link";
import { Reveal, RevealGroup } from "@/components/motion";
import { ArrowIcon, Button, RouteLine, Section, SectionHeader } from "@/components/ui";
import { fill, popularRoutes, routesCopy, type PopularRoute } from "@/content";
import type { Locale } from "@/i18n/config";
import { localizedHref } from "@/i18n/routes";
import { cn } from "@/lib";
import { formatMXN, routePrice } from "@/lib/pricing";
import { formatKm } from "@/lib/quote/format";
import { buildSpecialQuoteUrl } from "@/lib/whatsapp";
import { quoteHref } from "./links";

interface PopularRoutesProps {
    lang: Locale;
    /** "teaser": las 3 rutas dentro de la zona y enlace a /tarifas. "full": las 5, en dos grupos (zona / fuera). */
    variant?: "teaser" | "full";
    tone?: "bg" | "surface";
    id?: string;
}

const REFERENCE_LEVEL = "practico" as const;

/**
 * Rutas frecuentes. Cada fila es un trayecto: origen ●——○ destino con la distancia sobre La línea,
 * "Desde $X en Práctico" y la flecha. En móvil La línea corre en vertical entre origen y destino.
 * Dentro de zona, km y precio salen del mismo cálculo que el cotizador sin Google (content/routes).
 *
 * Piezas con atributo propio (para el movimiento): fila `[data-route-row]` (con `data-zone`),
 * línea `[data-route-line]`, distancia `[data-route-km]`, precio `[data-route-price]` y flecha `[data-route-arrow]`.
 */
export function PopularRoutes({ lang, variant = "teaser", tone = "bg", id = "rutas" }: PopularRoutesProps) {
    const t = routesCopy[lang];
    const inZone = popularRoutes.filter((r) => r.zone === "in");
    const outOfZone = popularRoutes.filter((r) => r.zone === "out");

    return (
        <Section tone={tone} aria-labelledby={id}>
            <SectionHeader
                id={id}
                title={t.title}
                text={t.text}
                action={
                    variant === "teaser" ? (
                        <Button asChild variant="link">
                            <Link href={localizedHref(lang, "pricing")}>{t.seeAll}</Link>
                        </Button>
                    ) : undefined
                }
            />
            {variant === "teaser" ? (
                <RouteList routes={inZone.slice(0, 3)} lang={lang} heading="h3" />
            ) : (
                <div className="flex flex-col gap-section-sm">
                    <div>
                        <GroupHeading id={`${id}-zona`}>{t.inZoneGroup}</GroupHeading>
                        <RouteList routes={inZone} lang={lang} heading="h4" labelledBy={`${id}-zona`} />
                    </div>
                    <div>
                        <GroupHeading id={`${id}-fuera`} text={t.outOfZoneGroupText}>
                            {t.outOfZoneGroup}
                        </GroupHeading>
                        <RouteList routes={outOfZone} lang={lang} heading="h4" labelledBy={`${id}-fuera`} />
                    </div>
                </div>
            )}
        </Section>
    );
}

function GroupHeading({ id, text, children }: { id: string; text?: string; children: React.ReactNode }) {
    return (
        <Reveal variant="text" className="mb-2 flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-8">
            <h3 id={id} className="font-medium text-fg-muted">
                {children}
            </h3>
            {text ? <p className="type-small max-w-[36rem] text-fg-subtle md:text-right">{text}</p> : null}
        </Reveal>
    );
}

function RouteList({
    routes,
    lang,
    heading,
    labelledBy,
}: {
    routes: readonly PopularRoute[];
    lang: Locale;
    heading: "h3" | "h4";
    labelledBy?: string;
}) {
    return (
        // Las filas suben una tras otra (60 ms). La fila (un enlace con hover propio) va dentro del li.
        <RevealGroup as="ul" aria-labelledby={labelledBy} className="border-t border-line-strong">
            {routes.map((route, i) => (
                <Reveal as="li" variant="item" index={i} key={route.slug} className="border-b border-line">
                    <RouteRow route={route} lang={lang} heading={heading} />
                </Reveal>
            ))}
        </RevealGroup>
    );
}

function RouteRow({ route, lang, heading: Heading }: { route: PopularRoute; lang: Locale; heading: "h3" | "h4" }) {
    const t = routesCopy[lang];
    const origin = route.origin.name[lang];
    const destination = route.destination.name[lang];
    const inZone = route.zone === "in";
    const km = fill(inZone ? t.approxKm : t.km, { km: formatKm(route.km) });

    const body = (
        <>
            {/* Trayecto. Móvil: rejilla [riel | nombres] con La línea vertical. Escritorio: una sola fila. */}
            <div className="col-span-2 min-w-0 lg:flex-1">
                <Heading className="type-subheading xl:type-heading grid grid-cols-[0.5rem_minmax(0,1fr)] gap-x-5 lg:flex lg:items-center lg:gap-x-5 xl:gap-x-7">
                    <span
                        data-route-line=""
                        className="col-start-1 row-span-3 row-start-1 flex py-[0.55em] lg:hidden"
                    >
                        <RouteLine orientation="vertical" label={t.to} />
                    </span>
                    <span className="col-start-2 row-start-1 transition-colors duration-micro ease group-hover:text-white group-focus-visible:text-white lg:max-w-[12rem] lg:shrink-0 xl:max-w-[20rem]">
                        {origin}
                    </span>
                    <span
                        data-route-km=""
                        aria-hidden="true"
                        className="type-small tabular col-start-2 row-start-2 py-3 font-sans font-medium tracking-normal text-fg-subtle lg:hidden"
                    >
                        {km}
                    </span>
                    <span data-route-line="" className="relative hidden min-w-24 flex-1 lg:flex">
                        <RouteLine label={t.to} />
                        <span
                            data-route-km=""
                            aria-hidden="true"
                            className="type-small tabular absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap font-sans font-medium tracking-normal text-fg-subtle"
                        >
                            {km}
                        </span>
                    </span>
                    <span className="col-start-2 row-start-3 transition-colors duration-micro ease group-hover:text-white group-focus-visible:text-white lg:w-[13rem] lg:shrink-0 xl:w-[21rem]">
                        {destination}
                    </span>
                </Heading>
                <span className="sr-only">{km}</span>
            </div>

            {/* Precio y flecha: abajo en móvil, a la derecha en escritorio. */}
            {inZone ? (
                <p
                    data-route-price=""
                    className="mt-6 flex flex-wrap items-baseline gap-x-2 self-center lg:mt-0 lg:w-40 lg:shrink-0 xl:w-52 lg:flex-col lg:items-end lg:gap-1 lg:self-center lg:text-right"
                >
                    <span className="type-label text-fg-subtle">{t.from}</span>
                    <span className="type-figure text-fg">{formatMXN(routePrice(REFERENCE_LEVEL, route.km))}</span>
                    <span className="type-label text-fg-subtle">{t.level}</span>
                </p>
            ) : (
                <p
                    data-route-price=""
                    className="mt-6 flex flex-col gap-1 self-center lg:mt-0 lg:w-40 lg:shrink-0 xl:w-52 lg:items-end lg:self-center lg:text-right"
                >
                    <span className="font-medium text-fg">{t.outOfZone}</span>
                    <span className="type-label text-fg-subtle">{t.viaWhatsapp}</span>
                    <span className="sr-only">{t.external}</span>
                </p>
            )}
            <span
                data-route-arrow=""
                aria-hidden="true"
                className="mt-6 flex size-11 items-center justify-center self-center rounded-full border border-line-strong text-fg lg:mt-0"
            >
                <ArrowIcon className="size-5" />
            </span>
        </>
    );

    const rowClass = cn(
        "group grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-6 py-7",
        "lg:flex lg:items-center lg:gap-x-8 lg:py-10 xl:gap-x-12",
    );

    if (inZone) {
        return (
            <Link
                data-route-row=""
                data-zone="in"
                href={quoteHref(lang, { o: route.origin.id ?? undefined, d: route.destination.id ?? undefined })}
                className={rowClass}
            >
                {body}
            </Link>
        );
    }

    return (
        <a
            data-route-row=""
            data-zone="out"
            href={buildSpecialQuoteUrl({
                kind: "out_of_zone",
                context: fill(t.whatsappContext, { origin, destination, km: formatKm(route.km) }),
                lang,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className={rowClass}
        >
            {body}
        </a>
    );
}
