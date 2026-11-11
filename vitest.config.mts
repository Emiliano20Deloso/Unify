import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            // "server-only" lanza fuera de un Server Component; en pruebas se usa su versión vacía.
            "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
        },
    },
    test: {
        environment: "node",
        include: ["tests/**/*.test.ts"],
    },
});
