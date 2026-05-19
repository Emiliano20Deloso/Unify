"use client";

import { useLanguage } from "@/contexts/language-context";
import Container from "../global/container";
import LogoLoop from "../ui/logo-loop";

const companies = [
    { name: "Didi", src: "/images/companies/logodidi.png", alt: "Didi" },
    { name: "Uber", src: "/images/companies/Uber Icon.svg", alt: "Uber" },
    { name: "Tesla", src: "/images/Logoteslablanc.png", alt: "Tesla" },
    { name: "Waze", src: "/images/companies/Waze Icon.svg", alt: "Waze" },
    { name: "Google Maps", src: "/images/companies/Icono Googlemaps.svg", alt: "Google Maps" },
];

const Companies = () => {
    const { t } = useLanguage();

    return (
        <div className="relative flex flex-col items-center justify-center w-full py-20 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF2400]/40 to-transparent" />

            <Container>
                <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#FF2400]/70 font-medium">
                        {t.companies.label}
                    </p>
                    <h4 className="text-2xl text-center lg:text-4xl font-medium text-white">
                        {t.companies.title}{" "}
                        <span className="italic text-white/50">{t.companies.titleHighlight}</span>{" "}
                        {t.companies.titleEnd}
                    </h4>
                </div>
            </Container>

            <Container delay={0.1}>
                <div className="w-full max-w-6xl mx-auto pt-12">
                    <div className="h-28 md:h-36 relative overflow-hidden">
                        <LogoLoop
                            logos={companies}
                            speed={150}
                            direction="left"
                            logoHeight={52}
                            gap={60}
                            mobileGap={20}
                            mobileSpeed={100}
                            scaleOnHover
                            fadeOut
                            fadeOutColor="rgba(0, 0, 0, 0)"
                            ariaLabel="Partner companies"
                        />
                    </div>
                </div>
            </Container>

            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
    );
};

export default Companies;
