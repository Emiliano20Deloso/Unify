// Texto en línea de los documentos legales: negritas y enlaces (correo, WhatsApp, sitio, páginas).
import Link from "next/link";
import { Fragment } from "react";
import type { Inline, Rich } from "@/content/legal/types";
import type { Locale } from "@/i18n/config";
import { localizedHref } from "@/i18n/routes";
import { site } from "@/lib/site";

const LINK =
    "rounded-sm text-fg underline decoration-line-strong decoration-1 underline-offset-[0.2em] transition-[text-decoration-color] duration-fast ease hover:decoration-fg";

const host = new URL(site.url).host;

function InlineNode({ node, lang }: { node: Inline; lang: Locale }) {
    if (typeof node === "string") return node;
    if ("strong" in node) return <strong className="font-medium text-fg">{node.strong}</strong>;
    switch (node.link) {
        case "email":
            return (
                <a href={`mailto:${site.email}`} className={LINK}>
                    {site.email}
                </a>
            );
        case "whatsapp":
            return (
                <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" className={`${LINK} tabular whitespace-nowrap`}>
                    {site.whatsapp.display}
                </a>
            );
        case "site":
            return (
                <Link href={localizedHref(lang, "home")} className={LINK}>
                    {host}
                </Link>
            );
        case "route": {
            const href = localizedHref(lang, node.route);
            return (
                <Link href={href} className={LINK}>
                    {node.text ?? `${host}${href}`}
                </Link>
            );
        }
    }
}

export function RichText({ content, lang }: { content: Rich; lang: Locale }) {
    const nodes = Array.isArray(content) ? (content as readonly Inline[]) : [content as Inline];
    return (
        <>
            {nodes.map((node, i) => (
                <Fragment key={i}>
                    <InlineNode node={node} lang={lang} />
                </Fragment>
            ))}
        </>
    );
}
