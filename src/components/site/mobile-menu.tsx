"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand";
import { LocaleSwitch } from "@/components/i18n/locale-switch";
import { Button, MenuIcon, Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { localizedHref, routes, stripLocale } from "@/i18n/routes";
import type { CommonDictionary } from "@/i18n/types";
import { cn } from "@/lib";
import { site } from "@/lib/site";
import { NAV_KEYS } from "./main-nav";

interface MobileMenuProps {
    lang: Locale;
    t: Pick<CommonDictionary, "nav" | "actions" | "a11y" | "languages" | "contact">;
    className?: string;
}

/** Móvil y tablet: hoja a pantalla completa con enlaces grandes, idioma y contacto. */
export function MobileMenu({ lang, t, className }: MobileMenuProps) {
    const current = stripLocale(usePathname() ?? "/");
    const keys = ["home", ...NAV_KEYS] as const;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t.a11y.openMenu} className={className}>
                    <MenuIcon className="size-[22px]" />
                </Button>
            </SheetTrigger>
            <SheetContent
                variant="full"
                closeLabel={t.a11y.closeMenu}
                aria-describedby={undefined}
                header={
                    <SheetClose asChild>
                        <Link href={localizedHref(lang, "home")} aria-label={t.a11y.home} className="flex min-h-11 items-center rounded-sm">
                            <Logo title={null} className="h-7" />
                        </Link>
                    </SheetClose>
                }
            >
                <SheetTitle className="sr-only">{t.a11y.menu}</SheetTitle>
                <nav aria-label={t.a11y.mainNav} className="pt-6">
                    <ul className="flex flex-col">
                        {keys.map((key) => {
                            const active = current === routes[key];
                            return (
                                <li key={key} className="border-b border-line">
                                    <SheetClose asChild>
                                        <Link
                                            href={localizedHref(lang, key)}
                                            aria-current={active ? "page" : undefined}
                                            className="type-heading flex min-h-[72px] items-center justify-between gap-4 rounded-sm"
                                        >
                                            {t.nav[key]}
                                            <span
                                                aria-hidden="true"
                                                className={cn("size-2 rounded-full", active ? "bg-brand-ink" : "border-[1.5px] border-route")}
                                            />
                                        </Link>
                                    </SheetClose>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <SheetClose asChild>
                    <Button asChild size="lg" className="mt-8 w-full">
                        <Link href={localizedHref(lang, "pricing", "cotizar")}>{t.actions.quote}</Link>
                    </Button>
                </SheetClose>

                <div className="mt-auto flex flex-col gap-6 pt-12">
                    <LocaleSwitch lang={lang} labels={t.languages} ariaLabel={t.a11y.languageSwitcher} variant="full" className="font-medium" />
                    <ul className="flex flex-col gap-1 text-fg-muted">
                        <li>
                            <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-3 rounded-sm hover:text-fg">
                                <span className="text-fg-subtle">{t.contact.whatsappLabel}</span>
                                <span className="tabular">{site.whatsapp.display}</span>
                            </a>
                        </li>
                        <li>
                            <a href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center gap-3 rounded-sm hover:text-fg">
                                <span className="text-fg-subtle">{t.contact.emailLabel}</span>
                                {site.email}
                            </a>
                        </li>
                    </ul>
                    <p className="type-label font-normal text-fg-subtle">
                        {t.contact.hoursLabel}: {t.contact.hours}
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
