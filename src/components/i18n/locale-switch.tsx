"use client";

// Enlace a la misma página en el otro idioma. Es un <a> normal (recarga completa) a propósito:
// cada idioma tiene su propio <html lang>. Solo recibe su trozo de diccionario.
import { usePathname } from "next/navigation";
import { htmlLang, locales, type Locale } from "@/i18n/config";
import { switchLocalePath } from "@/i18n/routes";
import type { CommonDictionary } from "@/i18n/types";

interface LocaleSwitchProps {
    lang: Locale;
    labels: CommonDictionary["languages"];
    ariaLabel: string;
}

export function LocaleSwitch({ lang, labels, ariaLabel }: LocaleSwitchProps) {
    const pathname = usePathname() ?? "/";
    return (
        <ul aria-label={ariaLabel} className="flex gap-3">
            {locales
                .filter((target) => target !== lang)
                .map((target) => (
                    <li key={target}>
                        <a
                            href={switchLocalePath(pathname, target)}
                            hrefLang={htmlLang[target]}
                            lang={htmlLang[target]}
                            className="underline underline-offset-4"
                        >
                            {labels[target]}
                        </a>
                    </li>
                ))}
        </ul>
    );
}
