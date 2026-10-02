"use client";

import { useLanguage } from "@/contexts/language-context";
import { WHATSAPP_LINK } from "@/constants";
import { cn } from "@/lib";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform, useMotionTemplate } from "motion/react";
import { ArrowRightIcon, CalendarIcon, ClockIcon, MapPinIcon, MenuIcon, PlusIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import type { Lang } from "@/translations";

const NAV_KEYS = ["inicio", "servicios", "tarifas", "about"] as const;
const NAV_HREFS: Record<string, string> = {
    inicio: "/",
    servicios: "/#servicios",
    tarifas: "/tarifas",
    about: "#nosotros",
};

const Navbar = () => {
    const { lang, setLang, t } = useLanguage();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [pastHero, setPastHero] = useState(false);
    const [showReturn, setShowReturn] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (v) => {
        if (v > 60 && mobileOpen) setMobileOpen(false);
        // Hero is min-h-screen; reveal UNIFY after scrolling ~80% of viewport
        if (typeof window !== "undefined") {
            setPastHero(v > window.innerHeight * 0.8);
        }
    });

    // Continuous scroll-linked liquid glass effect (0px → 140px)
    const GLASS_RANGE: [number, number] = [0, 140];
    const bgOpacity = useTransform(scrollY, GLASS_RANGE, [0, 0.55], { clamp: true });
    const blurAmount = useTransform(scrollY, GLASS_RANGE, [0, 20], { clamp: true });
    const saturateAmount = useTransform(scrollY, GLASS_RANGE, [100, 180], { clamp: true });
    const borderOpacity = useTransform(scrollY, GLASS_RANGE, [0, 0.08], { clamp: true });
    const highlightOpacity = useTransform(scrollY, GLASS_RANGE, [0, 0.08], { clamp: true });
    const shadowOpacity = useTransform(scrollY, GLASS_RANGE, [0, 0.35], { clamp: true });

    const glassBg = useMotionTemplate`rgba(15,15,17,${bgOpacity})`;
    const glassFilter = useMotionTemplate`blur(${blurAmount}px) saturate(${saturateAmount}%)`;
    const glassBorder = useMotionTemplate`rgba(255,255,255,${borderOpacity})`;
    const glassShadow = useMotionTemplate`inset 0 1px 0 0 rgba(255,255,255,${highlightOpacity}), 0 8px 32px 0 rgba(0,0,0,${shadowOpacity})`;

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
                style={{
                    backgroundColor: glassBg,
                    backdropFilter: glassFilter,
                    WebkitBackdropFilter: glassFilter,
                    borderBottomColor: glassBorder,
                    boxShadow: glassShadow,
                }}
                className="hidden lg:flex items-center justify-between w-full px-8 xl:px-16 py-5 border-b"
            >
                {/* Logo */}
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
                            className="relative px-4 py-2 text-base text-white hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right: language toggle + CTA */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="-translate-x-28">
                        <LangToggle lang={lang} setLang={setLang} />
                    </div>
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
                style={{
                    backgroundColor: glassBg,
                    backdropFilter: glassFilter,
                    WebkitBackdropFilter: glassFilter,
                    borderBottomColor: glassBorder,
                    boxShadow: glassShadow,
                }}
                className="flex lg:hidden items-center justify-between w-full px-5 py-5 border-b"
            >
                <Link href="/" className="relative flex items-center h-10 min-w-[90px]">
                    {/* Icon logo — visible within hero */}
                    <Image
                        src="/icons/iconouni.png"
                        alt="UNIFY"
                        width={44}
                        height={44}
                        className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 w-auto h-10 transition-opacity duration-300",
                            pastHero ? "opacity-0 pointer-events-none" : "opacity-100"
                        )}
                    />
                    {/* Text — visible after scrolling past hero */}
                    <span className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-white tracking-tight transition-opacity duration-300",
                        pastHero ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}>UNIFY</span>
                </Link>
                <div className="flex items-center gap-5">
                    {!mobileOpen && (
                        <button
                            onClick={() => setMobileOpen(true)}
                            className={cn("p-1 transition-colors duration-300", pastHero ? "text-white" : "text-black")}
                            aria-label="Abrir menú"
                        >
                            <MenuIcon className="size-9" />
                        </button>
                    )}
                </div>
            </motion.nav>

            {/* Mobile quote menu — slides up from bottom, white rounded card */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="menu-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => setMobileOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />
                        {/* Modal */}
                        <motion.div
                            key="mobile-menu"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "tween", duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                            className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] px-5 pt-5 pb-7 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
                        >
                            {/* Top row: X on left, title centered, spacer right */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    aria-label="Cerrar"
                                    className="p-1 text-black active:scale-90 transition-transform"
                                >
                                    <XIcon className="size-6" />
                                </button>
                                <h2 className="text-base font-semibold text-black tracking-tight">{t.quote.title}</h2>
                                <div className="w-8" />
                            </div>

                            {/* Origin & Destination */}
                            <div className="flex flex-col gap-2">
                                <p className="text-xs text-black/50 font-medium px-1">{t.quote.originDestLabel}</p>
                                <div className="flex items-center gap-3 bg-black/5 rounded-full px-4 py-3">
                                    <MapPinIcon className="size-4 text-black/60 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder={t.quote.originPlaceholder}
                                        className="flex-1 bg-transparent text-sm text-black placeholder:text-black/40 outline-none"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowReturn(!showReturn)}
                                    className="flex items-center gap-1.5 text-sm text-black/70 hover:text-black px-2 py-1 w-fit transition-colors"
                                >
                                    <PlusIcon className={cn("size-4 transition-transform", showReturn && "rotate-45")} />
                                    {showReturn ? t.quote.removeReturn : t.quote.addReturn}
                                </button>
                            </div>

                            {/* Pickup date + time */}
                            <div className="flex flex-col gap-2">
                                <p className="text-xs text-black/50 font-medium px-1">{t.quote.pickupLabel}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-2.5 bg-black/5 rounded-2xl px-3 py-3">
                                        <CalendarIcon className="size-4 text-black/60 shrink-0" />
                                        <input
                                            type="date"
                                            className="flex-1 bg-transparent text-sm text-black outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2.5 bg-black/5 rounded-2xl px-3 py-3">
                                        <ClockIcon className="size-4 text-black/60 shrink-0" />
                                        <input
                                            type="time"
                                            defaultValue="10:00"
                                            className="flex-1 bg-transparent text-sm text-black outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Return date + time (toggled by "Agrega regreso") */}
                            <AnimatePresence initial={false}>
                                {showReturn && (
                                    <motion.div
                                        key="return-section"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex flex-col gap-2">
                                            <p className="text-xs text-black/50 font-medium px-1">{t.quote.returnLabel}</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex items-center gap-2.5 bg-black/5 rounded-2xl px-3 py-3">
                                                    <CalendarIcon className="size-4 text-black/60 shrink-0" />
                                                    <input
                                                        type="date"
                                                        className="flex-1 bg-transparent text-sm text-black outline-none"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2.5 bg-black/5 rounded-2xl px-3 py-3">
                                                    <ClockIcon className="size-4 text-black/60 shrink-0" />
                                                    <input
                                                        type="time"
                                                        defaultValue="18:00"
                                                        className="flex-1 bg-transparent text-sm text-black outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Language toggle */}
                            <div className="self-center pt-1">
                                <LangToggle lang={lang} setLang={setLang} variant="light" />
                            </div>

                            {/* CTA */}
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="w-full flex items-center justify-center gap-2 bg-black hover:bg-black/90 text-white text-base font-medium py-4 rounded-full transition-colors"
                            >
                                {t.hero.cta}
                                <ArrowRightIcon className="size-4" />
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

const LangToggle = ({
    lang,
    setLang,
    variant = "dark",
}: {
    lang: Lang;
    setLang: (l: Lang) => void;
    variant?: "dark" | "light";
}) => {
    const isDark = variant === "dark";
    const pillId = useId();
    return (
        <div className={cn(
            "relative flex items-center gap-0.5 p-0.5 rounded-full",
            isDark
                ? "bg-white/10 border border-white shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                : "bg-black/10 border border-black shadow-[0_0_12px_rgba(0,0,0,0.25)]"
        )}>
            {(["es", "en"] as const).map((l) => {
                const active = lang === l;
                return (
                    <button
                        key={l}
                        onClick={() => setLang(l)}
                        className={cn(
                            "relative px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200",
                            active
                                ? "text-white"
                                : isDark
                                    ? "text-white/55 hover:text-white/85"
                                    : "text-black hover:text-black"
                        )}
                    >
                        {active && (
                            <motion.span
                                layoutId={`lang-toggle-pill-${pillId}`}
                                className="absolute inset-0 rounded-full bg-[#ff3131] shadow-[0_2px_10px_rgba(255,49,49,0.35)]"
                                transition={{ type: "tween", duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                            />
                        )}
                        <span className="relative z-10">{l.toUpperCase()}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default Navbar;
