import Hero from "@/components/marketing/hero";
import Features from "@/components/marketing/features";
import Analysis from "@/components/marketing/analysis";
import Pricing from "@/components/marketing/pricing";
import Testimonials from "@/components/marketing/testimonials";
import LanguageSupport from "@/components/marketing/lang-support";
import CorpCta from "@/components/marketing/corp-cta";
import CTA from "@/components/marketing/cta";

const HomePage = () => {
    return (
        <>
            <Hero />
            <main className="w-full px-4 md:px-12 lg:max-w-screen-xl lg:mx-auto">
                <Features />
                <Analysis />
                <Pricing />
                <Testimonials />
                <LanguageSupport />
                <CorpCta />
                <CTA />
            </main>
        </>
    );
};

export default HomePage;
