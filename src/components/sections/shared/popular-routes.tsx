import Link from "next/link";
import { Reveal } from "@/components/motion";
import { ArrowIcon, Button, Media, RouteLine, Section, SectionHeader, WhatsAppIcon } from "@/components/ui";
import { fill, popularRoutes, routesCopy, type PopularRoute } from "@/content";
import type { Locale } from "@/i18n/config";
import { localizedHref } from "@/i18n/routes";
import { formatMXN, routePrice } from "@/lib/pricing";
import { formatKm } from "@/lib/quote/format";
import { buildSpecialQuoteUrl } from "@/lib/whatsapp";
import { quoteHref } from "./links";

interface PopularRoutesProps {
    lang: Locale;
    /** "teaser": las 3 rutas dentro de la zona y enlace a /tarifas. "full": las 5, foráneas al final. */
    variant?: "teaser" | "full";
    tone?: "bg" | "surface";
    id?: string;
}

const REFERENCE_LEVEL = "practico" as const;

/**
 * Rutas frecuentes como filas: foto, origen ●——○ destino, km y "Desde $X" en Práctico.
 * Dentro de zona, km y precio salen del mismo cálculo que el cotizador sin Google (content/routes).
 */
export function PopularRoutes({ lang, variant = "teaser", tone = "bg", id = "rutas" }: PopularRoutesProps) {
    const t = routesCopy[lang];
    const routes = variant === "teaser" ? popularRoutes.filter((r) => r.zone === "in").slice(0, 3) : popularRoutes;

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
            <Reveal>
                <ul className="border-t border-line">
                    {routes.map((route) => (
                        <li key={route.slug} className="border-b border-line">
                            <RouteRow route={route} lang={lang} />
                        </li>
                    ))}
                </ul>
            </Reveal>
        </Section>
    );
}

function RouteRow({ route, lang }: { route: PopularRoute; lang: Locale }) {
    const t = routesCopy[lang];
    const origin = route.origin.name[lang];
    const destination = route.destination.name[lang];
    const inZone = route.zone === "in";

    const body = (
        <>
            <Media
                src={route.image.src}
                alt=""
                position={route.image.position}
                radius="card"
                sizes="(min-width: 1024px) 208px, (min-width: 640px) 144px, 96px"
                className="row-span-2 aspect-[4/3] self-start lg:row-span-1"
            />
            <div className="min-w-0 self-center">
                <h3 className="type-subheading flex flex-wrap items-center gap-x-3 gap-y-1 transition-colors duration-fast ease group-hover:text-white">
                    <span>{origin}</span>
                    <RouteLine label={t.to} className="w-10 sm:w-14" />
                    <span>{destination}</span>
                </h3>
                <p className="type-small mt-2 text-fg-subtle">
                    <span className="tabular">{fill(inZone ? t.approxKm : t.km, { km: formatKm(route.km) })}</span>
                    {inZone ? null : <span> · {t.outOfZoneHint}</span>}
                </p>
            </div>
            <div className="flex items-center justify-between gap-6 self-center lg:justify-end">
                {inZone ? (
                    <p className="flex flex-wrap items-baseline gap-x-1.5 text-sm font-medium text-fg-subtle">
                        {t.from}
                        <span className="tabular text-[1.375rem] text-fg">{formatMXN(routePrice(REFERENCE_LEVEL, route.km))}</span>
                        {t.level}
                    </p>
                ) : (
                    <p className="flex items-center gap-2 font-medium">
                        <WhatsAppIcon className="text-fg-subtle" />
                        {t.outOfZone}
                    </p>
                )}
                <ArrowIcon className="size-5 text-fg-subtle transition-transform duration-fast ease-out group-hover:translate-x-1" />
            </div>
        </>
    );

    const rowClass =
        "group grid grid-cols-[6rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-6 lg:grid-cols-[13rem_minmax(0,1fr)_auto] lg:gap-x-10 lg:py-7";

    if (inZone) {
        return (
            <Link
                href={quoteHref(lang, { o: route.origin.id ?? undefined, d: route.destination.id ?? undefined })}
                className={rowClass}
            >
                {body}
            </Link>
        );
    }

    return (
        <a
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
