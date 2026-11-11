// 404 traducida para cuando una página bajo [lang] llama a notFound() (p. ej. un slug dinámico futuro).
// not-found no recibe props: el idioma sale de next/root-params. Las URLs sin ruta las atiende
// app/global-not-found.tsx. Nota: como el layout raíz cuelga de [lang], Next entrega esta UI dentro del
// payload RSC y la pinta en el cliente (el HTML inicial es el shell de error de Next, con status 404).
import Link from "next/link";
import { lang as rootLang } from "next/root-params";
import { defaultLocale, hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedHref } from "@/i18n/routes";

export default async function NotFound() {
    const value = await rootLang();
    const lang = value && hasLocale(value) ? value : defaultLocale;
    const dict = await getDictionary(lang, "not-found");
    return (
        <section className="px-6 py-16">
            <h1 className="text-4xl font-bold">{dict.title}</h1>
            <p className="mt-4">{dict.body}</p>
            <p className="mt-8">
                <Link href={localizedHref(lang, "home")} className="underline underline-offset-4">
                    {dict.backHome}
                </Link>
            </p>
        </section>
    );
}
