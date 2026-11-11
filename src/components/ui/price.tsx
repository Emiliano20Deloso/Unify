"use client";

import NumberFlow from "@number-flow/react";
import { formatMXN } from "@/lib/pricing/format";
import { cn } from "@/lib";

const FORMAT = { style: "currency", currency: "MXN", maximumFractionDigits: 0 } as const;

interface PriceProps {
    /** Pesos enteros. */
    value: number;
    /** Muestra " MXN" después de la cifra. */
    currency?: boolean;
    className?: string;
}

/**
 * Cifra en MXN que rueda al cambiar (NumberFlow; respeta reduced motion). El lector de pantalla
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
                transformTiming={{ duration: 450, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}
                spinTiming={{ duration: 450, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}
                opacityTiming={{ duration: 250, easing: "ease-out" }}
            />
        </span>
    );
}
