import Container from "../global/container";
import LogoLoop from "../ui/logo-loop";

const Companies = () => {
    const companies = [
        { name: "Didi", src: "/images/companies/logodidi.png", alt: "Didi" },
        { name: "Uber", src: "/images/companies/Uber Icon.svg", alt: "Uber" },
        { name: "Tesla", src: "/images/Logoteslablanc.png", alt: "Tesla" },
        { name: "Waze", src: "/images/companies/Waze Icon.svg", alt: "Waze" },
        { name: "Google Maps", src: "/images/companies/Icono Googlemaps.svg", alt: "Google Maps" },
    ];

    return (
        <div className="relative flex flex-col items-center justify-center w-full py-20 mt-16 companies overflow-hidden bg-transparent">
            <Container>
                <div className="flex flex-col items-center justify-center">
                    <h4 className="text-2xl text-center lg:text-4xl font-medium text-white">
                    Conectados con <span className="font-subheading italic text-[#08fefe]">Líderes</span> en movilidad 
                    </h4>
                </div>
            </Container>

            <Container delay={0.1}>
                <div className="w-full max-w-6xl mx-auto pt-16">
                    <div className="h-32 md:h-40 relative overflow-hidden bg-transparent">
                        <LogoLoop
                            logos={companies}
                            speed={150}
                            direction="left"
                            logoHeight={56}
                            gap={60}
                            scaleOnHover
                            fadeOut
                            fadeOutColor="rgba(0, 0, 0, 0)"
                            ariaLabel="Compañías asociadas"
                        />
                    </div>
                </div>
            </Container>
        </div>
    )
};

export default Companies
