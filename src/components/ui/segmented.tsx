"use client";

import { cn } from "@/lib";

export interface SegmentedOption<V extends string> {
    value: V;
    label: string;
    /** Línea grande bajo la etiqueta (p. ej. el precio: <Price value={450} />). */
    detail?: React.ReactNode;
}

interface SegmentedProps<V extends string> {
    /** Nombre del grupo para formularios y para agrupar los radios. */
    name: string;
    /** Título del grupo (se lee, no se ve: el contexto visual ya lo explica). */
    legend: string;
    options: readonly SegmentedOption<V>[];
    value: V;
    onValueChange: (value: V) => void;
    /** Texto junto al punto en la opción elegida (p. ej. "Elegido"). */
    selectedLabel?: string;
    className?: string;
}

type Vars = React.CSSProperties & Record<`--${string}`, number>;

/**
 * Elegir uno entre pocos (nivel de servicio). Radios nativos: flechas para moverse, funciona en
 * formularios. Una sola pastilla (línea clara y superficie elevada, `[data-indicator]`) se desliza a
 * la opción elegida con el resorte ui: columnas iguales, posición calculada por índice, sin medir
 * (correcta desde el HTML del servidor). "Elegido" está montado en todas y solo cambia opacidad y 4 px.
 * Movimiento reducido: sin pastilla; la opción elegida cambia de fondo y borde con fundido.
 */
export function Segmented<V extends string>({
    name,
    legend,
    options,
    value,
    onValueChange,
    selectedLabel,
    className,
}: SegmentedProps<V>) {
    const index = options.findIndex((option) => option.value === value);
    const vars: Vars = { "--seg-n": options.length, "--seg-i": Math.max(index, 0) };

    return (
        <fieldset className={cn("min-w-0", className)}>
            <legend className="sr-only">{legend}</legend>
            <div className="segmented" style={vars}>
                <span
                    aria-hidden="true"
                    data-indicator=""
                    data-visible={index >= 0 ? "" : undefined}
                    className="sliding-indicator segmented__pill rounded-control border border-fg bg-elevated"
                />
                {options.map((option) => {
                    const checked = option.value === value;
                    return (
                        <label
                            key={option.value}
                            data-checked={checked ? "" : undefined}
                            className={cn(
                                "ctl ctl-press relative flex min-h-[72px] cursor-pointer select-none flex-col justify-center gap-1.5 rounded-control border px-4 py-3 [--press-scale:0.98] md:min-h-24 md:px-5",
                                checked ? "border-line" : "border-line hover:border-line-strong",
                            )}
                        >
                            <input
                                type="radio"
                                name={name}
                                value={option.value}
                                checked={checked}
                                onChange={() => onValueChange(option.value)}
                                className="sr-only"
                            />
                            <span
                                className={cn(
                                    "flex items-center justify-between gap-2 text-[0.9375rem] font-medium transition-colors duration-micro ease",
                                    checked ? "text-fg" : "text-fg-subtle",
                                )}
                            >
                                {option.label}
                                {selectedLabel ? (
                                    <span aria-hidden={checked ? undefined : true} className="segmented__tag type-label hidden items-center gap-1.5 text-brand-ink sm:flex">
                                        <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-ink" />
                                        {selectedLabel}
                                    </span>
                                ) : null}
                            </span>
                            {option.detail ? <span className="text-xl font-medium tabular md:text-2xl">{option.detail}</span> : null}
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}
