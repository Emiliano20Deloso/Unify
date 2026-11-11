"use client";

// Enlace a la misma página en el otro idioma. Es navegación suave (Link): /x y /en/x comparten el layout
// raíz [lang] y React actualiza <html lang> sin recargar. Como el layout se vuelve a montar, React no
// inicia View Transition: el clic la inicia aquí (tipo "locale": fundido cruzado sin desplazamiento,
// globals.css) y navega dentro de ella. Solo recibe su trozo de diccionario.
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LOCALE_TYPE } from "@/lib/motion";
import { localeSwapDone, navigateWithTransition } from "@/lib/motion/transition";
import { htmlLang, locales, type Locale } from "@/i18n/config";
import { switchLocalePath } from "@/i18n/routes";
import type { CommonDictionary } from "@/i18n/types";
import { cn } from "@/lib";

interface LocaleSwitchProps {
    lang: Locale;
    labels: CommonDictionary["languages"];
    ariaLabel: string;
    /** "short": ES / EN (menú). "full": Español · English (hoja móvil, pie). */
    variant?: "short" | "full";
    className?: string;
}

export function LocaleSwitch({ lang, labels, ariaLabel, variant = "short", className }: LocaleSwitchProps) {
    const pathname = usePathname() ?? "/";
    const router = useRouter();
    const short = variant === "short";

    // La página del otro idioma se precarga: al hacer clic, la transición no congela la pantalla
    // esperando la red (la captura del estado nuevo espera a que esa página esté insertada).
    useEffect(() => {
        for (const target of locales) if (target !== lang) router.prefetch(switchLocalePath(pathname, target));
    }, [router, pathname, lang]);

    const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        // Nueva pestaña, descarga, etc.: lo resuelve el navegador.
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const href = event.currentTarget.getAttribute("href");
        if (!href) return;
        if (navigateWithTransition(LOCALE_TYPE, () => router.push(href, { scroll: false }), localeSwapDone())) event.preventDefault();
    };

    return (
        <ul aria-label={ariaLabel} className={cn("flex items-center", short ? "gap-1.5" : "gap-5", className)}>
            {locales.map((target, i) => {
                const text = short ? target.toUpperCase() : labels[target];
                return (
                    <li key={target} className="flex items-center gap-1.5">
                        {short && i > 0 ? (
                            <span aria-hidden="true" className="text-fg-subtle">
                                /
                            </span>
                        ) : null}
                        {target === lang ? (
                            <span aria-current="true" lang={htmlLang[target]} className="py-3 text-fg">
                                {short ? <abbr title={labels[target]} className="no-underline">{text}</abbr> : text}
                            </span>
                        ) : (
                            <Link
                                href={switchLocalePath(pathname, target)}
                                scroll={false}
                                onClick={onClick}
                                hrefLang={htmlLang[target]}
                                lang={htmlLang[target]}
                                className="inline-flex min-h-11 items-center rounded-sm px-0.5 text-fg-muted transition-colors duration-micro ease hover:text-fg"
                            >
                                {short ? (
                                    <>
                                        <span aria-hidden="true">{text}</span>
                                        <span className="sr-only">{labels[target]}</span>
                                    </>
                                ) : (
                                    text
                                )}
                            </Link>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
