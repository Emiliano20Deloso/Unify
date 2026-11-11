import Footer from "@/components/marketing/footer";
import Navbar from "@/components/marketing/navbar";
import React from 'react';

interface Props {
    children: React.ReactNode
}

const MarketingLayout = ({ children }: Props) => {
    return (
        <>
            {/* Fondo global y detalles cian */}
            <div className="fixed inset-0 -z-30 bg-black">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f0f]/5 to-transparent"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#ff3131]/10 to-transparent"></div> 
                <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-l from-[#0a0f0f]/10 to-transparent"></div>
            </div>
            
            <Navbar />
            <main className="mx-auto w-full z-40 relative">
                {children}
            </main>
            <Footer />
        </>
    );
};

export default MarketingLayout
