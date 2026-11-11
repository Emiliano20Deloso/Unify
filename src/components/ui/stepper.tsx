"use client";

import { cn } from "@/lib";
import { MinusIcon, PlusIcon } from "./icons";

interface StepperProps {
    value: number;
    onValueChange: (value: number) => void;
    min?: number;
    max?: number;
    /** Nombre del valor (p. ej. "Pasajeros"). Si hay una etiqueta visible, pasa su id en labelledBy. */
    label?: string;
    labelledBy?: string;
    decrementLabel: string;
    incrementLabel: string;
    className?: string;
}

/** − n + con botones de 44 px. El número es un spinbutton: también responde a flechas, Inicio y Fin. */
export function Stepper({
    value,
    onValueChange,
    min = 0,
    max = 99,
    label,
    labelledBy,
    decrementLabel,
    incrementLabel,
    className,
}: StepperProps) {
    const set = (next: number) => onValueChange(Math.min(max, Math.max(min, next)));
    const onKeyDown = (e: React.KeyboardEvent) => {
        const keys: Record<string, number> = { ArrowUp: value + 1, ArrowRight: value + 1, ArrowDown: value - 1, ArrowLeft: value - 1, Home: min, End: max };
        if (e.key in keys) {
            e.preventDefault();
            set(keys[e.key]!);
        }
    };
    const button =
        "grid size-11 place-items-center rounded-inner text-fg transition-[background-color,transform] duration-fast ease hover:bg-elevated active:scale-95 disabled:pointer-events-none disabled:opacity-30";

    return (
        <div className={cn("inline-flex items-center gap-1 rounded-control border border-line bg-surface p-1", className)}>
            <button type="button" className={button} onClick={() => set(value - 1)} disabled={value <= min} aria-label={decrementLabel}>
                <MinusIcon />
            </button>
            <span
                role="spinbutton"
                tabIndex={0}
                aria-label={labelledBy ? undefined : label}
                aria-labelledby={labelledBy}
                aria-valuenow={value}
                aria-valuemin={min}
                aria-valuemax={max}
                onKeyDown={onKeyDown}
                className="min-w-10 rounded-sm text-center text-lg font-medium tabular"
            >
                {value}
            </span>
            <button type="button" className={button} onClick={() => set(value + 1)} disabled={value >= max} aria-label={incrementLabel}>
                <PlusIcon />
            </button>
        </div>
    );
}
