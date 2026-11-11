import Link from "next/link";
import { Logo } from "@/components/brand";
import { LocaleSwitch } from "@/components/i18n/locale-switch";
import { Button, Container } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { localizedHref } from "@/i18n/routes";
import type { CommonDictionary } from "@/i18n/types";
import { HeaderFrame } from "./header-frame";
import { MainNav } from "./main-nav";
import { MobileMenu } from "./mobile-menu";

interface SiteHeaderProps {
    lang: Locale;
    t: CommonDictionary;
}

/** Menú del sitio (64 px móvil · 88 px escritorio). Las páginas compensan su alto con --header-h. */
export function SiteHeader({ lang, t }: SiteHeaderProps) {
    return (
        <HeaderFrame>
            <Container className="grid h-header grid-cols-[1fr_auto] items-center gap-4 pr-[calc(var(--gutter)-0.75rem)] lg:grid-cols-[1fr_auto_1fr] lg:pr-gutter">
                <Link href={localizedHref(lang, "home")} aria-label={t.a11y.home} className="flex min-h-11 items-center justify-self-start rounded-sm">
                    <Logo title={null} className="h-7 lg:h-8" />
                </Link>

                <MainNav lang={lang} labels={t.nav} ariaLabel={t.a11y.mainNav} className="hidden lg:block" />

                <div className="flex items-center gap-1 justify-self-end lg:gap-7">
                    <LocaleSwitch
                        lang={lang}
                        labels={t.languages}
                        ariaLabel={t.a11y.languageSwitcher}
                        className="hidden text-sm font-medium lg:flex"
                    />
                    <Button asChild size="sm">
                        <Link href={localizedHref(lang, "pricing", "cotizar")}>{t.actions.quote}</Link>
                    </Button>
                    <MobileMenu lang={lang} t={t} className="lg:hidden" />
                </div>
            </Container>
        </HeaderFrame>
    );
}
