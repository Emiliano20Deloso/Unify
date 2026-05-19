"use client";

import { useLanguage } from "@/contexts/language-context";
import { WHATSAPP_LINK } from "@/constants";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import Container from "../global/container";
import { Button } from "../ui/button";
import Particles from "../ui/particles";

const CTA = () => {
    const { t } = useLanguage();

    return (
        <div className="relative flex flex-col items-center justify-center w-full py-24">
            <Container className="max-w-6xl mx-auto w-full">
                <div className="relative flex flex-col items-center justify-center py-16 lg:py-24 px-6 rounded-2xl lg:rounded-3xl bg-[#070000] text-center border border-[#FF2400]/20 overflow-hidden">

                    <Particles
                        refresh
                        ease={80}
                        quantity={60}
                        color="#ff3131"
                        className="hidden lg:block absolute inset-0 z-0 opacity-30"
                    />
                    <Particles
                        refresh
                        ease={80}
                        quantity={25}
                        color="#ff3131"
                        className="block lg:hidden absolute inset-0 z-0 opacity-30"
                    />

                    <motion.div
                        className="absolute -bottom-1/4 left-1/2 -translate-x-1/2 w-72 h-40 lg:w-[500px] lg:h-56 rounded-full blur-[6rem] lg:blur-[10rem] -z-10"
                        style={{
                            background: "conic-gradient(from 0deg at 50% 50%, #FF2400 0deg, #7f0000 180deg, #FF2400 360deg)",
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />

                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF2400]/60 to-transparent" />

                    <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl">
                        <p className="text-xs uppercase tracking-[0.3em] text-[#FF2400]/70 font-medium">
                            {t.cta.label}
                        </p>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold !leading-tight text-white">
                            {t.cta.title}{" "}
                            <span className="italic font-light text-white/50">{t.cta.titleHighlight}</span>
                        </h2>
                        <p className="text-white/40 text-base max-w-lg">{t.cta.subtitle}</p>
                        <Link href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                            <Button
                                size="lg"
                                className="group bg-[#ff3131] hover:bg-[#ff3131]/90 text-white border-0 text-lg px-12 h-16 rounded-full shadow-[0_0_50px_rgba(255,49,49,0.45)] hover:shadow-[0_0_80px_rgba(255,49,49,0.7)] transition-all duration-300 mt-2"
                            >
                                {t.cta.button}
                                <ArrowRightIcon className="ml-2 size-5 group-hover:translate-x-1 transition-transform duration-300" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default CTA;
