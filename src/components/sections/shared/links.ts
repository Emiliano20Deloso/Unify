// Enlaces al cotizador de /tarifas con datos precargados (?n=nivel, ?o=origen, ?d=destino).
import type { Locale } from "@/i18n/config";
import { localizedHref } from "@/i18n/routes";

type QuoteParams = { n?: string; o?: string; d?: string };

/** /tarifas?…#cotizar en el idioma pedido. Los ":" de los ids del catálogo se dejan legibles. */
export function quoteHref(lang: Locale, params: QuoteParams = {}): string {
    const query = Object.entries(params)
        .filter((entry): entry is [string, string] => Boolean(entry[1]))
        .map(([key, value]) => `${key}=${encodeURIComponent(value).replace(/%3A/gi, ":")}`)
        .join("&");
    return `${localizedHref(lang, "pricing")}${query ? `?${query}` : ""}#cotizar`;
}
