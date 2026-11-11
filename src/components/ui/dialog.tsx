"use client";

// Dialog (centrado) y Sheet (hoja: lateral, pantalla completa o inferior). Radix atrapa el foco, cierra
// con Escape y devuelve el foco al disparador. Sin desenfoque de fondo: velo opaco del color del fondo.
// Entrada y salida con keyframes CSS (Radix espera a animationend para desmontar): globals.css
// § Diálogos y hojas. Con movimiento reducido solo hay fundidos.
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib";
import { CloseIcon, MenuIcon } from "./icons";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

const Overlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay ref={ref} className={cn("motion-overlay fixed inset-0 z-50 bg-bg/80", className)} {...props} />
));
Overlay.displayName = "Overlay";

function CloseButton({ label, icon = "close", className }: { label: string; icon?: "close" | "menu"; className?: string }) {
    return (
        <DialogPrimitive.Close
            aria-label={label}
            className={cn(
                "grid size-11 place-items-center rounded-control text-fg transition-[background-color,transform] duration-micro ease hover:bg-elevated active:scale-95",
                className,
            )}
        >
            {/* En el menú, el icono nace como hamburguesa y gira a X (mismo sitio que el disparador). */}
            {icon === "menu" ? <MenuIcon className="size-[22px]" /> : <CloseIcon className="size-[22px]" />}
        </DialogPrimitive.Close>
    );
}

type ContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /** Nombre accesible del botón de cerrar (va en el diccionario). */
    closeLabel: string;
};

/** Ventana centrada (máx. 32 rem). Entra con fundido y escala .97 → 1; sale al revés y baja 4 px. */
export const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, ContentProps>(
    ({ className, children, closeLabel, ...props }, ref) => (
        <DialogPrimitive.Portal>
            <Overlay />
            <DialogPrimitive.Content
                ref={ref}
                className={cn(
                    "motion-panel dialog-center fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-5 overflow-y-auto",
                    "rounded-card border border-line bg-elevated p-6 md:p-8",
                    className,
                )}
                {...props}
            >
                {children}
                <CloseButton label={closeLabel} className="absolute right-3 top-3" />
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    ),
);
DialogContent.displayName = "DialogContent";

const SHEET = {
    // Pantalla completa siempre (menú): entra 16 px desde arriba y sale subiendo 8 px.
    full: "sheet-full inset-0",
    // Completa en móvil, panel derecho desde sm: entra y sale por la derecha (32 px).
    side: "sheet-side inset-0 sm:left-auto sm:w-full sm:max-w-md sm:border-l sm:border-line sm:bg-surface",
    // Hoja inferior (lugares en móvil): entra y sale por abajo (24 px).
    bottom: "sheet-bottom inset-x-0 bottom-0 max-h-[calc(100dvh-3rem)] rounded-t-card border-t border-line bg-surface",
} as const;

type SheetContentProps = ContentProps & {
    /** "full": pantalla completa (menú). "side": completa en móvil, panel derecho desde sm. "bottom": hoja inferior. */
    variant?: keyof typeof SHEET;
    /** Contenido fijo a la izquierda de la cabecera (p. ej. el logo en el menú). */
    header?: React.ReactNode;
};

/**
 * Hoja con cabecera (contenido + botón de cerrar) y cuerpo con scroll propio. La variante "full" lleva
 * view-transition-name "site-sheet": si se navega desde ella, se retira encima mientras la página
 * cambia debajo.
 */
export const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
    ({ className, children, closeLabel, variant = "side", header, style, ...props }, ref) => (
        <DialogPrimitive.Portal>
            <Overlay className={variant === "full" ? "hidden" : undefined} />
            <DialogPrimitive.Content
                ref={ref}
                style={variant === "full" ? { viewTransitionName: "site-sheet", ...style } : style}
                className={cn("motion-panel fixed z-50 flex flex-col bg-bg", SHEET[variant], className)}
                {...props}
            >
                <div
                    className={cn(
                        "flex shrink-0 items-center justify-between gap-4 pl-gutter pr-[calc(var(--gutter)-0.75rem)]",
                        variant === "bottom" ? "h-16" : "h-header",
                    )}
                >
                    <div className="min-w-0">{header}</div>
                    <CloseButton label={closeLabel} icon={variant === "full" ? "menu" : "close"} />
                </div>
                <div data-sheet-body className="flex flex-1 flex-col overflow-y-auto px-gutter pb-8">
                    {children}
                </div>
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    ),
);
SheetContent.displayName = "SheetContent";

export const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => <DialogPrimitive.Title ref={ref} className={cn("type-subheading pr-10", className)} {...props} />);
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => <DialogPrimitive.Description ref={ref} className={cn("text-fg-subtle", className)} {...props} />);
DialogDescription.displayName = "DialogDescription";

export const SheetTitle = DialogTitle;
export const SheetDescription = DialogDescription;
