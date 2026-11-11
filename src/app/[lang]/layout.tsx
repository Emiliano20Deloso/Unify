// Layout raíz del sitio público (uno por idioma): fuentes, menú fijo, pie y proveedores de movimiento.
import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/styles/fonts";
import { htmlLang, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/params";
import { InlineScript, Providers } from "@/components/motion";
import { SiteFooter, SiteHeader } from "@/components/site";
import { site } from "@/lib/site";
import { BOOT_SCRIPT, NOSCRIPT_CSS } from "@/lib/motion/boot";

// Solo "es" y "en": cualquier otro primer segmento (p. ej. /admin/x) no entra a este layout.
export const dynamicParams = false;

export function generateStaticParams() {
    return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
    // Mismo color que --c-bg (src/styles/tokens.css): barra del navegador móvil.
    themeColor: "rgb(11, 11, 12)",
    colorScheme: "dark",
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
    const lang = await resolveLocale(params);
    const home = await getDictionary(lang, "home");
    // Valores por defecto (p. ej. para la 404); cada página define los suyos con buildMetadata.
    return {
        metadataBase: new URL(site.url),
        title: { default: home.meta.title, template: `%s | ${site.name}` },
        description: home.meta.description,
    };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
    const lang = await resolveLocale(params);
    const t = await getDictionary(lang, "common");

    return (
        // suppressHydrationWarning: el script de arranque escribe atributos en <html> antes de hidratar.
        // data-scroll-behavior: Next quita el scroll suave mientras navega (la subida al inicio no se anima).
        <html lang={htmlLang[lang]} className={fontVariables} data-scroll-behavior="smooth" suppressHydrationWarning>
            <head>
                <InlineScript html={BOOT_SCRIPT} />
                <noscript>
                    <style>{NOSCRIPT_CSS}</style>
                </noscript>
            </head>
            <body>
                <a
                    data-site-chrome
                    href="#main"
                    className="sr-only rounded-control bg-fg px-4 py-3 font-medium text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
                >
                    {t.a11y.skipToContent}
                </a>
                <Providers>
                    <SiteHeader lang={lang} t={t} />
                    <main id="main" tabIndex={-1} className="outline-none">
                        {children}
                    </main>
                    <SiteFooter lang={lang} t={t} />
                </Providers>
            </body>
        </html>
    );
}
