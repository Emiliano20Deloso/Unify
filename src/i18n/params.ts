// Lee y valida el idioma de los params de una ruta bajo [lang]. Solo servidor.
import "server-only";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "./config";

export async function resolveLocale(params: Promise<{ lang: string }>): Promise<Locale> {
    const { lang } = await params;
    if (!hasLocale(lang)) notFound();
    return lang;
}
