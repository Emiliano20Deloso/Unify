"use client";

import { useLanguage } from "@/contexts/language-context";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Container from "../global/container";
import { Button } from "../ui/button";
import { QuoteDialog } from "./quote-form";

const CTA = () => {
    const { t } = useLanguage();

    return (
        <div className="relative flex flex-col items-center justify-center w-full py-24">
            <Container className="max-w-6xl mx-auto w-full">
                <div className="relative flex flex-col items-center justify-center py-16 lg:py-24 px-6 rounded-2xl lg:rounded-3xl text-center border border-[#FF2400]/25 overflow-hidden">

                    {/* Background image */}
                    <div className="absolute inset-0 -z-10">
                        <Image
                            src="/images/new.jpg"
                            alt="UNIFY Tesla"
                            fill
                            className="object-cover object-center"
                            quality={80}
                        />
                        <div className="absolute inset-0 bg-black/35" />
                    </div>

                    {/* Top border glow */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF2400]/60 to-transparent" />
                    {/* Bottom border glow */}
                    <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF2400]/30 to-transparent" />

                    <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl">
                        <p className="text-xs uppercase tracking-[0.3em] text-[#FF2400]/80 font-medium">
                            {t.cta.label}
                        </p>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold !leading-tight text-white">
                            {t.cta.title}{" "}
                            <span className="italic font-light text-white/60">{t.cta.titleHighlight}</span>
                        </h2>
                        <p className="text-white/50 text-base max-w-lg">{t.cta.subtitle}</p>
                        <QuoteDialog
                            trigger={
                                <Button
                                    size="lg"
                                    className="group bg-[#ff3131] hover:bg-[#ff3131]/90 text-white border-0 text-lg px-12 h-16 rounded-full shadow-[0_0_50px_rgba(255,49,49,0.5)] hover:shadow-[0_0_80px_rgba(255,49,49,0.7)] transition-all duration-300 mt-2"
                                >
                                    {t.cta.button}
                                    <ArrowRightIcon className="ml-2 size-5 group-hover:translate-x-1 transition-transform duration-300" />
                                </Button>
                            }
                        />
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default CTA;
