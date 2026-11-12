import { Archivo } from "next/font/google";
import localFont from "next/font/local";

/** Texto e interfaz: Satoshi variable (300–900), un solo archivo. */
export const satoshi = localFont({
    src: "../assets/fonts/Satoshi-Variable.woff2",
    weight: "300 900",
    style: "normal",
    display: "swap",
    variable: "--font-satoshi",
});

/** Títulos: Archivo variable con eje de ancho (los títulos usan font-stretch 118–122 %). */
export const archivo = Archivo({
    subsets: ["latin"],
    axes: ["wdth"],
    display: "swap",
    variable: "--font-archivo",
});

/** Clases para <html>: exponen ambas familias como variables CSS. */
export const fontVariables = `${satoshi.variable} ${archivo.variable}`;
