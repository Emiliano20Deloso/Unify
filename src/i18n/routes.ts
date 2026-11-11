// Rutas públicas por idioma. Mismo slug en ambos idiomas; el inglés lleva el prefijo /en.
// Seguro para cliente, servidor y proxy.
import { defaultLocale, htmlLang, locales, type Locale } from "./config";

export const routes = {
    home: "/",
    services: "/servicios",
    pricing: "/tarifas",
    about: "/nosotros",
    privacy: "/privacidad",
    terms: "/terminos",
} as const;

export type RouteKey = keyof typeof routes;

export const routeKeys = Object.keys(routes) as RouteKey[];

function prefix(lang: Locale): string {
    return lang === defaultLocale ? "" : `/${lang}`;
}

/** Une el prefijo de idioma con una ruta interna ("/" o "/x"). */
function withLocale(lang: Locale, path: string): string {
    const p = prefix(lang);
    if (path === "/") return p || "/";
    return `${p}${path}`;
}

/** Enlace a una página en un idioma. `hash` sin "#" (p. ej. "cotizar"). */
export function localizedHref(lang: Locale, key: RouteKey, hash?: string): string {
    const href = withLocale(lang, routes[key]);
    return hash ? `${href}#${hash}` : href;
}

/**
 * Mapa hreflang → ruta relativa, para `alternates.languages` de la metadata y el sitemap.
 * Incluye `x-default` (el español, que vive sin prefijo).
 */
export function alternates(key: RouteKey): Record<string, string> {
    const languages: Record<string, string> = {};
    for (const lang of locales) {
        languages[htmlLang[lang]] = localizedHref(lang, key);
    }
    languages["x-default"] = localizedHref(defaultLocale, key);
    return languages;
}

/** Quita el prefijo de idioma de una ruta pública: "/en/tarifas" → "/tarifas", "/en" → "/". */
export function stripLocale(pathname: string): string {
    for (const lang of locales) {
        if (pathname === `/${lang}`) return "/";
        if (pathname.startsWith(`/${lang}/`)) return pathname.slice(lang.length + 1);
    }
    return pathname || "/";
}

/** La misma página en otro idioma (para el selector de idioma). Conserva rutas desconocidas. */
export function switchLocalePath(pathname: string, lang: Locale): string {
    return withLocale(lang, stripLocale(pathname));
}
