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

/**
 * Elegir uno entre pocos (nivel de servicio). Radios nativos: flechas para moverse, funciona en
 * formularios. Opción elegida: línea clara, superficie elevada y el punto de origen.
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
    return (
        <fieldset className={cn("grid gap-3", className)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
            <legend className="sr-only">{legend}</legend>
            {options.map((option) => {
                const checked = option.value === value;
                return (
                    <label
                        key={option.value}
                        className={cn(
                            "relative flex min-h-[72px] cursor-pointer select-none flex-col justify-center gap-1.5 rounded-control border px-4 py-3 md:min-h-24 md:px-5",
                            "transition-[border-color,background-color,transform] duration-fast ease active:scale-[0.98]",
                            "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[3px] has-[:focus-visible]:outline-fg",
                            checked ? "border-fg bg-elevated" : "border-line hover:border-line-strong",
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
                        <span className={cn("flex items-center justify-between gap-2 text-[0.9375rem] font-medium", checked ? "text-fg" : "text-fg-subtle")}>
                            {option.label}
                            {checked && selectedLabel ? (
                                <span className="type-label hidden items-center gap-1.5 text-brand-ink sm:flex">
                                    <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-ink" />
                                    {selectedLabel}
                                </span>
                            ) : null}
                        </span>
                        {option.detail ? <span className="text-xl font-medium tabular md:text-2xl">{option.detail}</span> : null}
                    </label>
                );
            })}
        </fieldset>
    );
}
