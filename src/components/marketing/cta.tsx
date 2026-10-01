"use client";

import { useLanguage } from "@/contexts/language-context";
import Image from "next/image";
import Container from "../global/container";

const CTA = () => {
    const { t } = useLanguage();

    return (
        <div className="relative flex flex-col items-center justify-center w-full py-24">
            <Container className="max-w-6xl mx-auto w-full">
                <div className="relative flex flex-col items-center justify-start pt-10 pb-24 lg:pt-14 lg:pb-32 px-6 rounded-2xl lg:rounded-3xl text-center border-2 border-[#FF2400] shadow-[0_0_40px_rgba(255,36,0,0.45),inset_0_0_20px_rgba(255,36,0,0.1)] overflow-hidden">

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
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold !leading-tight text-white">
                            {t.cta.title}{" "}
                            <span className="italic font-light text-white/60">{t.cta.titleHighlight}</span>
                        </h2>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default CTA;
