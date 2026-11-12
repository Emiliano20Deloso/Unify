"use client";

import NumberFlow from "@number-flow/react";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib";
import { EASE_OUT, SPRING_CSS } from "@/lib/motion";

interface StatProps {
    /** Cifra ya formateada: "+1,500", "98 %". Usa espacio fino no separable antes de "%". */
    value: string;
    label: string;
    className?: string;
}

/** "+1,500" → { prefix: "+", number: 1500, suffix: "" }. Agrupación con coma (es-MX y en-US). */
function parse(value: string) {
    const match = /^(\D*?)(\d[\d,]*)(\D*)$/.exec(value);
    if (!match) return null;
    const [, prefix = "", digits = "", suffix = ""] = match;
    return { prefix, number: Number(digits.replace(/,/g, "")), suffix };
}

/** Rueda de 0 a su valor con el resorte layout (sin rebote); los dígitos nuevos entran con fundido. */
const SPIN = SPRING_CSS.layout;
const FADE = { duration: 280, easing: `cubic-bezier(${EASE_OUT.join(", ")})` };

/**
 * Cifra grande (Archivo extendida, tabular) con su etiqueta al lado, alineadas por la base.
 * Dentro de un Reveal, rueda de 0 a su valor cuando el Reveal entra en pantalla (una sola vez). Si ya
 * estaba a la vista al hidratar, con movimiento reducido o sin JS, se pinta el texto final tal cual.
 * La caja la fija el texto final (invisible): la etiqueta no se recorre y nada brinca al hidratar.
 */
export function Stat({ value, label, className }: StatProps) {
    const parts = parse(value);
    const ref = useRef<HTMLSpanElement>(null);
    // null: texto final (como en el servidor) · número: NumberFlow con ese valor.
    const [shown, setShown] = useState<number | null>(null);

    useLayoutEffect(() => {
        const node = ref.current;
        const reveal = node?.closest("[data-reveal]");
        if (!parts || !reveal || reveal.hasAttribute("data-shown")) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        // Todavía oculto (opacidad 0): se cambia al contador en 0 antes de pintar, sin que se vea.
        // eslint-disable-next-line react-hooks/set-state-in-effect -- depende del DOM tras hidratar (data-shown)
        setShown(0);
        const observer = new MutationObserver(() => {
            if (!reveal.hasAttribute("data-shown")) return;
            observer.disconnect();
            setShown(parts.number);
        });
        observer.observe(reveal, { attributes: true, attributeFilter: ["data-shown"] });
        return () => observer.disconnect();
        // Solo al montar: el valor no cambia.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <p className={cn("flex items-baseline gap-3.5", className)}>
            <span ref={ref} className="type-title tabular relative">
                {shown === null || !parts ? (
                    value
                ) : (
                    <>
                        <span className="sr-only">{value}</span>
                        {/* El texto final (invisible) fija el ancho, el alto y la línea base: nada se mueve al
                            montar el contador. El contador va encima, centrado en alto (su caja es más alta por
                            la máscara de NumberFlow). Al imprimir se ve el texto final (sin scroll pudo quedarse en 0). */}
                        <span aria-hidden="true" className="invisible print:visible">
                            {value}
                        </span>
                        <NumberFlow
                            aria-hidden="true"
                            className="absolute left-0 top-1/2 -translate-y-1/2 print:hidden"
                            value={shown}
                            locales="en-US"
                            format={{ useGrouping: true, maximumFractionDigits: 0 }}
                            prefix={parts.prefix || undefined}
                            suffix={parts.suffix || undefined}
                            transformTiming={SPIN}
                            spinTiming={SPIN}
                            opacityTiming={FADE}
                            trend={1}
                        />
                    </>
                )}
            </span>
            <span className="font-medium text-fg-subtle">{label}</span>
        </p>
    );
}
