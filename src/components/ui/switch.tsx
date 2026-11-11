import * as React from "react";
import { cn } from "@/lib";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "role" | "children" | "onChange"> {
    /** Recibe el estado nuevo (true = encendido). */
    onCheckedChange?: (checked: boolean) => void;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    /** Texto de la etiqueta (va a la izquierda; toda la fila es clicable). */
    children: React.ReactNode;
    /** Clases de la fila (label). */
    className?: string;
}

/**
 * Interruptor: `<Switch checked={x} onCheckedChange={setX}>Ida y vuelta</Switch>` (o `defaultChecked`
 * sin estado). Es un checkbox nativo con role="switch" dentro de su etiqueta (fila de 44 px como
 * mínimo). La perilla se desliza con el resorte ui y el color cambia en 160 ms (globals.css
 * § Interruptor). Sin estado propio: sirve desde servidor o cliente.
 */
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({ onCheckedChange, onChange, children, className, ...props }, ref) => (
    <label className={cn("switch flex min-h-11 cursor-pointer items-center justify-between gap-4 has-[:disabled]:cursor-not-allowed", className)}>
        {children}
        <input
            ref={ref}
            type="checkbox"
            role="switch"
            className="switch__input sr-only"
            // Solo con manejadores (desde un Server Component no se puede pasar una función al DOM).
            onChange={
                onChange || onCheckedChange
                    ? (e) => {
                          onChange?.(e);
                          onCheckedChange?.(e.target.checked);
                      }
                    : undefined
            }
            {...props}
        />
        <span aria-hidden="true" className="switch__track">
            <span className="switch__thumb" />
        </span>
    </label>
));
Switch.displayName = "Switch";
