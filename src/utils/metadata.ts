import { Metadata } from "next";

interface MetadataProps {
    title?: string;
    description?: string;
    icons?: Metadata["icons"];
    noIndex?: boolean;
    keywords?: string[];
    author?: string;
    twitterHandle?: string;
    type?: "website" | "article" | "profile";
    locale?: string;
    alternates?: Record<string, string>;
    publishedTime?: string;
    modifiedTime?: string;
}

export const generateMetadata = ({
    title = `Unify - Unify your journey`,
    description = `Traslados ejecutivos en Tesla con atención personalizada, puntualidad, seguridad y snacks a bordo. Movilidad premium, cómoda y sustentable.`,
    icons = [
        {
            rel: "icon",
            url: "/icons/iconounify.png",
            media: "(prefers-color-scheme: light)",
        },
        {
            rel: "icon",
            url: "/icons/iconounify.png",
            media: "(prefers-color-scheme: dark)",
        },
    ],
    noIndex = false,
    keywords = [
        "traslados ejecutivos",
        "transporte ejecutivo",
        "traslados en Tesla",
        "movilidad premium",
        "servicio de transporte ejecutivo",
        "traslados corporativos",
        "transporte de lujo",
        "movilidad sustentable",
        "traslados con snacks",
        "servicio de chofer ejecutivo",
        "transporte empresarial",
        "traslados puntuales",
        "transporte seguro",
        "movilidad ejecutiva",
        "servicio de transporte personalizado"
    ],
    author = process.env.NEXT_PUBLIC_AUTHOR_NAME,
    type = "website",
}: MetadataProps = {}): Metadata => {
    const metadataBase = new URL(process.env.NEXT_PUBLIC_APP_URL || "https://unify-eight.vercel.app");

    return {
        metadataBase,
        title: {
            template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME}`,
            default: title
        },
        description,
        keywords,
        authors: [{ name: author }],
        creator: author,
        publisher: process.env.NEXT_PUBLIC_APP_NAME,
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        icons,
    };
};