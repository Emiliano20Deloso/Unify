// Metadata por página e idioma: canonical, hreflang, Open Graph y Twitter.
// La imagen de Open Graph la agrega la fase de diseño (opengraph-image o `images` aquí).
import type { Metadata } from "next";
import { locales, ogLocale, type Locale } from "@/i18n/config";
import { alternates, localizedHref, type RouteKey } from "@/i18n/routes";
import { site } from "@/lib/site";

export interface BuildMetadataArgs {
    lang: Locale;
    route: RouteKey;
    title: string;
    description: string;
    noIndex?: boolean;
}

export function buildMetadata({ lang, route, title, description, noIndex = false }: BuildMetadataArgs): Metadata {
    const url = localizedHref(lang, route);
    // La portada usa su título completo; el resto lleva la marca al final.
    const fullTitle = route === "home" ? title : `${title} | ${site.name}`;

    return {
        metadataBase: new URL(site.url),
        title: { absolute: fullTitle },
        description,
        applicationName: site.name,
        alternates: {
            canonical: url,
            languages: alternates(route),
        },
        openGraph: {
            type: "website",
            siteName: site.name,
            title: fullTitle,
            description,
            url,
            locale: ogLocale[lang],
            alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocale[l]),
        },
        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description,
        },
        formatDetection: { email: false, address: false, telephone: false },
        ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    };
}
