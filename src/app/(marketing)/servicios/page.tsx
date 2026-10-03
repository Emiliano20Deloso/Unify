import Wrapper from "@/components/global/wrapper";
import CTA from "@/components/marketing/cta";
import Features from "@/components/marketing/features";
import Pricing from "@/components/marketing/pricing";

const HomePage = () => {
    return (
        <Wrapper className="py-20 relative">
            <Features />
            <Pricing />
            <CTA />
        </Wrapper>
    )
};

export default HomePage
