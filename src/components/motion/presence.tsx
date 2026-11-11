"use client";

// Entrada y salida animadas de algo que aparece por una interacción (barra móvil, avisos sueltos).
import { AnimatePresence, useIsPresent, type HTMLMotionProps } from "motion/react";
import * as m from "motion/react-m";
import { FADE_IN, FADE_OUT, SPRING } from "@/lib/motion";

const PRESETS = {
    /** Solo fundido. */
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: FADE_IN },
        exit: { opacity: 0, transition: FADE_OUT },
    },
    /** Sube 8 px al entrar; al salir se funde bajando 4 px (avisos). */
    rise: {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0, transition: { opacity: FADE_IN, y: SPRING.ui } },
        exit: { opacity: 0, y: 4, transition: FADE_OUT },
    },
    /** Entra desde abajo de su propio alto y sale hacia abajo (barra fija inferior). */
    drop: {
        initial: { opacity: 0, y: "100%" },
        animate: { opacity: 1, y: 0, transition: { opacity: FADE_IN, y: SPRING.layout } },
        exit: { opacity: 0, y: "100%", transition: { opacity: FADE_OUT, y: SPRING.ui } },
    },
    /** Hoja inferior: 24 px desde abajo con fundido, y de regreso. */
    "sheet-bottom": {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0, transition: { opacity: FADE_IN, y: SPRING.ui } },
        exit: { opacity: 0, y: 24, transition: { opacity: FADE_OUT, y: FADE_OUT } },
    },
} as const;

export type PresencePreset = keyof typeof PRESETS;

type PresenceProps = Omit<HTMLMotionProps<"div">, "initial" | "animate" | "exit" | "variants" | "transition"> & {
    show: boolean;
    preset?: PresencePreset;
};

/**
 * `<Presence show={x} preset="fade|rise|drop|sheet-bottom" className=…>…</Presence>`. Monta y desmonta
 * con animación de entrada y de salida; mientras sale lleva `aria-hidden` e `inert`. Si ya se ve al
 * cargar, no anima. Acepta las props de un div (id, role, className, style…).
 */
export function Presence({ show, preset = "fade", ...props }: PresenceProps) {
    return <AnimatePresence initial={false}>{show ? <Item key="presence" preset={preset} {...props} /> : null}</AnimatePresence>;
}

function Item({ preset, ...props }: Omit<PresenceProps, "show"> & { preset: PresencePreset }) {
    const present = useIsPresent();
    const p = PRESETS[preset];
    return (
        <m.div
            aria-hidden={present ? undefined : true}
            inert={!present}
            initial={p.initial}
            animate={p.animate}
            exit={p.exit}
            {...props}
        />
    );
}
