// Configuración de idiomas. Seguro para cliente, servidor y proxy (sin dependencias).

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

/** Idioma sin prefijo en la URL. */
export const defaultLocale: Locale = "es";

export function hasLocale(value: string): value is Locale {
    return (locales as readonly string[]).includes(value);
}

/** Valor de `<html lang>` y de hreflang. */
export const htmlLang: Record<Locale, string> = {
    es: "es-MX",
    en: "en",
};

/** Valor de `og:locale`. */
export const ogLocale: Record<Locale, string> = {
    es: "es_MX",
    en: "en_US",
};
