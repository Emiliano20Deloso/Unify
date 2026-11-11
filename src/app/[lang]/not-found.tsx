// 404 traducida para cuando una página bajo [lang] llama a notFound() (p. ej. un slug dinámico futuro).
// not-found no recibe props: el idioma sale de next/root-params. Las URLs sin ruta las atiende
// app/global-not-found.tsx. Nota: como el layout raíz cuelga de [lang], Next entrega esta UI dentro del
// payload RSC y la pinta en el cliente (el HTML inicial es el shell de error de Next, con status 404).
import Link from "next/link";
import { BrokenRoute } from "@/components/brand";
import { Button, Container } from "@/components/ui";
import { lang as rootLang } from "next/root-params";
import { defaultLocale, hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedHref } from "@/i18n/routes";

export default async function NotFound() {
    const value = await rootLang();
    const lang = value && hasLocale(value) ? value : defaultLocale;
    const dict = await getDictionary(lang, "not-found");
    return (
        <Container className="flex min-h-[80svh] flex-col justify-center pb-section-md pt-[calc(var(--header-h)+var(--section-sm))]">
            {/* Entrada en secuencia (data-enter): la línea rota → título → texto → botón. */}
            <div data-enter="0">
                <BrokenRoute />
            </div>
            <h1 data-enter="1" className="type-display mt-10 max-w-3xl">
                {dict.title}
            </h1>
            <p data-enter="2" className="type-lead mt-5 max-w-[36rem] text-fg-subtle">
                {dict.body}
            </p>
            <Button asChild data-enter="3" className="mt-10 self-start">
                <Link href={localizedHref(lang, "home")}>{dict.backHome}</Link>
            </Button>
        </Container>
    );
}
