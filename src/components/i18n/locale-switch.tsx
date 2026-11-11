"use client";

// Enlace a la misma página en el otro idioma. Es un <a> normal (recarga completa) a propósito:
// cada idioma tiene su propio <html lang>. Solo recibe su trozo de diccionario.
import { usePathname } from "next/navigation";
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
    const short = variant === "short";

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
                            <a
                                href={switchLocalePath(pathname, target)}
                                hrefLang={htmlLang[target]}
                                lang={htmlLang[target]}
                                className="inline-flex min-h-11 items-center rounded-sm px-0.5 text-fg-muted transition-colors duration-fast ease hover:text-fg"
                            >
                                {short ? (
                                    <>
                                        <span aria-hidden="true">{text}</span>
                                        <span className="sr-only">{labels[target]}</span>
                                    </>
                                ) : (
                                    text
                                )}
                            </a>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
