import Link from "next/link";
import { Logo } from "@/components/brand";
import { LocaleSwitch } from "@/components/i18n/locale-switch";
import { Container, RouteLine } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { localizedHref, type RouteKey } from "@/i18n/routes";
import type { CommonDictionary } from "@/i18n/types";
import { site } from "@/lib/site";

interface SiteFooterProps {
    lang: Locale;
    t: CommonDictionary;
}

const SITE_LINKS = ["home", "services", "pricing", "about"] as const satisfies readonly RouteKey[];

const link = "inline-flex min-h-11 items-center rounded-sm text-fg-muted transition-colors duration-fast ease hover:text-fg md:min-h-9";
const heading = "type-label mb-3 text-fg-subtle";

/**
 * Pie del sitio. Vive en el layout, pero entra en la transición de página con nombre propio
 * (site-footer): se desvanece y vuelve a aparecer con la página nueva (globals.css).
 */
export function SiteFooter({ lang, t }: SiteFooterProps) {
    const year = new Date().getFullYear();
    return (
        <footer data-site-chrome className="bg-bg" style={{ viewTransitionName: "site-footer" }}>
            <Container>
                <RouteLine draw />
                <div className="grid gap-12 py-section-sm md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                    <div className="flex flex-col gap-5 lg:col-span-5">
                        <Link href={localizedHref(lang, "home")} aria-label={t.a11y.home} className="flex min-h-11 items-center self-start rounded-sm">
                            <Logo title={null} className="h-8" />
                        </Link>
                        <p lang="en" className="type-lead text-fg-soft">
                            {t.footer.tagline}
                        </p>
                    </div>

                    <nav aria-label={t.a11y.footerNav} className="grid grid-cols-2 gap-8 lg:col-span-4">
                        <div>
                            <h2 className={heading}>{t.footer.navTitle}</h2>
                            <ul>
                                {SITE_LINKS.map((key) => (
                                    <li key={key}>
                                        <Link href={localizedHref(lang, key)} className={link}>
                                            {t.nav[key]}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className={heading}>{t.footer.legalTitle}</h2>
                            <ul>
                                <li>
                                    <Link href={localizedHref(lang, "privacy")} className={link}>
                                        {t.footer.privacy}
                                    </Link>
                                </li>
                                <li>
                                    <Link href={localizedHref(lang, "terms")} className={link}>
                                        {t.footer.terms}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    <section aria-labelledby="footer-contact" className="lg:col-span-3">
                        <h2 id="footer-contact" className={heading}>
                            {t.footer.contactTitle}
                        </h2>
                        <dl className="flex flex-col gap-3 text-fg-muted">
                            <div>
                                <dt className="sr-only">{t.contact.whatsappLabel}</dt>
                                <dd>
                                    <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" className={`${link} tabular`}>
                                        WhatsApp {site.whatsapp.display}
                                    </a>
                                </dd>
                            </div>
                            <div>
                                <dt className="sr-only">{t.contact.emailLabel}</dt>
                                <dd>
                                    <a href={`mailto:${site.email}`} className={link}>
                                        {site.email}
                                    </a>
                                </dd>
                            </div>
                            <div>
                                <dt className="type-label font-normal text-fg-subtle">{t.contact.hoursLabel}</dt>
                                <dd>{t.contact.hours}</dd>
                            </div>
                            <div>
                                <dt className="type-label font-normal text-fg-subtle">{t.contact.areaLabel}</dt>
                                <dd>{t.contact.area}</dd>
                            </div>
                        </dl>
                    </section>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-line py-6 text-sm text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {year} {site.name}. {t.footer.rights}
                    </p>
                    <LocaleSwitch lang={lang} labels={t.languages} ariaLabel={t.a11y.languageSwitcher} variant="full" />
                </div>
            </Container>
        </footer>
    );
}
