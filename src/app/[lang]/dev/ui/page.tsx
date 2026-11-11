// Muestrario del sistema de diseño (solo revisión): tokens, tipografía y todas las primitivas.
// Fuera del sitemap, noindex y bloqueado en robots. Guía: design/SISTEMA.md.
import type { Metadata } from "next";
import Link from "next/link";
import { interiorAsientosDelanteros, rutaCosta, teslaGrisAnochecer } from "@/assets/images";
import { Logo, LogoMark } from "@/components/brand";
import { PageTransition, Reveal, RevealGroup } from "@/components/motion";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Button,
    Card,
    CardBody,
    CheckIcon,
    Chip,
    Container,
    Divider,
    Field,
    Input,
    Media,
    PageHero,
    RouteLine,
    Section,
    SectionHeader,
    Stat,
    Textarea,
} from "@/components/ui";
import { ControlsDemos } from "./controls-demos";
import { OverlaysDemo, QuoteControlsDemo } from "./demos";
import { MotionDemos } from "./motion-demos";

export const metadata: Metadata = {
    title: { absolute: "Muestrario · Unify" },
    robots: { index: false, follow: false },
};

const COLORS = [
    ["Fondo", "bg-bg", "--c-bg"],
    ["Superficie", "bg-surface", "--c-surface"],
    ["Elevada", "bg-elevated", "--c-elevated"],
    ["Texto", "bg-fg", "--c-fg"],
    ["Texto suave", "bg-fg-soft", "--c-fg-soft"],
    ["Texto atenuado", "bg-fg-muted", "--c-fg-muted"],
    ["Secundario", "bg-fg-subtle", "--c-fg-subtle"],
    ["Trazo", "bg-route", "--c-route"],
    ["Línea", "bg-line", "--line"],
    ["Línea marcada", "bg-line-strong", "--line-strong"],
    ["Rojo", "bg-brand", "--c-brand"],
    ["Acento", "bg-brand-ink", "--c-brand-ink"],
] as const;

const TYPE = [
    ["type-display", "Display · Archivo 122 % · 30→76", "Viaja en silencio."],
    ["type-title", "Título · 32→52", "Llega a tiempo."],
    ["type-heading", "Encabezado · 24→34", "Select"],
    ["type-subheading", "Subtítulo · 118 % · 20→26", "Polanco a AICM Terminal 1"],
    ["type-figure", "Cifra · Satoshi 500 tabular · 24→30", "$450 MXN"],
    ["type-lead", "Entrada · 16→18", "Tu chofer privado en Tesla, puntual y con tarifa fija desde que cotizas."],
    ["type-body", "Cuerpo · 16", "Incluye 15 minutos de espera sin costo en cada viaje."],
    ["type-small", "Pequeño · 15", "Una experiencia elevada, con detalles pensados para tu comodidad."],
    ["type-label", "Etiqueta · 13 / 500", "Origen · Destino · Hora"],
] as const;

const FEATURES = ["Tesla Model 3", "Conductor certificado", "Música a tu elección", "Bebida de bienvenida"];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Section space="sm" aria-label={title}>
            <h2 className="type-subheading mb-8 border-t border-line pt-8 text-fg-subtle">{title}</h2>
            {children}
        </Section>
    );
}

export default function UiPage() {
    return (
        <PageTransition>
            <PageHero
                title="Sistema Nocturno"
                text="Tokens, tipografía y primitivas del sitio. Todo lo que ves aquí sale de src/components y src/styles."
                media={{ src: teslaGrisAnochecer, alt: "Tesla Model 3 gris en una carretera de desierto al anochecer", position: "50% 62%" }}
            >
                <Button asChild>
                    <Link href="/dev/frame">Ver en móvil y tablet</Link>
                </Button>
                <Button asChild variant="secondary">
                    <a href="#primitivas">Primitivas</a>
                </Button>
            </PageHero>

            <Block title="Color">
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                    {COLORS.map(([name, cls, token]) => (
                        <li key={token} className="flex flex-col gap-1">
                            <span className={`mb-2 h-16 rounded-control border border-line ${cls}`} />
                            <span className="type-label">{name}</span>
                            <code className="type-label font-normal text-fg-subtle">{token}</code>
                        </li>
                    ))}
                </ul>
            </Block>

            <Block title="Tipografía">
                <dl className="flex flex-col">
                    {TYPE.map(([cls, label, sample]) => (
                        <div key={cls} className="grid gap-2 border-b border-line py-6 md:grid-cols-[16rem_1fr] md:gap-8">
                            <dt className="type-label font-normal text-fg-subtle">
                                <code>.{cls}</code>
                                <br />
                                {label}
                            </dt>
                            <dd className={cls}>{sample}</dd>
                        </div>
                    ))}
                </dl>
            </Block>

            <Block title="Encabezado de sección">
                <SectionHeader
                    title="Tres niveles, un mismo Tesla."
                    text="Elige cuánto quieres que el viaje haga por ti. El precio queda fijo desde que cotizas."
                    action={
                        <Button asChild variant="link">
                            <a href="#primitivas">Comparar niveles</a>
                        </Button>
                    }
                />
                <SectionHeader align="center" title="Preguntas frecuentes" text="Lo que más nos preguntan antes del primer viaje." className="mb-0" />
            </Block>

            <Block title="Botones">
                <div id="primitivas" className="flex flex-col gap-8">
                    <div className="flex flex-wrap items-center gap-3">
                        <Button>Cotizar</Button>
                        <Button variant="secondary">Cotizar Select</Button>
                        <Button variant="ghost">Ver detalles</Button>
                        <Button variant="link">Ver todas las tarifas</Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button size="sm">Pequeño 44</Button>
                        <Button size="md">Mediano 52</Button>
                        <Button size="lg">
                            Reservar por WhatsApp
                        </Button>
                        <Button disabled>Deshabilitado</Button>
                        <Button variant="secondary" disabled>
                            Deshabilitado
                        </Button>
                    </div>
                </div>
            </Block>

            <Block title="Controles">
                <p className="type-small mb-6 max-w-prose text-fg-subtle">
                    Cada acción tiene su reacción animada: presión, foco con teclado, deshabilitar, deslizar, rodar, desplegar. Escenarios C* de
                    scripts/motion/escenarios.json.
                </p>
                <ControlsDemos />
            </Block>

            <Block title="Tarjeta, chip, cifra y línea">
                <div className="grid gap-6 lg:grid-cols-[480px_minmax(0,1fr)]">
                    <Card as="article" padding="none">
                        <Media src={interiorAsientosDelanteros} alt="Asientos delanteros blancos del Tesla vistos desde atrás" radius="none" sizes="(min-width: 1024px) 480px, 100vw" className="h-[150px]" />
                        <CardBody>
                            <div className="flex items-baseline justify-between gap-4">
                                <h3 className="type-heading">Select</h3>
                                <p className="flex items-baseline gap-1.5 text-sm font-medium text-fg-subtle">
                                    Desde <span className="tabular text-[1.375rem] text-fg">$399</span> MXN
                                </p>
                            </div>
                            <p className="type-small mt-3 text-fg-subtle">Una experiencia elevada, con detalles pensados para tu comodidad.</p>
                            <ul className="type-small mt-5 flex flex-col gap-2.5 border-t border-line pt-5">
                                {FEATURES.map((f) => (
                                    <li key={f} className="flex items-center gap-3">
                                        <CheckIcon className="text-brand-ink" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Button variant="secondary" className="mt-8 w-full">
                                Cotizar Select
                            </Button>
                        </CardBody>
                    </Card>

                    <div className="flex flex-col gap-10">
                        <div className="flex flex-wrap items-baseline gap-x-16 gap-y-6 border-t border-line pt-8">
                            <Stat value="+1,500" label="viajes" />
                            <Stat value="98 %" label="de satisfacción" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Chip>Aeropuerto</Chip>
                            <Chip>Por horas</Chip>
                            <Chip tone="dot">Disponible hoy</Chip>
                        </div>
                        <div className="flex flex-col gap-6">
                            <p className="type-subheading flex flex-wrap items-center gap-4">
                                Polanco
                                <RouteLine label="a" className="w-14" />
                                AICM Terminal 1
                            </p>
                            <RouteLine draw />
                            <div className="flex h-28 gap-10">
                                <RouteLine orientation="vertical" />
                                <RouteLine orientation="vertical" draw />
                                <Divider orientation="vertical" />
                                <Divider orientation="vertical" strong />
                            </div>
                            <Divider />
                        </div>
                    </div>
                </div>
            </Block>

            <Block title="Formulario y cotizador">
                <div className="grid gap-10 lg:grid-cols-2">
                    <form className="flex flex-col gap-5" action="#">
                        <Field label="Correo" hint="Te enviamos la confirmación aquí.">
                            <Input type="email" autoComplete="email" placeholder="tu@correo.com" />
                        </Field>
                        <Field label="Teléfono" error="Escribe 10 dígitos, sin espacios.">
                            <Input type="tel" defaultValue="55 1234" autoComplete="tel" />
                        </Field>
                        <Field label="Vuelo" hint="Deshabilitado hasta elegir aeropuerto.">
                            <Input disabled placeholder="AM 123" />
                        </Field>
                        <Field label="Notas para el chofer">
                            <Textarea placeholder="Equipaje, silla para niño, punto exacto de encuentro" />
                        </Field>
                    </form>
                    <Card tone="surface">
                        <QuoteControlsDemo />
                    </Card>
                </div>
            </Block>

            <Block title="Preguntas, diálogo y hoja">
                <div className="grid gap-10 lg:grid-cols-2">
                    <Accordion type="single" collapsible>
                        <AccordionItem value="espera">
                            <AccordionTrigger>¿Cuánto tiempo de espera incluye?</AccordionTrigger>
                            <AccordionContent>Cada viaje incluye 15 minutos de espera sin costo.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="casetas">
                            <AccordionTrigger>¿Las casetas están incluidas?</AccordionTrigger>
                            <AccordionContent>No. Las casetas se pagan aparte, al costo.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="pago">
                            <AccordionTrigger>¿Cómo pago?</AccordionTrigger>
                            <AccordionContent>Con tarjeta o transferencia al confirmar tu viaje.</AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <OverlaysDemo />
                </div>
            </Block>

            <Block title="Foto y movimiento">
                <div className="relative overflow-hidden rounded-media">
                    <Media src={teslaGrisAnochecer} alt="" fill veil="bottom" radius="none" sizes="(min-width: 1440px) 1280px, 100vw" position="50% 60%" />
                    <div className="relative flex aspect-[4/3] flex-col justify-end gap-3 p-6 md:aspect-[21/9] md:p-10">
                        <p className="type-heading max-w-xl">La luz viene de la foto, no de efectos.</p>
                        <p className="max-w-md text-fg-soft">Velo inferior para leer texto encima. Nada de texto atenuado sobre fotos.</p>
                    </div>
                </div>
            </Block>

            <Block title="Movimiento">
                <MotionDemos />
                {/* RevealGroup: aparece al entrar en pantalla, escalonado (60 ms), una sola vez. */}
                <RevealGroup id="mov-reveal" className="mt-section-md grid gap-4 sm:grid-cols-3">
                    {["Puntual", "Silencioso", "Precio fijo"].map((word, i) => (
                        <Reveal key={word} variant="item" index={i}>
                            <Card>
                                <p className="type-heading">{word}</p>
                            </Card>
                        </Reveal>
                    ))}
                </RevealGroup>
                <Reveal id="mov-reveal-media" variant="media" className="mt-4">
                    <Media src={rutaCosta} alt="" sizes="(min-width: 1440px) 1280px, 100vw" className="aspect-[21/9]" />
                </Reveal>
                <Reveal id="mov-reveal-text" className="mt-4">
                    <Card tone="elevated">
                        <p>Reveal: aparece una vez al entrar en pantalla, 14 px y fundido; la foto, con escala 1.03 → 1.</p>
                    </Card>
                </Reveal>
            </Block>

            <Block title="Marca">
                <div className="flex flex-wrap items-end gap-12">
                    <Logo className="h-16" />
                    <Logo className="h-8" />
                    <LogoMark className="size-16" />
                    <span className="grid size-16 place-items-center rounded-[14px] bg-surface">
                        <LogoMark title={null} className="size-12" />
                    </span>
                </div>
            </Block>

            <Container className="pb-section-md" />
        </PageTransition>
    );
}
