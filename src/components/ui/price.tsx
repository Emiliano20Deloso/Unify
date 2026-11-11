"use client";

import NumberFlow from "@number-flow/react";
import { formatMXN } from "@/lib/pricing/format";
import { cn } from "@/lib";
import { EASE_OUT, SPRING_CSS } from "@/lib/motion";

const FORMAT = { style: "currency", currency: "MXN", maximumFractionDigits: 0 } as const;
/** Las cifras ruedan y se reacomodan con el resorte ui (sin rebote); los dígitos nuevos entran con fundido. */
const SPIN = SPRING_CSS.ui;
const FADE = { duration: 280, easing: `cubic-bezier(${EASE_OUT.join(", ")})` };

interface PriceProps {
    /** Pesos enteros. */
    value: number;
    /** Muestra " MXN" después de la cifra. */
    currency?: boolean;
    className?: string;
}

/**
 * Cifra en MXN que rueda al cambiar con el resorte ui (NumberFlow; respeta reduced motion). El lector de pantalla
 * recibe el texto de formatMXN, no los dígitos animados. Tamaño y peso por className (type-figure…).
 */
export function Price({ value, currency = false, className }: PriceProps) {
    const text = `${formatMXN(value)}${currency ? " MXN" : ""}`;
    return (
        <span className={cn("tabular inline-flex items-baseline whitespace-nowrap", className)}>
            <span className="sr-only">{text}</span>
            <NumberFlow
                aria-hidden="true"
                value={value}
                locales="es-MX"
                format={FORMAT}
                suffix={currency ? " MXN" : undefined}
                transformTiming={SPIN}
                spinTiming={SPIN}
                opacityTiming={FADE}
            />
        </span>
    );
}
