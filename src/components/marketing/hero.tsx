"use client";

import { useLanguage } from "@/contexts/language-context";
import { ChevronDownIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { QuoteDialog } from "./quote-form";

const Hero = () => {
    const { t } = useLanguage();

    return (
        <section className="relative w-full min-h-screen flex items-end overflow-hidden">

            {/* Background image */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/Hero.jpg"
                    alt="Tesla Model 3 Performance — UNIFY"
                    fill
                    className="object-cover object-center"
                    priority
                    quality={90}
                />
                {/* Dark overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
            </div>

            {/* Content — bottom-left */}
            <div className="relative z-10 w-full px-6 lg:px-20 xl:px-28 pb-28 lg:pb-40">
                <div className="max-w-3xl flex flex-col gap-6">

                    <div>
                        <h1 className="text-[5rem] sm:text-[7rem] lg:text-[9rem] xl:text-[11rem] font-bold text-white leading-none tracking-tight">
                            UNIFY
                        </h1>
                        <p className="mt-3 text-lg sm:text-2xl lg:text-3xl text-white/50 font-light italic tracking-wide">
                            {t.hero.tagline}
                        </p>
                    </div>

                    <p className="max-w-md text-base lg:text-lg text-white/40 leading-relaxed">
                        {t.hero.description}
                    </p>

                    <div className="flex items-center gap-5 mt-2">
                        <QuoteDialog
                            trigger={
                                <Button
                                    size="lg"
                                    className="group bg-[#ff3131] hover:bg-[#ff3131]/90 text-white border-0 text-base px-10 h-14 rounded-full shadow-[0_0_50px_rgba(255,49,49,0.45)] hover:shadow-[0_0_70px_rgba(255,49,49,0.65)] transition-all duration-300"
                                >
                                    {t.hero.cta}
                                    <ChevronDownIcon className="ml-2 size-5 group-hover:translate-y-0.5 transition-transform duration-300" />
                                </Button>
                            }
                        />

                        <div className="hidden sm:flex items-center gap-6 pl-4 border-l border-white/10">
                            <div>
                                <p className="text-2xl font-bold text-white">+1,500</p>
                                <p className="text-xs text-white/40 uppercase tracking-wider">{t.hero.tripsLabel}</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">98%</p>
                                <p className="text-xs text-white/40 uppercase tracking-wider">{t.hero.satisfactionLabel}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 opacity-40">
                <ChevronDownIcon className="size-5 text-white animate-bounce" />
            </div>
        </section>
    );
};

export default Hero;
