import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Solo producción se indexa: las previews de Vercel (VERCEL_ENV=preview) y local quedan bloqueadas.
export default function robots(): MetadataRoute.Robots {
    if (process.env.VERCEL_ENV !== "production") {
        return { rules: { userAgent: "*", disallow: "/" } };
    }
    return {
        rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/auth", "/api", "/dev", "/en/dev"] },
        sitemap: absoluteUrl("/sitemap.xml"),
    };
}
