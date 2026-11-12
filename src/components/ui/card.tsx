import { cn } from "@/lib";

type CardProps = React.HTMLAttributes<HTMLElement> & {
    as?: "div" | "article" | "li" | "section";
    /** Superficie (por defecto) o elevada (paneles sobre superficie o sobre foto). */
    tone?: "surface" | "elevated";
    /** Relleno interno: "md" 28→32 px; "none" si la tarjeta empieza con una foto (usa CardBody). */
    padding?: "md" | "none";
};

/** Tarjeta: superficie, línea de 1 px y radio 18. Sin sombra, sin brillo. */
export function Card({ as: Tag = "div", tone = "surface", padding = "md", className, ...props }: CardProps) {
    return (
        <Tag
            className={cn(
                "flex flex-col overflow-hidden rounded-card border border-line",
                tone === "elevated" ? "bg-elevated" : "bg-surface",
                padding === "md" && "p-6 md:p-8",
                className,
            )}
            {...props}
        />
    );
}

/** Cuerpo con relleno, para tarjetas con foto arriba (padding="none"). */
export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-1 flex-col p-6 md:px-8 md:pb-8 md:pt-7", className)} {...props} />;
}
