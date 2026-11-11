"use client";

// Fundido cruzado entre dos estados del mismo lugar (vacío → cargando → precio, texto que cambia).
import { AnimatePresence, useIsPresent } from "motion/react";
import * as m from "motion/react-m";
import { cn } from "@/lib";
import { FADE_IN, FADE_OUT, SPRING } from "@/lib/motion";

interface SwapProps {
    /** Clave del estado: cuando cambia, el contenido viejo sale y el nuevo entra. */
    id: string | number;
    /** Texto en línea: fundido cruzado puro, sin desplazamiento. */
    inline?: boolean;
    className?: string;
    children: React.ReactNode;
}

/**
 * `<Swap id={estado}>…</Swap>` (normalmente dentro de AutoHeight) o `<Swap inline id={texto}>`.
 * Entra: fundido + 6 px hacia arriba (resorte ui). Sale: fundido corto en su sitio, fuera del flujo
 * (popLayout), con `aria-hidden` e `inert`. Las regiones vivas (aria-live) van fuera del Swap.
 * Al cargar no anima: pinta el estado actual.
 */
export function Swap({ id, inline = false, className, children }: SwapProps) {
    const Wrapper = inline ? "span" : "div";
    return (
        <Wrapper className={cn("relative", inline ? "inline-block" : "block", className)}>
            <AnimatePresence mode="popLayout" initial={false}>
                <Item key={id} inline={inline}>
                    {children}
                </Item>
            </AnimatePresence>
        </Wrapper>
    );
}

function Item({ inline, children, ref }: { inline: boolean; children: React.ReactNode; ref?: React.Ref<HTMLElement> }) {
    const present = useIsPresent();
    const props = {
        "aria-hidden": present ? undefined : true,
        inert: !present,
        initial: { opacity: 0, y: inline ? 0 : 6 },
        animate: { opacity: 1, y: 0, transition: { opacity: FADE_IN, y: SPRING.ui } },
        exit: { opacity: 0, transition: FADE_OUT },
        children,
    } as const;
    return inline ? (
        <m.span ref={ref as React.Ref<HTMLSpanElement>} className="inline-block" {...props} />
    ) : (
        <m.div ref={ref as React.Ref<HTMLDivElement>} {...props} />
    );
}
