// 404 de toda la app para URLs sin ruta: /nada (el proxy la reescribe a /es/nada), /en/nada, /admin/nada…
// La app tiene dos layouts raíz ([lang] y admin) y el del sitio cuelga de un segmento dinámico, el caso
// para el que la guía de not-found recomienda global-not-found (experimental.globalNotFound).
// Se salta los layouts y no recibe el idioma: es una sola página estática con ambos idiomas.
import "@/styles/globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { htmlLang, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedHref } from "@/i18n/routes";

export const metadata: Metadata = {
    title: "Página no encontrada · Page not found | Unify",
    description: "La página que buscas no existe o cambió de dirección.",
};

export default async function GlobalNotFound() {
    const copies = await Promise.all(locales.map(async (lang) => ({ lang, t: await getDictionary(lang, "not-found") })));

    return (
        <html lang={htmlLang.es} className="dark">
            <body className="min-h-screen bg-black text-foreground antialiased">
                <main id="main" className="px-6 py-16">
                    {copies.map(({ lang, t }, i) => (
                        <section key={lang} lang={htmlLang[lang]} className={i > 0 ? "mt-12" : undefined}>
                            {i === 0 ? (
                                <h1 className="text-4xl font-bold">{t.title}</h1>
                            ) : (
                                <h2 className="text-2xl font-bold">{t.title}</h2>
                            )}
                            <p className="mt-4">{t.body}</p>
                            <p className="mt-6">
                                <Link href={localizedHref(lang, "home")} hrefLang={htmlLang[lang]} className="underline underline-offset-4">
                                    {t.backHome}
                                </Link>
                            </p>
                        </section>
                    ))}
                </main>
            </body>
        </html>
    );
}
