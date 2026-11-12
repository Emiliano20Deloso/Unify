import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge debe conocer los valores propios del tema (tailwind.config.ts) para resolver
// conflictos como `rounded-control` contra `rounded-full`.
const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            borderRadius: ["inner", "control", "card", "media"],
            spacing: ["gutter", "header", "section-sm", "section-md", "section-lg"],
        },
        classGroups: {
            shadow: [{ shadow: ["bar"] }],
            duration: [{ duration: ["fast", "base", "slow", "slower"] }],
        },
    },
});

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
