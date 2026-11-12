// Estructura de página: Container, Section, SectionHeader. Todo de servidor.
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { cn } from "@/lib";

type ContainerProps = React.HTMLAttributes<HTMLElement> & {
    as?: "div" | "section" | "header" | "footer" | "nav";
    /** "prose" limita el ancho de lectura (textos legales, notas largas). */
    width?: "default" | "prose";
};

/** Márgenes laterales del sistema (20 → 80 px) y ancho máximo de 1280 px de contenido. */
export function Container({ as: Tag = "div", width = "default", className, ...props }: ContainerProps) {
    return (
        <Tag
            className={cn(
                "mx-auto w-full px-gutter",
                width === "prose" ? "max-w-[calc(var(--prose)+2*var(--gutter))]" : "max-w-[calc(var(--container)+2*var(--gutter))]",
                className,
            )}
            {...props}
        />
    );
}

const SECTION_SPACE = {
    sm: "py-section-sm",
    md: "py-section-md",
    lg: "py-section-lg",
} as const;

type SectionProps = React.HTMLAttributes<HTMLElement> & {
    /** Fondo de la página o superficie (para alternar ritmo sin líneas). */
    tone?: "bg" | "surface";
    /** Aire vertical: sm 40→64 · md 64→112 · lg 80→152 px. */
    space?: keyof typeof SECTION_SPACE;
    /** false si la sección maneja su propio ancho (foto a sangre). */
    contained?: boolean;
};

/** Bloque vertical de página. Por defecto ya incluye el Container. */
export function Section({ tone = "bg", space = "md", contained = true, className, children, ...props }: SectionProps) {
    return (
        <section className={cn(tone === "surface" ? "bg-surface" : "bg-bg", SECTION_SPACE[space], className)} {...props}>
            {contained ? <Container>{children}</Container> : children}
        </section>
    );
}

interface SectionHeaderProps {
    title: React.ReactNode;
    text?: React.ReactNode;
    /** Id del título, para aria-labelledby de la sección. */
    id?: string;
    as?: "h1" | "h2" | "h3";
    align?: "start" | "center";
    /** Acción a la derecha en escritorio (p. ej. un Button variant="link"). */
    action?: React.ReactNode;
    className?: string;
}

/**
 * Título de sección + texto opcional. Sin etiquetas sobre el título.
 * Aparece al entrar en pantalla: el título lidera (sube 18 px) y el texto y la acción lo siguen.
 */
export function SectionHeader({ title, text, id, as: Heading = "h2", align = "start", action, className }: SectionHeaderProps) {
    const centered = align === "center";
    return (
        <RevealGroup
            className={cn(
                "mb-10 flex flex-col gap-6 md:mb-14",
                !centered && action ? "md:flex-row md:items-end md:justify-between" : null,
                centered && "items-center text-center",
                className,
            )}
        >
            <div className={cn("flex max-w-3xl flex-col gap-4", centered && "items-center")}>
                <Reveal as={Heading} variant="title" index={0} id={id} className="type-title">
                    {title}
                </Reveal>
                {text ? (
                    <Reveal as="p" variant="text" index={1} className="type-lead max-w-[36rem] text-fg-subtle">
                        {text}
                    </Reveal>
                ) : null}
            </div>
            {/* La acción (un botón con transición propia) va envuelta: Reveal pisa su transition. */}
            {action ? (
                <Reveal variant="text" index={2} className="shrink-0">
                    {action}
                </Reveal>
            ) : null}
        </RevealGroup>
    );
}
