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
    // Copias de trabajo temporales de agentes (git worktrees).
    ".claude/**",
    // Capturas, informes y pasos sueltos de revisión visual (carpeta ignorada por git).
    ".shots/**",
  ]),
]);

export default eslintConfig;
