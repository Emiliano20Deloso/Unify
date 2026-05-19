"use client";

import { useLanguage } from "@/contexts/language-context";
import { WHATSAPP_LINK } from "@/constants";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
    const { t } = useLanguage();

    type FooterLink = { label: string; href: string; external?: boolean };
    type FooterCol = { heading: string; links: FooterLink[] };

    const columns: FooterCol[] = [
        {
            heading: t.nav.servicios,
            links: [
                { label: t.nav.inicio, href: "/" },
                { label: t.nav.servicios, href: "/servicios" },
                { label: t.nav.tarifas, href: "#tarifas" },
            ],
        },
        {
            heading: t.nav.about,
            links: [
                { label: t.nav.about, href: "#nosotros" },
                { label: t.nav.contacto, href: "#contacto" },
                { label: "WhatsApp", href: WHATSAPP_LINK, external: true },
            ],
        },
        {
            heading: "Legal",
            links: [
                { label: "Privacidad", href: "#" },
                { label: "Términos", href: "#" },
            ],
        },
    ];

    return (
        <footer className="relative w-full border-t border-white/5 bg-black">
            {/* Top red accent line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF2400]/30 to-transparent" />

            <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

                    {/* Brand column */}
                    <div className="md:col-span-1 flex flex-col gap-5">
                        <Link href="/" className="flex items-center gap-2.5">
                            <Image
                                src="/icons/iconouni.png"
                                alt="UNIFY"
                                width={24}
                                height={24}
                                className="w-auto h-6"
                            />
                            <span className="text-lg font-bold text-white tracking-tight">UNIFY</span>
                        </Link>
                        <p className="text-sm text-white/65 leading-relaxed max-w-[220px]">
                            Transporte de lujo en flota exclusiva Tesla. Silencio, potencia y sofisticación.
                        </p>
                    </div>

                    {/* Link columns */}
                    {columns.map((col) => (
                        <div key={col.heading} className="flex flex-col gap-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/45 font-medium">
                                {col.heading}
                            </p>
                            <ul className="flex flex-col gap-3">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            target={link.external ? "_blank" : undefined}
                                            rel={link.external ? "noopener noreferrer" : undefined}
                                            className="text-sm text-white/65 hover:text-white transition-colors duration-200"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-16 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-white/45">
                        © {new Date().getFullYear()} UNIFY. All rights reserved.
                    </p>
                    <p className="text-xs text-white/70 italic">
                        The luxury of travelling green
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
