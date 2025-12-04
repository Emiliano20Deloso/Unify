import Image from "next/image";
import Container from "../global/container";

const Companies = () => {
    const companies = [
        { name: "Didi", logo: "/images/companies/logodidi.png" },
        { name: "Uber", logo: "/images/companies/Uber Icon.svg" },
        { name: "Tesla", logo: "/images/companies/logotesla.png" },
        { name: "Waze", logo: "/images/companies/Waze Icon.svg" },
        { name: "Google Maps", logo: "/images/companies/Icono Googlemaps.svg" },
    ];

    return (
        <div className="relative flex flex-col items-center justify-center w-full py-20 mt-16 companies overflow-hidden">
            <Container>
                <div className="flex flex-col items-center justify-center">
                    <h4 className="text-2xl text-center lg:text-4xl font-medium text-white">
                    Conectados con <span className="font-subheading italic text-[#08fefe]">Líderes</span> en movilidad 
                    </h4>
                </div>
            </Container>

            <Container delay={0.1}>
                <div className="flex flex-row flex-wrap items-center justify-center gap-8 max-w-4xl mx-auto pt-16">
                    {companies.map((company, index) => (
                        <div 
                            key={index} 
                            className="flex flex-col items-center justify-center gap-2"
                        >
                            <div className="h-12 md:h-14 w-auto opacity-60 hover:opacity-100 transition-opacity duration-300">
                                <Image 
                                    src={company.logo} 
                                    alt={company.name}
                                    width={180}
                                    height={56}
                                    className="h-12 md:h-14 w-auto object-contain"
                                    unoptimized
                                />
                            </div>
                            <span className="text-sm md:text-base font-medium text-white">
                                {company.name}
                            </span>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    )
};

export default Companies
