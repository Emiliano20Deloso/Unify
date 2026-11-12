import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { alternates, localizedHref, routeKeys } from "@/i18n/routes";
import { absoluteUrl } from "@/lib/site";

// Las 6 páginas en cada idioma, cada una con sus alternativas hreflang.
export default function sitemap(): MetadataRoute.Sitemap {
    return routeKeys.flatMap((key) => {
        const languages = Object.fromEntries(
            Object.entries(alternates(key)).map(([hreflang, href]) => [hreflang, absoluteUrl(href)]),
        );
        return locales.map((lang) => ({
            url: absoluteUrl(localizedHref(lang, key)),
            changeFrequency: "monthly" as const,
            priority: key === "home" ? 1 : 0.7,
            alternates: { languages },
        }));
    });
}
