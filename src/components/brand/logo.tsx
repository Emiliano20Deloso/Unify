// Logo 3 · Punto. Geometría de design/logo/*.svg sin cambios: la tinta toma currentColor y el punto
// de la "i" (y de la marca) es el rojo de marca, el mismo punto de origen de La línea.
import { cn } from "@/lib";

interface LogoProps {
    className?: string;
    /** Nombre accesible. Pasa `null` si el logo va dentro de un enlace que ya tiene nombre. */
    title?: string | null;
}

function a11y(title: string | null) {
    return title ? { role: "img", "aria-label": title } : { "aria-hidden": true };
}

/** Logotipo completo. Su alto define el tamaño: h-7 (28 px) en móvil, h-8 (32 px) en escritorio. */
export function Logo({ className, title = "Unify" }: LogoProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-8 10 233.2 117"
            className={cn("block h-8 w-auto shrink-0", className)}
            focusable="false"
            {...a11y(title)}
        >
            <path
                d="M3.6 47.6V78.08A19.4 19.4 0 0 0 42.4 78.08V47.6M62.6 96.4V65.92A19.4 19.4 0 0 1 101.4 65.92V96.4M121.6 47.6V96.4M145.92 96.4V35.88A14.28 14.28 0 0 1 160.2 21.6H166.6M139.8 47.6H162.52M179.8 47.6L195.47 96.4M213.6 47.6L188.41 115.4"
                fill="none"
                stroke="currentColor"
                strokeWidth="7.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="121.6" cy="30.5" r="5" className="fill-brand" />
        </svg>
    );
}

/** Marca sola (la "u" con su punto). Cuadrada: dale tamaño con size-*. */
export function LogoMark({ className, title = "Unify" }: LogoProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            className={cn("block size-10 shrink-0", className)}
            focusable="false"
            {...a11y(title)}
        >
            <path
                d="M16.7 19.05V33.76A15.3 15.3 0 0 0 47.3 33.76V19.05"
                fill="none"
                stroke="currentColor"
                strokeWidth="9.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="47.3" cy="19.05" r="7.4" className="fill-brand" />
        </svg>
    );
}
