"use client";

import NumberFlow from "@number-flow/react";
import { cn } from "@/lib";
import { EASE_OUT, SPRING_CSS } from "@/lib/motion";
import { MinusIcon, PlusIcon } from "./icons";

/** Tiempos de la cifra que rueda: resorte ui (sin rebote) y fundido de entrada. */
const SPIN = SPRING_CSS.ui;
const FADE = { duration: 280, easing: `cubic-bezier(${EASE_OUT.join(", ")})` };

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

/**
 * − n + con botones de 44 px. El número es un spinbutton (flechas, Inicio y Fin) y rueda al cambiar
 * (NumberFlow, aria-hidden: el valor lo anuncian aria-valuenow y aria-valuetext). En un tope el botón
 * se atenúa con transición y queda `aria-disabled` en vez de `disabled`: conserva el foco aunque se
 * llegue al tope con varios clics seguidos.
 */
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
    const set = (next: number) => {
        const clamped = Math.min(max, Math.max(min, next));
        if (clamped !== value) onValueChange(clamped);
    };
    const onKeyDown = (e: React.KeyboardEvent) => {
        const keys: Record<string, number> = { ArrowUp: value + 1, ArrowRight: value + 1, ArrowDown: value - 1, ArrowLeft: value - 1, Home: min, End: max };
        if (e.key in keys) {
            e.preventDefault();
            set(keys[e.key]!);
        }
    };
    const button =
        "ctl ctl-press grid size-11 place-items-center rounded-inner text-fg [--press-scale:0.94] hover:bg-elevated aria-disabled:cursor-default aria-disabled:opacity-30 aria-disabled:hover:bg-transparent";
    const atMin = value <= min;
    const atMax = value >= max;

    return (
        <div className={cn("inline-flex items-center gap-1 rounded-control border border-line bg-surface p-1", className)}>
            <button type="button" className={button} onClick={() => set(value - 1)} aria-disabled={atMin || undefined} aria-label={decrementLabel}>
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
                aria-valuetext={String(value)}
                onKeyDown={onKeyDown}
                className="min-w-10 rounded-sm text-center text-lg font-medium tabular"
            >
                <NumberFlow aria-hidden="true" value={value} spinTiming={SPIN} transformTiming={SPIN} opacityTiming={FADE} />
            </span>
            <button type="button" className={button} onClick={() => set(value + 1)} aria-disabled={atMax || undefined} aria-label={incrementLabel}>
                <PlusIcon />
            </button>
        </div>
    );
}
