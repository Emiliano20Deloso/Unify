import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

// Todos los valores salen de src/styles/tokens.css. Aquí solo se mapean a clases.
const rgb = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

export default {
	content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				// Sistema Nocturno
				bg: rgb("--c-bg"),
				surface: rgb("--c-surface"),
				elevated: rgb("--c-elevated"),
				fg: {
					DEFAULT: rgb("--c-fg"),
					soft: rgb("--c-fg-soft"),
					muted: rgb("--c-fg-muted"),
					subtle: rgb("--c-fg-subtle"),
				},
				brand: {
					DEFAULT: rgb("--c-brand"),
					hover: rgb("--c-brand-hover"),
					ink: rgb("--c-brand-ink"),
				},
				route: rgb("--c-route"),
				veil: rgb("--veil"),
				line: {
					DEFAULT: "var(--line)",
					strong: "var(--line-strong)",
				},
				// Nombres shadcn (admin, Radix)
				background: rgb("--background"),
				foreground: rgb("--foreground"),
				card: { DEFAULT: rgb("--card"), foreground: rgb("--card-foreground") },
				popover: { DEFAULT: rgb("--popover"), foreground: rgb("--popover-foreground") },
				primary: { DEFAULT: rgb("--primary"), foreground: rgb("--primary-foreground") },
				secondary: { DEFAULT: rgb("--secondary"), foreground: rgb("--secondary-foreground") },
				muted: { DEFAULT: rgb("--muted"), foreground: rgb("--muted-foreground") },
				accent: { DEFAULT: rgb("--accent"), foreground: rgb("--accent-foreground") },
				destructive: { DEFAULT: rgb("--destructive"), foreground: rgb("--destructive-foreground") },
				border: "var(--border)",
				input: "var(--input)",
				ring: rgb("--ring"),
			},
			fontFamily: {
				sans: ["var(--font-satoshi)", "Helvetica Neue", "Arial", "sans-serif"],
				display: ["var(--font-archivo)", "Helvetica Neue", "Arial", "sans-serif"],
			},
			borderColor: {
				DEFAULT: "var(--line)",
			},
			borderRadius: {
				inner: "var(--radius-inner)",
				control: "var(--radius-control)",
				card: "var(--radius-card)",
				media: "var(--radius-media)",
			},
			boxShadow: {
				bar: "var(--shadow-bar)",
			},
			maxWidth: {
				container: "var(--container)",
				prose: "var(--prose)",
			},
			spacing: {
				gutter: "var(--gutter)",
				header: "var(--header-h)",
				"section-sm": "var(--section-sm)",
				"section-md": "var(--section-md)",
				"section-lg": "var(--section-lg)",
			},
			transitionDuration: {
				fast: "var(--dur-fast)",
				base: "var(--dur-base)",
				slow: "var(--dur-slow)",
				slower: "var(--dur-slower)",
				// Movimiento v2 (design/MOVIMIENTO.md §B1)
				micro: "var(--dur-micro)",
				ui: "var(--dur-ui)",
				exit: "var(--dur-exit)",
				layout: "var(--dur-layout)",
			},
			transitionTimingFunction: {
				out: "var(--ease-out)",
				"in-out": "var(--ease-in-out)",
				DEFAULT: "var(--ease)",
				exit: "var(--ease-exit)",
				"spring-micro": "var(--spring-micro)",
				"spring-ui": "var(--spring-ui)",
				"spring-layout": "var(--spring-layout)",
			},
			transitionProperty: {
				// Todo lo que cambia al interactuar, foco incluido (anima aunque el componente fije otra propiedad).
				interactive: "background-color, border-color, color, opacity, transform, outline-color, outline-offset",
			},
		},
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
