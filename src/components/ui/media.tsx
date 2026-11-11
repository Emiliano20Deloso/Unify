// Envoltura de next/image: caja con proporción y radio del sistema, imagen en modo fill.
// Carga: debajo se pinta la versión borrosa (blurDataURL, unos 8 px ampliados: el suavizado al escalar
// ya la difumina; sin filter: blur, que es caro de pintar) y la foto nítida se funde encima cuando el
// script de arranque marca data-loaded (src/lib/motion/boot.ts; CSS en globals.css § Fotos). Sin JS,
// la nítida se ve directamente.
import Image, { type StaticImageData } from "next/image";
import { cn } from "@/lib";

const RADIUS = { none: "", card: "rounded-card", media: "rounded-media" } as const;

const VEIL = {
    // Velos para leer texto sobre la foto (el único degradado permitido). Valores de la maqueta.
    top: "bg-[linear-gradient(180deg,rgb(var(--veil)/0.6)_0,rgb(var(--veil)/0.3)_240px,rgb(var(--veil)/0)_460px)]",
    bottom: "bg-[linear-gradient(0deg,rgb(var(--veil)/0.7)_0,rgb(var(--veil)/0)_160px)]",
    both: "bg-[linear-gradient(180deg,rgb(var(--veil)/0.6)_0,rgb(var(--veil)/0.3)_240px,rgb(var(--veil)/0)_460px),linear-gradient(0deg,rgb(var(--veil)/0.7)_0,rgb(var(--veil)/0)_160px)]",
} as const;

/** Fundido a fondo sólido en el borde inferior: la foto termina en `bg` sin corte visible. */
const FADE = "bg-[linear-gradient(0deg,rgb(var(--c-bg))_0,rgb(var(--c-bg)/0.8)_10%,rgb(var(--c-bg)/0)_30%)]";

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
    /**
     * Funde el borde inferior con el fondo de la página (`bg`). Se puede combinar con `veil`.
     * "mobile": solo por debajo de lg (p. ej. el hero de portada, donde en escritorio la foto llena la sección).
     */
    fade?: boolean | "mobile";
    /** object-position, p. ej. "50% 60%". */
    position?: string;
    /** Solo para la foto LCP arriba del pliegue (hero): la precarga en <head>. */
    preload?: boolean;
    quality?: 60 | 75 | 85;
    /** Primer paso de la entrada de una cabecera (data-enter="0"): fundido y el encuadre se asienta. */
    enter?: boolean;
    className?: string;
}

export function Media({
    src,
    alt,
    sizes,
    fill = false,
    radius = "media",
    veil,
    fade = false,
    position,
    preload,
    quality,
    enter,
    className,
}: MediaProps) {
    return (
        <div
            data-media=""
            data-enter={enter ? "0" : undefined}
            // El script de arranque añade data-loaded antes de hidratar.
            suppressHydrationWarning
            className={cn(
                "overflow-hidden bg-elevated",
                fill ? "absolute inset-0" : "relative",
                RADIUS[radius],
                className,
            )}
        >
            <div data-media-frame="" className="absolute inset-0">
                {src.blurDataURL ? (
                    <div
                        data-media-blur=""
                        aria-hidden="true"
                        className="absolute inset-0 bg-cover"
                        style={{ backgroundImage: `url("${src.blurDataURL}")`, backgroundPosition: position ?? "center" }}
                    />
                ) : null}
                <Image
                    data-media-sharp=""
                    src={src}
                    alt={alt}
                    fill
                    sizes={sizes}
                    preload={preload}
                    quality={quality}
                    className="object-cover"
                    style={position ? { objectPosition: position } : undefined}
                />
            </div>
            {veil ? <div aria-hidden="true" className={cn("absolute inset-0", VEIL[veil])} /> : null}
            {fade ? <div aria-hidden="true" className={cn("absolute inset-0", FADE, fade === "mobile" && "lg:hidden")} /> : null}
        </div>
    );
}
