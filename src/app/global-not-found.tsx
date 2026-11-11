// 404 de toda la app para URLs sin ruta: /nada (el proxy la reescribe a /es/nada), /en/nada, /admin/nada…
// La app tiene dos layouts raíz ([lang] y admin) y el del sitio cuelga de un segmento dinámico, el caso
// para el que la guía de not-found recomienda global-not-found (experimental.globalNotFound).
// Se salta los layouts y no recibe el idioma: es una sola página estática con ambos idiomas.
import "@/styles/globals.css";
import type { Metadata } from "next";
import { site } from "@/lib/site";
import Link from "next/link";
import { BrokenRoute, Logo } from "@/components/brand";
import { Button, Container } from "@/components/ui";
import { htmlLang, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedHref } from "@/i18n/routes";
import { fontVariables } from "@/styles/fonts";
import { BOOT_SCRIPT } from "@/lib/motion/boot";
import { InlineScript } from "@/components/motion/inline-script";

export const metadata: Metadata = {
    metadataBase: new URL(site.url),
    title: "Página no encontrada · Page not found | Unify",
    description: "La página que buscas no existe o cambió de dirección.",
};

export default async function GlobalNotFound() {
    const copies = await Promise.all(locales.map(async (lang) => ({ lang, t: await getDictionary(lang, "not-found") })));

    return (
        // Otro layout raíz con su propio script de arranque: la entrada (data-enter) es CSS y el título espera
        // a las fuentes. Volver al inicio es una carga completa (solo se ve la entrada de la portada).
        <html lang={htmlLang.es} className={fontVariables} suppressHydrationWarning>
            <head>
                <InlineScript html={BOOT_SCRIPT} />
            </head>
            <body>
                <Container as="header" className="flex h-header items-center">
                    <Link href={localizedHref("es", "home")} aria-label="Unify" className="flex min-h-11 items-center rounded-sm">
                        <Logo title={null} className="h-7 lg:h-8" />
                    </Link>
                </Container>
                <main id="main">
                    {/* Contenido centrado: si cambia la fuente, todo se reacomoda. Por eso aquí toda la entrada
                        (data-enter-fonts) espera a las fuentes, invisible, y no solo el título. */}
                    <Container data-enter-fonts className="flex min-h-[calc(100svh-var(--header-h))] flex-col justify-center py-section-md">
                        <div data-enter="0">
                            <BrokenRoute />
                        </div>
                        <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
                            {copies.map(({ lang, t }, i) => {
                                const Heading = i === 0 ? "h1" : "h2";
                                return (
                                    <section
                                        key={lang}
                                        lang={htmlLang[lang]}
                                        // La línea que separa los dos idiomas entra con su texto.
                                        data-enter={i > 0 ? "2" : undefined}
                                        className={i > 0 ? "border-t border-line pt-12 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0" : undefined}
                                    >
                                        <Heading data-enter="1" className="type-title">
                                            {t.title}
                                        </Heading>
                                        <p data-enter="2" className="type-lead mt-5 max-w-[30rem] text-fg-subtle">
                                            {t.body}
                                        </p>
                                        <Button asChild data-enter="3" variant={i === 0 ? "primary" : "secondary"} className="mt-8">
                                            <Link href={localizedHref(lang, "home")} hrefLang={htmlLang[lang]}>
                                                {t.backHome}
                                            </Link>
                                        </Button>
                                    </section>
                                );
                            })}
                        </div>
                    </Container>
                </main>
            </body>
        </html>
    );
}
