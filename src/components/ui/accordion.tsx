"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib";
import { PlusIcon } from "./icons";

/** Preguntas frecuentes. <Accordion type="single" collapsible> con AccordionItem por pregunta. */
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
                    "group flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left text-lg font-medium text-fg transition-colors duration-fast ease hover:text-white",
                    className,
                )}
                {...props}
            >
                {children}
                <PlusIcon className="size-5 text-fg-subtle transition-transform duration-base ease-out group-data-[state=open]:rotate-45" />
            </AccordionPrimitive.Trigger>
        </h3>
    </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content ref={ref} className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1 data-[state=open]:duration-base" {...props}>
        <div className={cn("max-w-prose pb-6 pr-11 text-fg-subtle", className)}>{children}</div>
    </AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";
