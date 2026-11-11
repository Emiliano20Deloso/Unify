import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz del proyecto (hay un package-lock.json suelto en el home que Turbopack confundía con la raíz).
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    // 404 para URLs sin ruta: la app tiene dos layouts raíz ([lang] y admin). Ver app/global-not-found.tsx.
    globalNotFound: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
  },
};

export default nextConfig;
