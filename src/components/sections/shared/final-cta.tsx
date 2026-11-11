import Link from "next/link";
import type { StaticImageData } from "next/image";
import { Button, Container, Media } from "@/components/ui";
import { finalCtaCopy } from "@/content";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib";
import { quoteHref } from "./links";

interface FinalCtaProps {
    lang: Locale;
    /** Foto de la banda (con su alt); cada página usa la suya. */
    image: { src: StaticImageData; alt: string; position?: string };
    /** La foto ocupa solo la derecha en escritorio (para fotos cuyo borde izquierdo se funde con el fondo). */
    offset?: boolean;
    id?: string;
    /** Línea superior: para cuando la sección anterior también va en `bg` (mismo fondo, sin cambio de tono). */
    separated?: boolean;
}

/** Banda de cierre a sangre: foto oscura, frase y botón al cotizador. */
export function FinalCta({ lang, image, offset = false, id = "cierre", separated = false }: FinalCtaProps) {
    const t = finalCtaCopy[lang];
    return (
        <section
            aria-labelledby={id}
            className={cn(
                "relative flex flex-col overflow-hidden bg-bg lg:min-h-[640px] lg:justify-end",
                separated && "border-t border-line",
            )}
        >
            {/* Móvil y tableta: la foto arriba y el texto debajo, sobre el fondo. Escritorio: texto sobre la
                foto; la foto por defecto se corre a la derecha para que el texto no pise el auto (su borde
                izquierdo es casi el mismo negro del fondo). */}
            <div
                className={
                    offset
                        ? "relative aspect-[4/3] sm:aspect-[16/9] lg:absolute lg:inset-y-0 lg:left-[28%] lg:right-0 lg:aspect-auto"
                        : "relative aspect-[4/3] sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto"
                }
            >
                <Media
                    src={image.src}
                    alt={image.alt}
                    fill
                    radius="none"
                    veil="bottom"
                    sizes={offset ? "(min-width: 1024px) 72vw, 100vw" : "100vw"}
                    position={image.position}
                />
            </div>
            <Container className="relative -mt-8 pb-section-md lg:mt-0 lg:pt-section-md">
                <div className="flex max-w-2xl flex-col items-start">
                    <h2 id={id} className="type-title">
                        {t.title}
                    </h2>
                    <p className="type-lead mt-4 text-fg-soft">{t.text}</p>
                    <Button asChild size="lg" className="mt-10">
                        <Link href={quoteHref(lang)}>{t.cta}</Link>
                    </Button>
                </div>
            </Container>
        </section>
    );
}
