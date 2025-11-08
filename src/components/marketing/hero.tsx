import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Container from "../global/container";
import Icons from "../global/icons";
import { Button } from "../ui/button";
import { OrbitingCircles } from "../ui/orbiting-circles";

const Hero = () => {
    return (
        <div className="relative flex flex-col items-center justify-center w-full min-[90vh]">

                <div className="absolute flex lg:hidden size-40 rounded-full  blur-[10rem] top-0 left-1/2 -translate-x-1/2 -z-10"></div>

            {/* Cyan glow behind hero content */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#FF2400]/20 via-[#FF2400]/10 to-transparent blur-3xl -z-10"></div>

            <div className="flex flex-col items-center justify-center gap-y-8 relative z-10">
                <div className="flex flex-col items-center justify-center text-center gap-y-4">
                    <Container delay={0.15}>
                    <h1 className="text-9xl font-bold text-center !leading-tight max-w-4xl mx-auto text-white">
                        UNIFY
                    </h1>

                    </Container>
                    <Container delay={0.2}>
                        <p className="max-w-xl mx-auto mt-2 text-base lg:text-4xl text-center text-muted-foreground">
                            The luxury of travelling green
                        </p>
                    </Container>
                    <Container delay={0.25} className="z-20">
                        <div className="flex items-center justify-center mt-6 gap-x-4">
                            <Link href="#" className="flex items-center gap-2 group">
                                <Button size="lg" className="bg-[#ff3131] hover:opacity-80 text-[#ffffff] border-0">
                                <span className="text-xl">Empieza tu viaje</span>
                                    <ArrowRightIcon className="size-7 group-hover:translate-x-1 transition-all duration-300" />
                                </Button>
                            </Link>
                        </div>
                    </Container>
                    <Container delay={0.3} className="relative">
                        <div className="relative rounded-xl lg:rounded-[32px] mt-4relative rounded-xl lg:rounded-[32px] mt-4 -translate-y-6 max-w-6xl mx-auto max-w-6xl mx-auto">
                            <div className="rounded-lg lg:rounded-[22px]">
                                <Image
                                    src="/5.png"
                                    alt="dashboard"
                                    width={2200}
                                    height={1240}
                                    className="rounded-lg lg:rounded-[20px] scale-110"
                                />
                            </div>
                        </div>
                        <div className=" absolute bottom-0 inset-x-0 w-full h-1/2"></div>
                    </Container>

                </div>
            </div>
        </div>
    )
};

export default Hero
