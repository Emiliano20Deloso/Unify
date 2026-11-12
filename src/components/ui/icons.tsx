// Iconos de trazo 1.6 de la maqueta. Heredan color (currentColor) y se dimensionan con size-*.
// Para cualquier otro icono usa lucide-react con strokeWidth={1.6} y el mismo tamaño.
import { cn } from "@/lib";

type IconProps = React.SVGProps<SVGSVGElement>;

function Icon({ className, children, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            className={cn("size-[18px] shrink-0", className)}
            {...props}
        >
            {children}
        </svg>
    );
}

export const ArrowIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M4 12h15M14 7l5 5-5 5" />
    </Icon>
);

export const CheckIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Icon>
);

/**
 * Hamburguesa que se transforma en X: los dos trazos giran cuando el botón padre lleva
 * data-state="open" (disparador de Radix) o el icono lleva data-open. Con movimiento reducido, la X
 * (tercer trazo) aparece con un fundido cruzado. CSS en globals.css § Icono de menú.
 */
export const MenuIcon = ({ className, ...p }: IconProps & { "data-open"?: boolean }) => (
    <Icon className={cn("menu-icon", className)} {...p}>
        <path className="menu-icon__a" d="M4 9h16" />
        <path className="menu-icon__b" d="M4 15h16" />
        <path className="menu-icon__x" d="M6 6l12 12M18 6L6 18" />
    </Icon>
);

export const CloseIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
);

export const PlusIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M12 5v14M5 12h14" />
    </Icon>
);

export const MinusIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M5 12h14" />
    </Icon>
);

