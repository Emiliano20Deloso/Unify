import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import {
    getRedirectUrl,
    getRewrittenUrl,
    isRewrite,
    unstable_doesMiddlewareMatch,
} from "next/experimental/testing/server";
import { config, proxy } from "@/proxy";

const BASE = "https://unifyluxury.com";
const run = (path: string) => proxy(new NextRequest(`${BASE}${path}`));
const matches = (url: string) => unstable_doesMiddlewareMatch({ config, url });

describe("proxy: idiomas por ruta", () => {
    it("reescribe /servicios a /es/servicios sin cambiar la URL", async () => {
        const res = await run("/servicios");
        expect(isRewrite(res)).toBe(true);
        expect(getRewrittenUrl(res)).toBe(`${BASE}/es/servicios`);
        expect(getRedirectUrl(res)).toBeNull();
    });

    it("reescribe la portada a /es", async () => {
        const res = await run("/");
        expect(getRewrittenUrl(res)).toBe(`${BASE}/es`);
    });

    it("redirige con 308 /es/servicios a /servicios (y /es a /), conservando la query", async () => {
        const res = await run("/es/servicios?ref=1");
        expect(res.status).toBe(308);
        expect(getRedirectUrl(res)).toBe(`${BASE}/servicios?ref=1`);

        const root = await run("/es");
        expect(root.status).toBe(308);
        expect(getRedirectUrl(root)).toBe(`${BASE}/`);
    });

    it("deja pasar /en/… tal cual", async () => {
        for (const path of ["/en", "/en/servicios"]) {
            const res = await run(path);
            expect(isRewrite(res)).toBe(false);
            expect(getRedirectUrl(res)).toBeNull();
        }
    });

    it("no confunde segmentos que solo empiezan igual", async () => {
        const res = await run("/estimado");
        expect(getRewrittenUrl(res)).toBe(`${BASE}/es/estimado`);
    });

    it("no reescribe /admin ni /auth (solo refresca la sesión, y sin variables deja pasar)", async () => {
        for (const path of ["/admin", "/admin/login", "/auth/callback"]) {
            const res = await run(path);
            expect(isRewrite(res)).toBe(false);
            expect(getRedirectUrl(res)).toBeNull();
        }
    });
});

describe("proxy: matcher", () => {
    it("corre en las páginas públicas, /en y /admin", () => {
        for (const url of ["/", "/servicios", "/es/servicios", "/en", "/en/tarifas", "/admin/login", "/auth/callback"]) {
            expect(matches(url), url).toBe(true);
        }
    });

    it("excluye /api, archivos internos de Next, /_vercel y rutas con extensión", () => {
        for (const url of [
            "/api/estimate",
            "/_next/static/chunks/main.js",
            "/_next/image?url=%2Fa.jpg&w=640&q=75",
            "/_vercel/insights/script.js",
            "/sitemap.xml",
            "/robots.txt",
            "/fonts/Satoshi-Regular.woff2",
            "/favicon.ico",
        ]) {
            expect(matches(url), url).toBe(false);
        }
    });
});
