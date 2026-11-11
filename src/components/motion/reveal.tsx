"use client";

import * as m from "motion/react-m";
import type { HTMLMotionProps } from "motion/react";
import { DURATION, EASE_OUT, REVEAL_OFFSET, STAGGER_STEP } from "@/lib/motion";

const VIEWPORT = { once: true, amount: 0.2 } as const;

const item = {
    hidden: { opacity: 0, y: REVEAL_OFFSET },
    shown: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
};

type DivProps = Omit<HTMLMotionProps<"div">, "initial" | "whileInView" | "viewport" | "variants">;

interface RevealProps extends DivProps {
    /** Retraso en segundos (para escalonar a mano dos o tres bloques). */
    delay?: number;
}

/**
 * Aparece al entrar en pantalla, una sola vez (opacidad + 12 px). Los hijos pueden ser de servidor.
 * No envolver el título principal ni la imagen del hero: el contenido arriba del pliegue ya se ve.
 */
export function Reveal({ delay = 0, children, ...props }: RevealProps) {
    return (
        <m.div
            initial="hidden"
            whileInView="shown"
            viewport={VIEWPORT}
            variants={{
                hidden: item.hidden,
                shown: { ...item.shown, transition: { ...item.shown.transition, delay } },
            }}
            {...props}
        >
            {children}
        </m.div>
    );
}

/** Contenedor que escalona a sus StaggerItem (60 ms entre cada uno) al entrar en pantalla. */
export function Stagger({ children, ...props }: DivProps) {
    return (
        <m.div
            initial="hidden"
            whileInView="shown"
            viewport={VIEWPORT}
            variants={{ hidden: {}, shown: { transition: { staggerChildren: STAGGER_STEP } } }}
            {...props}
        >
            {children}
        </m.div>
    );
}

/** Hijo directo de Stagger. Acepta `as` implícito de div; para listas usa className en un <li> interior. */
export function StaggerItem({ children, ...props }: DivProps) {
    return (
        <m.div variants={item} {...props}>
            {children}
        </m.div>
    );
}
