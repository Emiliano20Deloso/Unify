import { cn } from "@/lib";

interface StatProps {
    /** Cifra ya formateada: "+1,500", "98 %". Usa espacio fino no separable antes de "%". */
    value: string;
    label: string;
    className?: string;
}

/** Cifra grande (Archivo extendida, tabular) con su etiqueta al lado, alineadas por la base. */
export function Stat({ value, label, className }: StatProps) {
    return (
        <p className={cn("flex items-baseline gap-3.5", className)}>
            <span className="type-title tabular">{value}</span>
            <span className="font-medium text-fg-subtle">{label}</span>
        </p>
    );
}
