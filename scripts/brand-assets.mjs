// Genera los iconos y la imagen Open Graph a partir de la geometría del logo (design/logo) y de la
// foto del hero. Iconos: src/app (convención icon / apple-icon de Next). Open Graph: public/, declarada
// en buildMetadata (src/lib/seo/metadata.ts), porque el `openGraph` de cada página reemplaza al del archivo.
// Uso: node scripts/brand-assets.mjs
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(root, "src/app");

// Colores de src/styles/tokens.css
const BG = "#0B0B0C";
const SURFACE = "#141416";
const INK = "#F2F1EE";
const BRAND = "#E5271C";

/** Toma <path> y <circle> de un SVG de design/logo y los pinta con la tinta y el rojo de marca. */
async function logoParts(file) {
    const svg = await readFile(path.join(root, "design/logo", file), "utf8");
    const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
    const body = svg
        .match(/<path[\s\S]*?\/>|<circle[\s\S]*?\/>/g)
        .join("")
        .replaceAll('stroke="currentColor"', `stroke="${INK}"`)
        .replaceAll('fill="#E5271C"', `fill="${BRAND}"`);
    return { viewBox, body };
}

/** La marca centrada en un cuadro de 64 con margen (escala 0.82 alrededor de su centro óptico). */
function markInSquare(mark, { rx, scale }) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${rx}" fill="${SURFACE}"/>
  <g transform="translate(32 32) scale(${scale}) translate(-33.4 -32.7)">${mark.body}</g>
</svg>
`;
}

const mark = await logoParts("mark-3-punto.svg");
const logo = await logoParts("logo-3-punto.svg");

// icon.svg: favicon vectorial, cuadro redondeado carbón. Legible a 16 px.
await writeFile(path.join(APP, "icon.svg"), markInSquare(mark, { rx: 14, scale: 0.82 }));

// apple-icon.png 180×180: sin redondeo (iOS aplica su máscara), más margen.
await sharp(Buffer.from(markInSquare(mark, { rx: 0, scale: 0.68 })), { density: 600 })
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toFile(path.join(APP, "apple-icon.png"));

// opengraph-image.jpg 1200×630: foto del hero, velo inferior y logo. Sin texto con fuentes.
const W = 1200;
const H = 630;
const [, , vbW, vbH] = logo.viewBox.split(/\s+/).map(Number);
const logoW = 300;
const logoH = (logoW * vbH) / vbW;
const [vbX, vbY] = logo.viewBox.split(/\s+/).map(Number);
const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="v" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="${BG}" stop-opacity="0.8"/>
      <stop offset="0.5" stop-color="${BG}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#v)"/>
  <svg x="72" y="${H - 72 - logoH}" width="${logoW}" height="${logoH}" viewBox="${vbX} ${vbY} ${vbW} ${vbH}">${logo.body}</svg>
</svg>`;

await sharp(path.join(root, "src/assets/images/tesla-gris-anochecer.jpg"))
    .resize(W, H, { fit: "cover", position: "centre" })
    .composite([{ input: Buffer.from(overlay) }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(root, "public/opengraph-image.jpg"));

console.log("src/app/icon.svg, src/app/apple-icon.png y public/opengraph-image.jpg listos");
