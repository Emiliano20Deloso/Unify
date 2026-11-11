import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    // Solo referencia de contenido; se borra en la Fase 3.
    "legacy/**",
    // Copias de trabajo temporales de agentes (git worktrees).
    ".claude/**",
  ]),
]);

export default eslintConfig;
