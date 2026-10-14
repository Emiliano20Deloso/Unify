import "@/styles/globals.css";
import { cn } from "@/lib";
import { generateMetadata } from "@/utils";
import { base, heading } from "@/constants";
import { Toaster } from "@/components/ui/sonner";
import { subheading } from "@/constants/fonts";
import { LanguageProvider } from "@/contexts/language-context";
import { MobileMenuProvider } from "@/contexts/mobile-menu-context";

export const metadata = generateMetadata();

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" suppressHydrationWarning className="overflow-x-hidden">
            <body
                className={cn(
                    "min-h-screen bg-black text-foreground antialiased font-heading overflow-x-hidden",
                    base.variable,
                    heading.variable,
                    subheading.variable,
                )}
            >
                <LanguageProvider>
                    <MobileMenuProvider>
                        <Toaster richColors theme="dark" position="top-right" />
                        {children}
                    </MobileMenuProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
