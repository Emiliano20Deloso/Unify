"use client";

// Dialog (centrado) y Sheet (hoja: pantalla completa en móvil). Radix atrapa el foco, cierra con
// Escape y devuelve el foco al disparador. Sin desenfoque de fondo: velo opaco del color del fondo.
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib";
import { CloseIcon } from "./icons";

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
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-bg/80",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-base",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-fast",
            className,
        )}
        {...props}
    />
));
Overlay.displayName = "Overlay";

function CloseButton({ label, className }: { label: string; className?: string }) {
    return (
        <DialogPrimitive.Close
            aria-label={label}
            className={cn(
                "grid size-11 place-items-center rounded-control text-fg transition-[background-color,transform] duration-fast ease hover:bg-elevated active:scale-95",
                className,
            )}
        >
            <CloseIcon className="size-[22px]" />
        </DialogPrimitive.Close>
    );
}

type ContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /** Nombre accesible del botón de cerrar (va en el diccionario). */
    closeLabel: string;
};

/** Ventana centrada (máx. 32 rem). Usa DialogTitle y, si hace falta, DialogDescription. */
export const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, ContentProps>(
    ({ className, children, closeLabel, ...props }, ref) => (
        <DialogPrimitive.Portal>
            <Overlay />
            <DialogPrimitive.Content
                ref={ref}
                className={cn(
                    "fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-5 overflow-y-auto",
                    "rounded-card border border-line bg-elevated p-6 md:p-8",
                    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.97] data-[state=open]:duration-base data-[state=open]:ease-out",
                    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.97] data-[state=closed]:duration-fast",
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

type SheetContentProps = ContentProps & {
    /** "full": pantalla completa siempre (menú). "side": completa en móvil, panel derecho desde sm. */
    variant?: "full" | "side";
    /** Contenido fijo a la izquierda de la cabecera (p. ej. el logo en el menú). */
    header?: React.ReactNode;
};

/** Hoja con cabecera (contenido + botón de cerrar) y cuerpo con scroll propio. */
export const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
    ({ className, children, closeLabel, variant = "side", header, ...props }, ref) => (
        <DialogPrimitive.Portal>
            <Overlay className={variant === "full" ? "hidden" : undefined} />
            <DialogPrimitive.Content
                ref={ref}
                className={cn(
                    "fixed inset-0 z-50 flex flex-col bg-bg",
                    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-base data-[state=open]:ease-out",
                    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-fast",
                    variant === "full"
                        ? "data-[state=open]:slide-in-from-top-2"
                        : "sm:left-auto sm:w-full sm:max-w-md sm:border-l sm:border-line sm:bg-surface data-[state=open]:slide-in-from-right-8",
                    className,
                )}
                {...props}
            >
                <div className="flex h-header shrink-0 items-center justify-between gap-4 pl-gutter pr-[calc(var(--gutter)-0.75rem)]">
                    <div className="min-w-0">{header}</div>
                    <CloseButton label={closeLabel} />
                </div>
                <div className="flex flex-1 flex-col overflow-y-auto px-gutter pb-8">{children}</div>
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
