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
    /**
     * true (portada): foto a sangre corrida a la derecha y texto encima de su borde oscuro.
     * false (servicios): columna de texto sobre el fondo y la foto a sangre a su derecha; el texto
     * nunca pisa la foto (para fotos con el auto al centro y fondo claro).
     */
    offset?: boolean;
    id?: string;
    /** Línea superior: para cuando la sección anterior también va en `bg` (mismo fondo, sin cambio de tono). */
    separated?: boolean;
}

/** Banda de cierre: foto oscura, frase y botón al cotizador. */
export function FinalCta({ lang, image, offset = false, id = "cierre", separated = false }: FinalCtaProps) {
    return offset ? (
        <Overlay lang={lang} image={image} id={id} separated={separated} />
    ) : (
        <Split lang={lang} image={image} id={id} separated={separated} />
    );
}

type LayoutProps = Required<Pick<FinalCtaProps, "lang" | "image" | "id" | "separated">>;

function Copy({ lang, id }: { lang: Locale; id: string }) {
    const t = finalCtaCopy[lang];
    return (
        <>
            <h2 id={id} className="type-title">
                {t.title}
            </h2>
            <p className="type-lead mt-4 text-fg-soft">{t.text}</p>
            <Button asChild size="lg" className="mt-10">
                <Link href={quoteHref(lang)}>{t.cta}</Link>
            </Button>
        </>
    );
}

/** Portada: la foto ocupa desde el 28 % a la derecha; el texto va al pie, sobre su borde casi negro. */
function Overlay({ lang, image, id, separated }: LayoutProps) {
    return (
        <section
            aria-labelledby={id}
            className={cn(
                "relative flex flex-col overflow-hidden bg-bg lg:min-h-[640px] lg:justify-end",
                separated && "border-t border-line",
            )}
        >
            <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:absolute lg:inset-y-0 lg:left-[28%] lg:right-0 lg:aspect-auto">
                <Media
                    src={image.src}
                    alt={image.alt}
                    fill
                    radius="none"
                    veil="bottom"
                    sizes="(min-width: 1024px) 72vw, 100vw"
                    position={image.position}
                />
            </div>
            <Container className="relative -mt-8 pb-section-md lg:mt-0 lg:pt-section-md">
                <div className="flex max-w-2xl flex-col items-start">
                    <Copy lang={lang} id={id} />
                </div>
            </Container>
        </section>
    );
}

/*
 * Servicios: en escritorio la columna de texto (26rem) va sobre el fondo, centrada en alto, y la foto
 * arranca justo después del margen del contenido + esa columna + 5rem de aire (31rem en xl), hasta el borde derecho.
 * En móvil y tableta la foto va arriba, se funde con el fondo y el texto queda debajo, sin encimarse.
 */
const SPLIT_PHOTO_LEFT =
    "lg:left-[calc(max(var(--gutter),(100vw-80rem)/2)+31rem)] xl:left-[calc(max(var(--gutter),(100vw-80rem)/2)+36rem)]";

function Split({ lang, image, id, separated }: LayoutProps) {
    return (
        <section
            aria-labelledby={id}
            className={cn("relative flex flex-col overflow-hidden bg-bg lg:min-h-[680px]", separated && "border-t border-line")}
        >
            <div
                data-final-photo=""
                className={cn("relative aspect-[4/3] sm:aspect-[16/9] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto", SPLIT_PHOTO_LEFT)}
            >
                <Media
                    src={image.src}
                    alt={image.alt}
                    fill
                    radius="none"
                    fade="mobile"
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    position={image.position}
                />
            </div>
            <Container className="relative pb-section-md pt-6 sm:pt-10 lg:flex lg:min-h-[680px] lg:items-center lg:py-section-md">
                <div className="flex max-w-[26rem] flex-col items-start xl:max-w-[31rem]">
                    <Copy lang={lang} id={id} />
                </div>
            </Container>
        </section>
    );
}
