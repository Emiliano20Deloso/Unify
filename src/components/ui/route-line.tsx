// La línea: ● origen (punto lleno rojo) —— ○ destino (anillo). Motivo gráfico del sitio.
import { cn } from "@/lib";
import { InView } from "./in-view";

interface RouteLineProps {
    orientation?: "horizontal" | "vertical";
    /** Se dibuja de origen a destino al entrar en pantalla (800 ms, una vez). */
    draw?: boolean;
    /**
     * Nombre accesible cuando la línea significa algo entre dos textos (p. ej. "a" en
     * "Polanco ●——○ AICM"). Sin label es decorativa.
     */
    label?: string;
    /** El largo lo da el contenedor: w-24, flex-1, h-16… (por defecto ocupa todo el eje). */
    className?: string;
}

export function RouteLine({ orientation = "horizontal", draw = false, label, className }: RouteLineProps) {
    const vertical = orientation === "vertical";
    const content = (
        <>
            <span className="route-line__start size-2 shrink-0 rounded-full bg-brand-ink" />
            <span className={cn("route-line__track flex-1 bg-route", vertical ? "w-px" : "h-px")} />
            <span className="route-line__end size-2 shrink-0 rounded-full border-[1.5px] border-fg" />
        </>
    );
    const shared = {
        "data-orientation": orientation,
        className: cn(
            "route-line flex items-center",
            vertical ? "h-full w-2 flex-col" : "w-full",
            className,
        ),
        ...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const }),
    };

    return draw ? (
        <InView data-draw="" {...shared}>
            {content}
        </InView>
    ) : (
        <span {...shared}>{content}</span>
    );
}
