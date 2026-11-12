import { cn } from "@/lib";

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** "dot" antepone el punto rojo de origen (estado, disponibilidad); "neutral" solo la línea. */
    tone?: "neutral" | "dot";
}

/** Etiqueta breve en minúsculas normales (nunca mayúsculas espaciadas). No es interactiva. */
export function Chip({ tone = "neutral", className, children, ...props }: ChipProps) {
    return (
        <span
            className={cn(
                "type-label inline-flex h-7 items-center gap-2 whitespace-nowrap rounded-full border border-line px-3 text-fg-muted",
                className,
            )}
            {...props}
        >
            {tone === "dot" ? <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-ink" /> : null}
            {children}
        </span>
    );
}
