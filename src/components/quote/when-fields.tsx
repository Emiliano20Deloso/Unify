"use client";

// Fecha y hora con el aspecto de la maqueta ("vie 20 nov" · "10:30").
// Fecha: input nativo transparente encima de la etiqueta formateada (selector del sistema, teclado
// y lector de pantalla siguen funcionando). Hora: select nativo cada 15 min (24 h, rueda en móvil).
// Los valores que dependen del borrador llevan data-draft-value (se funden al restaurarlo).
import { useId, useLayoutEffect, useRef } from "react";
import { InlineScript } from "@/components/motion/inline-script";
import type { Locale } from "@/i18n/types";
import { cn } from "@/lib";
import { dateCellScript } from "@/lib/quote/date-fill";
import { formatShortDate, timeOptions } from "@/lib/quote/format";
import { enterValue } from "./motion";

interface CellProps {
    label: string;
    className?: string;
    labelClassName?: string;
    valueClassName?: string;
    invalid?: boolean;
    errorId?: string;
}

export function DateCell({
    label,
    lang,
    value,
    min,
    onChange,
    className,
    labelClassName,
    valueClassName,
    invalid,
    errorId,
    fill = false,
}: CellProps & {
    lang: Locale;
    value: string;
    min: string;
    onChange: (v: string) => void;
    /**
     * La celda muestra la fecha por defecto (mañana) desde la primera pintura: el servidor no conoce
     * el día y un script en línea la escribe antes de pintar (sin cambio al hidratar).
     */
    fill?: boolean;
}) {
    const id = useId();
    // La fecha nueva entra con fundido (al restaurar un borrador lo hace [data-draft-value]).
    const text = useRef<HTMLSpanElement>(null);
    const last = useRef(value);
    useLayoutEffect(() => {
        if (last.current === value) return;
        const first = last.current === "";
        last.current = value;
        if (first || document.documentElement.hasAttribute("data-quote-restore")) return;
        enterValue(text.current, 4);
    }, [value]);
    return (
        <div className={cn("relative flex min-w-0 flex-col", className)}>
            <label htmlFor={id} className={cn("type-label text-fg-subtle", labelClassName)}>
                {label}
            </label>
            <span ref={text} aria-hidden="true" data-date-text="" data-draft-value="" suppressHydrationWarning className={cn("truncate font-medium", valueClassName)}>
                {formatShortDate(value, lang) || " "}
            </span>
            <input
                id={id}
                type="date"
                value={value}
                min={min || undefined}
                suppressHydrationWarning
                required
                aria-invalid={invalid || undefined}
                aria-describedby={errorId}
                onChange={(e) => {
                    if (e.target.value) onChange(e.target.value);
                }}
                onClick={(e) => {
                    try {
                        e.currentTarget.showPicker();
                    } catch {
                        /* sin showPicker: el navegador abre su selector */
                    }
                }}
                className="absolute inset-0 size-full cursor-pointer opacity-0 [color-scheme:dark] focus-visible:outline-none"
            />
            {fill ? <InlineScript html={dateCellScript(lang)} /> : null}
        </div>
    );
}

export function TimeCell({
    label,
    value,
    onChange,
    className,
    labelClassName,
    valueClassName,
    invalid,
    errorId,
}: CellProps & { value: string; onChange: (v: string) => void }) {
    const id = useId();
    const options = timeOptions(value);
    return (
        <div className={cn("relative flex min-w-0 flex-col", className)}>
            <label htmlFor={id} className={cn("type-label text-fg-subtle", labelClassName)}>
                {label}
            </label>
            <select
                id={id}
                value={value}
                data-draft-value=""
                aria-invalid={invalid || undefined}
                aria-describedby={errorId}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "w-full cursor-pointer appearance-none bg-transparent font-medium tabular text-fg focus-visible:outline-none",
                    valueClassName,
                )}
            >
                {value === "" ? <option value="" disabled /> : null}
                {options.map((t) => (
                    <option key={t} value={t} className="bg-elevated text-fg">
                        {t}
                    </option>
                ))}
            </select>
        </div>
    );
}

/** Contorno de foco en la celda entera (el control interno no dibuja el suyo). */
export const cellFocus =
    "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-fg";
