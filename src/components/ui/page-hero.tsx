// Cabecera de páginas interiores. Ya deja el espacio del menú fijo. Entra en secuencia con data-enter
// (foto 0 → título 1 → texto 2 → botones 3; CSS en globals.css), al cargar y al llegar navegando.
import type { StaticImageData } from "next/image";
import { cn } from "@/lib";
import { Container } from "./layout";
import { Media } from "./media";

interface PageHeroProps {
    title: React.ReactNode;
    text?: React.ReactNode;
    /** Foto ancha bajo el texto (21:9 en escritorio, 4:3 en móvil). Es la imagen LCP: se precarga. */
    media?: { src: StaticImageData; alt: string; position?: string };
    /** Acciones bajo el texto (botones). */
    children?: React.ReactNode;
    className?: string;
}

export function PageHero({ title, text, media, children, className }: PageHeroProps) {
    return (
        <header className={cn("pt-[calc(var(--header-h)+var(--section-sm))]", media ? "pb-section-sm" : "pb-section-md", className)}>
            <Container>
                <div className="flex max-w-4xl flex-col gap-5">
                    <h1 data-enter="1" className="type-display">
                        {title}
                    </h1>
                    {text ? (
                        <p data-enter="2" className="type-lead max-w-[36rem] text-fg-soft">
                            {text}
                        </p>
                    ) : null}
                    {children ? (
                        <div data-enter="3" className="mt-3 flex flex-wrap gap-3">
                            {children}
                        </div>
                    ) : null}
                </div>
                {media ? (
                    <Media
                        src={media.src}
                        alt={media.alt}
                        position={media.position}
                        preload
                        enter
                        sizes="(min-width: 1440px) 1280px, 92vw"
                        className="mt-section-sm aspect-[4/3] md:aspect-[21/9]"
                    />
                ) : null}
            </Container>
        </header>
    );
}
