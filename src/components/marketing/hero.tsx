import { WHATSAPP_LINK } from "@/constants";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Container from "../global/container";
import Icons from "../global/icons";
import { Button } from "../ui/button";
import { OrbitingCircles } from "../ui/orbiting-circles";

const Hero = () => {
    return (
        <div className="relative flex flex-col items-center justify-start sm:justify-center w-full min-h-[85vh] sm:min-h-[90vh] px-4 sm:px-6 lg:px-8 pt-8 sm:pt-0">

                <div className="absolute flex lg:hidden size-40 rounded-full blur-[10rem] top-0 left-1/2 -translate-x-1/2 -z-10"></div>

            {/* red glow behind hero content */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] rounded-full bg-gradient-to-br from-[#FF2400]/20 via-[#FF2400]/10 to-transparent blur-3xl -z-10"></div>

            <div className="flex flex-col items-center justify-start sm:justify-center gap-y-2 sm:gap-y-3 md:gap-y-4 lg:gap-y-6 xl:gap-y-8 relative z-10 w-full">
                <div className="flex flex-col items-center justify-center text-center gap-y-1.5 sm:gap-y-2 md:gap-y-3 lg:gap-y-4 w-full">
                    <Container delay={0.15}>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-center !leading-tight max-w-4xl mx-auto text-white px-2 sm:px-4">
                        UNIFY
                    </h1>

                    </Container>
                    <Container delay={0.2}>
                        <p className="max-w-xl mx-auto mt-0.5 sm:mt-1 md:mt-2 text-base sm:text-sm md:text-base lg:text-xl xl:text-2xl text-center text-muted-foreground px-2 sm:px-4">
                            The luxury of travelling green
                        </p>
                    </Container>
                    <Container delay={0.25} className="z-20">
                        <div className="flex items-center justify-center mt-2 sm:mt-3 md:mt-4 lg:mt-6 gap-x-4 px-2 sm:px-4">
                            <Link href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
                                <Button size="lg" className="bg-[#ff3131] hover:opacity-80 text-[#ffffff] border-0 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3">
                                <span>Empieza tu viaje</span>
                                    <ArrowRightIcon className="size-3 sm:size-4 md:size-5 lg:size-6 xl:size-7 group-hover:translate-x-1 transition-all duration-300" />
                                </Button>
                            </Link>
                        </div>
                    </Container>
                    <Container delay={0.3} className="relative w-full px-2 sm:px-4 md:px-6 lg:px-0">
                        <div className="relative rounded-lg sm:rounded-xl lg:rounded-[32px] mt-2 sm:mt-3 md:mt-4 lg:mt-6 xl:mt-8 -translate-y-1 sm:-translate-y-2 md:-translate-y-4 lg:-translate-y-6 max-w-6xl mx-auto w-full">
                            <div className="rounded-lg lg:rounded-[22px] overflow-hidden">
                                <Image
                                    src="/5.png"
                                    alt="dashboard"
                                    width={2200}
                                    height={1240}
                                    className="rounded-lg lg:rounded-[20px] scale-95 sm:scale-100 md:scale-105 lg:scale-110 w-full h-auto"
                                />
                            </div>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 w-full h-1/2"></div>
                    </Container>

                </div>
            </div>
        </div>
    )
};

export default Hero
