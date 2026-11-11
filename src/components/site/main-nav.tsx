"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localizedHref, routes, stripLocale, type RouteKey } from "@/i18n/routes";
import { cn } from "@/lib";

export const NAV_KEYS = ["services", "pricing", "about"] as const satisfies readonly RouteKey[];

interface MainNavProps {
    lang: Locale;
    labels: Record<(typeof NAV_KEYS)[number], string>;
    ariaLabel: string;
    className?: string;
}

/** Enlaces de escritorio. La página actual lleva el punto rojo de origen bajo el texto. */
export function MainNav({ lang, labels, ariaLabel, className }: MainNavProps) {
    const current = stripLocale(usePathname() ?? "/");
    return (
        <nav aria-label={ariaLabel} className={className}>
            <ul className="flex items-center gap-10">
                {NAV_KEYS.map((key) => {
                    const active = current === routes[key];
                    return (
                        <li key={key}>
                            <Link
                                href={localizedHref(lang, key)}
                                aria-current={active ? "page" : undefined}
                                className="group relative inline-flex min-h-11 items-center rounded-sm text-[0.9375rem] font-medium text-fg transition-colors duration-fast ease hover:text-white"
                            >
                                {labels[key]}
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        "absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand-ink transition-[opacity,transform] duration-base ease-out",
                                        active ? "opacity-100" : "scale-50 opacity-0",
                                    )}
                                />
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
