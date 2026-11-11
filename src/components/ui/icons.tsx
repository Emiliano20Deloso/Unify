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

export const MenuIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M4 9h16M4 15h16" />
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

export const WhatsAppIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5z" />
    </Icon>
);

export const MailIcon = (p: IconProps) => (
    <Icon {...p}>
        <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
        <path d="M4 7.5l8 5.5 8-5.5" />
    </Icon>
);
