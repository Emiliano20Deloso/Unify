"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hideIndicator, slideIndicatorTo } from "@/components/motion/sliding-indicator";
import type { Locale } from "@/i18n/config";
import { localizedHref, routes, stripLocale, type RouteKey } from "@/i18n/routes";

export const NAV_KEYS = ["services", "pricing", "about"] as const satisfies readonly RouteKey[];

interface MainNavProps {
    lang: Locale;
    labels: Record<(typeof NAV_KEYS)[number], string>;
    ariaLabel: string;
    className?: string;
}

/**
 * Enlaces de escritorio.
 * - Página actual: un solo punto rojo bajo el texto con view-transition-name "nav-dot"; al navegar, la
 *   transición lo lleva del enlace viejo al nuevo (y a la portada se desvanece). CSS en globals.css.
 * - Hover: una pastilla se desliza bajo el enlace y se desvanece al salir de la lista (SlidingIndicator,
 *   sin estado de React).
 */
export function MainNav({ lang, labels, ariaLabel, className }: MainNavProps) {
    const current = stripLocale(usePathname() ?? "/");
    const pill = useRef<HTMLLIElement>(null);

    const onPointerOver = (event: React.PointerEvent<HTMLUListElement>) => {
        if (event.pointerType === "touch" || !pill.current) return;
        const link = (event.target as HTMLElement).closest("a");
        if (link) slideIndicatorTo(pill.current, link, "x", 14);
    };
    const onPointerLeave = () => {
        if (pill.current) hideIndicator(pill.current);
    };

    return (
        <nav aria-label={ariaLabel} className={className}>
            <ul className="relative flex items-center gap-10" onPointerOver={onPointerOver} onPointerLeave={onPointerLeave}>
                {/* Pastilla de hover (decorativa: fuera del árbol de accesibilidad). */}
                <li
                    ref={pill}
                    aria-hidden="true"
                    className="sliding-indicator pointer-events-none absolute left-0 top-1/2 -mt-[18px] h-9 rounded-control bg-fg/10 opacity-0 data-[visible]:opacity-100"
                />
                {NAV_KEYS.map((key) => {
                    const active = current === routes[key];
                    return (
                        <li key={key}>
                            <Link
                                href={localizedHref(lang, key)}
                                aria-current={active ? "page" : undefined}
                                className="relative inline-flex min-h-11 items-center rounded-sm text-[0.9375rem] font-medium text-fg transition-colors duration-micro ease hover:text-white"
                            >
                                {labels[key]}
                                {active ? (
                                    <span
                                        aria-hidden="true"
                                        style={{ viewTransitionName: "nav-dot" }}
                                        className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand-ink"
                                    />
                                ) : null}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
