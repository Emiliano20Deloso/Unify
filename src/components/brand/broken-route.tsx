/** La línea interrumpida (●—— ○): la ruta no llega. Solo para las páginas 404. */
export function BrokenRoute() {
    return (
        <span aria-hidden="true" className="flex w-40 items-center">
            <span className="size-2 shrink-0 rounded-full bg-brand-ink" />
            <span className="h-px flex-1 bg-route" />
            <span className="w-8" />
            <span className="size-2 shrink-0 rounded-full border-[1.5px] border-fg" />
        </span>
    );
}
