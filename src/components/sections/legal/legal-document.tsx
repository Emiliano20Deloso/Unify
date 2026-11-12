// Página de lectura para textos legales: cabecera con fecha, índice (lateral fijo en escritorio,
// acordeón en móvil) y el documento con medida de lectura de ~70 caracteres. Servidor salvo el índice.
// Cada sección del texto aparece al entrar en pantalla (Reveal text, sin escalonar, una sola vez).
import Link from "next/link";
import type { LegalBlock, LegalDocument as LegalDoc, Rich } from "@/content/legal/types";
import { Reveal } from "@/components/motion";
import { Button, Container, RouteLine } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import type { LegalDictionary } from "@/i18n/types";
import { cn } from "@/lib";
import { LegalToc } from "./legal-toc";
import { LegalTocMobile } from "./legal-toc-mobile";
import { RichText } from "./rich-text";

interface LegalDocumentProps {
    lang: Locale;
    doc: LegalDoc;
    title: string;
    text: string;
    ui: LegalDictionary["ui"];
    /** El otro documento legal, enlazado al pie. */
    related: { label: string; href: string };
}

const DATE_LOCALE: Record<Locale, string> = { es: "es-MX", en: "en-US" };

function formatDate(iso: string, lang: Locale): string {
    return new Intl.DateTimeFormat(DATE_LOCALE[lang], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
        new Date(`${iso}T00:00:00Z`),
    );
}

export function LegalDocument({ lang, doc, title, text, ui, related }: LegalDocumentProps) {
    const toc = doc.sections.map((s) => ({ id: s.id, label: s.title }));

    return (
        // En papel: tinta oscura sobre blanco (CanvasText con esquema claro), sin índice ni menú de la página.
        <div className="print:[color-scheme:light] print:[&_*]:!text-[CanvasText]">
            <header className="pb-section-sm pt-[calc(var(--header-h)+var(--section-sm))] print:pt-0">
                <Container>
                    <div className="flex max-w-4xl flex-col gap-5">
                        <h1 data-enter="1" className="type-display">
                            {title}
                        </h1>
                        <p data-enter="2" className="type-lead max-w-[36rem] text-fg-soft">
                            {text}
                        </p>
                        <p data-enter="2" className="type-small text-fg-subtle">
                            {ui.updated}{" "}
                            <time dateTime={doc.updated} className="text-fg-muted">
                                {formatDate(doc.updated, lang)}
                            </time>
                        </p>
                    </div>
                    <div data-enter="3" className="mt-10 md:mt-14 print:hidden">
                        <RouteLine />
                    </div>
                </Container>
            </header>

            <Container className="pb-section-lg">
                <div className="lg:grid lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] xl:gap-24">
                    <aside className="hidden lg:block print:hidden">
                        <div className="sticky top-[calc(var(--header-h)+2rem)]">
                            <LegalToc items={toc} label={ui.toc} headingId="toc-desktop" />
                        </div>
                    </aside>

                    <div className="min-w-0">
                        <div className="mb-12 lg:hidden print:hidden">
                            <LegalTocMobile items={toc} label={ui.toc} />
                        </div>

                        <article className="max-w-[35rem]">
                            {doc.sections.map((section, index) => (
                                <Reveal
                                    as="section"
                                    variant="text"
                                    key={section.id}
                                    id={section.id}
                                    aria-labelledby={`${section.id}-title`}
                                    className="border-t border-line pb-10 pt-8 first:border-t-0 first:pt-0 md:pb-12 md:pt-10 print:break-inside-avoid-page"
                                >
                                    <h2 id={`${section.id}-title`} className="type-subheading flex gap-3">
                                        <span className="tabular shrink-0 text-fg-subtle">{index + 1}.</span>
                                        <span>{section.title}</span>
                                    </h2>
                                    <div className="mt-5 flex flex-col gap-4 type-body text-fg-muted">
                                        {section.blocks.map((block, i) => (
                                            <Block key={i} block={block} lang={lang} />
                                        ))}
                                    </div>
                                </Reveal>
                            ))}

                            <Reveal as="footer" variant="text" className="border-t border-line pt-8 print:hidden">
                                <p className="type-small text-fg-subtle">{ui.related}</p>
                                <Button variant="link" size="md" asChild className="mt-1">
                                    <Link href={related.href}>{related.label}</Link>
                                </Button>
                            </Reveal>
                        </article>
                    </div>
                </div>
            </Container>
        </div>
    );
}

function Block({ block, lang }: { block: LegalBlock; lang: Locale }) {
    switch (block.type) {
        case "p":
            return (
                <p>
                    <RichText content={block.content} lang={lang} />
                </p>
            );
        case "ul":
            return (
                <ul className="flex flex-col gap-2.5">
                    {block.items.map((item, i) => (
                        <li key={i} className="relative pl-6">
                            <span aria-hidden="true" className="absolute left-1 top-[0.7em] size-1.5 rounded-full bg-fg-subtle" />
                            <RichText content={item} lang={lang} />
                        </li>
                    ))}
                </ul>
            );
        case "ol":
            return (
                <ol className="flex list-decimal flex-col gap-2.5 pl-6 marker:tabular-nums marker:text-fg-subtle">
                    {block.items.map((item, i) => (
                        <li key={i} className="pl-1">
                            <RichText content={item} lang={lang} />
                        </li>
                    ))}
                </ol>
            );
        case "table":
            return (
                <div className="my-2 overflow-x-auto rounded-card border border-line">
                    <table className="w-full border-collapse text-left type-small">
                        <caption className="sr-only">{block.caption}</caption>
                        <thead className="bg-surface">
                            <tr>
                                {block.head.map((h) => (
                                    <th key={h} scope="col" className="px-4 py-3 type-label text-fg-subtle sm:px-5">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {block.rows.map(([first, second], i) => (
                                <tr key={i} className="border-t border-line align-top">
                                    <th scope="row" className="px-4 py-3.5 font-normal text-fg sm:px-5">
                                        <RichText content={first} lang={lang} />
                                    </th>
                                    <td className={cn("px-4 py-3.5 text-fg-muted sm:px-5", isShort(second) && "tabular whitespace-nowrap")}>
                                        <RichText content={second} lang={lang} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
    }
}

/** Celdas breves (porcentajes, "Sin reembolso") no se parten en dos líneas. */
function isShort(content: Rich): boolean {
    return typeof content === "string" && content.length <= 16;
}
