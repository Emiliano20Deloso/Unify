// Envoltura de next/image: caja con proporción y radio del sistema, imagen en modo fill.
import Image, { type StaticImageData } from "next/image";
import { cn } from "@/lib";

const RADIUS = { none: "", card: "rounded-card", media: "rounded-media" } as const;

const VEIL = {
    // Velos para leer texto sobre la foto (el único degradado permitido). Valores de la maqueta.
    top: "bg-[linear-gradient(180deg,rgb(var(--veil)/0.6)_0,rgb(var(--veil)/0.3)_240px,rgb(var(--veil)/0)_460px)]",
    bottom: "bg-[linear-gradient(0deg,rgb(var(--veil)/0.7)_0,rgb(var(--veil)/0)_160px)]",
    both: "bg-[linear-gradient(180deg,rgb(var(--veil)/0.6)_0,rgb(var(--veil)/0.3)_240px,rgb(var(--veil)/0)_460px),linear-gradient(0deg,rgb(var(--veil)/0.7)_0,rgb(var(--veil)/0)_160px)]",
} as const;

export interface MediaProps {
    src: StaticImageData;
    /** Describe la foto. Vacío ("") solo si es decorativa. */
    alt: string;
    /**
     * Ancho real en pantalla para elegir el tamaño (obligatorio pensarlo):
     * p. ej. "100vw" a sangre, "(min-width: 1024px) 50vw, 100vw" en dos columnas.
     */
    sizes: string;
    /** Proporción con una clase aspect-* en className, o "fill" para ocupar el padre (que debe ser relative). */
    fill?: boolean;
    radius?: keyof typeof RADIUS;
    /** Velo para texto encima: arriba (menú), abajo (texto al pie) o ambos. */
    veil?: keyof typeof VEIL;
    /** object-position, p. ej. "50% 60%". */
    position?: string;
    /** Solo para la foto LCP arriba del pliegue (hero): la precarga en <head>. */
    preload?: boolean;
    quality?: 60 | 75 | 85;
    className?: string;
}

export function Media({
    src,
    alt,
    sizes,
    fill = false,
    radius = "media",
    veil,
    position,
    preload,
    quality,
    className,
}: MediaProps) {
    return (
        <div
            className={cn(
                "overflow-hidden bg-elevated",
                fill ? "absolute inset-0" : "relative",
                RADIUS[radius],
                className,
            )}
        >
            <Image
                src={src}
                alt={alt}
                fill
                sizes={sizes}
                preload={preload}
                quality={quality}
                placeholder="blur"
                className="object-cover"
                style={position ? { objectPosition: position } : undefined}
            />
            {veil ? <div aria-hidden="true" className={cn("absolute inset-0", VEIL[veil])} /> : null}
        </div>
    );
}
