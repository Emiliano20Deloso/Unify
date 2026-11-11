import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // TEMPORAL: el marketing viejo se borra en una fase posterior del rediseño.
  // Sus errores se bajan a advertencia en vez de refactorizarlos. Quitar este bloque al borrar esas carpetas.
  {
    files: [
      "src/components/marketing/**",
      "src/components/global/**",
      "src/app/(marketing)/**",
    ],
    rules: {
      "react/no-unescaped-entities": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
