"use client";

// Despliegue y pliegue con alto animado (0 ↔ auto) y fundido. Cerrado = desmontado (no recibe Tab).
import { useRef } from "react";
import { AnimatePresence, useIsPresent } from "motion/react";
import * as m from "motion/react-m";
import { FADE_IN, FADE_OUT, SPRING } from "@/lib/motion";

interface CollapseProps {
    open: boolean;
    /** id estable del panel (para aria-controls / aria-describedby). */
    id?: string;
    className?: string;
    children: React.ReactNode;
}

const variants = {
    closed: { height: 0, opacity: 0 },
    open: { height: "auto", opacity: 1, transition: { height: SPRING.layout, opacity: { ...FADE_IN, delay: 0.06 } } },
    exit: { height: 0, opacity: 0, transition: { height: SPRING.ui, opacity: FADE_OUT } },
};

/**
 * `<Collapse open={x}>…</Collapse>`. Entra: alto con resorte layout y fundido con 60 ms de retraso.
 * Sale: fundido corto y alto con resorte ui; mientras sale lleva `inert`. Si ya está abierto al
 * cargar, no anima (lo pinta el servidor tal cual). Con movimiento reducido el alto cambia al instante
 * y solo queda el fundido (MotionConfig reducedMotion="user").
 */
export function Collapse({ open, id, className, children }: CollapseProps) {
    return (
        <AnimatePresence initial={false}>
            {open ? (
                <Panel key="collapse" id={id} className={className}>
                    {children}
                </Panel>
            ) : null}
        </AnimatePresence>
    );
}

function Panel({ id, className, children }: Omit<CollapseProps, "open">) {
    const ref = useRef<HTMLDivElement>(null);
    const present = useIsPresent();
    // overflow recortado solo mientras anima: en reposo no corta el anillo de foco ni listas flotantes.
    const clip = (on: boolean) => {
        if (ref.current) ref.current.style.overflow = on ? "clip" : "";
    };
    return (
        <m.div
            ref={ref}
            id={id}
            className={className}
            inert={!present}
            initial="closed"
            animate="open"
            exit="exit"
            variants={variants}
            style={{ overflowClipMargin: 6 }}
            onAnimationStart={() => clip(true)}
            onAnimationComplete={(def) => clip(def !== "open")}
        >
            {children}
        </m.div>
    );
}
