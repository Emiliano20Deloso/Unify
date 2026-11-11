"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib";
import { PlusIcon } from "./icons";

/**
 * Preguntas frecuentes. <Accordion type="single" collapsible> con AccordionItem por pregunta.
 * Abrir: alto con resorte layout y fundido; cerrar: resorte ui; cambiar de pregunta: una se cierra
 * mientras la otra se abre y lo de abajo se recorre con el alto. Transiciones CSS (globals.css
 * § Acordeón): se redirigen a media animación y funcionan antes de hidratar.
 */
export const Accordion = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => <AccordionPrimitive.Root ref={ref} className={cn("border-t border-line", className)} {...props} />);
Accordion.displayName = "Accordion";

export const AccordionItem = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => <AccordionPrimitive.Item ref={ref} className={cn("border-b border-line", className)} {...props} />);
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header asChild>
        <h3>
            <AccordionPrimitive.Trigger
                ref={ref}
                className={cn(
                    "ctl flex min-h-16 w-full items-center justify-between gap-6 rounded-sm py-5 text-left text-lg font-medium text-fg hover:text-white",
                    className,
                )}
                {...props}
            >
                {children}
                <PlusIcon className="accordion-icon size-5 text-fg-subtle" />
            </AccordionPrimitive.Trigger>
        </h3>
    </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    // Siempre montado (forceMount): el cierre es una transición que se puede interrumpir; cerrado
    // queda con visibility hidden (sin Tab ni lector). La respuesta también está en el HTML.
    <AccordionPrimitive.Content ref={ref} forceMount className="accordion-content" {...props}>
        <div className="accordion-panel">
            <div>
                <div className={cn("accordion-content__inner max-w-prose pb-6 pr-11 text-fg-subtle", className)}>{children}</div>
            </div>
        </div>
    </AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";
