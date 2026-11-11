// Aparición al entrar en pantalla, sin motion ni JS de React: el Server Component pinta atributos y
// el script de arranque (src/lib/motion/boot.ts) marca data-shown con un IntersectionObserver.
// CSS en src/styles/globals.css (§ Aparición al hacer scroll). Funciona antes de hidratar y en cada
// navegación suave. Sin JS (o si el script falla) todo se ve desde el principio.
import type { CSSProperties, ElementType, HTMLAttributes } from "react";

/** title: sube 18 px · text e item: 14 px · media: escala 1.03 → 1 · figure: como text (las cifras ruedan aparte). */
export type RevealVariant = "title" | "text" | "media" | "item" | "figure";

interface RevealProps extends HTMLAttributes<HTMLElement> {
    /** Etiqueta (div por defecto). */
    as?: ElementType;
    variant?: RevealVariant;
    /** Posición dentro de un escalonado: retraso index × 60 ms. */
    index?: number;
    /** Retraso extra en milisegundos. */
    delay?: number;
}

type Vars = CSSProperties & Record<`--${string}`, string | number>;

function vars(style: CSSProperties | undefined, index?: number, delay?: number): CSSProperties | undefined {
    if (index === undefined && delay === undefined) return style;
    const next: Vars = { ...style };
    if (index !== undefined) next["--i"] = index;
    if (delay !== undefined) next["--d"] = `${delay}ms`;
    return next;
}

/**
 * Aparece una vez al entrar en pantalla (opacidad + desplazamiento corto). Los hijos siguen siendo
 * de servidor. Lo que ya está en pantalla en la primera pintura se queda visible sin animar.
 * No usar en cabeceras (para eso, data-enter) ni en el cotizador.
 */
export function Reveal({ as: Tag = "div", variant = "text", index, delay, style, ...props }: RevealProps) {
    return <Tag data-reveal={variant} suppressHydrationWarning style={vars(style, index, delay)} {...props} />;
}

/**
 * Revela a todos sus `<Reveal index={i}>` a la vez, escalonados (60 ms entre cada uno), cuando el
 * grupo asoma. Los Reveal dentro de un grupo no se observan por separado.
 */
export function RevealGroup({ as: Tag = "div", ...props }: HTMLAttributes<HTMLElement> & { as?: ElementType }) {
    return <Tag data-reveal-group="" suppressHydrationWarning {...props} />;
}
