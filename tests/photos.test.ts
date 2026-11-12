// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { photos } from "@/content/photos";

const SRC = path.resolve(__dirname, "../src");

function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const full = path.join(dir, name);
        return statSync(full).isDirectory() ? walk(full) : [full];
    });
}

describe("fotos del sitio", () => {
    it("cada hueco usa una foto distinta", () => {
        const values = Object.values(photos);
        expect(new Set(values).size).toBe(values.length);
    });

    it("solo el registro importa de @/assets/images", () => {
        const allowed = (file: string) => {
            const rel = path.relative(SRC, file).split(path.sep).join("/");
            return rel === "content/photos.ts" || rel.startsWith("assets/images/") || rel.startsWith("app/[lang]/dev/");
        };
        const offenders = walk(SRC)
            .filter((file) => /\.(ts|tsx)$/.test(file) && !allowed(file))
            .filter((file) => /from\s+["']@\/assets\/images/.test(readFileSync(file, "utf8")));
        expect(offenders).toEqual([]);
    });

    it("toda imagen exportada está en el registro", () => {
        const index = readFileSync(path.join(SRC, "assets/images/index.ts"), "utf8");
        const exported = [...index.matchAll(/export \{ default as (\w+) \}/g)].map((m) => m[1]);
        const registry = readFileSync(path.join(SRC, "content/photos.ts"), "utf8");
        expect(exported.length).toBeGreaterThan(0);
        for (const name of exported) expect(registry).toMatch(new RegExp(`\\b${name}\\b`));
        expect(Object.keys(photos)).toHaveLength(exported.length);
    });
});
