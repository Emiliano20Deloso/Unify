import "@/styles/globals.css";
import { cn } from "@/lib";
import { generateMetadata } from "@/utils";
import { base, heading } from "@/constants";
import { Toaster } from "@/components/ui/sonner";
import { subheading } from "@/constants/fonts";
import { LanguageProvider } from "@/contexts/language-context";

export const metadata = generateMetadata();

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body
                className={cn(
                    "min-h-screen bg-black text-foreground antialiased font-heading overflow-x-hidden",
                    base.variable,
                    heading.variable,
                    subheading.variable,
                )}
            >
                <LanguageProvider>
                    <Toaster richColors theme="dark" position="top-right" />
                    {children}
                </LanguageProvider>
            </body>
        </html>
    );
}
