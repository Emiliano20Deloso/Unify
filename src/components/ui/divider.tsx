import { cn } from "@/lib";

interface DividerProps {
    orientation?: "horizontal" | "vertical";
    /** Línea más marcada (separar grupos dentro de un panel). */
    strong?: boolean;
    className?: string;
}

/** Línea de 1 px. Para el motivo ●——○ usa RouteLine. */
export function Divider({ orientation = "horizontal", strong = false, className }: DividerProps) {
    const color = strong ? "bg-line-strong" : "bg-line";
    return orientation === "vertical" ? (
        <span aria-hidden="true" className={cn("w-px self-stretch", color, className)} />
    ) : (
        <hr className={cn("h-px w-full border-0", color, className)} />
    );
}
