// Metadata por página e idioma: canonical, hreflang, Open Graph y Twitter.
// Imagen de Open Graph: public/opengraph-image.jpg (la genera scripts/brand-assets.mjs).
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

const OG_IMAGE_ALT: Record<Locale, string> = {
    es: "Unify: Tesla Model 3 gris en una carretera al anochecer, con el logotipo de Unify.",
    en: "Unify: grey Tesla Model 3 on a road at dusk, with the Unify logo.",
};

export function buildMetadata({ lang, route, title, description, noIndex = false }: BuildMetadataArgs): Metadata {
    const url = localizedHref(lang, route);
    // La portada usa su título completo; el resto lleva la marca al final.
    const fullTitle = route === "home" ? title : `${title} | ${site.name}`;
    const images = [{ url: "/opengraph-image.jpg", width: 1200, height: 630, alt: OG_IMAGE_ALT[lang] }];

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
            images,
        },
        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description,
            images,
        },
        formatDetection: { email: false, address: false, telephone: false },
        ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    };
}
