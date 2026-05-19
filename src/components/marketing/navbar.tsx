"use client";

import { useLanguage } from "@/contexts/language-context";
import { WHATSAPP_LINK } from "@/constants";
import { cn } from "@/lib";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { ArrowRightIcon, MenuIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Lang } from "@/translations";

const NAV_KEYS = ["inicio", "servicios", "tarifas", "about", "contacto"] as const;
const NAV_HREFS: Record<string, string> = {
    inicio: "/",
    servicios: "/servicios",
    tarifas: "#tarifas",
    about: "#nosotros",
    contacto: "#contacto",
};

const Navbar = () => {
    const { lang, setLang, t } = useLanguage();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (v) => {
        setScrolled(v > 60);
        if (v > 60 && mobileOpen) setMobileOpen(false);
    });

    const navItems = NAV_KEYS.map((key) => ({
        name: t.nav[key as keyof typeof t.nav],
        href: NAV_HREFS[key],
    }));

    return (
        <motion.header
            className="fixed inset-x-0 top-0 z-50 w-full"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 32, delay: 0.1 }}
        >
            {/* Desktop nav */}
            <motion.nav
                animate={{
                    backgroundColor: scrolled ? "rgba(0,0,0,0.88)" : "transparent",
                    backdropFilter: scrolled ? "blur(24px)" : "blur(0px)",
                    borderBottomColor: scrolled ? "rgba(255,49,49,0.12)" : "rgba(0,0,0,0)",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="hidden lg:flex items-center justify-between w-full px-8 xl:px-16 py-5 border-b"
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 shrink-0">
                    <Image
                        src="/icons/iconouni.png"
                        alt="UNIFY"
                        width={44}
                        height={44}
                        className="w-auto h-11"
                    />
                    <span className="text-xl font-bold text-white tracking-tight">UNIFY</span>
                </Link>

                {/* Links — centered */}
                <div className="flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative px-4 py-2 text-sm text-white/55 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right: language toggle + CTA */}
                <div className="flex items-center gap-3 shrink-0">
                    <LangToggle lang={lang} setLang={setLang} />
                    <Link
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 bg-[#ff3131] hover:bg-[#ff3131]/90 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 shadow-[0_0_20px_rgba(255,49,49,0.3)] hover:shadow-[0_0_35px_rgba(255,49,49,0.5)]"
                    >
                        {t.nav.reservar}
                        <ArrowRightIcon className="size-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </Link>
                </div>
            </motion.nav>

            {/* Mobile nav */}
            <motion.nav
                animate={{
                    backgroundColor: scrolled || mobileOpen ? "rgba(0,0,0,0.92)" : "transparent",
                    backdropFilter: scrolled || mobileOpen ? "blur(24px)" : "blur(0px)",
                }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex lg:hidden items-center justify-between w-full px-5 py-4 border-b border-transparent"
            >
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/icons/iconouni.png" alt="UNIFY" width={36} height={36} className="w-auto h-9" />
                    <span className="text-lg font-bold text-white tracking-tight">UNIFY</span>
                </Link>
                <div className="flex items-center gap-3">
                    <LangToggle lang={lang} setLang={setLang} compact />
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="text-white p-1"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <XIcon className="size-6" /> : <MenuIcon className="size-6" />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile menu panel */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        key="mobile-menu"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="lg:hidden absolute inset-x-0 top-full bg-black/95 backdrop-blur-2xl border-b border-white/5 px-5 pb-6 pt-4 flex flex-col gap-1"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className="text-white/60 hover:text-white text-base py-3 px-3 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href={WHATSAPP_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setMobileOpen(false)}
                            className="mt-3 flex items-center justify-center gap-2 bg-[#ff3131] text-white text-sm font-medium px-5 py-3.5 rounded-full"
                        >
                            {t.nav.reservar}
                            <ArrowRightIcon className="size-4" />
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

const LangToggle = ({
    lang,
    setLang,
    compact = false,
}: {
    lang: Lang;
    setLang: (l: Lang) => void;
    compact?: boolean;
}) => {
    return (
        <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-white/6 border border-white/10">
            <button
                onClick={() => setLang("es")}
                className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                    lang === "es"
                        ? "bg-[#ff3131] text-white shadow-sm"
                        : "text-white/45 hover:text-white/75"
                )}
            >
                {compact ? "ES" : "🇲🇽 ES"}
            </button>
            <button
                onClick={() => setLang("en")}
                className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                    lang === "en"
                        ? "bg-[#ff3131] text-white shadow-sm"
                        : "text-white/45 hover:text-white/75"
                )}
            >
                {compact ? "EN" : "🇺🇸 EN"}
            </button>
        </div>
    );
};

export default Navbar;
