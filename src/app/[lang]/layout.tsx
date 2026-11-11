// Layout raíz del sitio público (uno por idioma). Esqueleto provisional: el header y el footer
// definitivos los construye la fase de diseño encima de esta estructura.
import "@/styles/globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib";
import { base, heading, subheading } from "@/styles/fonts";
import { htmlLang, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/params";
import { localizedHref, type RouteKey } from "@/i18n/routes";
import { LocaleSwitch } from "@/components/i18n/locale-switch";
import { site } from "@/lib/site";

// Solo "es" y "en": cualquier otro primer segmento (p. ej. /admin/x) no entra a este layout.
export const dynamicParams = false;

export function generateStaticParams() {
    return locales.map((lang) => ({ lang }));
}

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

const NAV = ["services", "pricing", "about"] as const satisfies readonly RouteKey[];

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
    const lang = await resolveLocale(params);
    const t = await getDictionary(lang, "common");
    const year = new Date().getFullYear();

    return (
        <html lang={htmlLang[lang]} className="dark">
            <body
                className={cn(
                    "min-h-screen bg-black text-foreground antialiased font-heading",
                    base.variable,
                    heading.variable,
                    subheading.variable,
                )}
            >
                <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50">
                    {t.a11y.skipToContent}
                </a>

                <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                    <Link href={localizedHref(lang, "home")} aria-label={t.a11y.home} className="font-bold">
                        {t.brand}
                    </Link>
                    <nav aria-label={t.a11y.mainNav}>
                        <ul className="flex flex-wrap gap-4">
                            {NAV.map((key) => (
                                <li key={key}>
                                    <Link href={localizedHref(lang, key)}>{t.nav[key]}</Link>
                                </li>
                            ))}
                            <li>
                                <Link href={localizedHref(lang, "pricing")}>{t.actions.quote}</Link>
                            </li>
                        </ul>
                    </nav>
                    <LocaleSwitch lang={lang} labels={t.languages} ariaLabel={t.a11y.languageSwitcher} />
                </header>

                <main id="main" tabIndex={-1}>
                    {children}
                </main>

                <footer className="px-6 py-10 text-sm">
                    <p>{t.footer.tagline}</p>
                    <nav aria-label={t.a11y.footerNav}>
                        <h2>{t.footer.navTitle}</h2>
                        <ul>
                            <li>
                                <Link href={localizedHref(lang, "home")}>{t.nav.home}</Link>
                            </li>
                            {NAV.map((key) => (
                                <li key={key}>
                                    <Link href={localizedHref(lang, key)}>{t.nav[key]}</Link>
                                </li>
                            ))}
                        </ul>
                        <h2>{t.footer.legalTitle}</h2>
                        <ul>
                            <li>
                                <Link href={localizedHref(lang, "privacy")}>{t.footer.privacy}</Link>
                            </li>
                            <li>
                                <Link href={localizedHref(lang, "terms")}>{t.footer.terms}</Link>
                            </li>
                        </ul>
                    </nav>
                    <section>
                        <h2>{t.footer.contactTitle}</h2>
                        <dl>
                            <dt>{t.contact.emailLabel}</dt>
                            <dd>
                                <a href={`mailto:${site.email}`}>{site.email}</a>
                            </dd>
                            <dt>{t.contact.whatsappLabel}</dt>
                            <dd>
                                <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer">
                                    {site.whatsapp.display}
                                </a>
                            </dd>
                            <dt>{t.contact.hoursLabel}</dt>
                            <dd>{t.contact.hours}</dd>
                            <dt>{t.contact.areaLabel}</dt>
                            <dd>{t.contact.area}</dd>
                        </dl>
                        <p>
                            <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer">
                                {t.actions.bookWhatsApp}
                            </a>
                        </p>
                    </section>
                    <p>
                        © {year} {site.name}. {t.footer.rights}
                    </p>
                </footer>
            </body>
        </html>
    );
}
