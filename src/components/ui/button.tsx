import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib";
import { ArrowIcon } from "./icons";

const buttonVariants = cva(
    [
        "group/button relative inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap font-medium",
        "transition-[background-color,border-color,color,transform] duration-fast ease",
        "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    ],
    {
        variants: {
            variant: {
                /** Acción principal: una por vista. */
                primary: "rounded-control bg-brand text-white hover:bg-brand-hover",
                /** Acción secundaria: línea marcada sobre fondo o superficie. */
                secondary: "rounded-control border border-line-strong text-fg hover:border-fg-subtle hover:bg-elevated",
                /** Acción terciaria sin borde (menús, barras). */
                ghost: "rounded-control text-fg hover:bg-elevated",
                /** Enlace con flecha. Sin caja: el tamaño solo ajusta la letra. */
                link: "rounded-sm text-fg underline-offset-4 hover:underline active:scale-100",
            },
            size: {
                sm: "h-11 px-[18px] text-[0.9375rem]",
                md: "h-[52px] px-6 text-base",
                lg: "h-14 px-8 text-base",
                icon: "size-11 rounded-control",
            },
        },
        compoundVariants: [{ variant: "link", class: "h-auto min-h-11 px-0" }],
        defaultVariants: { variant: "primary", size: "md" },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    /** Renderiza el hijo (Link, <a>) con los estilos del botón. */
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, children, type, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                ref={ref}
                className={cn(buttonVariants({ variant, size }), className)}
                type={asChild ? undefined : (type ?? "button")}
                {...props}
            >
                <Slottable>{children}</Slottable>
                {variant === "link" ? (
                    <ArrowIcon className="transition-transform duration-fast ease-out group-hover/button:translate-x-0.5" />
                ) : null}
            </Comp>
        );
    },
);
Button.displayName = "Button";

export { Button, buttonVariants };
