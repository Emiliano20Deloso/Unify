import Hero from "@/components/marketing/hero";
import Companies from "@/components/marketing/companies";
import Features from "@/components/marketing/features";
import Analysis from "@/components/marketing/analysis";
import Pricing from "@/components/marketing/pricing";
import LanguageSupport from "@/components/marketing/lang-support";
import CTA from "@/components/marketing/cta";

const HomePage = () => {
    return (
        <>
            <Hero />
            <main className="w-full px-4 md:px-12 lg:max-w-screen-xl lg:mx-auto">
                <Companies />
                <Features />
                <Analysis />
                <Pricing />
                <LanguageSupport />
                <CTA />
            </main>
        </>
    );
};

export default HomePage;
