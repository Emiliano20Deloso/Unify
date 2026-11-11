import * as React from "react";
import { cn } from "@/lib";

const control = [
    "w-full rounded-control border border-line bg-surface px-4 text-base text-fg",
    "placeholder:text-fg-subtle transition-[border-color,background-color] duration-fast ease",
    "hover:border-line-strong focus-visible:border-fg-subtle focus-visible:outline-offset-2",
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

/** Etiqueta visible + control + ayuda/error, ya conectados por id y aria. */
export function Field({ label, hint, error, id, className, children }: FieldProps) {
    const auto = React.useId();
    const controlId = id ?? children.props.id ?? `f${auto}`;
    const hintId = hint ? `${controlId}-hint` : undefined;
    const errorId = error ? `${controlId}-error` : undefined;
    const describedBy = [children.props["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <label htmlFor={controlId} className="type-label text-fg-subtle">
                {label}
            </label>
            {React.cloneElement(children, {
                id: controlId,
                "aria-describedby": describedBy,
                "aria-invalid": error ? true : children.props["aria-invalid"],
            })}
            {hint ? (
                <p id={hintId} className="type-label font-normal text-fg-subtle">
                    {hint}
                </p>
            ) : null}
            <p id={errorId} aria-live="polite" className={cn("type-label text-brand-ink", !error && "sr-only")}>
                {error}
            </p>
        </div>
    );
}
