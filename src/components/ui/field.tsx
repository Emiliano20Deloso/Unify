import * as React from "react";
import { Collapse } from "@/components/motion/collapse";
import { cn } from "@/lib";

// ctl: borde (también el de error), fondo y opacidad con transición; el anillo de foco entra y sale
// animado (globals.css § Controles). --ring-offset: el anillo queda a 2 px del borde.
const control = [
    "ctl w-full rounded-control border border-line bg-surface px-4 text-base text-fg [--ring-offset:2px]",
    "placeholder:text-fg-subtle hover:border-line-strong focus-visible:border-fg-subtle",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "aria-[invalid=true]:border-brand-ink",
].join(" ");

/** Campo de texto (52 px). Úsalo dentro de Field para tener etiqueta, ayuda y error. */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type = "text", ...props }, ref) => (
        <input ref={ref} type={type} className={cn(control, "h-[52px]", className)} {...props} />
    ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className, rows = 4, ...props }, ref) => (
        <textarea ref={ref} rows={rows} className={cn(control, "min-h-28 resize-y py-3.5 leading-normal", className)} {...props} />
    ),
);
Textarea.displayName = "Textarea";

interface FieldProps {
    label: React.ReactNode;
    /** Texto de ayuda bajo el control. */
    hint?: React.ReactNode;
    /** Mensaje de error: marca aria-invalid y se anuncia. */
    error?: React.ReactNode;
    /** Id del control (opcional: si falta se genera uno). */
    id?: string;
    className?: string;
    /** Un solo control: Input, Textarea, select… Recibe id, aria-describedby y aria-invalid. */
    children: React.ReactElement<React.HTMLAttributes<HTMLElement> & { id?: string }>;
}

/**
 * Etiqueta visible + control + ayuda/error, ya conectados por id y aria. El error y la ayuda se
 * despliegan y se pliegan con Collapse (alto con resorte y fundido); el borde de error entra con
 * transición. Ids estables (`<id>-hint`, `<id>-error`): aria-describedby solo los nombra mientras
 * hay texto. El error vive en una región aria-live siempre montada (se anuncia al aparecer). Al
 * plegarse, AnimatePresence conserva el último texto hasta que termina de salir. Sin estado: sirve
 * desde un Server Component (Collapse es la única isla cliente).
 */
export function Field({ label, hint, error, id, className, children }: FieldProps) {
    const auto = React.useId();
    const controlId = id ?? children.props.id ?? `f${auto}`;
    const hintId = `${controlId}-hint`;
    const errorId = `${controlId}-error`;
    const describedBy = [children.props["aria-describedby"], hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

    return (
        <div className={cn("flex flex-col", className)}>
            <label htmlFor={controlId} className="type-label pb-2 text-fg-subtle">
                {label}
            </label>
            {React.cloneElement(children, {
                id: controlId,
                "aria-describedby": describedBy,
                "aria-invalid": error ? true : children.props["aria-invalid"],
            })}
            <Collapse open={!!hint}>
                <p id={hintId} className="type-label pt-2 font-normal text-fg-subtle">
                    {hint}
                </p>
            </Collapse>
            <div aria-live="polite">
                <Collapse open={!!error}>
                    <p id={errorId} className="type-label pt-2 text-brand-ink">
                        {error}
                    </p>
                </Collapse>
            </div>
        </div>
    );
}
